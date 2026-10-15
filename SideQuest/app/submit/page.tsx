"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  Globe2,
  MapPin,
  Sparkles,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Mascot } from "@/components/sidequest/mascot";

export default function SubmitPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    title: "",
    organizer: "",
    organizer_type: "college",
    mode: "online",
    city: "",
    scope: "national",
    reg_deadline: "",
    start_date: "",
    end_date: "",
    prize_text: "",
    fee_type: "free",
    fee_amount_inr: 0,
    apply_url: "",
    tags: "AI, Web3",
    eligibility: "Open to all students",
    contact_email: "",
    contact_telegram: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title || !form.organizer || !form.apply_url) {
      toast.error("Please fill in all required fields (Title, Organizer, Apply URL)");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...form,
        fee_amount_inr: Number(form.fee_amount_inr) || 0,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };

      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to submit event");
      }

      setSubmitted(true);
      toast.success("Hackathon submitted for review!");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit event");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "11px 14px",
    borderRadius: "12px",
    background: "#ffffff",
    border: "1.5px solid #cbd5e1",
    color: "var(--ink)",
    fontSize: "14px",
    fontWeight: 500,
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  };

  const sectionStyle: React.CSSProperties = {
    background: "#ffffff",
    border: "1.5px solid var(--border)",
    padding: "24px",
    borderRadius: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
  };

  if (submitted) {
    return (
      <main className="sq-container" style={{ padding: "60px 16px", maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
        <div style={{ display: "inline-flex", padding: "16px", background: "rgba(182, 245, 0, 0.15)", borderRadius: "50%", marginBottom: "20px" }}>
          <CheckCircle2 size={48} className="text-lime-500" />
        </div>
        <h1 style={{ fontSize: "32px", fontWeight: 800, marginBottom: "12px" }}>
          Quest Board Submission Received!
        </h1>
        <p style={{ color: "var(--muted-foreground)", fontSize: "16px", lineHeight: 1.6, marginBottom: "28px" }}>
          Thank you for bringing <strong>{form.title}</strong> to India&apos;s builder community. Our scouts review every submission within 24 hours to ensure verified links and accurate deadlines.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <Button asChild>
            <Link href="/discover">
              Browse Live Quests <ArrowUpRight size={16} />
            </Link>
          </Button>
          <Button variant="outline" onClick={() => setSubmitted(false)}>
            Submit Another Hackathon
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="sq-container" style={{ padding: "40px 16px 80px", maxWidth: "760px", margin: "0 auto" }}>
      <header style={{ marginBottom: "36px" }}>
        <div className="sq-eyebrow" style={{ marginBottom: "12px" }}>
          <Sparkles size={13} /> Calling all campus organisers & founders
        </div>
        <h1 style={{ fontSize: "36px", fontWeight: 800, lineHeight: 1.15, marginBottom: "12px" }}>
          Put your hackathon <span className="sq-highlight">on the board.</span>
        </h1>
        <p style={{ color: "var(--muted-foreground)", fontSize: "16px", maxWidth: "540px" }}>
          Reach thousands of hungry builders, developers, and designers across 40+ campus hubs in India. Free listing, always.
        </p>
      </header>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Core details */}
        <section style={sectionStyle}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
            <Zap size={18} fill="currentColor" /> Event Basics
          </h2>

          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
              Hackathon Name *
            </label>
            <input
              name="title"
              required
              placeholder="e.g. HackSphere 2026, BitBuild v2"
              value={form.title}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                Organizing Body / College *
              </label>
              <input
                name="organizer"
                required
                placeholder="e.g. IIT Bombay / IEEE Student Branch"
                value={form.organizer}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                Organizer Type
              </label>
              <select
                name="organizer_type"
                value={form.organizer_type}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="college">College / University Club</option>
                <option value="company">Company / Startup</option>
                <option value="community">Developer Community</option>
                <option value="government">Government / Public Body</option>
                <option value="nonprofit">Non-Profit / NGO</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
              Official Registration Link / Portal URL *
            </label>
            <input
              name="apply_url"
              type="url"
              required
              placeholder="https://unstop.com/..., https://devfolio.co/..., or your website"
              value={form.apply_url}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>
        </section>

        {/* Location & Format */}
        <section style={sectionStyle}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
            <Globe2 size={18} /> Location & Mode
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                Event Mode
              </label>
              <select
                name="mode"
                value={form.mode}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="online">Online / Virtual</option>
                <option value="offline">In-Person (On Campus / Venue)</option>
                <option value="hybrid">Hybrid (Online + Offline Finals)</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                City (if In-Person / Hybrid)
              </label>
              <input
                name="city"
                placeholder="e.g. Bengaluru, New Delhi, Pune"
                value={form.city}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                Scope
              </label>
              <select
                name="scope"
                value={form.scope}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="national">National (Open across India)</option>
                <option value="global">Global (International)</option>
                <option value="state">State Level</option>
                <option value="college">Intra-College (Students only)</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                Fee Type
              </label>
              <select
                name="fee_type"
                value={form.fee_type}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="free">Free Registration</option>
                <option value="paid">Paid Entry</option>
              </select>
            </div>
          </div>
        </section>

        {/* Deadlines & Prizes */}
        <section style={sectionStyle}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
            <Trophy size={18} /> Deadlines & Rewards
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                Registration Deadline *
              </label>
              <input
                name="reg_deadline"
                type="date"
                value={form.reg_deadline}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                Prize Pool Description
              </label>
              <input
                name="prize_text"
                placeholder="e.g. ₹1,50,000 + Swag & Cloud Credits"
                value={form.prize_text}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
              Themes & Tags (comma-separated)
            </label>
            <input
              name="tags"
              placeholder="e.g. AI / ML, Web3, Open Innovation, FinTech, HealthTech"
              value={form.tags}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>
        </section>

        {/* Contact info for verification */}
        <section style={sectionStyle}>
          <h2 style={{ fontSize: "18px", fontWeight: 700 }}>Organizer Contact (For Verification)</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                Contact Email *
              </label>
              <input
                name="contact_email"
                type="email"
                required
                placeholder="organizer@college.edu"
                value={form.contact_email}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                Telegram Username (Optional)
              </label>
              <input
                name="contact_telegram"
                placeholder="@username"
                value={form.contact_telegram}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>
          </div>
        </section>

        <Button type="submit" size="lg" disabled={loading} style={{ height: "48px", fontSize: "16px", fontWeight: 700 }}>
          {loading ? "Submitting quest…" : "Submit Hackathon for Verification"} <ArrowUpRight size={18} />
        </Button>
      </form>
    </main>
  );
}
