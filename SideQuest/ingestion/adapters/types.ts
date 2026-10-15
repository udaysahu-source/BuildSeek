import { Hackathon, OrganizerType } from "@/lib/types";

export interface RawItem {
  [key: string]: any;
}

export interface SourceAdapter {
  name: string;
  isEnabled(): boolean;
  fetchListings(useFixture?: boolean): Promise<RawItem[]>;
  normalize(raw: RawItem): Hackathon | null;
}

/**
 * Guesses organizer_type only from clear keywords, otherwise defaults to 'other'.
 * Government detection: ministries, government bodies, and government-run programmes
 * (e.g. Ministry of Education Innovation Cell, AICTE, MeitY, Startup India, state departments).
 * A government-funded institute running its own college fest is 'college', not 'government'.
 */
export function detectOrganizerType(name: string = ""): OrganizerType {
  const lower = name.toLowerCase();

  // Government: ministries, AICTE, MeitY, government departments, Startup India
  if (
    /\b(ministry|aicte|meity|dst|drdo|isro|nic|startup india|niti aayog|innovation cell|gov\.in|department of)\b/i.test(
      lower
    ) &&
    !/\b(institute|college|university|iit|nit|iiit|bits)\b/i.test(lower)
  ) {
    return "government";
  }

  // College / University
  if (
    /\b(college|university|institute|campus|iit|nit|iiit|bits|vit|srm|dtu|nsut|faculty|fest|engineering|polytechnic)\b/i.test(
      lower
    )
  ) {
    return "college";
  }

  // Non-profit
  if (/\b(foundation|nonprofit|non-profit|ngo|charity|trust)\b/i.test(lower)) {
    return "nonprofit";
  }

  // Community
  if (
    /\b(community|chapter|gdg|ieee|acm|club|society|meetup|dev club|hacker club)\b/i.test(
      lower
    )
  ) {
    return "community";
  }

  // Company / Corporate
  if (
    /\b(pvt|ltd|inc|llc|corp|corporation|technologies|solutions|labs|systems|aws|amazon|google|meta|microsoft|paypal|nebius|nvidia)\b/i.test(
      lower
    )
  ) {
    return "company";
  }

  return "other";
}
