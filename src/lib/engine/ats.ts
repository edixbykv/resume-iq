import { asScore } from "../utils";
import type { ResumeFields, AtsReport, SubScores } from "./types";

/**
 * ATS Compatibility Engine. Goes beyond the ATS sub-score to produce an
 * actionable report: missing sections, formatting issues, parsing risks,
 * keyword gaps and fixes — all derived from real extracted signals.
 */
export function analyzeAts(fields: ResumeFields, atsSubScore: number, text: string): AtsReport {
  const f = fields;
  const s = f.stats;

  const missingSections: string[] = [];
  if (!f.sections.experience) missingSections.push("Work Experience");
  if (!f.sections.education) missingSections.push("Education");
  if (!f.sections.skills) missingSections.push("Skills");
  if (!f.sections.summary) missingSections.push("Professional Summary");
  if (!f.sections.projects) missingSections.push("Projects");

  const formattingIssues: string[] = [];
  if (s.bulletCount < 5) formattingIssues.push("Few or no bullet points — use bullets for achievements.");
  if (s.pages > 2) formattingIssues.push(`Resume spans ${s.pages} pages — trim to 1-2 pages.`);
  if (s.wordCount < 300) formattingIssues.push("Resume is very short — add more relevant detail.");
  if (s.wordCount > 1100) formattingIssues.push("Resume is dense — tighten wording for readability.");
  if (/[│┃|]{2,}/.test(text) || /\t{2,}/.test(text)) formattingIssues.push("Possible multi-column/table layout — ATS may mis-parse it.");

  const atsRisks: string[] = [];
  if (!f.email) atsRisks.push("No email detected — recruiters can't reach or index you.");
  if (!f.phone) atsRisks.push("No phone number detected.");
  if (s.weakVerbs > 3) atsRisks.push("Passive language ('responsible for') weakens keyword relevance.");
  if (f.skills.length < 6) atsRisks.push("Low keyword density — add more role-relevant skills.");

  // Keyword gaps: common high-value keywords not present.
  const present = new Set(f.skills.map((x) => x.name.toLowerCase()));
  const expectedHighValue = ["Git", "REST API", "SQL", "Agile", "Unit Testing", "Docker"];
  const keywordGaps = expectedHighValue.filter((k) => !present.has(k.toLowerCase()));

  const recommendations: string[] = [];
  if (missingSections.length) recommendations.push(`Add missing sections: ${missingSections.join(", ")}.`);
  if (!f.sections.skills) recommendations.push("Create a dedicated, keyword-rich Skills section.");
  if (s.quantifiedBullets < 4) recommendations.push("Quantify results so ATS keyword + recruiter scanning both win.");
  if (keywordGaps.length) recommendations.push(`Consider adding relevant keywords if applicable: ${keywordGaps.slice(0, 4).join(", ")}.`);
  recommendations.push("Use a single-column, standard-font layout and save as PDF (text-based, not scanned).");

  // Parsing accuracy proxy: did we successfully extract the key entities?
  const extracted = [f.name, f.email, f.skills.length > 0, f.sections.experience].filter(Boolean).length;
  const parsingAccuracy = asScore((extracted / 4) * 100);

  return {
    score: asScore(atsSubScore),
    missingSections,
    formattingIssues,
    atsRisks,
    keywordGaps,
    recommendations,
    parsingAccuracy,
  };
}

/** Re-export helper so callers can pull the ATS sub-score conveniently. */
export function atsSubScore(sub: SubScores): number {
  return sub.ats.score;
}
