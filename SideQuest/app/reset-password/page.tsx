import { Placeholder } from "@/components/sidequest/placeholder";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset your password | BuildSeek",
  description: "Set a new password for your BuildSeek account.",
};

export default function ResetPasswordPage() {
  return (
    <Placeholder
      title="Reset your password"
      description="Set a new password for your BuildSeek account."
    />
  );
}
