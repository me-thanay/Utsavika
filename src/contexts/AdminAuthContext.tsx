import { createContext, useContext, useState, ReactNode } from "react";

interface AdminAuthContextType {
  isAdmin: boolean;
  adminLogin: (username: string, password: string) => boolean;
  adminLogout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
};

interface AdminAuthProviderProps {
  children: ReactNode;
}

// Hardcoded admin credentials - only developer can change these
const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "utsavika2024"
};

export const AdminAuthProvider = ({ children }: AdminAuthProviderProps) => {
  const [isAdmin, setIsAdmin] = useState(false);

  const adminLogin = (username: string, password: string): boolean => {
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      setIsAdmin(true);
      localStorage.setItem("admin_authenticated", "true");
      return true;
    }
    return false;
  };

  const adminLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem("admin_authenticated");
  };

  // Check if admin is already authenticated on mount
  useState(() => {
    const authenticated = localStorage.getItem("admin_authenticated");
    if (authenticated === "true") {
      setIsAdmin(true);
    }
  });

  const value = {
    isAdmin,
    adminLogin,
    adminLogout,
  };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
};
