import { Placeholder } from "@/components/sidequest/placeholder";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Put your hackathon on the board — SideQuest",
  description: "Bring your campus challenge to India’s student builders.",
};

export default function SubmitPage() {
  return (
    <Placeholder
      title="Put your hackathon on the board"
      description="Bring your campus challenge to India’s student builders."
    />
  );
}
