"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Mail, LockKeyhole, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Mascot } from "./mascot";
import { useAuth } from "./auth-state";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export type AuthDestination = "/discover" | "/quest-log" | "/profile";

function GoogleIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  );
}

function GitHubIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

export function AuthForm({ next = "/quest-log" }: { next?: AuthDestination | string }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [oauthBusy, setOauthBusy] = useState<"google" | "github" | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (user && !loading) {
      const stored = typeof window !== "undefined" ? sessionStorage.getItem("sidequest-auth-next") : null;
      if (typeof window !== "undefined") sessionStorage.removeItem("sidequest-auth-next");
      const destination =
        stored && stored.startsWith("/") && !stored.startsWith("//")
          ? stored
          : next;
      router.replace(destination);
    }
  }, [user, loading, router, next]);

  // Handle URL errors returned from OAuth or server
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const errDesc = params.get("error_description") || params.get("error");
      if (errDesc) {
        if (errDesc.includes("redirect_uri_mismatch")) {
          setError("OAuth redirect mismatch: Callback URL must be whitelisted in OAuth settings.");
        } else if (errDesc === "oauth_exchange_failed") {
          setError("Could not complete authentication. Try email/password or use Guest Demo mode.");
        } else if (errDesc.includes("access_denied")) {
          setError("Sign-in cancelled by user.");
        } else {
          setError(decodeURIComponent(errDesc.replace(/\+/g, " ")));
        }
      }
    }
  }, []);

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
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
          },
        });
        if (error) throw error;
        if (data.session) {
          router.replace(next);
        } else {
          setNotice("Check your email to confirm your account, then come back to log in.");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) {
          router.replace(next);
        }
      }
    } catch (err: any) {
      const msg = err?.message || "";
      if (msg.includes("dummy-anon-key") || msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
        setError("Supabase credentials are not configured in .env.local. You can test the app using Instant Guest Demo below!");
      } else {
        setError(msg || "Something went wrong. Please check your credentials and try again.");
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleOAuth(provider: "google" | "github") {
    setOauthBusy(provider);
    setError("");
    setNotice("");
    const supabase = getSupabaseBrowserClient();

    try {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("sidequest-auth-next", next);
      }
      const callbackUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: callbackUrl,
        },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      const msg = err?.message || "";
      if (msg.includes("dummy-anon-key") || msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
        setError("OAuth requires active Supabase keys. You can test immediately using Instant Guest Demo below.");
      } else {
        setError(msg || `${provider === "google" ? "Google" : "GitHub"} sign-in could not start. Please try again.`);
      }
    } finally {
      setOauthBusy(null);
    }
  }

  function continueAsGuest() {
    const demoUser = {
      id: "demo-builder-" + Math.random().toString(36).slice(2, 9),
      email: "builder@campus.buildseek.dev",
      user_metadata: {
        name: "Campus Builder",
        full_name: "Campus Builder",
        user_name: "campus_builder",
      },
      app_metadata: { provider: "guest" },
      aud: "authenticated",
      created_at: new Date().toISOString(),
    };
    if (typeof window !== "undefined") {
      localStorage.setItem("buildseek_demo_user", JSON.stringify(demoUser));
      sessionStorage.removeItem("sidequest-auth-next");
    }
    router.replace(next);
  }

  const isBusy = busy || oauthBusy !== null;

  return (
    <main className="sq-auth">
      <section className="sq-auth-brand">
        <span className="sq-eyebrow">A little ambition. A big adventure.</span>
        <h1>
          Your next
          <br />
          BuildSeek.
        </h1>
        <p>India’s live hackathon departure board for campus builders.</p>
        <Mascot className="sq-auth-mascot" />
        <span className="sq-auth-brand-note">For India’s campus builders.</span>
      </section>

      <section className="sq-auth-form">
        <div className="sq-auth-inner">
          <span className="sq-eyebrow">Station clearance &bull; Boarding</span>
          <h2>
            {mode === "forgot"
              ? "Lost your password?"
              : mode === "signup"
              ? "Join the board."
              : "Welcome back, builder."}
          </h2>
          <p>
            {mode === "forgot"
              ? "Let’s get your credentials reset and back on the trail."
              : mode === "signup"
              ? "Create your builder passport to track deadlines and claim prizes."
              : "Your saved hackathons and countdown alarms are waiting."}
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

              {/* OAuth Providers: Google & GitHub */}
              <div className="sq-oauth-buttons">
                <button
                  type="button"
                  className="sq-oauth-button is-google"
                  disabled={isBusy}
                  onClick={() => handleOAuth("google")}
                >
                  {oauthBusy === "google" ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <GoogleIcon className="w-4 h-4 shrink-0" />
                  )}
                  <span>Continue with Google</span>
                </button>

                <button
                  type="button"
                  className="sq-oauth-button is-github"
                  disabled={isBusy}
                  onClick={() => handleOAuth("github")}
                >
                  {oauthBusy === "github" ? (
                    <Loader2 size={16} className="animate-spin text-white" />
                  ) : (
                    <GitHubIcon className="w-4 h-4 shrink-0" />
                  )}
                  <span>Continue with GitHub</span>
                </button>
              </div>

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

            <Button type="submit" className="sq-auth-submit" disabled={isBusy}>
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
            <Button
              variant="ghost"
              className="mt-3 w-full"
              onClick={() => changeMode("login")}
            >
              Back to log in
            </Button>
          )}

          {/* Quick Demo Mode for immediate evaluation without setup friction */}
          <button
            type="button"
            className="sq-guest-button"
            onClick={continueAsGuest}
            title="Explore full logged-in features without signing in"
          >
            <Sparkles size={16} />
            <span>Instant Demo: Enter as Guest Builder</span>
          </button>

          <Link href="/discover" className="sq-browse-link">
            Browse live board without an account <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    </main>
  );
}
