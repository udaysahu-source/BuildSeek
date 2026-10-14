"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Mascot from "@/components/ui/Mascot";
import Button from "@/components/ui/Button";
import { isSupabaseConfigured, getSupabaseClient } from "@/lib/supabase";
import { Mail, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [sent, setSent] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setError(null);

    if (isSupabaseConfigured) {
      try {
        const supabase = getSupabaseClient();
        const { error: authError } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/quest-log`,
          },
        });
        if (authError) throw authError;
      } catch (err: any) {
        setError(err.message || "Failed to send magic link");
        setLoading(false);
        return;
      }
    }

    // Success state
    setLoading(false);
    setSent(true);
  };

  const handleGoogleSignIn = async () => {
    if (isSupabaseConfigured) {
      const supabase = getSupabaseClient();
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/quest-log`,
        },
      });
    } else {
      // In local demo mode, route directly to quest-log
      router.push("/quest-log");
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 py-12">
      <div className="w-full max-w-md retro-card p-6 sm:p-8 bg-white space-y-6">
        {/* Mascot & Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-1">
            <Mascot size={80} expression="excited" />
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-ink">
            Sign In to SideQuest
          </h1>
          <p className="text-xs sm:text-sm text-ink-500 max-w-xs mx-auto">
            Save hackathons, sync with your calendar, and receive deadline alerts.
          </p>
        </div>

        {sent ? (
          <div className="p-5 rounded-2xl bg-lime-light border-2 border-lime-dark text-center space-y-3 animate-in fade-in">
            <CheckCircle2 className="w-8 h-8 text-lime-dark mx-auto" />
            <h3 className="font-display font-bold text-base text-ink">
              Magic Link Sent!
            </h3>
            <p className="text-xs text-ink-700">
              Check your inbox at <span className="font-bold">{email}</span> to sign in.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/quest-log")}
              className="mt-2"
            >
              Go to Quest Log
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Google OAuth Button */}
            <button
              onClick={handleGoogleSignIn}
              className="w-full py-2.5 px-4 bg-white hover:bg-parchment-subtle text-ink font-bold text-sm border-2 border-ink rounded-full shadow-solid-sm flex items-center justify-center gap-3 transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-3">
              <div className="w-full border-t border-parchment-border" />
              <span className="bg-white px-3 text-[11px] font-bold uppercase text-ink-500 absolute">
                or email link
              </span>
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailSignIn} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-ink-700 block mb-1">
                  College or Personal Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-ink-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@college.edu.in"
                    className="w-full pl-10 pr-4 py-2 bg-parchment/60 text-xs sm:text-sm font-semibold rounded-xl border border-ink focus:outline-none focus:ring-2 focus:ring-lime"
                  />
                </div>
              </div>

              {error && (
                <p className="text-xs font-bold text-urgent bg-urgent-light p-2 rounded-lg">
                  {error}
                </p>
              )}

              <Button
                variant="lime"
                size="md"
                className="w-full"
                type="submit"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Magic Link"}
              </Button>
            </form>
          </div>
        )}

        {/* Footer info */}
        <div className="pt-3 border-t border-parchment-border text-center space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-xs text-ink-500">
            <ShieldCheck className="w-3.5 h-3.5 text-lime-dark" />
            <span>Browsing never requires login. Free forever.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
