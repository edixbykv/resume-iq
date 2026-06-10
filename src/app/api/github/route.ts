import { NextRequest, NextResponse } from "next/server";
import { analyzeGithub } from "@/lib/engine";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const url = typeof body.url === "string" ? body.url.trim() : "";
    if (!url) return NextResponse.json({ error: "Provide a GitHub username or URL." }, { status: 400 });
    const report = await analyzeGithub(url);
    return NextResponse.json(report);
  } catch (err) {
    console.error("github error", err);
    return NextResponse.json({ error: "GitHub analysis failed." }, { status: 500 });
  }
}
