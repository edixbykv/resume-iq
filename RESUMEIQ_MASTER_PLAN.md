# ResumeIQ — Master Product, Engineering, Mobile, SEO & Marketing Plan

**Project:** ResumeIQ — AI Resume Intelligence Platform  
**Repository:** `C:\Users\edixb\OneDrive\Desktop\github\resume-iq`  
**Document date:** 2026-07-12  
**Current state:** Functional Next.js web MVP; not yet production-ready; no Android app exists yet.

## 1. Product vision

Build a trusted career platform that helps users create a strong resume, measure ATS readiness, tailor it to a job description, improve weak content, generate cover letters, export polished documents, and manage their career profile on web and Android.

### Core promise

> Create, improve, tailor, and export job-winning resumes with transparent, privacy-respecting AI assistance.

### Target users

- Students and freshers creating their first professional resume.
- Job seekers improving an existing resume for ATS and recruiters.
- Experienced professionals tailoring applications to specific jobs.
- Career coaches, colleges, and placement cells (future B2B offering).

## 2. Current project assessment

### What exists

- Next.js 16 + React 19 + TypeScript web application.
- Resume upload/paste flow for PDF and DOCX.
- Deterministic resume analysis with ATS, skill, experience, education, project, recruiter, career, salary, benchmark, GitHub, LinkedIn, portfolio, JD-match, and skill-gap modules.
- Optional AI enrichment via Vercel AI Gateway, OpenAI, or Anthropic.
- Optional Prisma/PostgreSQL persistence and NextAuth providers.
- Responsive UI, theme support, and printable analysis report.

### What does not exist yet

- Android app / Play Store release pipeline.
- ~~Resume Builder with editable structured fields, templates, autosave, and version history.~~ ✅ DONE
- ~~Complete authentication, user dashboard, profile, settings, and secure analysis ownership.~~ ✅ DONE
- Cover Letter Generator.
- Reliable resume-PDF generation from user-created templates.
- Tests, CI/CD quality gates, observability, consent/data controls, and production abuse protections.

### Validation result

- Production build passed successfully on 2026-07-12.
- ESLint currently fails with one blocking React effect rule in `src/components/site/theme-toggle.tsx` and five unused-import warnings.
- No automated test suite is currently present.

## 3. Critical issues to fix before public launch

### P0 — Security, privacy, and abuse prevention

1. **Fix Server-Side Request Forgery (SSRF) in portfolio analysis.** ✅ DONE
   - `src/lib/ssrf.ts` — DNS resolution, private IP blocking, metadata endpoint blocking, safe redirect handling.
   - `src/lib/engine/portfolio.ts` — uses `safeFetch()` instead of raw `fetch()`.

2. **Validate every API request with Zod.** ✅ DONE
   - `src/lib/validation.ts` — schemas for analyze, jd-match, github, linkedin, portfolio, skill-gap.
   - All API routes now validate input with `safeParse()`.

3. **Add rate limits and abuse controls.** ⏳ PARTIAL
   - Upload content verification (file signature magic bytes, extension, size checks) in `/api/analyze`.
   - Redis/Vercel KV rate limiting not yet implemented.

4. **Create a real privacy model.** ✅ DONE
   - Privacy Policy at `/privacy` — explains AI processing, data storage, third-party services.
   - Terms of Service at `/terms`.
   - Account/data deletion flows via dashboard.

5. **Correct privacy messaging.** ✅ DONE
   - Homepage now links to privacy policy instead of claiming "file never leaves the request."

### P0 — Account and data ownership

1. Add sign-up/sign-in/sign-out UI and protected routes. ✅ DONE
2. Attach every persisted analysis to the authenticated `userId`. ✅ DONE
3. Enforce ownership checks before reading, editing, exporting, or deleting a resume. ✅ DONE
4. Create user dashboard, profile, settings, and account deletion. ✅ DONE
5. Support guest mode with a clear upgrade path to save work. ✅ DONE

## 4. Recommended product architecture

Keep the existing Next.js codebase and evolve it incrementally. Do not rewrite the scoring engine.

