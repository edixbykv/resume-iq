import { NextRequest, NextResponse } from "next/server";
import { analyzeGithub } from "@/lib/engine";
import { GithubSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = GithubSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Invalid request.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }
    const report = await analyzeGithub(parsed.data.url);
    return NextResponse.json(report);
  } catch (err) {
    console.error("github error", err);
    return NextResponse.json({ error: "GitHub analysis failed." }, { status: 500 });
  }
}