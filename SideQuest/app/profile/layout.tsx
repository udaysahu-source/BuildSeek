import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile & Settings",
  description: "Manage your BuildSeek account preferences, data privacy, and notification settings.",
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
