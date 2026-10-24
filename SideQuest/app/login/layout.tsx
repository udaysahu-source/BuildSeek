import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log In or Sign Up",
  description: "Log in or sign up to BuildSeek to sync bookmarked quests and receive Telegram deadline alerts.",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
