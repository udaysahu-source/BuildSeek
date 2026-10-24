import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Deadline Alerts & Radar",
  description: "Automated Telegram deadline alerts and calendar integration before hackathon registrations close.",
};

export default function AlertsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
