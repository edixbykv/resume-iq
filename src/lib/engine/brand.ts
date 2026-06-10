import { asScore } from "../utils";

export interface BrandInput {
  resume?: number;
  linkedin?: number;
  github?: number;
  portfolio?: number;
}

export interface BrandResult {
  score: number;
  grade: string;
  breakdown: Array<{ label: string; score: number; present: boolean }>;
  message: string;
}

/**
 * Personal Brand Score. Weighted blend of the four pillars; only counts the
 * pillars the user actually analyzed, then renormalizes weights so the score
 * is always evidence-backed (never a placeholder).
 */
export function computeBrandScore(input: BrandInput): BrandResult {
  const pillars = [
    { key: "resume", label: "Resume", weight: 0.4, score: input.resume },
    { key: "linkedin", label: "LinkedIn", weight: 0.25, score: input.linkedin },
    { key: "github", label: "GitHub", weight: 0.2, score: input.github },
    { key: "portfolio", label: "Portfolio", weight: 0.15, score: input.portfolio },
  ];

  const present = pillars.filter((p) => typeof p.score === "number");
  const totalWeight = present.reduce((a, p) => a + p.weight, 0) || 1;
  const score = asScore(present.reduce((a, p) => a + (p.score ?? 0) * p.weight, 0) / totalWeight);

  const grade = score >= 80 ? "Strong" : score >= 60 ? "Developing" : "Early";
  const missing = pillars.filter((p) => typeof p.score !== "number").map((p) => p.label);

  return {
    score,
    grade,
    breakdown: pillars.map((p) => ({ label: p.label, score: asScore(p.score ?? 0), present: typeof p.score === "number" })),
    message: missing.length
      ? `Analyze your ${missing.join(", ")} to complete your brand score.`
      : "All four brand pillars analyzed — well-rounded presence.",
  };
}
