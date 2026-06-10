import type { SkillCategory } from "./skills-db";
import { countMatches } from "./text-utils";

/**
 * Lightweight semantic layer. Instead of pure keyword presence, it reads the
 * *meaning* of phrases (what the person built / did) to infer skill domains and
 * the scope of their work. This corrects role mis-classification and overly
 * harsh experience scoring for people whose resumes describe real work
 * (enterprise apps, dashboards, APIs) without listing every framework.
 */

/** Phrases that signal substantial, real-world engineering scope. */
export const SCOPE_KEYWORDS = [
  "enterprise", "production", "large-scale", "large scale", "mission-critical",
  "high-traffic", "high traffic", "scalable", "platform", "application",
  "applications", "dashboard", "dashboards", "web application", "web app",
  "system", "systems", "deployed", "client", "clients", "customer", "customers",
  "end users", "saas", "b2b", "b2c", "distributed", "real-time", "real time",
];

/** Cue phrases → the skill domains they imply. */
const CUES: Array<{ re: RegExp; categories: SkillCategory[] }> = [
  { re: /\b(dashboard|dashboards|front[\s-]?end|responsive|web (app|application)|landing page|single[\s-]page|component library|design system|user interface|ui\/ux)\b/i, categories: ["frontend"] },
  { re: /\b(rest|api|apis|back[\s-]?end|micro[\s-]?service|server[\s-]?side|endpoint|authentication|authorization|crud|enterprise application|business logic|web service)\b/i, categories: ["backend"] },
  { re: /\b(database|sql|query|queries|schema|stored procedure|etl|data pipeline|data model|indexing|migrations?)\b/i, categories: ["database"] },
  { re: /\b(machine learning|ml model|deep learning|nlp|natural language|computer vision|model training|data science|neural network)\b/i, categories: ["data-ai"] },
  { re: /\b(reporting|analytics|data analysis|business intelligence|insights|visuali[sz]ation|forecasting|kpis?)\b/i, categories: ["data-ai"] },
  { re: /\b(ci\/cd|kubernetes|docker|deployment|infrastructure|devops|terraform|cloud|provisioning|monitoring|observability)\b/i, categories: ["devops", "cloud"] },
  { re: /\b(android|ios|mobile app|react native|flutter|cross[\s-]platform app)\b/i, categories: ["mobile"] },
];

/** Domains implied by the way the work is described (beyond named skills). */
export function inferCategories(text: string): Set<SkillCategory> {
  const set = new Set<SkillCategory>();
  for (const c of CUES) if (c.re.test(text)) c.categories.forEach((x) => set.add(x));
  return set;
}

/** Count of scope/impact signals — used to credit substantive work. */
export function scopeSignal(text: string): number {
  return countMatches(text, SCOPE_KEYWORDS);
}

/** True when the resume reads like full-stack work (both FE and BE domains). */
export function isFullStackSignal(text: string): boolean {
  const cats = inferCategories(text);
  return cats.has("frontend") && cats.has("backend");
}
