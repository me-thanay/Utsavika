import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface AuthContextType {
  user: { email: string } | null;
  token: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
  setSession: (t: string | null, email: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("auth_token");
    const email = localStorage.getItem("auth_email");
    if (saved && email) {
      setToken(saved);
      setUser({ email });
    }
    setLoading(false);
  }, []);

  const signOut = async () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_email");
    setToken(null);
    setUser(null);
  };

  const handleSetSession = (t: string | null, email: string | null) => {
    if (t && email) {
      localStorage.setItem("auth_token", t);
      localStorage.setItem("auth_email", email);
      setToken(t);
      setUser({ email });
    } else {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_email");
      setToken(null);
      setUser(null);
    }
  };

  const value = {
    user,
    token,
    loading,
    signOut,
    setSession: handleSetSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};