```text
Web app (Next.js)                 Android app (React Native / Expo)
         │                                      │
         └─────────────── HTTPS API ────────────┘
                                │
                  Next.js Route Handlers / API layer
                                │
       Auth · Validation · Rate Limits · Audit Logs · AI Gateway
                                │
          PostgreSQL (Prisma) · Object Storage · Redis/KV
                                │
       Resume parser · ATS engine · AI service · PDF generation service
```

### Web

- Retain Next.js App Router and TypeScript.
- Add feature folders for `auth`, `resume-builder`, `dashboard`, `billing`, `exports`, and `settings`.
- Use server-side authorization for all user-owned data.

### Backend

- Keep Prisma/PostgreSQL as the system of record.
- Use object storage (S3, Cloudflare R2, or Vercel Blob) for uploaded source files; do not store files in the database.
- Move expensive analysis/PDF generation to a job queue when traffic grows.
- Keep scoring deterministic; label AI-generated content clearly and never invent achievements.

### Android application

**Recommended:** React Native + Expo + TypeScript.

Why: shared TypeScript models, fast Android development, reliable Expo Application Services (EAS) build/submission, and a separate native-quality app without duplicating business logic.

- Android calls the same secured API as web.
- Store only short-lived session tokens securely using Android Keystore/Expo SecureStore.
- Support upload from device, resume editing, analysis results, saved resumes, notifications, and PDF share/download.
- Do not embed database keys, AI keys, or admin secrets in the mobile app.

## 5. Core feature roadmap

### Phase 1 — Foundation (P0)

- [x] Fix SSRF, validation, upload checks, rate limits, and error handling.
- [x] Fix lint failures and establish formatting/lint/typecheck scripts.
- [ ] Add unit, integration, and end-to-end test foundations.
- [ ] Add environment template, secrets documentation, staging environment, and CI.
- [x] Complete authentication and data ownership.
- [x] Build dashboard with saved analyses and resume history.

### Phase 2 — Resume Builder (P0)

- [x] Structured editable resume data: contact, summary, experience, education, skills, projects, certificates, links, languages.
- [x] Autosave, undo/redo, duplicate, delete, and version history.
- [x] ATS-friendly templates with responsive preview.
- [x] Section ordering, visibility, rich bullet editing, and validation hints.
- [ ] Import existing resume PDF/DOCX into editable fields with user review.
- [ ] Generate a reliable PDF using server-side templates and automated visual regression checks.

### Phase 3 — Resume intelligence (P1)

- [ ] Improve ATS score with transparent rubric and per-rule evidence.
- [ ] Job description matching: matched/missing skills, keywords, years, and tailored summary guidance.
- [ ] AI suggestions at section/bullet level with Accept, Edit, Reject, and Undo controls.
- [ ] Require user confirmation for all measurable claims; never generate fake metrics.
- [ ] Cover Letter Generator using selected resume, job description, tone, and length.
- [ ] Track before/after score changes and explain what changed.

### Phase 4 — Account and growth features (P1)

- [ ] Profile and career preferences.
- [ ] Settings: AI consent, privacy, notification, export and language preferences.
- [ ] Resume sharing links with expiration/password options.
- [ ] Email reminders for incomplete resumes and saved jobs (opt-in only).
- [ ] Premium plan with free limits and secure billing integration.

### Phase 5 — Android app (P1)

- [ ] Create a separate `apps/mobile` Expo application after API contracts are stable.
- [ ] Login/onboarding, home dashboard, upload/paste, builder, analysis, job match, cover letter, and settings.
- [ ] Native file picker, secure storage, PDF share/download, push notifications.
- [ ] Internal testing, closed testing, Play Store production rollout.

## 6. Resume Builder specification

### Essential user experience

1. User signs in or starts as a guest.
2. User selects a template or imports an existing resume.
3. User edits structured sections with live preview.
4. System shows ATS and quality feedback without blocking writing.
5. User pastes a job description to tailor the resume.
6. User accepts/rejects AI suggestions and verifies claims.
7. User exports PDF and optionally saves a targeted version.

### Templates at launch

