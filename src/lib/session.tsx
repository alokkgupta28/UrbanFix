import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "./api";

export type User = {
  id: string;
  email: string;
  full_name: string;
  roles: string[];
};

type Ctx = {
  session: { access_token: string; user: User } | null;
  user: User | null;
  loading: boolean;
  refreshSession: () => Promise<void>;
  signOut: () => void;
};

const SessionContext = createContext<Ctx>({ 
  session: null, 
  user: null, 
  loading: true,
  refreshSession: async () => {},
  signOut: () => {}
});

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<{ access_token: string; user: User } | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSession = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setSession(null);
      setLoading(false);
      return;
    }
    
    try {
      const res = await api.get("/auth/me");
      if (res.data?.user) {
        setSession({ access_token: token, user: res.data.user });
      } else {
        localStorage.removeItem("token");
        setSession(null);
      }
    } catch (err) {
      localStorage.removeItem("token");
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSession();
    
    // Listen for custom login event from auth forms
    const handleAuthChange = () => {
      setLoading(true);
      loadSession();
    };
    
    window.addEventListener("auth-change", handleAuthChange);
    return () => window.removeEventListener("auth-change", handleAuthChange);
  }, []);

  const signOut = () => {
    localStorage.removeItem("token");
    setSession(null);
    window.dispatchEvent(new Event("auth-change"));
  };

  return (
    <SessionContext.Provider value={{ 
      session, 
      user: session?.user ?? null, 
      loading,
      refreshSession: loadSession,
      signOut
    }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
