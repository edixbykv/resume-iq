import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionProvider } from "@/components/site/session-provider";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// The title carries the same name as the Play listing ("ResumeIQ: AI Resume Analyzer") so a search
// for the app name finds the site too.
const TITLE = "ResumeIQ: AI Resume Analyzer and ATS Score Checker";
const DESCRIPTION =
  "ResumeIQ is a free AI resume analyzer by KVai Solutions. Get your ATS score, see how a recruiter reads your resume, match it to a job and download a report.";

export const metadata: Metadata = {
  metadataBase: new URL("https://resume.kvai.in"),
  title: {
    default: TITLE,
    template: "%s · ResumeIQ",
  },
  description: DESCRIPTION,
  applicationName: "ResumeIQ",
  keywords: [
    "resumeiq", "resume iq", "ai resume analyzer", "resume analyzer", "ats score checker", "resume checker",
    "ai resume review", "resume review", "job match", "kvai",
  ],
  authors: [{ name: "KVai Solutions", url: "https://www.kvai.in" }],
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://resume.kvai.in",
    siteName: "ResumeIQ",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

// Tells Google what ResumeIQ is and who makes it, so the brand search has something to match.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": "https://resume.kvai.in/#app",
      name: "ResumeIQ",
      alternateName: ["Resume IQ", "ResumeIQ: AI Resume Analyzer"],
      url: "https://resume.kvai.in",
      description: DESCRIPTION,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Any web browser, Android",
      offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
      publisher: { "@id": "https://www.kvai.in/#organization" },
    },
    {
      "@type": "Organization",
      "@id": "https://www.kvai.in/#organization",
      name: "KVai Solutions",
      url: "https://www.kvai.in",
    },
  ],
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
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <SessionProvider>
            {children}
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
