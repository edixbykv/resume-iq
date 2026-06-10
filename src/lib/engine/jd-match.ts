import { asScore } from "../utils";
import { SKILLS } from "./skills-db";
import { words, estimateExperienceYears, highestDegree } from "./text-utils";
import type { ResumeFields, JdMatchResult } from "./types";

/** Extract the skills a JD asks for, using the same taxonomy as the resume. */
function skillsInText(text: string): string[] {
  const lower = ` ${text.toLowerCase()} `;
  const found: string[] = [];
  for (const skill of SKILLS) {
    const terms = [skill.name, ...(skill.aliases ?? [])];
    for (const t of terms) {
      const term = t.toLowerCase();
      const re = new RegExp(`(^|[^a-z0-9+#.])${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z0-9+#]|$)`);
      if (re.test(lower)) {
        found.push(skill.name);
        break;
      }
    }
  }
  return [...new Set(found)];
}

/** Top non-trivial keywords from the JD that aren't in the skills taxonomy. */
function jdKeywords(jd: string): string[] {
  const stop = new Set([
    "the", "and", "for", "with", "you", "our", "are", "will", "have", "this",
    "that", "your", "role", "team", "work", "ability", "strong", "good", "plus",
    "experience", "years", "skills", "knowledge", "looking", "join", "company",
    "responsibilities", "requirements", "preferred", "must", "should", "candidate",
  ]);
  const freq = new Map<string, number>();
  for (const w of words(jd)) {
    if (w.length < 4 || stop.has(w)) continue;
    freq.set(w, (freq.get(w) ?? 0) + 1);
  }
  return [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15).map(([w]) => w);
}

/** Parse a required-years figure like "3+ years". */
function requiredYears(jd: string): number {
  const m = jd.match(/(\d{1,2})\+?\s*years?/i);
  return m ? parseInt(m[1], 10) : 0;
}

export function matchJobDescription(fields: ResumeFields, jd: string): JdMatchResult {
  const resumeSkills = new Set(fields.skills.map((s) => s.name.toLowerCase()));
  const jdSkills = skillsInText(jd);

  const matchedSkills = jdSkills.filter((s) => resumeSkills.has(s.toLowerCase()));
  const missingSkills = jdSkills.filter((s) => !resumeSkills.has(s.toLowerCase()));

  const skillsMatch = jdSkills.length ? asScore((matchedSkills.length / jdSkills.length) * 100) : 60;

  // Experience match
  const reqYears = requiredYears(jd);
  const haveYears = fields.experienceYears;
  const experienceMatch = reqYears === 0
    ? 75
    : asScore(Math.min(100, (haveYears / reqYears) * 100));

  // Education match
  const reqDegree = highestDegree(jd).level;
  const educationMatch = reqDegree === 0
    ? 80
    : fields.degree.level >= reqDegree
      ? 100
      : asScore((fields.degree.level / reqDegree) * 100);

  // Project relevance: do project-area skills overlap with JD skills?
  const projectMatch = jdSkills.length
    ? asScore(Math.min(100, (matchedSkills.length / Math.max(jdSkills.length, 1)) * 90 + (fields.projects.length ? 10 : 0)))
    : (fields.projects.length ? 70 : 50);

  // Keyword gaps
  const kw = jdKeywords(jd);
  const resumeWords = new Set(words(fields.keywords.join(" ") + " " + fields.skills.map((s) => s.name).join(" ")));
  const missingKeywords = kw.filter((k) => !resumeWords.has(k)).slice(0, 10);

  const matchPercentage = asScore(
    skillsMatch * 0.5 + experienceMatch * 0.22 + educationMatch * 0.13 + projectMatch * 0.15,
  );

  const strengths: string[] = [];
  if (matchedSkills.length) strengths.push(`Matches ${matchedSkills.length} required skills: ${matchedSkills.slice(0, 6).join(", ")}.`);
  if (experienceMatch >= 90) strengths.push("Experience meets or exceeds the requirement.");
  if (educationMatch >= 100) strengths.push("Education requirement satisfied.");

  const weaknesses: string[] = [];
  if (missingSkills.length) weaknesses.push(`Missing ${missingSkills.length} required skills.`);
  if (experienceMatch < 70 && reqYears) weaknesses.push(`Role wants ~${reqYears} yrs; resume shows ~${haveYears}.`);
  if (missingKeywords.length) weaknesses.push("Several JD keywords are absent from the resume.");

  const gapAnalysis: string[] = [];
  if (missingSkills.length) gapAnalysis.push(`Add or highlight: ${missingSkills.slice(0, 6).join(", ")}.`);
  if (missingKeywords.length) gapAnalysis.push(`Mirror JD language: ${missingKeywords.slice(0, 6).join(", ")}.`);
  if (experienceMatch < 70 && reqYears) gapAnalysis.push("Emphasize relevant projects to offset the experience gap.");
  if (!gapAnalysis.length) gapAnalysis.push("Strong alignment — tailor the summary to mirror the JD title and keywords.");

  return {
    matchPercentage,
    skillsMatch,
    experienceMatch,
    educationMatch,
    projectMatch,
    matchedSkills,
    missingSkills,
    missingKeywords,
    strengths,
    weaknesses,
    gapAnalysis,
  };
}
