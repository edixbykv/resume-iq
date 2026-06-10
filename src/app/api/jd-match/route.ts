import { NextRequest, NextResponse } from "next/server";
import { matchJobDescription } from "@/lib/engine";
import { simulateRecruiter } from "@/lib/engine/recruiter";
import type { ResumeFields, SubScores } from "@/lib/engine";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const fields = body.fields as ResumeFields | undefined;
    const subScores = body.subScores as SubScores | undefined;
    const overallScore = typeof body.overallScore === "number" ? body.overallScore : 0;
    const jd = typeof body.jd === "string" ? body.jd : "";

    if (!fields || jd.trim().length < 30) {
      return NextResponse.json({ error: "Provide resume fields and a job description (min 30 chars)." }, { status: 400 });
    }

    const match = matchJobDescription(fields, jd);
    // Re-run recruiter simulation with the JD blended in.
    const recruiter = subScores ? simulateRecruiter(subScores, overallScore, match) : null;

    return NextResponse.json({ match, recruiter });
  } catch (err) {
    console.error("jd-match error", err);
    return NextResponse.json({ error: "Matching failed." }, { status: 500 });
  }
}
