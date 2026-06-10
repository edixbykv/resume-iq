import { asScore, clamp } from "../utils";
import type { SubScores, RecruiterSimulation, JdMatchResult } from "./types";

/**
 * Recruiter Simulation Engine. Models a recruiter's first-pass screen by
 * weighting the signals recruiters actually act on: ATS pass, impact/appeal,
 * experience and (when present) job-description fit.
 */
export function simulateRecruiter(
  sub: SubScores,
  overall: number,
  jd?: JdMatchResult,
): RecruiterSimulation {
  // Recruiter-weighted composite (different from the overall resume score).
  const base =
    sub.ats.score * 0.18 +
    sub.recruiterAppeal.score * 0.22 +
    sub.experience.score * 0.2 +
    sub.skills.score * 0.16 +
    sub.projectQuality.score * 0.12 +
    sub.technicalDepth.score * 0.12;

  // If a JD is matched, blend the fit heavily — recruiters screen against roles.
  const confidence = jd
    ? asScore(base * 0.55 + jd.matchPercentage * 0.45)
    : asScore(base);

  const decision: RecruiterSimulation["decision"] =
    confidence >= 72 ? "YES" : confidence >= 52 ? "MAYBE" : "NO";

  // Hiring + interview probabilities derived from confidence, with realistic gaps.
  const interviewProbability = asScore(clamp(confidence * 0.95 + (sub.ats.score >= 75 ? 5 : 0)));
  const hiringProbability = asScore(clamp(interviewProbability * 0.62));

  // Time-to-hire: stronger candidates move faster.
  const timeToHireDays =
    confidence >= 80 ? 14 : confidence >= 65 ? 21 : confidence >= 50 ? 32 : 45;

  const reasons: string[] = [];
  if (sub.recruiterAppeal.score >= 65) reasons.push("Impact-driven, well-structured resume.");
  if (sub.experience.score >= 65) reasons.push("Relevant, quantified experience.");
  if (sub.skills.score >= 65) reasons.push("Strong, in-demand skill set.");
  if (jd && jd.matchPercentage >= 70) reasons.push(`Strong job-description match (${jd.matchPercentage}%).`);
  if (sub.ats.score >= 75) reasons.push("Passes ATS screening cleanly.");
  if (!reasons.length) reasons.push("Some relevant signals, but the resume needs sharpening.");

  const concerns: string[] = [];
  if (sub.ats.score < 70) concerns.push("ATS parsing risks could filter the resume out early.");
  if (sub.experience.score < 55) concerns.push("Limited or under-quantified experience.");
  if (sub.recruiterAppeal.score < 55) concerns.push("Lacks measurable impact / business outcomes.");
  if (jd && jd.matchPercentage < 55) concerns.push(`Weak match to the target role (${jd.matchPercentage}%).`);
  if (sub.leadership.score < 40) concerns.push("Little evidence of ownership or leadership.");

  const verdict =
    decision === "YES"
      ? "I'd shortlist this candidate for a first-round interview."
      : decision === "MAYBE"
        ? "Borderline — I'd shortlist only if the pipeline is thin or after targeted edits."
        : "I'd pass for now; the resume needs meaningful improvements first.";

  return {
    decision,
    hiringProbability,
    recruiterConfidence: confidence,
    interviewProbability,
    timeToHireDays,
    reasons: reasons.slice(0, 5),
    concerns: concerns.slice(0, 5),
    verdict,
  };
}
