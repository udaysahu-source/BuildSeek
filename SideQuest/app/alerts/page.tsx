"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Bell,
  Check,
  CheckCircle2,
  Clock3,
  Mail,
  Send,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Mascot } from "@/components/sidequest/mascot";

export default function AlertsPage() {
  const [email, setEmail] = useState("");
  const [emailSubscribed, setEmailSubscribed] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  // Preference toggles
  const [prefs, setPrefs] = useState({
    deadline24h: true,
    digestFriday: true,
    freeOnly: false,
    onlineOnly: false,
  });

  const togglePref = (key: keyof typeof prefs) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      toast.success("Alert preferences updated!");
      return next;
    });
  };

  const handleEmailSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    setEmailLoading(true);
    setTimeout(() => {
      setEmailLoading(false);
      setEmailSubscribed(true);
      toast.success("Subscribed to the BuildSeek weekly digest!");
    }, 400);
  };

  return (
    <main className="sq-container" style={{ padding: "40px 16px 80px", maxWidth: "860px", margin: "0 auto" }}>
      <header style={{ marginBottom: "40px", textAlign: "center" }}>
        <div className="sq-eyebrow" style={{ display: "inline-flex", marginBottom: "12px" }}>
          <Zap size={13} fill="currentColor" /> Never miss your moment
        </div>
        <h1 style={{ fontSize: "38px", fontWeight: 800, lineHeight: 1.15, marginBottom: "14px" }}>
          Telegram alerts before the <span className="sq-highlight">clock runs out.</span>
        </h1>
        <p style={{ color: "var(--muted-foreground)", fontSize: "16px", maxWidth: "560px", margin: "0 auto" }}>
          No spam, no promotional noise. Just a high-priority ping 24 hours before your saved hackathons close registration.
        </p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px", marginBottom: "40px" }}>
        {/* Telegram Direct Connect */}
        <section
          style={{
            background: "linear-gradient(135deg, rgba(34, 158, 217, 0.08), rgba(182, 245, 0, 0.08))",
            border: "2px solid rgba(34, 158, 217, 0.3)",
            borderRadius: "24px",
            padding: "28px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
              <div style={{ background: "#229ED9", color: "#fff", padding: "8px", borderRadius: "12px", display: "inline-flex" }}>
                <Send size={20} />
              </div>
              <h2 style={{ fontSize: "20px", fontWeight: 700 }}>Connect Telegram Bot</h2>
            </div>
            <p style={{ color: "var(--muted-foreground)", fontSize: "14px", lineHeight: 1.6, marginBottom: "20px" }}>
              Get automated reminders sent directly to your Telegram chat. Instant setup in under 5 seconds with zero account creation required.
            </p>

            <ol style={{ fontSize: "13px", color: "var(--foreground)", display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px", paddingLeft: "20px" }}>
              <li>Click the button below to open <strong>@BuildSeekAlertsBot</strong></li>
              <li>Press <strong>Start</strong> in Telegram</li>
              <li>Receive reminders 24h & 3h before registrations close</li>
            </ol>
          </div>

          <Button
            asChild
            size="lg"
            style={{
              background: "#229ED9",
              color: "#ffffff",
              fontWeight: 700,
              height: "46px",
            }}
          >
            <a
              href="https://t.me/BuildSeekAlertsBot?start=web_connect"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Send size={16} /> Open @BuildSeekAlertsBot <ArrowUpRight size={16} />
            </a>
          </Button>
        </section>

        {/* Telegram Sample Preview */}
        <section
          style={{
            background: "#181f2a",
            color: "#f8fafc",
            borderRadius: "24px",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
          }}
        >
          <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e" }} />
            Telegram Message Preview
          </div>

          <div
            style={{
              background: "#242f3d",
              borderRadius: "14px",
              padding: "16px",
              fontSize: "13px",
              lineHeight: 1.6,
              borderLeft: "4px solid #B6F500",
            }}
          >
            <div style={{ color: "#B6F500", fontWeight: 700, fontSize: "14px", marginBottom: "4px" }}>
              ⏰ BuildSeek Deadline Alert
            </div>
            <div style={{ fontWeight: 600, fontSize: "15px", marginBottom: "6px" }}>
              OpenCV AI Competition 2026
            </div>
            <div style={{ color: "#cbd5e1", marginBottom: "10px" }}>
              📍 Online · Global<br />
              🏆 Prize Pool: $20,250<br />
              ⏳ <strong>Registration closes in 24 hours!</strong>
            </div>
            <div style={{ display: "inline-block", background: "#B6F500", color: "#000", fontWeight: 700, padding: "5px 12px", borderRadius: "8px", fontSize: "11px" }}>
              Direct Apply Link ↗
            </div>
          </div>
        </section>
      </div>

      {/* Alert Preferences */}
      <section
        style={{
          background: "var(--muted)",
          borderRadius: "24px",
          padding: "28px",
          marginBottom: "40px",
        }}
      >
        <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>
          Alert Preferences
        </h2>
        <p style={{ color: "var(--muted-foreground)", fontSize: "14px", marginBottom: "20px" }}>
          Fine-tune what pings reach your phone.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "14px" }}>
          {[
            {
              key: "deadline24h" as const,
              title: "24-Hour Urgent Warning",
              desc: "High-priority ping exactly 24h before closing.",
            },
            {
              key: "digestFriday" as const,
              title: "Friday Builder Digest",
              desc: "Top 3 curated campus hackathons for the weekend.",
            },
            {
              key: "freeOnly" as const,
              title: "Free Events Only",
              desc: "Ignore competitions with paid registration fees.",
            },
            {
              key: "onlineOnly" as const,
              title: "Online / Remote Only",
              desc: "Skip offline campus events outside your city.",
            },
          ].map(({ key, title, desc }) => (
            <button
              key={key}
              type="button"
              onClick={() => togglePref(key)}
              style={{
                textAlign: "left",
                background: prefs[key] ? "rgba(182, 245, 0, 0.12)" : "var(--background)",
                border: `1.5px solid ${prefs[key] ? "var(--brand)" : "var(--border)"}`,
                borderRadius: "14px",
                padding: "16px",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                <strong style={{ fontSize: "14px" }}>{title}</strong>
                <span
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: prefs[key] ? "var(--brand)" : "var(--muted)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--ink)",
                  }}
                >
                  {prefs[key] && <Check size={13} strokeWidth={3} />}
                </span>
              </div>
              <p style={{ fontSize: "12px", color: "var(--muted-foreground)", margin: 0 }}>
                {desc}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* Email Backup Alternative */}
      <section
        style={{
          background: "var(--muted)",
          borderRadius: "24px",
          padding: "28px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Mail size={20} />
          <h2 style={{ fontSize: "20px", fontWeight: 700 }}>Don&apos;t use Telegram? Get email digests.</h2>
        </div>
        <p style={{ color: "var(--muted-foreground)", fontSize: "14px", maxWidth: "560px" }}>
          Every Monday, we email a neat 3-minute summary of deadlines for the week ahead.
        </p>

        {emailSubscribed ? (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--brand-dark, #22c55e)", fontWeight: 600 }}>
            <CheckCircle2 size={18} />
            <span>You&apos;re subscribed with {email}! First digest arrives this Monday.</span>
          </div>
        ) : (
          <form onSubmit={handleEmailSubscribe} style={{ display: "flex", gap: "10px", maxWidth: "480px" }}>
            <input
              type="email"
              required
              placeholder="you@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: "10px",
                background: "var(--background)",
                border: "1px solid var(--border)",
                fontSize: "14px",
              }}
            />
            <Button type="submit" disabled={emailLoading}>
              {emailLoading ? "Subscribing…" : "Subscribe"}
            </Button>
          </form>
        )}
      </section>
    </main>
  );
}
