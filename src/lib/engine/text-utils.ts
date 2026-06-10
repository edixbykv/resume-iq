/**
 * Low-level text analysis primitives. Everything here operates on the raw
 * resume text and returns measurable signals — no AI, no randomness.
 */

export const ACTION_VERBS = new Set([
  "achieved", "accelerated", "architected", "automated", "built", "boosted",
  "created", "championed", "collaborated", "delivered", "designed", "developed",
  "drove", "engineered", "established", "executed", "expanded", "generated",
  "implemented", "improved", "increased", "initiated", "introduced", "launched",
  "led", "managed", "mentored", "migrated", "optimized", "orchestrated",
  "owned", "pioneered", "produced", "reduced", "refactored", "resolved",
  "scaled", "shipped", "spearheaded", "streamlined", "transformed", "deployed",
]);

export const WEAK_VERBS = new Set([
  "responsible", "worked", "helped", "assisted", "participated", "involved",
  "handled", "tasked", "duties", "various", "etc", "stuff", "things",
]);

export const LEADERSHIP_KEYWORDS = [
  "led", "managed", "mentored", "supervised", "directed", "coordinated",
  "spearheaded", "owned", "headed", "oversaw", "founded", "established",
  "team of", "cross-functional", "stakeholder", "leadership",
];

export const IMPACT_KEYWORDS = [
  "revenue", "growth", "users", "customers", "performance", "latency",
  "cost", "efficiency", "conversion", "retention", "scale", "throughput",
  "uptime", "engagement", "adoption",
];

export const DEPTH_KEYWORDS = [
  "architecture", "distributed", "scalability", "scalable", "optimization",
  "algorithm", "concurrency", "asynchronous", "caching", "load balancing",
  "fault-tolerant", "high availability", "system design", "data structures",
  "pipeline", "real-time", "low-latency",
];

export const SECTION_PATTERNS: Record<string, RegExp> = {
  summary: /\b(summary|objective|profile|about\s*me|professional\s+summary|career\s+objective)\b/i,
  experience: /\b(experience|employment|work\s+history|professional\s+experience|work\s+experience|career\s+history)\b/i,
  education: /\b(education|academic|qualifications?)\b/i,
  skills: /\b(skills|technical\s+skills|technologies|tech\s+stack|competencies|expertise|proficiencies|core\s+skills)\b/i,
  projects: /\b(projects?|personal\s+projects?|key\s+projects?|notable\s+projects?|select(?:ed)?\s+projects?|academic\s+projects?|project\s+experience|featured\s+work)\b/i,
  certifications: /\b(certifications?|certificates?|licen[sc]es?|credentials?)\b/i,
  achievements: /\b(achievements?|accomplishments?|awards?|honou?rs?|recognitions?)\b/i,
};

/** Is this line a standalone section header (short + keyword near the start)? */
export function isSectionHeader(line: string, exclude?: RegExp): boolean {
  const l = line.trim();
  if (l.length === 0 || l.length > 38) return false;
  const wordCount = l.split(/\s+/).length;
  if (wordCount > 4) return false;
  for (const [, re] of Object.entries(SECTION_PATTERNS)) {
    if (exclude && exclude.source === re.source) continue;
    if (re.test(l)) return true;
  }
  return false;
}

export const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
export const PHONE_RE = /(\+?\d{1,3}[\s-]?)?\(?\d{3,5}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}/;
export const LINKEDIN_RE = /linkedin\.com\/in\/[a-z0-9_-]+/i;
export const GITHUB_RE = /github\.com\/[a-z0-9_-]+/i;
export const URL_RE = /https?:\/\/[^\s)]+/i;

export function normalize(text: string): string {
  return text.replace(/\r\n/g, "\n").replace(/\t/g, " ").replace(/[ ]{2,}/g, " ").trim();
}

export function toLines(text: string): string[] {
  return text.split("\n").map((l) => l.trim()).filter(Boolean);
}

