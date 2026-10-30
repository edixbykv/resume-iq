import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free AI Resume Analyzer: Check Your ATS Score",
  description:
    "Upload your resume and ResumeIQ checks it the way an ATS and a recruiter would: ATS score, missing keywords, job match and what to fix first.",
  alternates: { canonical: "/analyze" },
};

export default function AnalyzeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
