import { asScore } from "../utils";
import { ROLE_BLUEPRINTS } from "./skills-db";
import { matchBestRole } from "./career";
import type { ResumeFields, SkillGapResult } from "./types";

/**
 * AI Skill Gap Analysis Engine. Compares the candidate's current skills against
 * a target role blueprint, then produces a structured 90-day upskilling plan.
 */
export function analyzeSkillGap(fields: ResumeFields, targetRole?: string): SkillGapResult {
  const have = new Set(fields.skills.map((s) => s.name.toLowerCase()));
  const role = targetRole ?? matchBestRole(fields.skills.map((s) => s.name)).bestFitRole;
  const bp = ROLE_BLUEPRINTS.find((b) => b.role === role) ?? ROLE_BLUEPRINTS[2];

  const currentSkills = bp.core.filter((c) => have.has(c.toLowerCase()));
  const missingSkills = bp.core.filter((c) => !have.has(c.toLowerCase()));
  const futureSkills = bp.emerging.filter((c) => !have.has(c.toLowerCase()));

  const coverage = asScore((currentSkills.length / bp.core.length) * 100);

  // Distribute missing + future skills across a 90-day plan.
  const priority = [...missingSkills, ...futureSkills];
  const third = Math.ceil(priority.length / 3) || 1;

  const plan = [
    {
      phase: "Days 1-30 — Close Core Gaps",
      focus: "Master the must-have skills recruiters filter on.",
      skills: priority.slice(0, third).length ? priority.slice(0, third) : currentSkills.slice(0, 3),
      outcome: "Be able to build and ship a small project using these.",
    },
    {
      phase: "Days 31-60 — Build Depth",
      focus: "Apply skills in a portfolio-grade project.",
      skills: priority.slice(third, third * 2),
      outcome: "Ship one substantial project to GitHub with a clean README.",
    },
    {
      phase: "Days 61-90 — Stand Out",
      focus: "Adopt emerging/in-demand skills and document impact.",
      skills: priority.slice(third * 2),
      outcome: "Add quantified achievements + emerging skills to the resume.",
    },
  ].filter((p) => p.skills.length > 0);

  return {
    targetRole: role,
    currentSkills,
    missingSkills,
    futureSkills,
    coverage,
    plan,
  };
}
