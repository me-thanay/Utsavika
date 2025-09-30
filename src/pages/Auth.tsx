import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const API_BASES = [
  "https://utsavika-api.onrender.com/api", // Render primary URL
  "https://api.utsavika.shop/api",         // Custom domain (if DNS is ready)
  "/api",                                   // Vercel rewrite (fallback)
];

async function postJson<T>(path: string, body: unknown): Promise<{ ok: boolean; status: number; json: T | any }> {
  for (const base of API_BASES) {
    try {
      const resp = await fetch(`${base}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!resp.ok && (resp.status === 404 || resp.status === 502 || resp.status === 500)) {
        if (base !== API_BASES[API_BASES.length - 1]) {
          continue;
        }
      }
      const json = await resp.json().catch(() => ({}));
      return { ok: resp.ok, status: resp.status, json };
    } catch {
      continue;
    }
  }
  return { ok: false, status: 0, json: { error: "Network error" } };
}

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setSession, token } = useAuth();

  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token, navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { ok, status, json } = await postJson<{ token: string }>("/local/signup", {
        email,
        password,
        full_name: fullName,
      });
      if (!ok) {
        toast({
          variant: "destructive",
          title: "Sign up failed",
          description: json?.error || `Server error (${status || "network"})`,
        });
        return;
      }
      setSession(json.token, email);
      toast({ title: "Welcome!", description: "Your account has been created and you are now signed in." });
      navigate("/");
    } catch {
      toast({ variant: "destructive", title: "Error", description: "An unexpected error occurred. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await postJson<{ token: string }>("/local/signin", { email, password });
      if (result.ok) {
        setSession(result.json.token, email);
        toast({ title: "Welcome back!", description: "Successfully signed in." });
        navigate("/");
        return;
      }

      if (result.status === 404) {
        const sResp = await postJson<{ token: string }>("/local/signup", {
          email,
          password,
          full_name: fullName || email.split("@")[0],
        });
        if (sResp.ok) {
          setSession(sResp.json.token, email);
          toast({ title: "Account created", description: "You are now signed in." });
          navigate("/");
          return;
        }
      }

      toast({
        variant: "destructive",
        title: "Login failed",
        description: result.json?.error || `Server error (${result.status || "network"})`,
      });
    } catch {
      toast({ variant: "destructive", title: "Error", description: "An unexpected error occurred. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center bg-white px-4 py-20">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-playfair text-primary">Welcome to Utsavika</CardTitle>
          <CardDescription>Sign in to your account or create a new one</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-fullname">Full name</Label>
                  <Input
                    id="signup-fullname"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Create a password (min 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating account..." : "Sign Up"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;