import { SKILLS, type SkillDef } from "./skills-db";
import {
  ACTION_VERBS,
  WEAK_VERBS,
  EMAIL_RE,
  PHONE_RE,
  LINKEDIN_RE,
  GITHUB_RE,
  URL_RE,
  SECTION_PATTERNS,
  sectionRegion,
  isSectionHeader,
  toLines,
  words,
  wordCount,
  bulletLines,
  countQuantifiedStatements,
  estimateExperienceYears,
  highestDegree,
} from "./text-utils";
import type { ResumeFields, ExtractedSkill } from "./types";

/** Detect which standard sections are present. */
function detectSections(text: string): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  for (const [key, re] of Object.entries(SECTION_PATTERNS)) out[key] = re.test(text);
  return out;
}

/** Match skills from the taxonomy against the resume text. */
function extractSkills(text: string): ExtractedSkill[] {
  const lower = ` ${text.toLowerCase()} `;
  const found = new Map<string, SkillDef>();
  for (const skill of SKILLS) {
    const terms = [skill.name, ...(skill.aliases ?? [])];
    for (const t of terms) {
      const term = t.toLowerCase();
      // word-boundary-ish match that tolerates symbols like c++, c#, node.js
      const re = new RegExp(`(^|[^a-z0-9+#.])${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z0-9+#]|$)`);
      if (re.test(lower)) {
        found.set(skill.name, skill);
        break;
      }
    }
  }
  return [...found.values()].map((s) => ({
    name: s.name,
    category: s.category,
    advanced: !!s.advanced,
  }));
}

