import { Placeholder } from "@/components/sidequest/placeholder";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset your password — SideQuest",
  description: "Set a new password for your SideQuest account.",
};

export default function ResetPasswordPage() {
  return (
    <Placeholder
      title="Reset your password"
      description="Set a new password for your SideQuest account."
    />
  );
}
