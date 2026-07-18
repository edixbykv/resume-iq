import type { Metadata } from "next";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "ResumeIQ privacy policy — how we handle your resume data.",
};

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl prose prose-sm dark:prose-invert">
          <h1>Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: July 12, 2026</p>

          <h2>1. What we collect</h2>
          <p>
            When you use ResumeIQ, we process the resume file or text you upload to generate analysis results.
            If you create an account, we store your name, email address, and analysis history.
          </p>

          <h2>2. How we use your data</h2>
          <ul>
            <li>To analyze your resume and provide scoring, feedback, and recommendations.</li>
            <li>To save your analysis history when you are signed in.</li>
            <li>To improve our analysis engine (aggregated, anonymized data only).</li>
          </ul>

          <h2>3. AI processing</h2>
          <p>
            If you enable AI enrichment, your resume text may be sent to a third-party AI provider
            (OpenAI, Anthropic, or Vercel AI Gateway) solely for the purpose of generating insights.
            We do not use your data to train AI models. You can disable AI enrichment at any time.
          </p>

          <h2>4. Data storage and retention</h2>
          <p>
            Resume files and analysis results are stored only when you are signed in and have consented
            to storage. You can delete any saved analysis at any time from your dashboard.
            Account deletion removes all associated data within 30 days.
          </p>

          <h2>5. Third-party services</h2>
          <p>
            ResumeIQ may use the following third-party services:
          </p>
          <ul>
            <li>Vercel (hosting and infrastructure)</li>
            <li>OpenAI / Anthropic (optional AI enrichment)</li>
            <li>GitHub / Google (authentication providers)</li>
            <li>PostgreSQL / Prisma (database)</li>
          </ul>

          <h2>6. Your rights</h2>
          <p>
            You have the right to access, correct, or delete your personal data.
            To exercise these rights, sign in to your account or contact us at solutionskvai@gmail.com.
          </p>

          <h2>7. Contact</h2>
          <p>
            For privacy-related inquiries, contact KVAI Solutions at solutionskvai@gmail.com.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}