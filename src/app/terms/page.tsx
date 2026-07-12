import type { Metadata } from "next";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "ResumeIQ terms of service — conditions for using the platform.",
};

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl prose prose-sm dark:prose-invert">
          <h1>Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: July 12, 2026</p>

          <h2>1. Acceptance of Terms</h2>
          <p>
            By using ResumeIQ, you agree to these terms. If you do not agree, do not use the service.
          </p>

          <h2>2. Service Description</h2>
          <p>
            ResumeIQ provides AI-assisted resume analysis, scoring, and improvement suggestions.
            Results are for informational purposes only and do not guarantee job placement or interview success.
          </p>

          <h2>3. User Responsibilities</h2>
          <ul>
            <li>You are responsible for the accuracy of the information you provide.</li>
            <li>You must not upload resumes containing malicious code or illegal content.</li>
            <li>You must not abuse the service through automated requests or excessive usage.</li>
          </ul>

          <h2>4. AI-Generated Content</h2>
          <p>
            AI-generated suggestions are provided as assistance only. You are responsible for reviewing
            and verifying all AI-generated content before using it in your resume. We never fabricate
            experience, skills, or metrics — any AI suggestions are clearly labeled.
          </p>

          <h2>5. Intellectual Property</h2>
          <p>
            Your resume content remains your property. ResumeIQ does not claim ownership of your
            uploaded content. The analysis engine, scoring algorithms, and platform code are the
            property of KVAI Solutions.
          </p>

          <h2>6. Limitation of Liability</h2>
          <p>
            ResumeIQ is provided &quot;as is&quot; without warranty. KVAI Solutions is not liable for any
            damages arising from the use of this service, including but not limited to lost
            employment opportunities.
          </p>

          <h2>7. Changes to Terms</h2>
          <p>
            We may update these terms at any time. Continued use after changes constitutes acceptance
            of the new terms.
          </p>

          <h2>8. Contact</h2>
          <p>
            For questions about these terms, contact KVAI Solutions at legal@kvai.in.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}