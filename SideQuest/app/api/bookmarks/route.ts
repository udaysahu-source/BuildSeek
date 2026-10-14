import { NextRequest, NextResponse } from "next/server";
import { getUserBookmarkedHackathons, toggleBookmark } from "@/lib/db/bookmarks";

export async function GET() {
  const bookmarks = await getUserBookmarkedHackathons();
  return NextResponse.json({ bookmarks });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hackathonId, userId } = body;

    if (!hackathonId) {
      return NextResponse.json(
        { error: "hackathonId is required" },
        { status: 400 }
      );
    }

    const result = await toggleBookmark(hackathonId, userId);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update bookmark" },
      { status: 500 }
    );
  }
}
