import { z } from "zod";
import type { SkillCategory } from "./skills-db";

/** A single scored dimension with explanation + fixes for the UI. */
export interface ScoreDetail {
  key: string;
  label: string;
  score: number; // 0-100
  weight: number; // contribution to overall
  summary: string;
  signals: string[]; // positive signals found
  recommendations: string[]; // concrete fixes
}

export interface ExtractedSkill {
  name: string;
  category: SkillCategory;
  advanced: boolean;
}

export interface ResumeFields {
  name: string | null;
  email: string | null;
  phone: string | null;
  linkedin: string | null;
  github: string | null;
  website: string | null;
  skills: ExtractedSkill[];
  experienceYears: number;
  roleCount: number;
  degree: { level: number; label: string };
  certifications: string[];
  projects: string[];
  achievements: string[];
  keywords: string[];
  sections: Record<string, boolean>;
  stats: {
    wordCount: number;
    bulletCount: number;
    quantifiedBullets: number;
    actionVerbs: number;
    weakVerbs: number;
    pages: number;
  };
}

export interface AtsReport {
  score: number;
  missingSections: string[];
  formattingIssues: string[];
  atsRisks: string[];
  keywordGaps: string[];
  recommendations: string[];
  parsingAccuracy: number;
}

export interface SubScores {
  ats: ScoreDetail;
  skills: ScoreDetail;
  experience: ScoreDetail;
  education: ScoreDetail;
  projectQuality: ScoreDetail;
  industryFit: ScoreDetail;
  recruiterAppeal: ScoreDetail;
  leadership: ScoreDetail;
  communication: ScoreDetail;
  technicalDepth: ScoreDetail;
}

export interface RecruiterSimulation {
  decision: "YES" | "MAYBE" | "NO";
  hiringProbability: number;
  recruiterConfidence: number;
  interviewProbability: number;
  timeToHireDays: number;
  reasons: string[];
  concerns: string[];
  verdict: string;
}

export interface JdMatchResult {
  matchPercentage: number;
  skillsMatch: number;
  experienceMatch: number;
  educationMatch: number;
  projectMatch: number;
  matchedSkills: string[];
  missingSkills: string[];
  missingKeywords: string[];
  strengths: string[];
  weaknesses: string[];
  gapAnalysis: string[];
}

export interface SkillGapResult {
  targetRole: string;
  currentSkills: string[];
  missingSkills: string[];
  futureSkills: string[];
  coverage: number;
  plan: Array<{ phase: string; focus: string; skills: string[]; outcome: string }>;
}

export interface CareerPath {
  bestFitRole: string;
  matchScore: number;
  suggestedRoles: Array<{ role: string; fit: number }>;
  roadmap: Array<{ stage: string; description: string }>;
}

export interface SalaryEstimate {
  india: { min: number; max: number };
  remote: { min: number; max: number };
  global: { min: number; max: number };
  currency: string;
  basis: string[];
}

export interface BenchmarkResult {
  level: "Fresher" | "Mid-Level" | "Senior";
  percentile: number;
  statement: string;
}

export interface AnalysisResult {
  overallScore: number;
  grade: string;
  fields: ResumeFields;
  subScores: SubScores;
  ats: AtsReport;
  recruiter: RecruiterSimulation;
  careerPath: CareerPath;
  salary: SalaryEstimate;
  benchmark: BenchmarkResult;
  healthDashboard: {
    careerHealth: number;
    marketReadiness: number;
    employability: number;
    growthPotential: number;
    strengths: string[];
    weaknesses: string[];
  };
  aiEnriched: boolean;
  aiInsights?: AiInsights;
}

// ---- AI enrichment schema (used with generateObject) ----
export const AiInsightsSchema = z.object({
  professionalSummary: z
    .string()
    .describe("A polished 2-3 sentence professional summary for the resume."),
  topStrengths: z.array(z.string()).max(5).describe("Key strengths a recruiter would notice."),
  redFlags: z.array(z.string()).max(5).describe("Concerns or weaknesses a recruiter might flag."),
  rewrittenBullets: z
    .array(z.object({ before: z.string(), after: z.string() }))
    .max(6)
    .describe("Weak resume bullets rewritten into strong, quantified, recruiter-friendly statements."),
  interviewQuestions: z.object({
    technical: z.array(z.string()).max(5),
    behavioral: z.array(z.string()).max(4),
    project: z.array(z.string()).max(4),
  }),
  improvedSummarySection: z.string().describe("A rewritten resume summary section."),
});

export type AiInsights = z.infer<typeof AiInsightsSchema>;

export const GRADES: Array<[number, string]> = [
  [90, "A+"],
  [80, "A"],
  [70, "B+"],
  [60, "B"],
  [50, "C"],
  [0, "Needs Work"],
];

export function gradeFor(score: number): string {
  return GRADES.find(([min]) => score >= min)![1];
}
