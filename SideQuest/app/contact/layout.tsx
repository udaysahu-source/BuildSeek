import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact & Support",
  description: "Get in touch with the BuildSeek team for feedback, organizer inquiries, or bug reports.",
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
