import { asScore } from "../utils";
import { countMatches, IMPACT_KEYWORDS, ACTION_VERBS } from "./text-utils";
import { SKILLS } from "./skills-db";

export interface LinkedInReport {
  linkedinScore: number;
  hasHeadline: boolean;
  hasAbout: boolean;
  wordCount: number;
  skillCount: number;
  metrics: { headline: number; about: number; keywords: number; branding: number };
  signals: string[];
  recommendations: string[];
}

/**
 * LinkedIn Analyzer. LinkedIn blocks automated scraping, so users paste their
 * profile text (headline + about + experience). We score real signals from it:
 * headline strength, About depth, keyword/skill density and personal branding.
 */
export function analyzeLinkedIn(profileText: string, headline?: string): LinkedInReport {
  const text = profileText.trim();
  const wc = text.split(/\s+/).filter(Boolean).length;
  const head = (headline ?? text.split("\n")[0] ?? "").trim();

  const skillsFound = SKILLS.filter((s) =>
    new RegExp(`\\b${s.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(text),
  ).length;

  const actionVerbs = text.toLowerCase().split(/\s+/).filter((w) => ACTION_VERBS.has(w)).length;
  const impact = countMatches(text, IMPACT_KEYWORDS);

  // Headline: strong if it states role + value (length + role keywords).
  const headlineScore = asScore(
    Math.min(head.length, 80) / 80 * 60 +
      (/\b(engineer|developer|designer|manager|analyst|specialist|lead|architect|consultant)\b/i.test(head) ? 25 : 0) +
      (/\|/.test(head) ? 15 : 0),
  );

  const aboutScore = asScore(
    Math.min(wc, 200) / 200 * 55 +
      Math.min(actionVerbs, 6) / 6 * 20 +
      Math.min(impact, 5) / 5 * 25,
  );

  const keywordScore = asScore(Math.min(skillsFound, 12) / 12 * 100);

  const brandingScore = asScore(
    (impact >= 2 ? 35 : impact * 15) +
      (actionVerbs >= 3 ? 30 : actionVerbs * 8) +
      (wc >= 120 ? 35 : (wc / 120) * 35),
  );

  const linkedinScore = asScore(
    headlineScore * 0.25 + aboutScore * 0.3 + keywordScore * 0.25 + brandingScore * 0.2,
  );

  const signals: string[] = [];
  if (headlineScore >= 70) signals.push("Strong, role-focused headline");
  if (skillsFound >= 6) signals.push(`${skillsFound} recognizable skills mentioned`);
  if (impact >= 2) signals.push("Quantified impact in the About section");

  const recommendations: string[] = [];
  if (headlineScore < 70) recommendations.push("Make your headline state your role + the value you deliver (use a '|' separator).");
  if (wc < 120) recommendations.push("Expand your About section to 120-250 words telling a clear story.");
  if (impact < 2) recommendations.push("Add quantified achievements (numbers, %, scale) to your About.");
  if (skillsFound < 6) recommendations.push("List more relevant skills so recruiters find you in search.");
  if (!recommendations.length) recommendations.push("Strong profile — keep it active with posts and recommendations.");

  return {
    linkedinScore,
    hasHeadline: head.length > 10,
    hasAbout: wc > 30,
    wordCount: wc,
    skillCount: skillsFound,
    metrics: { headline: headlineScore, about: aboutScore, keywords: keywordScore, branding: brandingScore },
    signals,
    recommendations,
  };
}
