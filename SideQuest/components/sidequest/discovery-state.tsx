"use client";

import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAuth } from "./auth-state";
import { QuestDialog } from "./quest-dialog";
import { Button } from "@/components/ui/button";
import { Mascot } from "./mascot";

interface BookmarkContextType {
  saved: string[];
  toggle: (id: string) => void;
  pending: string[];
  loading: boolean;
  error: Error | null;
}

const BookmarkContext = createContext<BookmarkContextType>({
  saved: [],
  toggle: () => {},
  pending: [],
  loading: false,
  error: null,
});

export function BookmarksProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const pathname = usePathname();
  const [signIn, setSignIn] = useState(false);
  const [saved, setSaved] = useState<string[]>([]);
  const [pending, setPending] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const locks = useRef(new Set<string>());

  // Fetch bookmarks when user changes
  useEffect(() => {
    if (!user) {
      // Load from localStorage for guest preview if available
      try {
        const local = localStorage.getItem("sidequest_guest_bookmarks");
        if (local) setSaved(JSON.parse(local));
      } catch {
        setSaved([]);
      }
      return;
    }

    let active = true;
    setLoading(true);
    const supabase = getSupabaseBrowserClient();

    supabase
      .from("bookmarks")
      .select("hackathon_id")
      .eq("user_id", user.id)
      .then(({ data, error }: { data: any; error: any }) => {
        if (!active) return;
        setLoading(false);
        if (error) {
          setError(new Error(error.message));
        } else {
          setSaved((data ?? []).map((row: { hackathon_id: string }) => row.hackathon_id));
        }
      })
      .catch((err: unknown) => {
        if (!active) return;
        setLoading(false);
        setError(err instanceof Error ? err : new Error(String(err)));
      });

    return () => {
      active = false;
    };
  }, [user]);

  async function toggle(id: string) {
    if (!user) {
      setSignIn(true);
      return;
    }

    if (locks.current.has(id)) return;
    locks.current.add(id);
    setPending((prev) => [...prev, id]);

    const removing = saved.includes(id);
    const supabase = getSupabaseBrowserClient();

    try {
      if (removing) {
        const { error } = await supabase
          .from("bookmarks")
          .delete()
          .eq("user_id", user.id)
          .eq("hackathon_id", id);
        if (error) throw error;
        setSaved((prev) => prev.filter((x) => x !== id));
        toast.success("Removed from Quest Log");
      } else {
        const { error } = await supabase
          .from("bookmarks")
          .insert({ user_id: user.id, hackathon_id: id });
        if (error) throw error;
        setSaved((prev) => [...new Set([...prev, id])]);
        toast.success("Saved to Quest Log");
      }
    } catch {
      toast.error("Could not update your Quest Log. Please try again.");
    } finally {
      locks.current.delete(id);
      setPending((prev) => prev.filter((x) => x !== id));
    }
  }

  return (
    <BookmarkContext.Provider
      value={{
        saved,
        toggle: (id) => {
          void toggle(id);
        },
        pending,
        loading: authLoading || loading,
        error,
      }}
    >
      {children}
      <QuestDialog
        open={signIn}
        onClose={() => setSignIn(false)}
        title="Save your next quest"
        kind="auth"
      >
        <div className="sq-discovery-empty">
          <Mascot />
          <h2>Keep this quest close.</h2>
          <p>Log in to save hackathons to your Quest Log.</p>
          <Button asChild>
            <Link
              href={`/login?next=${encodeURIComponent(pathname === "/quest-log" ? "/quest-log" : "/discover")}`}
              onClick={() => setSignIn(false)}
            >
              Log in or sign up
            </Link>
          </Button>
          <Button variant="ghost" onClick={() => setSignIn(false)}>
            Keep browsing
          </Button>
        </div>
      </QuestDialog>
    </BookmarkContext.Provider>
  );
}

export function useBookmarks() {
  return useContext(BookmarkContext);
}

export function useCountdownClock(initial: number) {
  const [now, setNow] = useState(initial);
  useEffect(() => {
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [initial]);
  return now;
}
