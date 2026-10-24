import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quest Log",
  description: "Your saved hackathons, target bookmarked events, and application tracking noticeboard.",
};

export default function QuestLogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
