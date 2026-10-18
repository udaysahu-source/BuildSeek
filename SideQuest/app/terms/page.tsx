import type { Metadata } from "next";
import Link from "next/link";
import { Scale, AlertCircle, ArrowLeft, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Terms of Service | SideQuest",
  description:
    "Terms of Service, Acceptable Use Policy, and AI disclaimers governing the use of SideQuest.",
  alternates: {
    canonical: "https://sidequest.camp/terms",
  },
};

export default function TermsOfServicePage() {
  return (
    <main className="sq-container" style={{ padding: "48px 16px 96px", maxWidth: "840px", margin: "0 auto" }}>
      <div style={{ marginBottom: "32px" }}>
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link href="/">
            <ArrowLeft size={16} className="mr-1" /> Back to Home
          </Link>
        </Button>
        <div className="sq-eyebrow" style={{ display: "inline-flex", gap: "6px", alignItems: "center" }}>
          <Scale size={14} /> Legal & Terms
        </div>
        <h1 style={{ fontSize: "36px", fontWeight: 800, marginTop: "8px", marginBottom: "8px" }}>
          Terms of Service
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
            1. Agreement to Terms
          </h2>
          <p>
            By accessing or using SideQuest (<strong>sidequest.camp</strong>), our Telegram notification bots, APIs, or related services, you agree to be bound by these Terms of Service. If you do not agree, you must discontinue use of the platform immediately.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "12px", color: "var(--foreground)" }}>
            2. Acceptable Use & Security Rules
          </h2>
          <p>You agree to use SideQuest solely for lawful purposes. You shall not:</p>
          <ul style={{ listStyleType: "disc", paddingLeft: "24px", marginTop: "8px", display: "flex", flexDirection: "column", gap: "8px" }}>
            <li>Deploy automated crawlers, scrapers, or bots against SideQuest endpoints without explicit written consent.</li>
            <li>Attempt to bypass rate limits, probe private routes, or execute Denial of Service (DoS) attacks.</li>
            <li>Submit malicious URLs, fraudulent prize pools, phishing payloads, or spam events via our community submission portal.</li>
            <li>Attempt to access, tamper with, or mutate other users’ profiles or private bookmark datasets (Broken Object Level Authorization).</li>
          </ul>
        </section>

        <section>
          <div
            style={{
              background: "rgba(255, 170, 0, 0.08)",
              border: "1.5px solid rgba(255, 170, 0, 0.35)",
              borderRadius: "14px",
              padding: "20px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", color: "#D97706" }}>
              <AlertCircle size={20} />
              <h2 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>
                3. AI Data Extraction & Verification Disclaimer
              </h2>
            </div>
            <p style={{ fontSize: "14px", color: "var(--foreground)", margin: 0 }}>
              SideQuest leverages automated crawlers and AI models (including Google Gemini) to extract, categorize, and normalize hackathon metadata from university portals, Unstop, Devfolio, and organizer websites. While we strive for accuracy, dates, eligibility criteria, prize distributions, and registration fees may change without notice.{" "}
              <strong>
                You are strongly advised to independently verify all critical event details on the organizer’s official portal before booking travel, accommodation, or paying registration fees.
              </strong>
            </p>
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "12px", color: "var(--foreground)" }}>
            4. Intellectual Property
          </h2>
          <p>
            All hackathon names, logos, sponsor trademarks, and campus banners displayed on SideQuest belong to their respective university, collegiate, or corporate owners. Their display on SideQuest constitutes nominative fair use for indexing and directory discovery purposes.
          </p>
          <p style={{ marginTop: "10px" }}>
            The SideQuest brand, custom mascot artwork, UI code, design system, and proprietary ranking algorithms are the intellectual property of SideQuest Technologies.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "12px", color: "var(--foreground)" }}>
            5. Limitation of Liability
          </h2>
          <p>
            SideQuest is an informational directory and notification utility. Under no circumstances shall SideQuest, its maintainers, or affiliates be liable for:
          </p>
          <ul style={{ listStyleType: "disc", paddingLeft: "24px", marginTop: "8px", display: "flex", flexDirection: "column", gap: "8px" }}>
            <li>Event cancellations, postponements, or venue changes made by hackathon organizers.</li>
            <li>Disputes regarding prize disbursements, judging outcomes, or team disqualifications.</li>
            <li>Travel expenses, ticketing losses, or accommodation costs incurred by participants.</li>
            <li>Service interruptions or delayed delivery of Telegram / email notifications.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "12px", color: "var(--foreground)" }}>
            6. Governing Law & Dispute Jurisdiction
          </h2>
          <p>
            These Terms of Service are governed by and construed in accordance with the laws of the Republic of India. Any disputes arising out of or relating to these terms or your use of SideQuest shall be subject to the exclusive jurisdiction of the competent courts situated in <strong>Raipur, Chhattisgarh, India</strong>.
          </p>
        </section>
      </div>
    </main>
  );
}