- Modern professional.
- Classic ATS-safe.
- Minimal one-page fresher.
- Technical/project-focused.
- Executive/experienced professional.

Every template must be ATS-safe: semantic headings, selectable text, no critical data in images/tables, readable fonts, and consistent date formats.

## 7. Data model additions

Add models incrementally:

- `Resume`: owner, title, target role, template, structured JSON, source file metadata, current version.
- `ResumeVersion`: immutable snapshot, score, created time, change reason.
- `Analysis`: score/results linked to a resume/version; do not mix it with raw file storage.
- `CoverLetter`: owner, resume version, job description reference, content, tone, created time.
- `JobDescription`: optional saved JDs for tailoring history.
- `Consent`: AI processing/storage consent records with policy version.
- `AuditEvent`: security-relevant events, without storing raw resume content.

## 8. AI safety and quality policy

- AI is an assistant, not an authority or recruiter guarantee.
- Never claim a candidate is guaranteed to be hired.
- Never fabricate employers, skills, projects, metrics, certificates, or experience.
- Highlight uncertainty and ask the user to confirm missing metrics.
- Cache and rate-limit requests; track token and cost usage.
- Use structured output schemas, safety checks, and fallback messages.
- Redact sensitive personal data before sending it to AI where possible.

## 9. Testing and release engineering

### Required quality gates

- `lint`, TypeScript typecheck, production build.
- Unit tests: parser, extraction, ATS rules, score calculations, role matching, validation, SSRF blocking.
- API integration tests: auth, ownership, uploads, invalid payloads, rate limits.
- E2E tests: create resume, edit, analyze, tailor, export, delete account.
- PDF visual regression tests across every template.
- Accessibility checks: keyboard-only operation, labels, contrast, screen-reader navigation.
- Mobile device testing: small Android phone, large phone, slow network, interrupted uploads.

### CI/CD

- GitHub Actions: install, lint, typecheck, tests, build, dependency audit.
- Preview deployments for pull requests.
- Separate staging and production environments.
- Error tracking (Sentry or equivalent), structured logs, uptime monitoring, and analytics dashboards.

## 10. Play Store launch plan

### Before building

- [ ] Register/verify Google Play Console developer account.
- [ ] Finalize legal business name, support email, website, Privacy Policy URL, and Terms URL.
- [ ] Create app name, package ID, icon, splash screen, screenshots, and feature graphic.
- [ ] Implement in-app account deletion if accounts can be created.
- [ ] Complete Google Play Data safety form based on actual data collection.
- [ ] Provide a privacy policy that exactly matches actual AI, storage, analytics, and deletion practices.

### Android technical checklist

- [ ] Use a release package ID, e.g. `in.kvai.resumeiq` after confirming availability.
- [ ] Produce signed Android App Bundle (`.aab`), not only APK.
- [ ] Configure EAS/Google Play signing, release keystore ownership, and backup procedure.
- [ ] Target the current Play-required Android API level at release time.
- [ ] Implement secure auth, crash reporting, privacy consent, deep links, and offline/error states.
- [ ] Test internal track → closed testing → open testing → production.
- [ ] Prepare support process and release notes.

### Store listing assets

- App title: `ResumeIQ: AI Resume Builder` (validate availability before publishing).
- Short description: `Build ATS-ready resumes, get AI feedback, and tailor every application.`
- Long description: feature-led, truthful, keyword-aware, no hiring guarantees.
- Minimum: phone screenshots showing builder, ATS score, job tailoring, cover letter, and PDF export.
- Localize English first; add Hindi and other Indian languages based on demand.

## 11. SEO plan for web

### Technical SEO

- [x] Add `robots.txt` — disallows `/api/` and `/dashboard/`.
- [ ] Add unique metadata, canonical URLs, Open Graph, and Twitter cards for all public pages.
- [ ] Add `sitemap.xml` and structured data (Organization, SoftwareApplication, FAQPage, BreadcrumbList).
- [ ] Improve Core Web Vitals: image optimization, bundle analysis, lazy-load non-critical motion/tools.
- [ ] Use server-rendered public content pages, not only client-side screens.
- [ ] Add accessible heading hierarchy, descriptive links, and image alt text.
- [ ] Set up Google Search Console and Bing Webmaster Tools.
- [ ] Add cookie/consent handling where legally required.

