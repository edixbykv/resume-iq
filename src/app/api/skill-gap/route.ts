import { NextRequest, NextResponse } from "next/server";
import { analyzeSkillGap } from "@/lib/engine";
import type { ResumeFields } from "@/lib/engine";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const fields = body.fields as ResumeFields | undefined;
    const targetRole = typeof body.targetRole === "string" ? body.targetRole.trim() : undefined;

    if (!fields || typeof fields !== "object") {
      return NextResponse.json({ error: "Resume fields required." }, { status: 400 });
    }
    if (!targetRole || targetRole.length < 1) {
      return NextResponse.json({ error: "Target role is required." }, { status: 400 });
    }
    if (targetRole.length > 200) {
      return NextResponse.json({ error: "Target role must be less than 200 characters." }, { status: 400 });
    }

    return NextResponse.json(analyzeSkillGap(fields, targetRole));
  } catch (err) {
    console.error("skill-gap error", err);
    return NextResponse.json({ error: "Skill gap analysis failed." }, { status: 500 });
  }
}