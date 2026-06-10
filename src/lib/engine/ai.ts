import { generateObject, type LanguageModel } from "ai";
import { AiInsightsSchema, type AiInsights, type ResumeFields, type SubScores } from "./types";

/**
 * Resolve a language model from whatever credentials are available:
 *   1. Vercel AI Gateway  (AI_GATEWAY_API_KEY)  -> "openai/gpt-4o-mini"
 *   2. OpenAI direct       (OPENAI_API_KEY)
 *   3. Anthropic direct    (ANTHROPIC_API_KEY)  -> Claude
 * Returns null when no provider is configured (engine falls back to its own
 * deterministic narratives — the product still fully works).
 */
async function resolveModel(): Promise<LanguageModel | null> {
  if (process.env.AI_GATEWAY_API_KEY) {
    // The AI SDK routes bare "provider/model" strings through the Gateway.
    return "openai/gpt-4o-mini" as unknown as LanguageModel;
  }
  if (process.env.OPENAI_API_KEY) {
    const { createOpenAI } = await import("@ai-sdk/openai");
    return createOpenAI({ apiKey: process.env.OPENAI_API_KEY })("gpt-4o-mini");
  }
  if (process.env.ANTHROPIC_API_KEY) {
    const { createAnthropic } = await import("@ai-sdk/anthropic");
    return createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY })("claude-3-5-haiku-latest");
  }
  return null;
}

export function aiAvailable(): boolean {
  return Boolean(
    process.env.AI_GATEWAY_API_KEY || process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY,
  );
}

export async function enrichWithAI(
  resumeText: string,
  fields: ResumeFields,
  sub: SubScores,
): Promise<AiInsights | null> {
  const model = await resolveModel();
  if (!model) return null;

  const weakAreas = Object.values(sub)
    .filter((s) => s.score < 65)
    .map((s) => s.label)
    .join(", ");

  try {
    const { object } = await generateObject({
      model,
      schema: AiInsightsSchema,
      system:
        "You are a senior technical recruiter and resume coach. Be specific, " +
        "honest, and use strong action verbs with quantified impact. Never invent " +
        "facts that aren't supported by the resume.",
      prompt: [
        `Analyze this resume and return structured insights.`,
        `Detected weak areas to focus on: ${weakAreas || "none"}.`,
        `Detected skills: ${fields.skills.map((s) => s.name).join(", ") || "n/a"}.`,
        ``,
        `RESUME TEXT:`,
        resumeText.slice(0, 8000),
      ].join("\n"),
    });
    return object;
  } catch {
    // Network/credit/parse failure -> behave as if no AI is configured.
    return null;
  }
}

/**
 * Deterministic, data-driven fallback for the narrative pieces the AI would
 * normally write. Built from real extracted signals — not random mock data.
 */
export function fallbackInsights(
  resumeText: string,
  fields: ResumeFields,
  sub: SubScores,
): AiInsights {
  const role = fields.skills.length
    ? fields.skills.slice(0, 3).map((s) => s.name).join(", ")
    : "your field";
  const years = fields.experienceYears || 1;

  const strengths = Object.values(sub)
    .filter((s) => s.score >= 70)
    .map((s) => `${s.label}: ${s.summary}`)
    .slice(0, 5);

  const redFlags = Object.values(sub)
    .filter((s) => s.score < 60)
    .flatMap((s) => s.recommendations)
    .slice(0, 5);

  // Rewrite weak bullet lines using action-verb + quantification scaffolding.
  const weakLines = resumeText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => /\b(responsible for|worked on|helped|assisted|involved in)\b/i.test(l))
    .slice(0, 4);

  const rewrittenBullets = weakLines.map((before) => ({
    before,
    after: before
      .replace(/^[•\-*\s]+/, "")
      .replace(/responsible for/i, "Owned and delivered")
      .replace(/worked on/i, "Built")
      .replace(/helped (to )?/i, "Drove ")
      .replace(/assisted (with|in)?/i, "Led")
      .replace(/involved in/i, "Delivered")
      .concat(" — add a metric (e.g. % improvement, users, time saved)."),
  }));

  if (!rewrittenBullets.length) {
    rewrittenBullets.push({
      before: "Worked on the backend APIs for the product.",
      after: "Built and shipped 12+ REST APIs serving 50k+ monthly requests, cutting p95 latency 35%.",
    });
  }

  return {
    professionalSummary: `${fields.name ?? "This candidate"} is a ${role} professional with ~${years} year(s) of experience and a resume strength of ${sub.recruiterAppeal.score}/100. ${strengths[0] ?? "Shows relevant foundational skills."}`,
    topStrengths: strengths.length ? strengths : ["Relevant technical skills detected.", "Clear contact information."],
    redFlags: redFlags.length ? redFlags : ["Add more quantified, impact-driven achievements."],
    rewrittenBullets,
    interviewQuestions: {
      technical: [
        `Walk me through a project where you used ${fields.skills[0]?.name ?? "your primary stack"}.`,
        "How do you approach debugging a production issue under time pressure?",
        "Describe a time you optimized performance — what was the measurable result?",
        "How do you decide between building vs. using an existing library/service?",
        "Explain a technical trade-off you made and why.",
      ],
      behavioral: [
        "Tell me about a time you disagreed with a teammate. How did you resolve it?",
        "Describe your most impactful contribution in the last year.",
        "How do you prioritize when everything feels urgent?",
        "Tell me about a failure and what you learned.",
      ],
      project: [
        `What was the hardest technical challenge in your ${fields.projects[0] ? "featured" : "best"} project?`,
        "How did you measure the success of that project?",
        "If you rebuilt it today, what would you change?",
        "What was your specific individual contribution?",
      ],
    },
    improvedSummarySection: `Results-driven ${role} professional with ${years}+ year(s) of experience building reliable, user-focused software. Proven ability to ship impact-driven work and collaborate across teams. Seeking to drive measurable outcomes in a high-growth engineering team.`,
  };
}
