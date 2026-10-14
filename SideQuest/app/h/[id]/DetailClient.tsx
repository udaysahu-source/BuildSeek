"use client";

import { useCountdownClock } from "@/components/sidequest/discovery-state";
import { HackathonDetail } from "@/components/sidequest/hackathon-detail";
import type { HackathonUI } from "@/lib/hackathons";

export function HackathonDetailClient({ event }: { event: HackathonUI }) {
  const now = useCountdownClock(Date.now());
  return <HackathonDetail event={event} now={now} />;
}
