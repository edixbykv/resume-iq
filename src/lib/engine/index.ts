import { asScore } from "../utils";
import { parseResume, type ParsedDocument } from "./parser";
import { extractFields } from "./extract";
import { scoreResume, overallScore } from "./resume-score";
import { analyzeAts } from "./ats";
import { simulateRecruiter } from "./recruiter";
import { buildCareerPath, estimateSalary, benchmark } from "./career";
import { enrichWithAI, fallbackInsights, aiAvailable } from "./ai";
import { gradeFor, type AnalysisResult } from "./types";

export * from "./types";
export { parseResume } from "./parser";
export { extractFields } from "./extract";
export { matchJobDescription } from "./jd-match";
export { analyzeSkillGap } from "./skill-gap";
export { analyzeGithub, type GithubReport } from "./github";
export { analyzeLinkedIn, type LinkedInReport } from "./linkedin";
export { analyzePortfolio, type PortfolioReport } from "./portfolio";
export { computeBrandScore, type BrandResult, type BrandInput } from "./brand";
export { roleFits, estimateSalary, buildCareerPath } from "./career";

export interface RunOptions {
  /** Skip the (optional) AI enrichment call even when keys exist. */
  noAI?: boolean;
  /** Pre-parsed document (when text was already extracted client-side). */
  parsed?: ParsedDocument;
}

/**
 * Full analysis pipeline:
 *   parse -> extract -> score (10 dims) -> ATS report -> recruiter sim ->
 *   career path -> salary -> benchmark -> health dashboard -> AI enrichment.
 */
export async function runFullAnalysis(
  buffer: Buffer | ArrayBuffer | null,
  fileName: string,
  mime: string | undefined,
  rawText: string | undefined,
  opts: RunOptions = {},
): Promise<AnalysisResult> {
  const parsed: ParsedDocument =
    opts.parsed ??
    (rawText
      ? { text: rawText, pages: Math.max(1, Math.ceil(rawText.length / 3500)), source: "text" }
      : await parseResume(buffer!, fileName, mime));

  const text = parsed.text;
  const fields = extractFields(text, parsed.pages);
  const subScores = scoreResume(fields, text);
  const overall = overallScore(subScores);
  const ats = analyzeAts(fields, subScores.ats.score, text);
  const recruiter = simulateRecruiter(subScores, overall);
  const careerPath = buildCareerPath(fields, text);
  const salary = estimateSalary(fields, text);
  const bench = benchmark(overall, fields.experienceYears);

  // Health dashboard — aggregate views over the sub-scores.
  const employability = asScore(
    overall * 0.5 + recruiter.recruiterConfidence * 0.3 + subScores.ats.score * 0.2,
  );
  const marketReadiness = asScore(
    subScores.skills.score * 0.4 + subScores.technicalDepth.score * 0.3 + careerPath.matchScore * 0.3,
  );
  const growthPotential = asScore(
    subScores.education.score * 0.3 + subScores.skills.score * 0.4 + subScores.leadership.score * 0.3,
  );
  const strengths = Object.values(subScores)
    .filter((s) => s.score >= 72)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.label);
  const weaknesses = Object.values(subScores)
    .filter((s) => s.score < 60)
    .sort((a, b) => a.score - b.score)
    .map((s) => s.label);

  // Optional AI enrichment (falls back to deterministic, data-driven narratives).
  let aiInsights;
  let aiEnriched = false;
  if (!opts.noAI && aiAvailable()) {
    const enriched = await enrichWithAI(text, fields, subScores);
    if (enriched) {
      aiInsights = enriched;
      aiEnriched = true;
    }
  }
  if (!aiInsights) aiInsights = fallbackInsights(text, fields, subScores);

  return {
    overallScore: overall,
    grade: gradeFor(overall),
    fields,
    subScores,
    ats,
    recruiter,
    careerPath,
    salary,
    benchmark: bench,
    healthDashboard: {
      careerHealth: overall,
      marketReadiness,
      employability,
      growthPotential,
      strengths,
      weaknesses,
    },
    aiEnriched,
    aiInsights,
  };
}
