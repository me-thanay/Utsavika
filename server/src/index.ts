import express, { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import cors from "cors";
import morgan from "morgan";
import { createClient, User } from "@supabase/supabase-js";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

const SUPABASE_URL = process.env.SUPABASE_URL as string | undefined;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string | undefined;
const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null;

type AuthedRequest = Request & { user?: User };

async function authMiddleware(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!supabase) {
    return res.status(401).json({ error: "Auth not configured" });
  }
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
  if (!token) return res.status(401).json({ error: "Missing Bearer token" });

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return res.status(401).json({ error: "Invalid token" });
  req.user = data.user;
  next();
}

app.get("/health", (_req: Request, res: Response) => {
  res.json({ ok: true });
});

// --- Local Auth (SQLite + JWT) ---
const dataDir = path.resolve(__dirname, "../../data");
try { fs.mkdirSync(dataDir, { recursive: true }); } catch {}
const db = new Database(path.join(dataDir, "app.db"));
db.pragma("journal_mode = WAL");
db.prepare(`create table if not exists users (
  id integer primary key autoincrement,
  email text not null unique,
  password_hash text not null,
  full_name text,
  created_at text not null default (datetime('now'))
)`).run();

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

const localSignup = (req: Request, res: Response) => {
  const { email, password, full_name } = req.body as { email: string; password: string; full_name?: string };
  if (!email || !password) return res.status(400).json({ error: "email and password are required" });
  try {
    const existing = db.prepare("select id from users where email = ?").get(email);
    if (existing) return res.status(409).json({ error: "Email already registered" });
    const passwordHash = bcrypt.hashSync(password, 10);
    const info = db.prepare("insert into users (email, password_hash, full_name) values (?, ?, ?)").run(email, passwordHash, full_name || null);
    const userId = Number(info.lastInsertRowid);
    const token = jwt.sign({ uid: userId, email }, JWT_SECRET, { expiresIn: "7d" });
    return res.status(201).json({ token, user: { id: userId, email, full_name } });
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error("/api/local/signup error:", e?.message || e);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

app.post("/api/local/signup", localSignup);
app.post("/local/signup", localSignup);

const localSignin = (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };
  if (!email || !password) return res.status(400).json({ error: "email and password are required" });
  try {
    const row = db.prepare("select id, password_hash, full_name from users where email = ?").get(email) as { id: number; password_hash: string; full_name: string } | undefined;
    if (!row) return res.status(401).json({ error: "Invalid credentials" });
    const ok = bcrypt.compareSync(password, row.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });
    const token = jwt.sign({ uid: row.id, email }, JWT_SECRET, { expiresIn: "7d" });
    return res.json({ token, user: { id: row.id, email, full_name: row.full_name } });
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error("/api/local/signin error:", e?.message || e);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

app.post("/api/local/signin", localSignin);
app.post("/local/signin", localSignin);

// Create user without email confirmation using service role
async function signupHandler(req: Request, res: Response) {
  try {
    const { email, password, full_name } = req.body as { email: string; password: string; full_name?: string };
    if (!email || !password) return res.status(400).json({ error: "email and password are required" });

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name },
    });

    if (error) {
      const message = (error as any).message || String(error);
      const lower = message.toLowerCase();
      if (lower.includes("already") && lower.includes("registered")) {
        return res.status(409).json({ error: "Email already registered" });
      }
      // eslint-disable-next-line no-console
      console.error("/auth/signup failed:", message);
      return res.status(500).json({ error: message });
    }

    return res.status(201).json({ user: { id: data.user?.id, email: data.user?.email } });
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error("/auth/signup exception:", e?.message || e);
    return res.status(500).json({ error: e?.message || "Internal Server Error" });
  }
}

app.post("/auth/signup", signupHandler);
app.post("/api/auth/signup", signupHandler);

app.get("/me", authMiddleware, async (req: AuthedRequest, res: Response) => {
  const userId = req.user!.id;
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, created_at")
    .eq("id", userId)
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(profile);
});

app.get("/orders", authMiddleware, async (req: AuthedRequest, res: Response) => {
  const userId = req.user!.id;
  const { data, error } = await supabase
    .from("orders")
    .select("id, status, total_amount, created_at, shipping_address_id, order_items:order_items(id, product_id, product_name, unit_price, quantity)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post("/orders", authMiddleware, async (req: AuthedRequest, res: Response) => {
  const userId = req.user!.id;
  const { items, shippingAddress } = req.body as {
    items: Array<{ product_id?: string; product_name: string; unit_price: number; quantity: number }>;
    shippingAddress?: { line1: string; line2?: string; city: string; state?: string; postal_code: string; country: string };
  };

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Order items required" });
  }

  let shippingAddressId: string | undefined;
  if (shippingAddress) {
    const { data: addr, error: addrErr } = await supabase
      .from("addresses")
      .insert({ user_id: userId, ...shippingAddress })
      .select("id")
      .single();
    if (addrErr) return res.status(500).json({ error: addrErr.message });
    shippingAddressId = addr.id;
  }

  const total = items.reduce((sum, it) => sum + Number(it.unit_price) * Number(it.quantity), 0);

  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({ user_id: userId, total_amount: total, shipping_address_id: shippingAddressId })
    .select("id")
    .single();
  if (orderErr) return res.status(500).json({ error: orderErr.message });

  const rows = items.map(it => ({
    order_id: order.id,
    product_id: it.product_id,
    product_name: it.product_name,
    unit_price: it.unit_price,
    quantity: it.quantity,
  }));

  const { error: itemsErr } = await supabase.from("order_items").insert(rows);
  if (itemsErr) return res.status(500).json({ error: itemsErr.message });

  res.status(201).json({ id: order.id, total_amount: total });
});

const port = process.env.PORT ? Number(process.env.PORT) : 8787;
// Serve frontend build (single-port setup)
const clientDistPath = path.resolve(__dirname, "../../dist");
app.use(express.static(clientDistPath));

// Map known SPA routes to index.html
const spaRoutes = ["/", "/shop", "/about", "/contact", "/cart", "/checkout", "/auth"];
spaRoutes.forEach((route) => {
  app.get(route, (_req: Request, res: Response) => {
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API + Frontend listening on http://localhost:${port}`);
});


