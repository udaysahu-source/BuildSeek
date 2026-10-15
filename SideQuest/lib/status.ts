import { HackathonStatus } from "./types";

/**
 * Computes dynamic status at query/render time based on registration dates.
 * - upcoming: now < reg_start
 * - closing_soon: now >= reg_start and now < reg_deadline and (reg_deadline - now) <= 72 hours
 * - open: now >= reg_start and now < reg_deadline and (reg_deadline - now) > 72 hours
 * - closed: now >= reg_deadline
 */
export function computeHackathonStatus(
  regStart?: string | Date | null,
  regDeadline?: string | Date | null,
  referenceNow: Date = new Date()
): HackathonStatus {
  const now = referenceNow.getTime();

  if (!regDeadline) {
    if (regStart && new Date(regStart).getTime() > now) {
      return "upcoming";
    }
    return "open";
  }

  const deadline = new Date(regDeadline).getTime();
  if (isNaN(deadline)) return "open";

  if (now >= deadline) {
    return "closed";
  }

  if (regStart) {
    const start = new Date(regStart).getTime();
    if (!isNaN(start) && now < start) {
      return "upcoming";
    }
  }

  const msRemaining = deadline - now;
  const hoursRemaining = msRemaining / (1000 * 60 * 60);

  if (hoursRemaining <= 72) {
    return "closing_soon";
  }

  return "open";
}

/**
 * Generates human readable countdown label for cards and detail headers.
 */
export function formatDeadlineCountdown(
  regDeadline?: string | Date | null,
  referenceNow: Date = new Date()
): { label: string; isClosingSoon: boolean; isClosed: boolean } {
  if (!regDeadline) {
    return { label: "Deadline not stated", isClosingSoon: false, isClosed: false };
  }

  const deadline = new Date(regDeadline).getTime();
  if (isNaN(deadline)) {
    return { label: "Deadline not stated", isClosingSoon: false, isClosed: false };
  }

  const now = referenceNow.getTime();
  const msRemaining = deadline - now;

  if (msRemaining <= 0) {
    return { label: "Registration closed", isClosingSoon: false, isClosed: true };
  }

  const hours = Math.floor(msRemaining / (1000 * 60 * 60));
  const isClosingSoon = hours <= 72;

  if (hours < 1) {
    const minutes = Math.max(1, Math.floor(msRemaining / (1000 * 60)));
    return { label: `Ends in ${minutes}m`, isClosingSoon, isClosed: false };
  }

  if (hours < 24) {
    const minutes = Math.floor((msRemaining % (1000 * 60 * 60)) / (1000 * 60));
    return { label: `Ends in ${hours}h ${minutes}m`, isClosingSoon, isClosed: false };
  }

  const days = Math.floor(hours / 24);
  if (days === 1) {
    return { label: "Ends tomorrow", isClosingSoon, isClosed: false };
  }

  if (hours <= 72) {
    return { label: `Ends in ${days} days (${hours}h)`, isClosingSoon, isClosed: false };
  }

  return { label: `${days} days left`, isClosingSoon, isClosed: false };
}
