import { NextRequest, NextResponse } from "next/server";
import { analyzeLinkedIn } from "@/lib/engine/linkedin";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const profileText = typeof body.profileText === "string" ? body.profileText : "";
    const headline = typeof body.headline === "string" ? body.headline : undefined;
    if (profileText.trim().length < 30) {
      return NextResponse.json(
        { error: "Paste your LinkedIn headline + About section (min 30 chars) for analysis." },
        { status: 400 },
      );
    }
    return NextResponse.json(analyzeLinkedIn(profileText, headline));
  } catch (err) {
    console.error("linkedin error", err);
    return NextResponse.json({ error: "LinkedIn analysis failed." }, { status: 500 });
  }
}
