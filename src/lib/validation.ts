import { z } from "zod";

/**
 * Shared Zod schemas for API request validation.
 * Every API route should validate its input against these schemas.
 */

// ---- File upload constraints ----
const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".txt"];

// ---- Text constraints ----
const MIN_RESUME_TEXT_LENGTH = 40;
const MAX_RESUME_TEXT_LENGTH = 50_000; // 50k chars

const MIN_JD_LENGTH = 30;
const MAX_JD_LENGTH = 20_000;

const MAX_URL_LENGTH = 2000;

// ---- Schemas ----

/** Resume text analysis (pasted text) */
export const AnalyzeTextSchema = z.object({
  text: z
    .string()
    .min(MIN_RESUME_TEXT_LENGTH, `Resume text must be at least ${MIN_RESUME_TEXT_LENGTH} characters.`)
    .max(MAX_RESUME_TEXT_LENGTH, `Resume text must be less than ${MAX_RESUME_TEXT_LENGTH} characters.`),
});

/** Resume file analysis (multipart upload) - validated at route level */
export const AnalyzeFileSchema = z.object({
  file: z.custom<File>((v) => v instanceof File),
  fileName: z.string().optional(),
  fileSize: z.number().gte(0).lte(MAX_FILE_BYTES).optional(),
});

/** JD Match endpoint */
export const JdMatchSchema = z.object({
  fields: z.record(z.string(), z.unknown()).refine(
    (v) => Object.keys(v).length > 0,
    "Resume fields are required.",
  ),
  subScores: z.record(z.string(), z.unknown()).optional(),
  overallScore: z.number().gte(0).lte(100).optional(),
  jd: z
    .string()
    .min(MIN_JD_LENGTH, `Job description must be at least ${MIN_JD_LENGTH} characters.`)
    .max(MAX_JD_LENGTH, `Job description must be less than ${MAX_JD_LENGTH} characters.`),
});

/** GitHub analysis */
export const GithubSchema = z.object({
  url: z
    .string()
    .min(1, "Provide a GitHub username or URL.")
    .max(MAX_URL_LENGTH),
});

/** LinkedIn analysis */
export const LinkedinSchema = z.object({
  url: z
    .string()
    .min(1, "Provide a LinkedIn username or URL.")
    .max(MAX_URL_LENGTH),
});

/** Portfolio analysis */
export const PortfolioSchema = z.object({
  url: z
    .string()
    .min(1, "Provide a portfolio website URL.")
    .max(MAX_URL_LENGTH),
});

/** Skill gap analysis */
export const SkillGapSchema = z.object({
  targetRole: z.string().min(1, "Target role is required.").max(200),
  currentSkills: z.array(z.string().min(1)).max(100).optional(),
  resumeText: z.string().min(10).max(MAX_RESUME_TEXT_LENGTH).optional(),
});

/** Saved resume deletion */
export const ResumeDeleteSchema = z.object({
  id: z.string().min(1, "Resume ID is required."),
});

export { MAX_FILE_BYTES, ALLOWED_EXTENSIONS };