/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { z } from "zod";

export const runtime = "nodejs";

const OptimizedResumeSchema = z.object({
  summary: z.string(),
  experience: z.array(
    z.object({
      id: z.string(),
      bullets: z.array(z.string()),
    })
  ),
  skills: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string(),
      category: z.enum(["technical", "soft", "language", "tool", "other"]),
    })
  ),
});

export async function POST(req: NextRequest) {
  try {
    const { resume, jobDescription } = await req.json();
    if (!resume || !jobDescription) {
      return NextResponse.json({ error: "Missing resume or job description." }, { status: 400 });
    }

    let optimizedData = null;

    // Check if AI keys are configured
    const apiKey = process.env.OPENAI_API_KEY || process.env.AI_GATEWAY_API_KEY;
    if (apiKey) {
      try {
        const { createOpenAI } = await import("@ai-sdk/openai");
        const model = createOpenAI({ apiKey })("gpt-4o-mini");

        const { object } = await generateObject({
          model,
          schema: OptimizedResumeSchema,
          system: "You are an expert resume optimizer and career coach. Tailor the summary, experience bullets, and skills to highlight keywords and matching credentials from the job description.",
          prompt: `
            TAILOR THIS RESUME:
            Summary: ${resume.summary}
            Skills: ${resume.skills.map((s: any) => s.name).join(", ")}
            Experience:
            ${resume.experience.map((e: any) => `- [${e.id}] ${e.title} at ${e.company}: ${e.bullets.join("; ")}`).join("\n")}
            
            TO MATCH THIS JOB DESCRIPTION:
            ${jobDescription}
          `,
        });
        optimizedData = object;
      } catch (err) {
        console.error("AI optimization call failed, falling back to deterministic matching", err);
      }
    }

    if (!optimizedData) {
      // Deterministic local mock optimization fallback
      const jdWords = jobDescription.toLowerCase();
      const detectedKeywords = ["react", "node", "typescript", "docker", "aws", "kubernetes", "python", "javascript", "graphql", "next.js", "tailwind", "sql", "git"]
        .filter((kw) => jdWords.includes(kw))
        .map((kw) => kw.charAt(0).toUpperCase() + kw.slice(1));

      const matchedSummary = resume.summary
        ? `${resume.summary} Optimized for role alignment with focus on ${detectedKeywords.slice(0, 3).join(", ")}.`
        : `Professional profile optimized for keys: ${detectedKeywords.slice(0, 4).join(", ")}.`;

      // Filter out duplicate skills
      const existingNames = new Set(resume.skills.map((s: any) => s.name.toLowerCase()));
      const newSkills = [...resume.skills];
      detectedKeywords.forEach((name) => {
        if (!existingNames.has(name.toLowerCase())) {
          newSkills.push({ id: `opt_${Math.random().toString(36).slice(2, 6)}`, name, category: "technical" });
        }
      });

      optimizedData = {
        summary: matchedSummary,
        experience: resume.experience.map((e: any) => ({
          id: e.id,
          bullets: e.bullets.map((b: string) => `${b} (Tailored for job role).`),
        })),
        skills: newSkills,
      };
    }

    // Merge the optimized blocks
    const updatedResume = {
      ...resume,
      summary: optimizedData.summary,
      skills: optimizedData.skills.map((s: any) => ({
        id: s.id || `opt_${Math.random().toString(36).slice(2, 6)}`,
        name: s.name,
        category: s.category,
      })),
      experience: resume.experience.map((e: any) => {
        const opt = optimizedData.experience.find((x: any) => x.id === e.id);
        return opt ? { ...e, bullets: opt.bullets } : e;
      }),
    };

    return NextResponse.json({ success: true, resume: updatedResume });
  } catch (err) {
    console.error("Optimize API error", err);
    return NextResponse.json({ error: "Failed to optimize resume." }, { status: 500 });
  }
}
