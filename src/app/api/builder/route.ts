import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma, dbEnabled } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    if (!dbEnabled) {
      return NextResponse.json({ resume: null });
    }

    const resume = await prisma.userResume.findFirst({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ resume: resume ? resume.content : null });
  } catch (err) {
    console.error("builder get error", err);
    return NextResponse.json({ error: "Failed to fetch builder state." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const data = await req.json();

    if (!dbEnabled) {
      return NextResponse.json({ success: true, message: "DB disabled" });
    }

    const existing = await prisma.userResume.findFirst({
      where: { userId: session.user.id },
    });

    if (existing) {
      await prisma.userResume.update({
        where: { id: existing.id },
        data: {
          title: data.title || "Untitled Resume",
          content: data,
        },
      });
    } else {
      await prisma.userResume.create({
        data: {
          userId: session.user.id,
          title: data.title || "Untitled Resume",
          content: data,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("builder put error", err);
    return NextResponse.json({ error: "Failed to save builder state." }, { status: 500 });
  }
}
