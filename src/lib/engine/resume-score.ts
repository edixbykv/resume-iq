import { asScore, clamp } from "../utils";
import { countMatches, sentences, LEADERSHIP_KEYWORDS, IMPACT_KEYWORDS, DEPTH_KEYWORDS } from "./text-utils";
import { matchBestRole } from "./career";
import { scopeSignal } from "./semantic";
import type { ResumeFields, ScoreDetail, SubScores } from "./types";

function detail(
  key: string,
  label: string,
  weight: number,
  score: number,
  summary: string,
  signals: string[],
  recommendations: string[],
): ScoreDetail {
  return { key, label, weight, score: asScore(score), summary, signals, recommendations };
}

const HEALTHY_WORDS_MIN = 350;
const HEALTHY_WORDS_MAX = 950;

/** Average words per sentence — used as a readability proxy. */
function avgSentenceLength(text: string): number {
  const s = sentences(text);
  if (!s.length) return 0;
  const total = s.reduce((acc, x) => acc + x.split(/\s+/).length, 0);
  return total / s.length;
}

export function scoreResume(fields: ResumeFields, text: string): SubScores {
  const f = fields;
  const s = f.stats;
  const skillCount = f.skills.length;
  const categories = new Set(f.skills.map((sk) => sk.category));
  const advanced = f.skills.filter((sk) => sk.advanced);
  const scope = scopeSignal(text); // enterprise / production / dashboard / scale signals

  // ---------- ATS ----------
  const atsParts = {
    email: f.email ? 12 : 0,
    phone: f.phone ? 8 : 0,
    link: f.linkedin || f.github || f.website ? 8 : 0,
    experience: f.sections.experience ? 18 : 0,
    education: f.sections.education ? 12 : 0,
    skills: f.sections.skills ? 14 : 0,
    summary: f.sections.summary ? 8 : 0,
    bullets: s.bulletCount >= 5 ? 10 : s.bulletCount * 2,
    length: s.wordCount >= HEALTHY_WORDS_MIN && s.wordCount <= HEALTHY_WORDS_MAX ? 10 : 4,
  };
  const atsScore = Object.values(atsParts).reduce((a, b) => a + b, 0);
  const atsRecs: string[] = [];
  if (!f.email) atsRecs.push("Add a professional email address near the top.");
  if (!f.sections.skills) atsRecs.push("Add a clearly labelled 'Skills' section — ATS parsers look for it.");
  if (!f.sections.summary) atsRecs.push("Add a short professional summary with target-role keywords.");
  if (s.bulletCount < 5) atsRecs.push("Use bullet points for achievements so parsers can segment content.");

  // ---------- Skills ----------
  const skillsScore =
    Math.min(skillCount, 16) / 16 * 50 +
    Math.min(categories.size, 6) / 6 * 30 +
    Math.min(advanced.length, 5) / 5 * 20;
  const skillsRecs: string[] = [];
  if (skillCount < 8) skillsRecs.push("List more relevant technical skills (aim for 10-15).");
  if (advanced.length < 2) skillsRecs.push("Add in-demand advanced skills (cloud, Docker, ML, GraphQL).");

  // ---------- Experience ----------
  // Balanced: real scope of work (enterprise apps, dashboards, production
  // systems) and tenure count toward impact, so strong engineers aren't
  // penalised purely for not bolting a number onto every line.
  const expScore =
    Math.min(f.experienceYears, 10) / 10 * 32 +
    Math.min(f.roleCount, 5) / 5 * 16 +
    Math.min(s.quantifiedBullets, 6) / 6 * 22 +
    Math.min(s.actionVerbs, 12) / 12 * 16 +
    Math.min(scope, 5) / 5 * 14;
  const expRecs: string[] = [];
  if (s.quantifiedBullets < 4) expRecs.push("Add metrics where you can (%, $, users, latency) to strengthen impact.");
  if (s.actionVerbs < 6) expRecs.push("Start bullets with strong action verbs (Led, Built, Optimized).");
  if (s.weakVerbs > 2) expRecs.push("Replace weak phrases like 'responsible for' / 'worked on'.");

  // ---------- Education ----------
  const eduMap: Record<number, number> = { 5: 100, 4: 92, 3: 80, 2: 62, 1: 45, 0: 28 };
  const eduScore = (eduMap[f.degree.level] ?? 28) * (f.sections.education ? 1 : 0.7);
  const eduRecs: string[] = [];
  if (f.degree.level === 0) eduRecs.push("Add your highest qualification with institution and year.");

  // ---------- Project Quality ----------
  const projScore =
    Math.min(f.projects.length, 4) / 4 * 40 +
    (f.github ? 20 : 0) +
    Math.min(advanced.length, 4) / 4 * 22 +
    (f.sections.projects ? 18 : 0);
  const projRecs: string[] = [];
  if (f.projects.length < 2) projRecs.push("Add 2-3 strong projects with impact and tech stack.");
  if (!f.github) projRecs.push("Link a GitHub profile to back up your projects.");

  // ---------- Industry Fit ----------
  const best = matchBestRole(f.skills.map((x) => x.name), text);
  const fitScore = best.matchScore;
  const fitRecs: string[] = [];
  if (fitScore < 60) fitRecs.push(`Align skills toward a clear target role (best current fit: ${best.bestFitRole}).`);

  // ---------- Recruiter Appeal ----------
  const impact = countMatches(text, IMPACT_KEYWORDS);
  const lengthOk = s.wordCount >= HEALTHY_WORDS_MIN && s.wordCount <= HEALTHY_WORDS_MAX;
  const appealScore = clamp(
    Math.min(s.quantifiedBullets, 8) / 8 * 26 +
      Math.min(s.actionVerbs, 12) / 12 * 20 +
      Math.min(impact, 6) / 6 * 16 +
      Math.min(scope, 5) / 5 * 10 +
      (lengthOk ? 10 : 4) +
      (f.linkedin ? 8 : 0) +
      (f.sections.summary ? 10 : 0) -
      Math.min(s.weakVerbs, 6) * 2,
  );
  const appealRecs: string[] = [];
  if (impact < 3) appealRecs.push("Tie work to business impact (revenue, growth, retention, performance).");
  if (!lengthOk) appealRecs.push("Keep the resume tight — 1 page for <8 yrs, 2 pages max.");

  // ---------- Leadership ----------
  const leadHits = countMatches(text, LEADERSHIP_KEYWORDS);
  const teamSize = /team of\s+\d+/i.test(text);
  const leadScore = clamp(
    Math.min(leadHits, 8) / 8 * 60 + (teamSize ? 20 : 0) + Math.min(f.experienceYears, 8) / 8 * 20,
  );
  const leadRecs: string[] = [];
  if (leadHits < 2) leadRecs.push("Show leadership: mentoring, ownership, leading initiatives or teams.");

  // ---------- Communication ----------
  const asl = avgSentenceLength(text);
  const readability = asl === 0 ? 40 : asl <= 24 ? 100 - Math.abs(16 - asl) * 2 : 70 - (asl - 24) * 2;
  const commScore = clamp(
    readability * 0.5 +
      (f.sections.summary ? 18 : 6) +
      (s.bulletCount >= 6 ? 18 : s.bulletCount * 2) -
      Math.min(s.weakVerbs, 6) * 2,
  );
  const commRecs: string[] = [];
  if (asl > 26) commRecs.push("Shorten sentences — aim for concise, scannable bullets.");

  // ---------- Technical Depth ----------
  const depthHits = countMatches(text, DEPTH_KEYWORDS);
  const depthScore = clamp(
    Math.min(advanced.length, 5) / 5 * 40 +
      Math.min(depthHits, 6) / 6 * 30 +
      Math.min(categories.size, 6) / 6 * 18 +
      Math.min(f.projects.length, 4) / 4 * 12,
  );
  const depthRecs: string[] = [];
  if (depthHits < 2) depthRecs.push("Mention depth: system design, scalability, optimization, architecture.");

  return {
    ats: detail("ats", "ATS Compatibility", 0.16, atsScore,
      atsScore >= 75 ? "Parses cleanly with strong structure." : "Some ATS-critical elements are missing.",
      [f.email && "Contact detected", f.sections.skills && "Skills section present", s.bulletCount >= 5 && "Good bullet structure"].filter(Boolean) as string[],
      atsRecs),
    skills: detail("skills", "Skills Strength", 0.12, skillsScore,
      `${skillCount} skills across ${categories.size} domains.`,
      [`${advanced.length} in-demand advanced skills`, `${categories.size} skill categories`],
      skillsRecs),
    experience: detail("experience", "Experience Impact", 0.16, expScore,
      `${f.experienceYears || "<1"} yrs, ${s.quantifiedBullets} quantified achievements.`,
      [`${s.actionVerbs} action verbs`, `${s.quantifiedBullets} metrics-backed bullets`],
      expRecs),
    education: detail("education", "Education", 0.08, eduScore,
      `Highest qualification: ${f.degree.label}.`,
      [f.degree.level > 0 && `${f.degree.label} detected`].filter(Boolean) as string[],
      eduRecs),
    projectQuality: detail("projectQuality", "Project Quality", 0.1, projScore,
      `${f.projects.length} projects detected.`,
      [f.github && "GitHub linked", f.projects.length > 0 && "Projects section present"].filter(Boolean) as string[],
      projRecs),
    industryFit: detail("industryFit", "Industry Fit", 0.08, fitScore,
      `Best fit: ${best.bestFitRole} (${asScore(fitScore)}%).`,
      [`Strong alignment with ${best.bestFitRole}`],
      fitRecs),
    recruiterAppeal: detail("recruiterAppeal", "Recruiter Appeal", 0.1, appealScore,
      appealScore >= 70 ? "Reads like a strong, impact-driven resume." : "Needs more measurable impact.",
      [impact >= 3 && "Business impact mentioned", lengthOk && "Healthy length"].filter(Boolean) as string[],
      appealRecs),
    leadership: detail("leadership", "Leadership", 0.06, leadScore,
      leadHits >= 2 ? "Clear leadership signals." : "Limited leadership evidence.",
      [leadHits >= 2 && `${leadHits} leadership signals`, teamSize && "Team size mentioned"].filter(Boolean) as string[],
      leadRecs),
    communication: detail("communication", "Communication", 0.06, commScore,
      asl <= 24 ? "Clear, scannable writing." : "Writing could be tighter.",
      [f.sections.summary && "Summary present", s.bulletCount >= 6 && "Well bulleted"].filter(Boolean) as string[],
      commRecs),
    technicalDepth: detail("technicalDepth", "Technical Depth", 0.08, depthScore,
      depthScore >= 65 ? "Demonstrates solid technical depth." : "Add more depth signals.",
      [advanced.length >= 2 && `${advanced.length} advanced technologies`, depthHits >= 2 && "Depth keywords present"].filter(Boolean) as string[],
      depthRecs),
  };
}

export function overallScore(sub: SubScores): number {
  const items = Object.values(sub);
  const totalWeight = items.reduce((a, b) => a + b.weight, 0);
  const weighted = items.reduce((a, b) => a + b.score * b.weight, 0);
  return asScore(weighted / totalWeight);
}
