import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Submit a Hackathon",
  description: "Submit a student hackathon to BuildSeek for multi-platform distribution across India.",
};

export default function SubmitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
