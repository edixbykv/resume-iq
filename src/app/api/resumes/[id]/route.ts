import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma, dbEnabled } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    if (!dbEnabled) {
      return NextResponse.json({ error: "Database not configured." }, { status: 503 });
    }

    const { id } = await params;

    const resume = await prisma.resume.findUnique({
      where: { id },
      select: {
        id: true,
        fileName: true,
        candidateName: true,
        overallScore: true,
        grade: true,
        bestFitRole: true,
        analysis: true,
        createdAt: true,
        userId: true,
      },
    });

    if (!resume) {
      return NextResponse.json({ error: "Resume not found." }, { status: 404 });
    }
    if (resume.userId !== session.user.id) {
      return NextResponse.json({ error: "Not authorized." }, { status: 403 });
    }

    const safe = { ...resume } as Omit<typeof resume, "userId"> & { userId?: string };
    delete safe.userId;
    return NextResponse.json(safe);
  } catch (err) {
    console.error("resume detail error", err);
    return NextResponse.json({ error: "Failed to fetch resume." }, { status: 500 });
  }
}