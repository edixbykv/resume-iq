import mammoth from "mammoth";
import { normalize } from "./text-utils";

export interface ParsedDocument {
  text: string;
  pages: number;
  source: "pdf" | "docx" | "text";
}

/**
 * Resume parsing pipeline. Accepts a file buffer + mime/name and returns
 * clean text plus a page estimate. Uses `unpdf` (serverless-safe) for PDFs
 * and `mammoth` for DOCX.
 */
export async function parseResume(
  buffer: Buffer | ArrayBuffer,
  fileName: string,
  mime?: string,
): Promise<ParsedDocument> {
  const name = fileName.toLowerCase();
  const buf = buffer instanceof ArrayBuffer ? Buffer.from(buffer) : buffer;

  const isPdf = mime?.includes("pdf") || name.endsWith(".pdf");
  const isDocx =
    mime?.includes("officedocument") ||
    mime?.includes("msword") ||
    name.endsWith(".docx") ||
    name.endsWith(".doc");

  if (isPdf) {
    const { extractText, getDocumentProxy } = await import("unpdf");
    const uint8 = new Uint8Array(buf);
    const pdf = await getDocumentProxy(uint8);
    const { text, totalPages } = await extractText(pdf, { mergePages: true });
    return {
      text: normalize(Array.isArray(text) ? text.join("\n") : text),
      pages: totalPages || 1,
      source: "pdf",
    };
  }

  if (isDocx) {
    const { value } = await mammoth.extractRawText({ buffer: buf });
    const text = normalize(value);
    return { text, pages: Math.max(1, Math.ceil(text.length / 3500)), source: "docx" };
  }

  // Plain text fallback (e.g. pasted resume).
  const text = normalize(buf.toString("utf-8"));
  return { text, pages: Math.max(1, Math.ceil(text.length / 3500)), source: "text" };
}
