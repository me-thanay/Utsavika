import express, { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import cors from "cors";
import morgan from "morgan";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const app = express();

// Explicit CORS to allow production domains and preflight
const allowedOrigins = new Set<string>([
  "https://www.utsavika.shop",
  "https://utsavika.shop",
  "http://localhost:5173",
]);

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow non-browser/SSR
    if (allowedOrigins.has(origin)) return callback(null, true);
    // Default to allow to avoid accidental blocks during propagation
    return callback(null, true);
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());
app.use(morgan("dev"));

type AuthedUser = { id: number; email: string };
type AuthedRequest = Request & { user?: AuthedUser };

function localAuthMiddleware(req: AuthedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
  if (!token) return res.status(401).json({ error: "Missing Bearer token" });
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { uid: number; email: string };
    req.user = { id: payload.uid, email: payload.email };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
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

// Minimal order schema to support checkout
db.prepare(`create table if not exists addresses (
  id integer primary key autoincrement,
  user_id integer not null,
  line1 text not null,
  line2 text,
  city text not null,
  state text,
  postal_code text not null,
  country text not null,
  created_at text not null default (datetime('now'))
)`).run();

db.prepare(`create table if not exists orders (
  id integer primary key autoincrement,
  user_id integer not null,
  total_amount real not null,
  shipping_address_id integer,
  status text not null default 'placed',
  created_at text not null default (datetime('now'))
)`).run();

db.prepare(`create table if not exists order_items (
  id integer primary key autoincrement,
  order_id integer not null,
  product_id text,
  product_name text not null,
  unit_price real not null,
  quantity integer not null
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
    if (!row) return res.status(404).json({ error: "User not found" });
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

// Simple password reset without email verification (admin-less). For demo only.
app.post("/api/local/reset-password", (req: Request, res: Response) => {
  const { email, new_password } = req.body as { email?: string; new_password?: string };
  if (!email || !new_password || new_password.length < 6) {
    return res.status(400).json({ error: "email and new_password (min 6) required" });
  }
  try {
    const user = db.prepare("select id from users where email = ?").get(email) as { id: number } | undefined;
    if (!user) return res.status(404).json({ error: "User not found" });
    const passwordHash = bcrypt.hashSync(new_password, 10);
    db.prepare("update users set password_hash = ? where id = ?").run(passwordHash, user.id);
    return res.json({ ok: true });
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error("/api/local/reset-password error:", e?.message || e);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Legacy Supabase signup routes removed — local auth in use

app.get("/me", localAuthMiddleware, (req: AuthedRequest, res: Response) => {
  const userId = req.user!.id;
  const row = db.prepare("select id, email, full_name, created_at from users where id = ?").get(userId) as
    | { id: number; email: string; full_name: string | null; created_at: string }
    | undefined;
  if (!row) return res.status(404).json({ error: "User not found" });
  res.json(row);
});

app.get("/orders", localAuthMiddleware, (req: AuthedRequest, res: Response) => {
  const userId = req.user!.id;
  const orders = db.prepare(
    "select id, status, total_amount, created_at, shipping_address_id from orders where user_id = ? order by datetime(created_at) desc"
  ).all(userId) as Array<{ id: number; status: string; total_amount: number; created_at: string; shipping_address_id: number | null }>;
  const itemsStmt = db.prepare(
    "select id, product_id, product_name, unit_price, quantity from order_items where order_id = ?"
  );
  const result = orders.map((o) => ({
    ...o,
    order_items: itemsStmt.all(o.id),
  }));
  res.json(result);
});

app.post("/orders", localAuthMiddleware, (req: AuthedRequest, res: Response) => {
  const userId = req.user!.id;
  const { items, shippingAddress } = req.body as {
    items: Array<{ product_id?: string; product_name: string; unit_price: number; quantity: number }>;
    shippingAddress?: { line1: string; line2?: string; city: string; state?: string; postal_code: string; country: string };
  };

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Order items required" });
  }

  let shippingAddressId: number | null = null;
  if (shippingAddress) {
    const info = db
      .prepare(
        "insert into addresses (user_id, line1, line2, city, state, postal_code, country) values (?, ?, ?, ?, ?, ?, ?)"
      )
      .run(
        userId,
        shippingAddress.line1,
        shippingAddress.line2 || null,
        shippingAddress.city,
        shippingAddress.state || null,
        shippingAddress.postal_code,
        shippingAddress.country
      );
    shippingAddressId = Number(info.lastInsertRowid);
  }

  const total = items.reduce((sum, it) => sum + Number(it.unit_price) * Number(it.quantity), 0);
  const orderInfo = db
    .prepare("insert into orders (user_id, total_amount, shipping_address_id) values (?, ?, ?)")
    .run(userId, total, shippingAddressId);
  const orderId = Number(orderInfo.lastInsertRowid);

  const insertItem = db.prepare(
    "insert into order_items (order_id, product_id, product_name, unit_price, quantity) values (?, ?, ?, ?, ?)"
  );
  items.forEach((it) => insertItem.run(orderId, it.product_id || null, it.product_name, it.unit_price, it.quantity));

  res.status(201).json({ id: orderId, total_amount: total });
});

const port = process.env.PORT ? Number(process.env.PORT) : 8787;
// Serve frontend build only if it exists (in case API is deployed separately)
const clientDistPath = path.resolve(__dirname, "../../dist");
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));

  // Map known SPA routes to index.html
  const spaRoutes = ["/", "/shop", "/about", "/contact", "/cart", "/checkout", "/auth"];
  spaRoutes.forEach((route) => {
    app.get(route, (_req: Request, res: Response) => {
      res.sendFile(path.join(clientDistPath, "index.html"));
    });
  });
} else {
  // API-only deployment default root response
  app.get("/", (_req: Request, res: Response) => {
    res.status(200).json({ ok: true, service: "api" });
  });
}

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API + Frontend listening on http://localhost:${port}`);
});


