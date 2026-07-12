import { NextRequest, NextResponse } from "next/server";
import { analyzeLinkedIn } from "@/lib/engine/linkedin";

export const runtime = "nodejs";

const MIN_PROFILE_LENGTH = 30;
const MAX_PROFILE_LENGTH = 10_000;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const profileText = typeof body.profileText === "string" ? body.profileText.trim() : "";
    const headline = typeof body.headline === "string" ? body.headline.trim() : undefined;

    if (profileText.length < MIN_PROFILE_LENGTH) {
      return NextResponse.json(
        { error: `Paste your LinkedIn headline + About section (min ${MIN_PROFILE_LENGTH} chars) for analysis.` },
        { status: 400 },
      );
    }
    if (profileText.length > MAX_PROFILE_LENGTH) {
      return NextResponse.json(
        { error: `LinkedIn profile text must be less than ${MAX_PROFILE_LENGTH} characters.` },
        { status: 400 },
      );
    }
    if (headline && headline.length > 500) {
      return NextResponse.json(
        { error: "Headline must be less than 500 characters." },
        { status: 400 },
      );
    }

    return NextResponse.json(analyzeLinkedIn(profileText, headline));
  } catch (err) {
    console.error("linkedin error", err);
    return NextResponse.json({ error: "LinkedIn analysis failed." }, { status: 500 });
  }
}