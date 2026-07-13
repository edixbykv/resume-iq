import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resume Builder",
  description: "Create and export high-converting resumes with beautiful, ATS-optimized print-ready templates.",
};

export default function BuilderLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
