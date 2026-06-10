# ResumeIQ — AI Resume Intelligence Platform

> A complete career intelligence system, not just an ATS checker. Upload a resume and get a recruiter-grade breakdown: 10-dimension scoring, ATS analysis, recruiter simulation, job-description matching, salary intelligence, a 90-day skill-gap plan, and more.

**Live:** [resume.kvai.in](https://resume.kvai.in) · A [KVAI Solutions](https://kvai.in) product.

## Features

- **AI Resume Analyzer** — 10 sub-scores (ATS, skills, experience, education, project quality, industry fit, recruiter appeal, leadership, communication, technical depth) with an overall score & grade.
- **ATS Compatibility Engine** — missing sections, formatting issues, parsing risks, keyword gaps + fixes.
- **Job Description Matching** — match %, matched/missing skills, gap analysis, per-dimension match.
- **Recruiter Simulation** — YES / MAYBE / NO verdict, hiring & interview probability, confidence, time-to-hire.
- **AI Rewrite Engine** — weak bullets rewritten into quantified, recruiter-friendly impact (before vs after).
- **Career Path + Salary Intelligence** — best-fit role, roadmap, India / remote / global salary bands.
- **Skill-Gap Analyzer** — target a role, see missing skills + a phased 90-day upskilling plan.
- **GitHub / LinkedIn / Portfolio analyzers** — live GitHub stats, LinkedIn optimization, real portfolio SEO/mobile/a11y audit.
- **Benchmark & Personal Brand Score** — percentile vs peers + unified brand score.
- **Downloadable PDF report**, dark/light mode, mobile-first responsive UI.

## Architecture

The scoring engine (`src/lib/engine/`) is **fully deterministic and evidence-based** — every score reports the signals behind it and concrete fixes. A **semantic layer** (`semantic.ts`) infers skill domains and work scope from prose, so role classification and scoring use meaning, not just keyword presence.

AI, database, and auth are all **optional** — the app runs with zero configuration:

- **AI enrichment** activates with `AI_GATEWAY_API_KEY`, `OPENAI_API_KEY`, or `ANTHROPIC_API_KEY` (otherwise deterministic, data-driven narratives are used).
- **Persistence + auth** (Prisma + NextAuth) activate with `DATABASE_URL` and provider credentials.

## Tech stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · Framer Motion · Prisma (PostgreSQL) · NextAuth v5 · Vercel AI SDK · `unpdf` + `mammoth` for parsing.

## Getting started

```bash
npm install
cp .env.example .env   # optional — app works without any keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment

Hosted on Vercel with Git integration — every push to `main` auto-deploys. See `.env.example` for optional environment variables.

---

© KVAI Solutions
