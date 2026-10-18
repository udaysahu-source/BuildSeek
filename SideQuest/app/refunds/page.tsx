import type { Metadata } from "next";
import Link from "next/link";
import { RotateCcw, CreditCard, Clock, Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy | SideQuest",
  description:
    "Refund and Cancellation Policy for SideQuest services, partnerships, and event listings.",
  alternates: {
    canonical: "https://sidequest.camp/refunds",
  },
};

export default function RefundsPage() {
  return (
    <main className="sq-container" style={{ padding: "48px 16px 96px", maxWidth: "840px", margin: "0 auto" }}>
      <div style={{ marginBottom: "32px" }}>
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link href="/">
            <ArrowLeft size={16} className="mr-1" /> Back to Home
          </Link>
        </Button>
        <div className="sq-eyebrow" style={{ display: "inline-flex", gap: "6px", alignItems: "center" }}>
          <RotateCcw size={14} /> Commercial & Billing
        </div>
        <h1 style={{ fontSize: "36px", fontWeight: 800, marginTop: "8px", marginBottom: "8px" }}>
          Refund & Cancellation Policy
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
            1. Free Tier for Students & Hackers
          </h2>
          <p>
            SideQuest is completely free for students, developers, and campus builders. Browsing the hackathon directory, bookmarking events, exporting iCal feeds, and receiving automated Telegram reminders are free of cost. No subscription fees or payment methods are collected for student participation.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "12px", color: "var(--foreground)" }}>
            2. Featured Organizer Listings & Sponsorships
          </h2>
          <p>
            Hackathon organizers, collegiate societies, and enterprise sponsors may purchase featured placement, spotlight newsletter mentions, or priority broadcast alerts on SideQuest. The following refund and cancellation conditions apply:
          </p>
          <ul style={{ listStyleType: "disc", paddingLeft: "24px", marginTop: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <li>
              <strong>Prior to Campaign Launch:</strong> If you request cancellation at least <strong>48 hours before</strong> your featured promotion campaign goes live on the platform or newsletter, you are eligible for a <strong>100% full refund</strong>.
            </li>
            <li>
              <strong>Live Campaigns:</strong> Once a featured badge, banner, or Telegram broadcast blast has been deployed to our audience, listing fees are <strong>non-refundable</strong> due to immediate distribution of impressions and clicks.
            </li>
            <li>
              <strong>Technical Non-Delivery:</strong> In the rare event that a verified technical failure on SideQuest prevents your paid event from being displayed as agreed, we will either extend your placement or issue a <strong>100% full refund</strong> within 5 to 7 business days.
            </li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "12px", color: "var(--foreground)" }}>
            3. Refund Process & Turnaround Time
          </h2>
          <p>
            All approved refunds are credited back to the original source payment method (Credit Card, Debit Card, Net Banking, or UPI via Razorpay / Stripe).
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
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Clock size={15} /> <strong>Processing Window:</strong> Refunds typically reflect in your bank account within <strong>5–7 working days</strong>, subject to your banking partner.
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Mail size={15} /> <strong>Billing Inquiries:</strong> Contact our billing desk at{" "}
              <a href="mailto:billing@sidequest.camp" style={{ textDecoration: "underline" }}>
                billing@sidequest.camp
              </a>{" "}
              with your transaction reference ID.
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
