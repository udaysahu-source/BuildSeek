import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getHackathonById } from "@/lib/db/hackathons";
import { normalizeHackathon, type HackathonUI } from "@/lib/hackathons";
import { HackathonDetailClient } from "./DetailClient";
import { Mascot } from "@/components/sidequest/mascot";
import { Button } from "@/components/ui/button";

interface DetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: DetailPageProps) {
  const { id } = await params;
  const hackathon = await getHackathonById(id);
  if (!hackathon) {
    return { title: "Quest not found — BuildSeek" };
  }
  return {
    title: `${hackathon.title} — BuildSeek`,
    description: `Explore ${hackathon.title}. Deadlines, prize pool, team size, eligibility, and direct registration details.`,
  };
}

export default async function HackathonDetailPage({ params }: DetailPageProps) {
  const { id } = await params;
  const hackathon = await getHackathonById(id);

  if (!hackathon) {
    return (
      <main className="sq-detail-page">
        <div className="sq-discovery-empty">
          <Mascot />
          <h1>Quest not found.</h1>
          <p>This event isn’t on the board.</p>
          <Button asChild>
            <Link href="/discover">Back to Discover</Link>
          </Button>
        </div>
      </main>
    );
  }

  const normalized = normalizeHackathon(hackathon);

  return (
    <main className="sq-detail-page">
      <HackathonDetailClient event={normalized} />
    </main>
  );
}
