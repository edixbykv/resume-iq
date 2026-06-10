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

// NOTE: alternatives are ordered longest/most-specific first, because JS regex
// alternation is ordered (not longest-match). This ensures a header like
// "PROJECT EXPERIENCE" is consumed whole rather than matching just "Project".
export const SECTION_PATTERNS: Record<string, RegExp> = {
  summary: /\b(professional\s+summary|career\s+objective|summary|objective|profile|about\s*me)\b/i,
  experience: /\b(professional\s+experience|work\s+experience|work\s+history|career\s+history|employment|experience)\b/i,
  education: /\b(education|academic|qualifications?)\b/i,
  skills: /\b(technical\s+skills|core\s+skills|tech\s+stack|technologies|competencies|expertise|proficiencies|skills)\b/i,
  projects: /\b(personal\s+projects?|key\s+projects?|notable\s+projects?|select(?:ed)?\s+projects?|academic\s+projects?|project\s+experience|featured\s+work|projects?)\b/i,
  certifications: /\b(certifications?|certificates?|licen[sc]es?|credentials?)\b/i,
  achievements: /\b(achievements?|accomplishments?|awards?|honou?rs?|recognitions?)\b/i,
};

/** Section keywords anchored at line start (handles collapsed PDF lines). */
const START_SECTION_RE =
  /^\s*(professional\s+summary|career\s+objective|summary|objective|profile|work\s+experience|professional\s+experience|work\s+history|career\s+history|experience|employment|education|academic|qualifications?|technical\s+skills|tech\s+stack|core\s+skills|skills|technologies|competencies|expertise|proficiencies|project\s+experience|projects?|certifications?|certificates?|licen[sc]es?|achievements?|accomplishments?|awards?|honou?rs?)\b/i;

/** Is this line a section boundary (standalone header, or keyword-led line)? */
export function isSectionHeader(line: string, exclude?: RegExp): boolean {
  const l = line.trim();
  if (l.length === 0) return false;

  // Boundary if the line STARTS with a section keyword — works even when the
  // header has trailing content on the same line (PDF layout collapse).
  const startMatch = l.match(START_SECTION_RE);
  if (startMatch) {
    if (exclude && exclude.test(startMatch[0].trim())) return false;
    return true;
  }

  // Otherwise only a short, keyword-led standalone line counts.
  if (l.length > 38) return false;
  if (l.split(/\s+/).length > 4) return false;
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

const PHONE_LIKE_RE = /(\+?\d[\d\s().-]{7,}\d)/;

/**
 * Does a statement contain a *quantified achievement*? Works regardless of
 * bullet formatting — looks for the meaning of a metric: percentages, money,
 * "15000+", scaled numbers (10k / 2 million / 5 lakh), multipliers (3x),
 * comma-grouped numbers, or any non-year integer (≥2 digits).
 */
export function hasImpactNumber(s: string): boolean {
  if (PHONE_LIKE_RE.test(s) && s.split(/\s+/).length <= 4) return false; // phone/contact line
  if (/\d+(?:\.\d+)?\s?%/.test(s)) return true; // 45%
  if (/[$₹€£]\s?\d/.test(s)) return true; // $1,200 / ₹50000
  if (/\b\d[\d,]*\s?\+/.test(s)) return true; // 15000+ / 1,000+
  if (/\b\d+(?:\.\d+)?\s?(k|m|b|mn|bn|million|billion|thousand|lakh|lakhs|cr|crore|crores)\b/i.test(s)) return true;
  if (/\b\d+(?:\.\d+)?\s?x\b/i.test(s)) return true; // 3x
  if (/\b\d{1,3}(?:,\d{3})+\b/.test(s)) return true; // 1,000,000
  // any standalone 2-7 digit integer that isn't a 4-digit calendar year
  for (const n of s.match(/\b\d{2,7}\b/g) ?? []) {
    const v = parseInt(n, 10);
    if (!(n.length === 4 && v >= 1900 && v <= 2099)) return true;
  }
  return false;
}

/** Count quantified-achievement statements across the whole resume. */
export function countQuantifiedStatements(text: string): number {
  const stmts = text
    .split(/\n|(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  let n = 0;
  for (const s of stmts) {
    if (/@|linkedin\.com|github\.com/i.test(s)) continue; // skip contact lines
    if (hasImpactNumber(s)) n++;
  }
  return n;
}

/** Legacy line-based count (kept for compatibility). */
export function quantifiedCount(lines: string[]): number {
  return lines.filter((l) => hasImpactNumber(l)).length;
}

/**
 * Extract the text region belonging to a section, using string indices so it
 * survives PDF layout collapse (header + content merged onto one line). Returns
 * the content from just after the header keyword to the next section header.
 */
export function sectionRegion(text: string, headerRe: RegExp): string | null {
  const m = headerRe.exec(text);
  if (!m) return null;
  const startIdx = m.index + m[0].length;
  const rest = text.slice(startIdx);
  const lines = rest.split("\n");
  let consumed = 0;
  let endRel = rest.length;
  for (let i = 0; i < lines.length; i++) {
    if (i > 0 && isSectionHeader(lines[i], headerRe)) {
      endRel = consumed;
      break;
    }
    consumed += lines[i].length + 1;
  }
  return rest.slice(0, endRel).replace(/^[:\s-]+/, "").trim();
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
