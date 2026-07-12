import { NextRequest, NextResponse } from "next/server";
import { runFullAnalysis } from "@/lib/engine";
import { saveAnalysis } from "@/lib/persist";
import { auth } from "@/auth";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".txt"];
const MIN_TEXT_LENGTH = 40;
const MAX_TEXT_LENGTH = 50_000;

// Common file magic bytes for validation
const FILE_SIGNATURES: Record<string, Uint8Array[]> = {
  "application/pdf": [new Uint8Array([0x25, 0x50, 0x44, 0x46])], // %PDF
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    new Uint8Array([0x50, 0x4b, 0x03, 0x04]), // PK\x03\x04 (ZIP/DOCX)
  ],
};

function checkFileSignature(buffer: Uint8Array, mime: string): boolean {
  const sigs = FILE_SIGNATURES[mime];
  if (!sigs) return true; // Unknown MIME, skip signature check
  return sigs.some((sig) => {
    if (buffer.length < sig.length) return false;
    return sig.every((byte, i) => buffer[i] === byte);
  });
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") ?? "";

    // Get authenticated user (null if not signed in)
    const session = await auth();
    const userId = session?.user?.id ?? undefined;

    // Path A: multipart file upload (PDF / DOCX)
    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = (form as unknown as { get: (name: string) => unknown }).get("file");
      if (!(file instanceof File)) {
        return NextResponse.json({ error: "No file provided." }, { status: 400 });
      }

      // Validate file extension
      const ext = "." + file.name.split(".").pop()?.toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        return NextResponse.json(
          { error: `Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}.` },
          { status: 400 },
        );
      }

      // Validate file size
      if (file.size > MAX_BYTES) {
        return NextResponse.json({ error: "File too large (max 8MB)." }, { status: 413 });
      }
      if (file.size === 0) {
        return NextResponse.json({ error: "Empty file provided." }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());

      // Validate file signature (magic bytes)
      const mime = file.type || "application/octet-stream";
      if (!checkFileSignature(new Uint8Array(buffer), mime === "application/octet-stream" && ext === ".pdf" ? "application/pdf" : mime)) {
        return NextResponse.json({ error: "File signature does not match the expected format." }, { status: 400 });
      }

      const result = await runFullAnalysis(buffer, file.name, file.type, undefined);
      if (result.fields.stats.wordCount < 40) {
        return NextResponse.json(
          { error: "Could not extract enough text. If this is a scanned PDF, upload a text-based PDF or DOCX." },
          { status: 422 },
        );
      }
      await saveAnalysis(result, file.name, userId);
      return NextResponse.json(result);
    }

    // Path B: pasted plain text
    const body = await req.json().catch(() => ({}));
    const text = typeof body.text === "string" ? body.text.trim() : "";
    if (text.length < MIN_TEXT_LENGTH) {
      return NextResponse.json(
        { error: `Please provide resume text of at least ${MIN_TEXT_LENGTH} characters.` },
        { status: 400 },
      );
    }
    if (text.length > MAX_TEXT_LENGTH) {
      return NextResponse.json(
        { error: `Resume text must be less than ${MAX_TEXT_LENGTH} characters.` },
        { status: 400 },
      );
    }

    const result = await runFullAnalysis(null, "pasted.txt", undefined, text);
    await saveAnalysis(result, "pasted.txt", userId);
    return NextResponse.json(result);
  } catch (err) {
    console.error("analyze error", err);
    return NextResponse.json({ error: "Analysis failed. Please try a different file." }, { status: 500 });
  }
}