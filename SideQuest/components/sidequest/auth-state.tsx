"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export interface AuthContextType {
  user: User | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    let active = true;

    const checkLocalDemo = () => {
      try {
        const stored = typeof window !== "undefined" ? localStorage.getItem("buildseek_demo_user") : null;
        return stored ? JSON.parse(stored) : null;
      } catch {
        return null;
      }
    };

    supabase.auth.getUser().then(({ data }: any) => {
      if (active) {
        if (data?.user) {
          setUser(data.user);
        } else {
          setUser(checkLocalDemo());
        }
        setLoading(false);
      }
    }).catch(() => {
      if (active) {
        setUser(checkLocalDemo());
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(checkLocalDemo());
      }
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
