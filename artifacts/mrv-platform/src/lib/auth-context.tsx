import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  getSession,
  logOut as authLogOut,
  onAuthChange,
  type PublicUser,
} from "@/lib/auth-db";

type AuthContextValue = {
  user: PublicUser | null;
  loading: boolean;
  setUser: (user: PublicUser | null) => void;
  logOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    void getSession().then((sessionUser) => {
      if (!active) return;
      setUser(sessionUser);
      setLoading(false);
    });

    const { data } = onAuthChange((next) => {
      if (!active) return;
      setUser(next);
      setLoading(false);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const logOut = async () => {
    await authLogOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, setUser, logOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
