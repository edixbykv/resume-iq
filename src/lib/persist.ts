import type { AnalysisResult } from "@/lib/engine";

/**
 * Best-effort persistence. No-op (and never throws) when DATABASE_URL is unset,
 * so the platform works with zero configuration and gains history once a DB is
 * connected. Prisma is dynamically imported to keep it out of the bundle when
 * unused.
 */
export async function saveAnalysis(result: AnalysisResult, fileName?: string, userId?: string) {
  if (!process.env.DATABASE_URL) return null;
  try {
    const { prisma } = await import("@/lib/prisma");
    return await prisma.resume.create({
      data: {
        userId: userId ?? null,
        fileName: fileName ?? null,
        candidateName: result.fields.name ?? null,
        overallScore: result.overallScore,
        grade: result.grade,
        bestFitRole: result.careerPath.bestFitRole,
        analysis: result as unknown as object,
      },
    });
  } catch (err) {
    console.error("saveAnalysis failed (non-fatal):", err);
    return null;
  }
}
