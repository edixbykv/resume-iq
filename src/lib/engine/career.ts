import { asScore } from "../utils";
import { ROLE_BLUEPRINTS, SKILL_INDEX, type SkillCategory } from "./skills-db";
import { inferCategories } from "./semantic";
import type { CareerPath, SalaryEstimate, BenchmarkResult, ResumeFields } from "./types";

/**
 * Compare a skill set against every role blueprint and return fit %.
 *
 * The fit blends three signals so a small blueprint can't win on a lucky
 * fraction (the old bug that labelled full-stack devs as "Data Analyst"):
 *   1. coverage       — how much of the role's core the candidate has
 *   2. absolute match — raw count of matched core skills (caps small-set inflation)
 *   3. domain align   — overlap of the candidate's actual + inferred skill
 *                       domains with the role's domains (semantic, from `text`)
 */
export function roleFits(
  skills: string[],
  text?: string,
): Array<{ role: string; fit: number; missing: string[]; matched: number }> {
  const have = new Set(skills.map((s) => s.toLowerCase()));

  // Candidate's domains = categories of named skills + domains inferred from prose.
  const candidateCats = new Set<SkillCategory>();
  for (const s of skills) {
    const def = SKILL_INDEX.get(s.toLowerCase());
    if (def) candidateCats.add(def.category);
  }
  if (text) for (const c of inferCategories(text)) candidateCats.add(c);

  return ROLE_BLUEPRINTS.map((bp) => {
    const matched = bp.core.filter((c) => have.has(c.toLowerCase()));
    const missing = bp.core.filter((c) => !have.has(c.toLowerCase()));
    const coverage = (matched.length / bp.core.length) * 100;
    const absMatch = (Math.min(matched.length, 6) / 6) * 100;
    const domainAlign = (bp.category.filter((c) => candidateCats.has(c)).length / bp.category.length) * 100;
    const fit = asScore(coverage * 0.5 + absMatch * 0.32 + domainAlign * 0.18);
    return { role: bp.role, fit, missing, matched: matched.length };
  }).sort((a, b) => b.fit - a.fit || b.matched - a.matched);
}

export function matchBestRole(skills: string[], text?: string): { bestFitRole: string; matchScore: number } {
  const fits = roleFits(skills, text);
  return { bestFitRole: fits[0]?.role ?? "Generalist", matchScore: fits[0]?.fit ?? 0 };
}

export function buildCareerPath(fields: ResumeFields, text?: string): CareerPath {
  const fits = roleFits(fields.skills.map((s) => s.name), text);
  const best = fits[0];
  const years = fields.experienceYears;

  const seniority =
    years >= 6 ? "Senior" : years >= 2 ? "Mid-level" : "Junior";
  const next =
    years >= 6 ? "Lead / Staff Engineer" : years >= 2 ? "Senior Engineer" : "Mid-level Engineer";

  return {
    bestFitRole: best.role,
    matchScore: best.fit,
    suggestedRoles: fits.slice(0, 4).map((f) => ({ role: f.role, fit: f.fit })),
    roadmap: [
      { stage: `Now — ${seniority} ${best.role}`, description: `Solidify core: ${best.missing.slice(0, 3).join(", ") || "deepen existing stack"}.` },
      { stage: `6-12 months — ${next}`, description: `Own end-to-end features, mentor peers, and ship measurable impact.` },
      { stage: `1-2 years`, description: `Lead projects, drive architecture decisions, and build a public portfolio (GitHub + writing).` },
      { stage: `2-3 years`, description: `Move toward specialization or leadership aligned with ${best.role}.` },
    ],
  };
}

/**
 * Salary intelligence. Base bands per role (annual), adjusted by experience,
 * advanced-skill premium and seniority. Figures are India-market anchored with
 * remote/global multipliers — transparent and deterministic, not guessed.
 */
const ROLE_SALARY_BASE_INR: Record<string, [number, number]> = {
  "Frontend Developer": [500000, 1400000],
  "Backend Developer": [600000, 1600000],
  "Full Stack Developer": [650000, 1800000],
  "AI / ML Engineer": [800000, 2400000],
  "Data Analyst": [450000, 1200000],
  "DevOps Engineer": [700000, 2000000],
  "Mobile Developer": [550000, 1500000],
  Generalist: [400000, 1000000],
};

export function estimateSalary(fields: ResumeFields, text?: string): SalaryEstimate {
  const best = matchBestRole(fields.skills.map((s) => s.name), text);
  const [baseMin, baseMax] = ROLE_SALARY_BASE_INR[best.bestFitRole] ?? ROLE_SALARY_BASE_INR.Generalist;
  const years = fields.experienceYears;
  // "Premium" skills = explicitly advanced OR high market demand (weight >= 0.85).
  // This stops the engine reporting "0 advanced skills" for strong stacks.
  const premiumSkills = fields.skills.filter((s) => {
    const def = SKILL_INDEX.get(s.name.toLowerCase());
    return s.advanced || (def?.weight ?? 0) >= 0.85;
  });
  const premium = premiumSkills.length;

  // Experience multiplier: +8% per year (capped), premium-skill premium up to +24%.
  const expMult = 1 + Math.min(years, 10) * 0.08;
  const skillMult = 1 + Math.min(premium, 6) * 0.04;
  const mult = expMult * skillMult;

  const india = { min: Math.round((baseMin * mult) / 10000) * 10000, max: Math.round((baseMax * mult) / 10000) * 10000 };
  // Remote (USD-ish via INR) and global bands derived with market multipliers.
  const remote = { min: Math.round(india.min * 1.8), max: Math.round(india.max * 2.2) };
  const global = { min: Math.round(india.min * 4.5), max: Math.round(india.max * 5.5) };

  return {
    india,
    remote,
    global,
    currency: "INR",
    basis: [
      `Role: ${best.bestFitRole}`,
      `${years || "<1"} years experience`,
      `${premium} in-demand skill${premium === 1 ? "" : "s"}`,
    ],
  };
}

export function benchmark(overall: number, years: number): BenchmarkResult {
  const level: BenchmarkResult["level"] = years >= 6 ? "Senior" : years >= 2 ? "Mid-Level" : "Fresher";
  // Map overall score to a percentile within the cohort (monotonic, deterministic).
  const percentile = asScore(Math.min(98, 30 + overall * 0.68));
  const top = 100 - percentile;
  return {
    level,
    percentile,
    statement: `Top ${top}% of ${level} candidates by resume strength`,
  };
}
