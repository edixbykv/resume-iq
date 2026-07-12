import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionProvider } from "@/components/site/session-provider";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://resume.kvai.in"),
  title: {
    default: "ResumeIQ — AI Resume Intelligence Platform",
    template: "%s · ResumeIQ",
  },
  description:
    "Career intelligence for your resume: ATS scoring, recruiter simulation, job-match analysis, salary intelligence, skill-gap planning, and a downloadable report. By KVAI Solutions.",
  keywords: ["resume checker", "ATS score", "recruiter simulation", "resume analyzer", "career intelligence", "KVAI"],
  authors: [{ name: "KVAI Solutions" }],
  openGraph: {
    title: "ResumeIQ — AI Resume Intelligence Platform",
    description: "Recruiter-grade analysis of your resume in seconds.",
    url: "https://resume.kvai.in",
    siteName: "ResumeIQ",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0d12" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="min-h-full antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <SessionProvider>
            {children}
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