### SEO landing pages

Create useful, non-duplicated pages for:

- ATS Resume Checker.
- Resume Builder.
- Resume Score Checker.
- Job Description Match.
- Cover Letter Generator.
- Fresher Resume Builder.
- Software Engineer Resume Builder.
- Student Resume Builder.
- LinkedIn Headline Generator/Checker.
- Resume examples by role and experience level.

Each page needs a clear tool CTA, original expert guidance, FAQs, examples, internal links, and schema markup.

### Content strategy

- Publish resume examples and guides for Indian and global job markets.
- Create role-specific articles: software developer, data analyst, marketing, finance, fresher, designer, manager.
- Publish practical content: action verbs, quantified achievements, ATS formatting, gap explanations, salary negotiation.
- Use real subject-matter review and avoid generic AI-generated articles.

## 12. Marketing plan

### Positioning

Differentiate from generic ATS checkers: **transparent score evidence + editable builder + JD tailoring + India-aware career guidance + privacy controls**.

### Launch channels

- LinkedIn: before/after resume transformations, short resume tips, founder posts, and career coach partnerships.
- Instagram/Reels/YouTube Shorts: 30-60 second resume mistakes and improvement demos.
- Colleges and placement cells: free workshops, campus codes, placement dashboards (future).
- Communities: GitHub, developer groups, Telegram/WhatsApp career communities, Reddit where appropriate.
- SEO content and free tools for sustained acquisition.
- Referral loop: export/share experience with ethical invite rewards.

### Funnel metrics

- Visitor → resume analysis conversion.
- Analysis → account creation conversion.
- Account → builder completion rate.
- Builder → PDF export rate.
- Free → paid conversion (if/when billing launches).
- 7-day and 30-day retention.
- Cost per activated user and AI cost per active user.

### Analytics events

Track privacy-safe events only:

- `resume_upload_started`, `analysis_completed`, `analysis_failed`.
- `builder_started`, `resume_saved`, `template_changed`, `pdf_exported`.
- `jd_match_completed`, `suggestion_accepted`, `cover_letter_generated`.
- `signup_completed`, `subscription_started`.

Do not send raw resume text, email, phone number, or job description content to product analytics.

## 13. Suggested milestones

### Milestone A — Safe web beta ✅

Security fixes, validation, rate limits, privacy notices, lint/tests, complete sign-in, data ownership, saved dashboard.

### Milestone B — Best-in-class builder ✅

Structured builder, templates, version history, ATS score feedback, reliable PDF export, JD tailoring.

### Milestone C — AI career suite

Verified AI suggestions, cover letters, targeted versions, skill-gap plan, usage controls, premium packaging.

### Milestone D — Android and launch

Expo Android app, internal/closed testing, Play Store compliance, release assets, support process, marketing campaign.

## 14. First engineering sprint — exact order

1. Fix portfolio SSRF and API input validation. ✅
2. Add rate limiting, upload content verification, and safe error responses. ✅
3. Fix lint issues and add CI quality gates. ✅
4. Implement complete authentication and connect saved analyses to `userId`. ✅
5. Create dashboard/history with authorization checks. ✅
6. Design the structured resume schema and implement the Resume Builder foundation. ✅
7. Add templates, versioning, and server-side PDF export. ✅

## 15. Definition of "production-ready"

ResumeIQ is ready for broad public launch only when:

- Security review, SSRF protection, API validation, rate limits, and data ownership are live. ✅
- Privacy policy, consent, deletion, support, and legal disclosures match actual behavior. ✅
- Resume Builder, user dashboard, template-based PDF export, and core analysis features work reliably. ✅
- Lint, types, tests, accessibility checks, and CI pass on every release.
- Monitoring, alerts, backups, staging, and rollback are in place.
- Android app has passed Play Console testing and Data safety compliance.
- SEO landing pages, analytics, and a measurable marketing funnel are live.