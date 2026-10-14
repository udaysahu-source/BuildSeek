import { Placeholder } from "@/components/sidequest/placeholder";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Never miss your moment — SideQuest",
  description: "Timely Telegram reminders and opportunities that match your interests.",
};

export default function AlertsPage() {
  return (
    <Placeholder
      title="Never miss your moment"
      description="Timely Telegram reminders and opportunities that match your interests."
    />
  );
}
