import { NextRequest, NextResponse } from "next/server";
import { analyzePortfolio } from "@/lib/engine/portfolio";
import { PortfolioSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = PortfolioSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Invalid request.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }
    return NextResponse.json(await analyzePortfolio(parsed.data.url));
  } catch (err) {
    console.error("portfolio error", err);
    if (err instanceof Error && err.message.startsWith("SSRF blocked")) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Portfolio analysis failed." }, { status: 500 });
  }
}