import { NextResponse } from "next/server";
import { prisma, dbEnabled } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!dbEnabled) {
      return NextResponse.json({ error: "Database is disabled" });
    }
    const logs = await prisma.otpLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    return NextResponse.json({ logs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || err });
  }
}
