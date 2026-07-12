import { NextRequest, NextResponse } from "next/server";
import { matchJobDescription } from "@/lib/engine";
import { simulateRecruiter } from "@/lib/engine/recruiter";
import { JdMatchSchema } from "@/lib/validation";
import type { ResumeFields, SubScores } from "@/lib/engine";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = JdMatchSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Invalid request.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const fields = parsed.data.fields as unknown as ResumeFields;
    const subScores = parsed.data.subScores as SubScores | undefined;
    const overallScore = parsed.data.overallScore ?? 0;
    const jd = parsed.data.jd;

    const match = matchJobDescription(fields, jd);
    // Re-run recruiter simulation with the JD blended in.
    const recruiter = subScores ? simulateRecruiter(subScores, overallScore, match) : null;

    return NextResponse.json({ match, recruiter });
  } catch (err) {
    console.error("jd-match error", err);
    return NextResponse.json({ error: "Matching failed." }, { status: 500 });
  }
}