export function words(text: string): string[] {
  return text.toLowerCase().match(/[a-z][a-z+#.]*[a-z+#]|[a-z]/g) ?? [];
}

export function wordCount(text: string): number {
  return words(text).length;
}

export function sentences(text: string): string[] {
  return text.split(/(?<=[.!?])\s+|\n/).map((s) => s.trim()).filter((s) => s.length > 0);
}

/** Lines that look like bullet points. */
export function bulletLines(lines: string[]): string[] {
  return lines.filter((l) => /^[•\-*▪◦‣·]|^\d+[.)]/.test(l) || (l.length > 30 && l.length < 220));
}

/** Count occurrences of any phrase from a list (case-insensitive, word-aware). */
export function countMatches(text: string, phrases: string[]): number {
  const lower = text.toLowerCase();
  let n = 0;
  for (const p of phrases) {
    const re = new RegExp(`\\b${p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "g");
    n += (lower.match(re) ?? []).length;
  }
  return n;
}

/** Detect lines/bullets that contain quantified impact (numbers, %, $, k/m). */
export function quantifiedCount(lines: string[]): number {
  const re = /(\$\s?\d|\d+\s?%|\d+\s?(k|m|b|million|billion|thousand)\b|\b\d{2,}\b|\d+x\b)/i;
  return lines.filter((l) => re.test(l)).length;
}

const EDU_CONTEXT_RE = /\b(b\.?tech|b\.?e\.?|b\.?sc|b\.?a\.?|bca|m\.?tech|m\.?sc|m\.?a\.?|mba|bachelor|master|phd|diploma|university|college|institute|school|iit|nit|gpa|cgpa|degree|graduat)/i;

/** Estimate total years of professional experience from date ranges in text. */
export function estimateExperienceYears(text: string): number {
  const now = new Date().getFullYear();
  const ranges: Array<[number, number]> = [];

  // Pattern: 2019 - 2022, 2019 – Present, Jan 2020 - Dec 2022
  const rangeRe =
    /((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*)?(\d{4})\s*[-–—to]+\s*((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*)?(\d{4}|present|current|now)/gi;

  // Work on a per-line basis so we can skip ranges that sit on education lines.
  const lines = text.split("\n");
  for (const line of lines) {
    if (EDU_CONTEXT_RE.test(line)) continue; // education dates are not work experience
    let m: RegExpExecArray | null;
    rangeRe.lastIndex = 0;
    while ((m = rangeRe.exec(line)) !== null) {
      const start = parseInt(m[2], 10);
      const endRaw = m[4].toLowerCase();
      const end = /present|current|now/.test(endRaw) ? now : parseInt(endRaw, 10);
      if (start >= 1980 && end >= start && end <= now + 1) ranges.push([start, end]);
    }
  }

  if (ranges.length) {
    // Merge overlapping ranges so concurrent roles don't double-count.
    ranges.sort((a, b) => a[0] - b[0]);
    let total = 0;
    let [cs, ce] = ranges[0];
    for (let i = 1; i < ranges.length; i++) {
      const [s, e] = ranges[i];
      if (s <= ce) ce = Math.max(ce, e);
      else {
        total += ce - cs;
        [cs, ce] = [s, e];
      }
    }
    total += ce - cs;
    if (total > 0) return Math.min(total, 45);
  }

  // Fallback: "5+ years of experience"
  const yearsRe = /(\d{1,2})\+?\s*years?(?:\s+of)?\s+experience/i;
  const ym = text.match(yearsRe);
  if (ym) return Math.min(parseInt(ym[1], 10), 45);

  return 0;
}

export const DEGREE_LEVELS: Array<{ level: number; label: string; re: RegExp }> = [
  { level: 5, label: "PhD", re: /\b(ph\.?d|doctorate|doctoral)\b/i },
  { level: 4, label: "Master's", re: /\b(master|m\.?s\.?|m\.?tech|mba|m\.?e\.?|msc|m\.?a\.?)\b/i },
  { level: 3, label: "Bachelor's", re: /\b(bachelor|b\.?s\.?|b\.?tech|b\.?e\.?|bsc|b\.?a\.?|bca|undergraduate)\b/i },
  { level: 2, label: "Diploma", re: /\b(diploma|associate)\b/i },
  { level: 1, label: "High School", re: /\b(high school|secondary|12th|hsc)\b/i },
];

export function highestDegree(text: string): { level: number; label: string } {
  for (const d of DEGREE_LEVELS) {
    if (d.re.test(text)) return { level: d.level, label: d.label };
  }
  return { level: 0, label: "Not detected" };
}
