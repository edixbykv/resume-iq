import { NextRequest, NextResponse } from "next/server";
import { runFullAnalysis } from "@/lib/engine";
import { saveAnalysis } from "@/lib/persist";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") ?? "";

    // Path A: multipart file upload (PDF / DOCX)
    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file");
      if (!(file instanceof File)) {
        return NextResponse.json({ error: "No file provided." }, { status: 400 });
      }
      if (file.size > MAX_BYTES) {
        return NextResponse.json({ error: "File too large (max 8MB)." }, { status: 413 });
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await runFullAnalysis(buffer, file.name, file.type, undefined);
      if (result.fields.stats.wordCount < 40) {
        return NextResponse.json(
          { error: "Could not extract enough text. If this is a scanned PDF, upload a text-based PDF or DOCX." },
          { status: 422 },
        );
      }
      await saveAnalysis(result, file.name);
      return NextResponse.json(result);
    }

    // Path B: pasted plain text
    const body = await req.json().catch(() => ({}));
    const text = typeof body.text === "string" ? body.text : "";
    if (text.trim().length < 40) {
      return NextResponse.json({ error: "Please provide a resume file or paste resume text." }, { status: 400 });
    }
    const result = await runFullAnalysis(null, "pasted.txt", undefined, text);
    await saveAnalysis(result, "pasted.txt");
    return NextResponse.json(result);
  } catch (err) {
    console.error("analyze error", err);
    return NextResponse.json({ error: "Analysis failed. Please try a different file." }, { status: 500 });
  }
}
