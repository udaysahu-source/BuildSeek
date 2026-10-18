import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Mail, MapPin, Clock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Privacy Policy | SideQuest",
  description:
    "Privacy Policy for SideQuest, detailing compliance with the Digital Personal Data Protection (DPDP) Act 2023 and GDPR.",
  alternates: {
    canonical: "https://sidequest.camp/privacy",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <main className="sq-container" style={{ padding: "48px 16px 96px", maxWidth: "840px", margin: "0 auto" }}>
      <div style={{ marginBottom: "32px" }}>
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link href="/">
            <ArrowLeft size={16} className="mr-1" /> Back to Home
          </Link>
        </Button>
        <div className="sq-eyebrow" style={{ display: "inline-flex", gap: "6px", alignItems: "center" }}>
          <ShieldCheck size={14} /> Legal & Compliance
        </div>
        <h1 style={{ fontSize: "36px", fontWeight: 800, marginTop: "8px", marginBottom: "8px" }}>
          Privacy Policy
        </h1>
        <p style={{ color: "var(--muted-foreground)", fontSize: "14px" }}>
          Last updated: October 18, 2026 • Effective immediately
        </p>
      </div>

      <div
        style={{
          background: "var(--card)",
          border: "2px solid var(--border)",
          borderRadius: "20px",
          padding: "36px",
          display: "flex",
          flexDirection: "column",
          gap: "32px",
          lineHeight: 1.7,
          fontSize: "15px",
        }}
      >
        <section>
          <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "12px", color: "var(--foreground)" }}>
            1. Overview & Data Fiduciary
          </h2>
          <p>
            SideQuest (“we”, “us”, or “our”) is dedicated to building tools for India’s student builders and hackathon
            participants. We value your digital privacy and ensure full compliance with the{" "}
            <strong>Digital Personal Data Protection Act, 2023 (DPDP Act, India)</strong>, the{" "}
            <strong>General Data Protection Regulation (GDPR, EU)</strong>, and applicable global privacy laws.
          </p>
          <p style={{ marginTop: "10px" }}>
            This policy outlines how we collect, process, store, and erase personal data when you interact with{" "}
            <strong>sidequest.camp</strong>, our Telegram notification bots, and our APIs.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "12px", color: "var(--foreground)" }}>
            2. Personal Data We Collect
          </h2>
          <p>We minimize data collection to strictly what is essential to provide our service:</p>
          <ul style={{ listStyleType: "disc", paddingLeft: "24px", marginTop: "8px", display: "flex", flexDirection: "column", gap: "8px" }}>
            <li>
              <strong>Account Information:</strong> When you register or log in, we collect your email address and authentication credentials securely managed via Supabase Auth. We never see or store your plaintext passwords.
            </li>
            <li>
              <strong>Saved Quests & Preferences:</strong> Your bookmarked hackathons, timeline statuses, and alert preferences are stored to sync across your authenticated sessions.
            </li>
            <li>
              <strong>Event Submissions:</strong> If you submit a hackathon, we collect the event title, links, organizer contact email, prize pool figures, and venue details.
            </li>
            <li>
              <strong>Network & Security Telemetry:</strong> For automated defense against abuse, DDoS, and brute force attacks, our in-memory sliding window rate limiters log hashed client IP addresses and user agents. These logs expire automatically every 60 seconds.
            </li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "12px", color: "var(--foreground)" }}>
            3. Lawful Basis & Purpose of Processing
          </h2>
          <p>We process your personal data under the following legal frameworks:</p>
          <ul style={{ listStyleType: "disc", paddingLeft: "24px", marginTop: "8px", display: "flex", flexDirection: "column", gap: "8px" }}>
            <li><strong>Consent:</strong> Explicit user opt-in for account creation, newsletter digests, and Telegram alert triggers.</li>
            <li><strong>Contractual Necessity:</strong> Providing your personalized Quest Log, calendar iCal feed generation, and saved bookmarks.</li>
            <li><strong>Legitimate Interest & Security:</strong> Mitigating denial-of-service attempts, preventing scraping, and validating API input integrity.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "12px", color: "var(--foreground)" }}>
            4. Third-Party Data Processors
          </h2>
          <p>We work exclusively with vetted infrastructure partners who adhere to rigorous data protection standards:</p>
          <div style={{ overflowX: "auto", marginTop: "12px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border)", textAlign: "left" }}>
                  <th style={{ padding: "8px" }}>Processor</th>
                  <th style={{ padding: "8px" }}>Role</th>
                  <th style={{ padding: "8px" }}>Location</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "8px" }}><strong>Supabase Inc.</strong></td>
                  <td style={{ padding: "8px" }}>PostgreSQL Database & Authentication</td>
                  <td style={{ padding: "8px" }}>AWS Singapore / Frankfurt</td>
                </tr>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "8px" }}><strong>Vercel Inc.</strong></td>
                  <td style={{ padding: "8px" }}>Edge Computing & Hosting Platform</td>
                  <td style={{ padding: "8px" }}>Global Edge CDN</td>
                </tr>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "8px" }}><strong>Resend Inc.</strong></td>
                  <td style={{ padding: "8px" }}>Transactional Auth & Reset Emails</td>
                  <td style={{ padding: "8px" }}>US East (N. Virginia)</td>
                </tr>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "8px" }}><strong>Telegram LLC</strong></td>
                  <td style={{ padding: "8px" }}>Alert Delivery via Bot API</td>
                  <td style={{ padding: "8px" }}>Global Infrastructure</td>
                </tr>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "8px" }}><strong>Google Gemini API</strong></td>
                  <td style={{ padding: "8px" }}>AI Event Normalization & Extraction</td>
                  <td style={{ padding: "8px" }}>Global Data Centers</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "12px", color: "var(--foreground)" }}>
            5. Cascading Erasure & Right to Be Forgotten
          </h2>
          <p>
            Under Section 12 of the DPDP Act and Article 17 of the GDPR, you maintain an absolute right to erasure.
            SideQuest provides an automated, self-serve data erasure tool:
          </p>
          <div
            style={{
              background: "rgba(182, 245, 0, 0.08)",
              border: "1.5px dashed var(--brand)",
              borderRadius: "14px",
              padding: "16px",
              marginTop: "12px",
            }}
          >
            <p style={{ margin: 0, fontSize: "14px" }}>
              ⚡ <strong>Instant Erasure:</strong> You can permanently wipe your account, saved bookmarks, alert rules, and Supabase auth identity anytime directly from your{" "}
              <Link href="/profile" style={{ textDecoration: "underline", fontWeight: 600 }}>
                Profile Settings
              </Link>{" "}
              via our audited cascading deletion endpoint (<code>DELETE /api/user/account</code>).
            </p>
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "12px", color: "var(--foreground)" }}>
            6. Cookies & Tracking
          </h2>
          <p>
            SideQuest does not use cross-site tracking cookies, behavioral ad-tech beacons, or fingerprinting scripts. We only utilize strictly necessary functional local storage keys for your dark/light UI preference and encrypted Supabase session tokens.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "12px", color: "var(--foreground)" }}>
            7. Grievance Redressal Officer (DPDP Act Compliance)
          </h2>
          <p>
            In accordance with Rule 3 of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules and the Digital Personal Data Protection Act, 2023, the details of our Data Protection & Grievance Officer are:
          </p>
          <div
            style={{
              background: "var(--muted)",
              borderRadius: "14px",
              padding: "20px",
              marginTop: "12px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              fontSize: "14px",
            }}
          >
            <div><strong>Designation:</strong> Data Protection & Grievance Redressal Officer</div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Mail size={15} /> <strong>Email:</strong>{" "}
              <a href="mailto:grievance@sidequest.camp" style={{ textDecoration: "underline" }}>
                grievance@sidequest.camp
              </a>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <MapPin size={15} /> <strong>Jurisdiction & Address:</strong> SideQuest Technologies, Raipur, Chhattisgarh, India - 492001
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Clock size={15} /> <strong>Response SLA:</strong> Acknowledged within 24 hours; resolved within 72 hours.
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
