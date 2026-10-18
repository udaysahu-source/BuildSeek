"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, MapPin, Clock, MessageSquare, CheckCircle2, ArrowLeft, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/states/FormValidationState";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Please enter your name.";
    if (!email.trim() || !email.includes("@")) errs.email = "Please enter a valid email address.";
    if (!subject.trim()) errs.subject = "Please enter a subject.";
    if (message.trim().length < 15) errs.message = "Message must be at least 15 characters long.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <main className="sq-container" style={{ padding: "48px 16px 96px", maxWidth: "860px", margin: "0 auto" }}>
      <div style={{ marginBottom: "32px" }}>
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link href="/">
            <ArrowLeft size={16} className="mr-1" /> Back to Home
          </Link>
        </Button>
        <div className="sq-eyebrow" style={{ display: "inline-flex", gap: "6px", alignItems: "center" }}>
          <MessageSquare size={14} /> Get in Touch
        </div>
        <h1 style={{ fontSize: "36px", fontWeight: 800, marginTop: "8px", marginBottom: "8px" }}>
          Contact & Support
        </h1>
        <p style={{ color: "var(--muted-foreground)", fontSize: "15px" }}>
          Have a question, feedback, partnership inquiry, or need grievance assistance? We’re here to help.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "28px" }}>
        {/* Contact info card */}
        <div
          style={{
            background: "var(--card)",
            border: "2px solid var(--border)",
            borderRadius: "20px",
            padding: "32px",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>Entity Details</h2>
            <p style={{ fontSize: "14px", color: "var(--muted-foreground)", lineHeight: 1.6 }}>
              SideQuest is built and maintained by independent developers and student campus ambassadors across India.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px", fontSize: "14px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
              <div style={{ background: "var(--muted)", padding: "8px", borderRadius: "8px" }}>
                <Mail size={18} />
              </div>
              <div>
                <strong style={{ display: "block" }}>General Support</strong>
                <a href="mailto:team@sidequest.camp" style={{ color: "var(--brand)", textDecoration: "underline" }}>
                  team@sidequest.camp
                </a>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
              <div style={{ background: "var(--muted)", padding: "8px", borderRadius: "8px" }}>
                <Mail size={18} />
              </div>
              <div>
                <strong style={{ display: "block" }}>Grievances & Privacy</strong>
                <a href="mailto:grievance@sidequest.camp" style={{ color: "var(--brand)", textDecoration: "underline" }}>
                  grievance@sidequest.camp
                </a>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
              <div style={{ background: "var(--muted)", padding: "8px", borderRadius: "8px" }}>
                <MapPin size={18} />
              </div>
              <div>
                <strong style={{ display: "block" }}>Registered Desk</strong>
                <span style={{ color: "var(--muted-foreground)" }}>
                  SideQuest Technologies<br />
                  Raipur, Chhattisgarh, India - 492001
                </span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
              <div style={{ background: "var(--muted)", padding: "8px", borderRadius: "8px" }}>
                <Clock size={18} />
              </div>
              <div>
                <strong style={{ display: "block" }}>Response Time SLA</strong>
                <span style={{ color: "var(--muted-foreground)" }}>
                  Typically within 24 to 48 business hours.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact form */}
        <div
          style={{
            background: "var(--card)",
            border: "2px solid var(--border)",
            borderRadius: "20px",
            padding: "32px",
          }}
        >
          {submitted ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  background: "var(--brand)",
                  color: "#000",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "16px",
                }}
              >
                <CheckCircle2 size={32} />
              </div>
              <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "8px" }}>Message Received!</h2>
              <p style={{ color: "var(--muted-foreground)", fontSize: "14px", marginBottom: "24px" }}>
                Thank you for reaching out. A team member will review your note and get back to you at{" "}
                <strong>{email}</strong> shortly.
              </p>
              <Button onClick={() => { setSubmitted(false); setMessage(""); setSubject(""); }}>
                Send another message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 700 }}>Send Us a Message</h2>

              <FormField label="Your Name" error={errors.name} required>
                <input
                  type="text"
                  placeholder="e.g. Alex Sharma"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                  }}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </FormField>

              <FormField label="Email Address" error={errors.email} required>
                <input
                  type="email"
                  placeholder="you@college.edu"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                  }}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </FormField>

              <FormField label="Subject" error={errors.subject} required>
                <input
                  type="text"
                  placeholder="e.g. Feature request / Partnership / Event inquiry"
                  value={subject}
                  onChange={(e) => {
                    setSubject(e.target.value);
                    if (errors.subject) setErrors((prev) => ({ ...prev, subject: "" }));
                  }}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </FormField>

              <FormField label="Message" error={errors.message} required>
                <textarea
                  rows={4}
                  placeholder="How can we help your quest?"
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    if (errors.message) setErrors((prev) => ({ ...prev, message: "" }));
                  }}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </FormField>

              <Button type="submit" disabled={loading} className="w-full mt-2">
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" /> Sending message…
                  </>
                ) : (
                  <>
                    <Send size={16} className="mr-2" /> Send Message
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
