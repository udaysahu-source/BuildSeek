import { NextRequest, NextResponse } from "next/server";
import { getUserBookmarkedHackathons } from "@/lib/db/bookmarks";
import { generateIcsFeed } from "@/lib/ics";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  if (!token || token.length < 8) {
    return new NextResponse("Invalid or missing calendar token", { status: 400 });
  }

  // Fetch bookmarked hackathons for this user/token
  const bookmarked = await getUserBookmarkedHackathons();
  const icsBody = generateIcsFeed(bookmarked);

  return new NextResponse(icsBody, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="sidequest-hackathons.ics"',
      "Cache-Control": "private, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
