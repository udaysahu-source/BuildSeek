import { Hackathon } from "./types";

function formatIcsDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

/**
 * Generates an RFC 5545 compliant iCalendar string for a list of bookmarked hackathons.
 * Creates two events per hackathon:
 * 1. The urgent registration deadline
 * 2. The main event dates
 */
export function generateIcsFeed(
  hackathons: Hackathon[],
  calendarName: string = "SideQuest Bookmarked Hackathons"
): string {
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SideQuest//Hackathon Radar v1.0//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeIcsText(calendarName)}`,
    "X-WR-TIMEZONE:Asia/Kolkata",
  ];

  const now = new Date();
  const dtStamp = formatIcsDate(now);

  for (const h of hackathons) {
    // 1. Registration Deadline Event (if deadline is stated)
    if (h.reg_deadline) {
      const regDeadline = new Date(h.reg_deadline);
      if (!isNaN(regDeadline.getTime())) {
        lines.push("BEGIN:VEVENT");
        lines.push(`UID:reg-deadline-${h.id}@sidequest.app`);
        lines.push(`DTSTAMP:${dtStamp}`);
        lines.push(`DTSTART:${formatIcsDate(regDeadline)}`);
        lines.push(
          `DTEND:${formatIcsDate(new Date(regDeadline.getTime() + 60 * 60 * 1000))}`
        );
        lines.push(`SUMMARY:${escapeIcsText(`⏰ [DEADLINE] ${h.title}`)}`);
        lines.push(
          `DESCRIPTION:${escapeIcsText(
            `Registration deadline for ${h.title} (by ${h.organizer}).\nPrize: ${
              h.prize_text || "Trophy/Swag"
            }\nRegister here: ${h.source_url}`
          )}`
        );
        lines.push(`URL:${h.source_url}`);
        lines.push("STATUS:CONFIRMED");
        lines.push("BEGIN:VALARM");
        lines.push("ACTION:DISPLAY");
        lines.push("DESCRIPTION:Registration deadline closes in 24 hours!");
        lines.push("TRIGGER:-P1D"); // 24 hours before
        lines.push("END:VALARM");
        lines.push("END:VEVENT");
      }
    }

    // 2. Hackathon Runtime Event (if dates are stated)
    if (h.start_date && h.end_date) {
      const startDate = new Date(h.start_date);
      const endDate = new Date(h.end_date);
      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        lines.push("BEGIN:VEVENT");
        lines.push(`UID:event-dates-${h.id}@sidequest.app`);
        lines.push(`DTSTAMP:${dtStamp}`);
        lines.push(`DTSTART:${formatIcsDate(startDate)}`);
        lines.push(`DTEND:${formatIcsDate(endDate)}`);
        lines.push(`SUMMARY:${escapeIcsText(`🚀 ${h.title}`)}`);
    lines.push(
      `DESCRIPTION:${escapeIcsText(
        `${h.summary || h.description || h.title}\nMode: ${h.mode}${
          h.city ? ` (${h.city})` : ""
        }\nSource: ${h.source_url}`
      )}`
    );
    lines.push(`URL:${h.source_url}`);
    lines.push("STATUS:CONFIRMED");
    lines.push("END:VEVENT");
      }
    }
  }

  lines.push("END:VCALENDAR");

  return lines.join("\r\n");
}
