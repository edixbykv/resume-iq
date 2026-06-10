import { NextRequest, NextResponse } from "next/server";
import { analyzePortfolio } from "@/lib/engine/portfolio";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const url = typeof body.url === "string" ? body.url.trim() : "";
    if (!url) return NextResponse.json({ error: "Provide a portfolio website URL." }, { status: 400 });
    return NextResponse.json(await analyzePortfolio(url));
  } catch (err) {
    console.error("portfolio error", err);
    return NextResponse.json({ error: "Portfolio analysis failed." }, { status: 500 });
  }
}
