"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Mail, LockKeyhole, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Mascot } from "./mascot";
import { useAuth } from "./auth-state";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export type AuthDestination = "/discover" | "/quest-log" | "/profile";

export function AuthForm({ next = "/quest-log" }: { next?: AuthDestination | string }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (user && !loading) {
      const stored = typeof window !== "undefined" ? sessionStorage.getItem("sidequest-auth-next") : null;
      if (typeof window !== "undefined") sessionStorage.removeItem("sidequest-auth-next");
      const destination =
        stored === "/discover" || stored === "/quest-log" || stored === "/profile"
          ? stored
          : next;
      router.replace(destination);
    }
  }, [user, loading, router, next]);

  function changeMode(value: typeof mode) {
    setMode(value);
    setError("");
    setNotice("");
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    const supabase = getSupabaseBrowserClient();

    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setNotice("If an account exists, a password reset link is on its way. Check your inbox.");
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        setNotice("Check your email to confirm your account, then come back to log in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.replace(next);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const errDesc = params.get("error_description") || params.get("error");
      if (errDesc) {
        if (errDesc.includes("redirect_uri_mismatch")) {
          setError("Google OAuth configuration mismatch: Redirect URI must be authorized in Google Cloud Console.");
        } else if (errDesc === "oauth_exchange_failed") {
          setError("Authentication session could not be established. Please try logging in with email/password.");
        } else {
          setError(decodeURIComponent(errDesc.replace(/\+/g, " ")));
        }
      }
    }
  }, []);

  async function google() {
    setBusy(true);
    setError("");
    const supabase = getSupabaseBrowserClient();

    try {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("sidequest-auth-next", next);
      }
      const callbackUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl,
        },
      });
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in could not start. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="sq-auth">
      <section className="sq-auth-brand">
        <span className="sq-eyebrow">A little ambition. A big adventure.</span>
        <h1>
          Your next
          <br />
          BuildSeek.
        </h1>
        <p>Big ideas deserve a place on the board.</p>
        <Mascot className="sq-auth-mascot" />
        <span className="sq-auth-brand-note">For India’s campus builders.</span>
      </section>

      <section className="sq-auth-form">
        <div className="sq-auth-inner">
          <span className="sq-eyebrow">Your quest starts here</span>
          <h2>
            {mode === "forgot"
              ? "Lost your password?"
              : mode === "signup"
              ? "Join the quest."
              : "Welcome back, builder."}
          </h2>
          <p>
            {mode === "forgot"
              ? "Let’s get you back on the trail."
              : mode === "signup"
              ? "Your next big opportunity is waiting."
              : "Your saved quests are waiting for you."}
          </p>

          {mode !== "forgot" && (
            <>
              <div className="sq-auth-tabs" role="group" aria-label="Account action">
                <Button
                  variant={mode === "login" ? "default" : "ghost"}
                  onClick={() => changeMode("login")}
                >
                  Log in
                </Button>
                <Button
                  variant={mode === "signup" ? "default" : "ghost"}
                  onClick={() => changeMode("signup")}
                >
                  Sign up
                </Button>
              </div>

              <Button
                variant="outline"
                className="sq-google-button"
                disabled={busy}
                onClick={google}
              >
                <span className="sq-google-mark" aria-hidden>
                  G
                </span>{" "}
                Continue with Google
              </Button>

              <div className="sq-auth-divider">
                <span>or with email</span>
              </div>
            </>
          )}

          <form onSubmit={submit}>
            <label className="sq-auth-label" htmlFor="email">
              Email address
            </label>
            <div className="sq-auth-input">
              <Mail size={18} />
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {mode !== "forgot" && (
              <>
                <label className="sq-auth-label" htmlFor="password">
                  Password
                </label>
                <div className="sq-auth-input">
                  <LockKeyhole size={18} />
                  <input
                    id="password"
                    type={show ? "text" : "password"}
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    placeholder="Your password"
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label={show ? "Hide password" : "Show password"}
                    onClick={() => setShow(!show)}
                  >
                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                  </Button>
                </div>
                {mode === "signup" && (
                  <small className="sq-password-note">At least 8 characters.</small>
                )}
              </>
            )}

            {mode === "login" && (
              <Button
                type="button"
                variant="ghost"
                className="sq-forgot-button"
                onClick={() => changeMode("forgot")}
              >
                Forgot password?
              </Button>
            )}

            {error && (
              <p className="sq-auth-error" role="alert">
                {error}
              </p>
            )}
            {notice && (
              <p className="sq-auth-notice" role="status">
                {notice}
              </p>
            )}

            <Button type="submit" className="sq-auth-submit" disabled={busy}>
              {busy ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>One moment…</span>
                </>
              ) : (
                <>
                  <span>
                    {mode === "signup"
                      ? "Create account"
                      : mode === "forgot"
                      ? "Send reset link"
                      : "Log in"}
                  </span>
                  <ArrowRight size={18} />
                </>
              )}
            </Button>
          </form>

          {mode === "forgot" && (
            <Button variant="ghost" onClick={() => changeMode("login")}>
              Back to log in
            </Button>
          )}

          <Link href="/discover" className="sq-browse-link">
            Browse without an account <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    </main>
  );
}
