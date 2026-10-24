import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Discover Hackathons",
  description: "Browse Indian student hackathons with live deadline radar, college organizers, and prize pools.",
};

export default function DiscoverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
