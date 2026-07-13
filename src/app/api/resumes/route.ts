import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma, dbEnabled } from "@/lib/prisma";

export const runtime = "nodejs";

/**
 * GET /api/resumes - List saved analyses for the authenticated user.
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    if (!dbEnabled) {
      return NextResponse.json({ resumes: [] });
    }

    const resumes = await prisma.resume.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        fileName: true,
        candidateName: true,
        overallScore: true,
        grade: true,
        bestFitRole: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ resumes });
  } catch (err) {
    console.error("resumes list error", err);
    return NextResponse.json({ error: "Failed to fetch resumes." }, { status: 500 });
  }
}

/**
 * DELETE /api/resumes - Delete a saved analysis (ownership check enforced).
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const { id } = await req.json();
    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Resume ID required." }, { status: 400 });
    }

    if (!dbEnabled) {
      return NextResponse.json({ error: "Database not configured." }, { status: 503 });
    }

    // Ownership check
    const resume = await prisma.resume.findUnique({ where: { id }, select: { userId: true } });
    if (!resume) {
      return NextResponse.json({ error: "Resume not found." }, { status: 404 });
    }
    if (resume.userId !== session.user.id) {
      return NextResponse.json({ error: "Not authorized." }, { status: 403 });
    }

    await prisma.resume.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("resume delete error", err);
    return NextResponse.json({ error: "Failed to delete resume." }, { status: 500 });
  }
}

/**
 * GET /api/resumes/[id] - Get a specific saved analysis (ownership check enforced).
 */
export async function getResumeById(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  if (!dbEnabled) {
    return NextResponse.json({ error: "Database not configured." }, { status: 503 });
  }

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
}

/**
 * POST /api/resumes - Save an analysis to the database for the authenticated user.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    if (!dbEnabled) {
      return NextResponse.json({ error: "Database not configured." }, { status: 503 });
    }

    const { result, fileName } = await req.json();
    if (!result) {
      return NextResponse.json({ error: "Analysis result is required." }, { status: 400 });
    }

    // Check if this analysis already exists for this user to prevent duplicates
    const existing = await prisma.resume.findFirst({
      where: {
        userId: session.user.id,
        overallScore: result.overallScore,
        candidateName: result.fields?.name ?? null,
      },
    });

    if (existing) {
      return NextResponse.json({ success: true, resume: existing });
    }

    const saved = await prisma.resume.create({
      data: {
        userId: session.user.id,
        fileName: fileName ?? "pasted.txt",
        candidateName: result.fields?.name ?? null,
        overallScore: result.overallScore,
        grade: result.grade,
        bestFitRole: result.careerPath?.bestFitRole ?? null,
        analysis: result as unknown as object,
      },
    });

    return NextResponse.json({ success: true, resume: saved });
  } catch (err) {
    console.error("resume save error", err);
    return NextResponse.json({ error: "Failed to save resume report." }, { status: 500 });
  }
}