/** Heuristic name detection: first plausible non-contact line near the top. */
function extractName(lines: string[], email: string | null): string | null {
  for (const line of lines.slice(0, 6)) {
    if (EMAIL_RE.test(line) || PHONE_RE.test(line) || URL_RE.test(line)) continue;
    if (/resume|curriculum|cv\b/i.test(line)) continue;
    const tokens = line.split(/\s+/).filter(Boolean);
    if (tokens.length >= 2 && tokens.length <= 4 && /^[A-Za-z.'-]+$/.test(tokens.join(""))) {
      const looksName = tokens.every((t) => /^[A-Z]/.test(t) || t.length <= 3);
      if (looksName) return line.replace(/[^A-Za-z .'-]/g, "").trim();
    }
  }
  // Derive from email local part as a last resort.
  if (email) {
    const local = email.split("@")[0].replace(/[._\d]+/g, " ").trim();
    if (local.length > 2) return local.replace(/\b\w/g, (c) => c.toUpperCase());
  }
  return null;
}

const BULLET_PREFIX_RE = /^[•\-*▪◦‣·●▸■○◆–—\d.)\s]+/;

/**
 * Pull discrete entries from a section, resilient to PDF layout collapse.
 * Splits the section region by lines first; if the region collapsed onto a
 * single line, falls back to splitting on bullet glyphs / multi-space / pipes /
 * "Title:" patterns.
 */
function extractSectionEntries(text: string, sectionRe: RegExp): string[] {
  const region = sectionRegion(text, sectionRe);
  if (!region) return [];

  let entries = region
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 2)
    .map((l) => l.replace(BULLET_PREFIX_RE, "").trim())
    .filter(Boolean);

  // Region collapsed onto ~one line → split semantically.
  if (entries.length <= 1 && region.length > 60) {
    const byGlyph = region
      .split(/\s*[•▪◦‣·●▸■|]\s*|\s{2,}/)
      .map((s) => s.replace(BULLET_PREFIX_RE, "").trim())
      .filter((s) => s.length > 3);
    const byTitle = [...region.matchAll(/([A-Z][\w .&/+'-]{2,48}?)\s*[:–—-]\s/g)].map((m) => m[1].trim());
    const best = [byGlyph, byTitle].sort((a, b) => b.length - a.length)[0];
    if (best.length > entries.length) entries = best;
  }

  // Drop short header remnants (e.g. a leftover "EXPERIENCE" / "SKILLS" token).
  entries = entries.filter((e) => !(e.length <= 15 && isSectionHeader(e)));

  return [...new Set(entries)].slice(0, 12);
}

const PROJECT_VERB = /(built|developed|created|designed|implemented|engineered|architected|launched|programmed|made)/i;
const PROJECT_NOUN = /(app|application|platform|system|website|web ?app|tool|bot|api|dashboard|pipeline|model|game|portal|engine|service|extension|library|clone)/i;

/**
 * Semantic project detection — finds project-like statements anywhere in the
 * resume (verb + artifact, or a "Title:" line that mentions tech), used when
 * there's no explicit Projects section or the section parse came up empty.
 */
function semanticProjects(text: string): string[] {
  const out: string[] = [];
  for (const raw of text.split("\n")) {
    const line = raw.replace(BULLET_PREFIX_RE, "").trim();
    if (line.length < 8 || line.length > 200) continue;
    const verbNoun = PROJECT_VERB.test(line) && PROJECT_NOUN.test(line);
    const titled = /^[A-Z][\w .&/+'-]{2,48}?\s*[:–—-]\s/.test(line) && PROJECT_NOUN.test(line);
    if (verbNoun || titled) out.push(line);
  }
  return [...new Set(out)].slice(0, 8);
}

/** Project extraction: explicit section first, then semantic fallback. */
function extractProjects(text: string): string[] {
  const fromSection = extractSectionEntries(text, SECTION_PATTERNS.projects);
  if (fromSection.length > 0) return fromSection;
  return semanticProjects(text);
}

function extractKeywords(text: string, skills: ExtractedSkill[]): string[] {
  const stop = new Set([
    "the", "and", "for", "with", "from", "this", "that", "have", "has", "are",
    "was", "were", "will", "your", "you", "our", "their", "they", "all", "any",
    "experience", "work", "team", "using", "used", "use", "various", "etc",
  ]);
  const freq = new Map<string, number>();
  for (const w of words(text)) {
    if (w.length < 4 || stop.has(w)) continue;
    freq.set(w, (freq.get(w) ?? 0) + 1);
  }
  const top = [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([w]) => w);
  // Prefer real skills first, then frequent terms.
  const skillNames = skills.map((s) => s.name);
  return [...new Set([...skillNames, ...top])].slice(0, 25);
}

/** Full extraction pass over parsed resume text. */
export function extractFields(text: string, pages: number): ResumeFields {
  const lines = toLines(text);
  const email = text.match(EMAIL_RE)?.[0] ?? null;
  const phone = text.match(PHONE_RE)?.[0]?.trim() ?? null;
  const linkedin = text.match(LINKEDIN_RE)?.[0] ?? null;
  const github = text.match(GITHUB_RE)?.[0] ?? null;
  const website = (() => {
    const all = text.match(new RegExp(URL_RE, "gi")) ?? [];
    return all.find((u) => !/linkedin\.com|github\.com/i.test(u)) ?? null;
  })();

  const skills = extractSkills(text);
  const sections = detectSections(text);
  const bullets = bulletLines(lines);
  const lowerWords = words(text);

  const actionVerbs = lowerWords.filter((w) => ACTION_VERBS.has(w)).length;
  const weakVerbs = lowerWords.filter((w) => WEAK_VERBS.has(w)).length;

  // Role count ≈ number of date ranges detected.
  const roleCount = (text.match(/\b(19|20)\d{2}\b/g) ?? []).length >= 2
    ? Math.max(1, Math.round((text.match(/\b(19|20)\d{2}\b/g) ?? []).length / 2))
    : 0;

  const certifications = extractSectionEntries(text, SECTION_PATTERNS.certifications);
  const projects = extractProjects(text);
  const achievements = extractSectionEntries(text, SECTION_PATTERNS.achievements);

  // If projects were found semantically (no explicit header), reflect that.
  if (projects.length > 0) sections.projects = true;

  return {
    name: extractName(lines, email),
    email,
    phone,
    linkedin,
    github,
    website,
    skills,
    experienceYears: estimateExperienceYears(text),
    roleCount,
    degree: highestDegree(text),
    certifications,
    projects,
    achievements,
    keywords: extractKeywords(text, skills),
    sections,
    stats: {
      wordCount: wordCount(text),
      bulletCount: bullets.length,
      quantifiedBullets: countQuantifiedStatements(text),
      actionVerbs,
      weakVerbs,
      pages,
    },
  };
}
