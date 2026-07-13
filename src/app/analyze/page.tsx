"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { UploadZone } from "@/components/result/upload-zone";
import { Dashboard } from "@/components/result/dashboard";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import type { AnalysisResult } from "@/lib/engine";

// Helper to format builder resume JSON into single plain-text string for AI analysis
function convertBuilderResumeToText(r: any): string {
  const parts: string[] = [];
  if (r.contact?.fullName) parts.push(`Name: ${r.contact.fullName}`);
  if (r.contact?.email) parts.push(`Email: ${r.contact.email}`);
  if (r.contact?.phone) parts.push(`Phone: ${r.contact.phone}`);
  if (r.contact?.location) parts.push(`Location: ${r.contact.location}`);
  if (r.contact?.website) parts.push(`Website: ${r.contact.website}`);
  if (r.summary) parts.push(`Professional Summary:\n${r.summary}`);
  
  if (r.experience && r.experience.length > 0) {
    parts.push("Work Experience:");
    r.experience.forEach((exp: any) => {
      parts.push(`- Role: ${exp.role}\n  Company: ${exp.company}\n  Duration: ${exp.duration}\n  Description: ${exp.description}`);
    });
  }
  if (r.education && r.education.length > 0) {
    parts.push("Education:");
    r.education.forEach((edu: any) => {
      parts.push(`- Degree: ${edu.degree}\n  School: ${edu.school}\n  Duration: ${edu.duration}`);
    });
  }
  if (r.skills && r.skills.length > 0) {
    parts.push(`Skills: ${r.skills.join(", ")}`);
  }
  if (r.projects && r.projects.length > 0) {
    parts.push("Projects:");
    r.projects.forEach((proj: any) => {
      parts.push(`- Project: ${proj.name}\n  Link: ${proj.link || "N/A"}\n  Description: ${proj.description}`);
    });
  }
  if (r.certifications && r.certifications.length > 0) {
    parts.push(`Certifications: ${r.certifications.join(", ")}`);
  }
  if (r.languages && r.languages.length > 0) {
    parts.push(`Languages: ${r.languages.join(", ")}`);
  }
  return parts.join("\n\n");
}

export default function AnalyzePage() {
  const { data: session, status } = useSession();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const analyze = useCallback(async (payload: { file?: File; text?: string }) => {
    setLoading(true);
    setError(null);
    try {
      let res: Response;
      if (payload.file) {
        const fd = new FormData();
        fd.append("file", payload.file);
        res = await fetch("/api/analyze", { method: "POST", body: fd });
      } else {
        res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: payload.text }),
        });
      }
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Try another file.");
        return;
      }
      setResult(data);
      try {
        localStorage.setItem("resume_iq_latest_analysis", JSON.stringify(data));
        localStorage.setItem("resume_iq_latest_analysis_name", payload.file ? payload.file.name : "pasted.txt");
      } catch {
        // ignore
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Automatic Loading Logic on Mount
  useEffect(() => {
    if (status !== "authenticated") return;

    async function loadSavedOrBuilderResume() {
      setLoadingInitial(true);
      try {
        // 0. Sync unsynced guest analysis to user account first
        const localResultStr = localStorage.getItem("resume_iq_latest_analysis");
        const localName = localStorage.getItem("resume_iq_latest_analysis_name") || "pasted.txt";
        if (localResultStr) {
          try {
            const localResult = JSON.parse(localResultStr);
            const saveRes = await fetch("/api/resumes", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ result: localResult, fileName: localName }),
            });
            if (saveRes.ok) {
              localStorage.removeItem("resume_iq_latest_analysis");
              localStorage.removeItem("resume_iq_latest_analysis_name");
              setResult(localResult);
              setNotice("Saved your latest resume analysis to your profile.");
              return;
            }
          } catch (e) {
            console.error("Failed to sync guest analysis:", e);
          }
        }

        const params = new URLSearchParams(window.location.search);
        const sourceParam = params.get("source");

        // 1. If source parameter is NOT explicitly "builder", look up previous analysed scorecards first
        if (sourceParam !== "builder") {
          const resumesRes = await fetch("/api/resumes");
          if (resumesRes.ok) {
            const resumesData = await resumesRes.json();
            const savedList = resumesData.resumes ?? [];
            if (savedList.length > 0) {
              // Fetch full analysis for latest scorecard
              const latestId = savedList[0].id;
              const detailRes = await fetch(`/api/resumes/${latestId}`);
              if (detailRes.ok) {
                const detailData = await detailRes.json();
                if (detailData.resume?.analysis) {
                  setResult(detailData.resume.analysis);
                  setNotice("Loaded your latest analyzed resume report.");
                  return;
                }
              }
            }
          }
        }

        // 2. If no previous scorecard or sourceParam is "builder", fetch builder resume
        const builderRes = await fetch("/api/builder");
        if (builderRes.ok) {
          const builderData = await builderRes.json();
          const resume = builderData.resume;
          if (resume && (resume.contact?.fullName || resume.summary || resume.experience?.length > 0)) {
            setNotice("Auto-analyzing your active builder resume...");
            const plainText = convertBuilderResumeToText(resume);
            await analyze({ text: plainText });
          }
        }
      } catch (err) {
        console.error("Auto load error:", err);
      } finally {
        setLoadingInitial(false);
      }
    }

    loadSavedOrBuilderResume();
  }, [status, analyze]);

  const handleReset = () => {
    setResult(null);
    setError(null);
    setNotice(null);
    // Clear search parameters
    if (typeof window !== "undefined") {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 px-4 py-10 sm:px-6 lg:px-8 bg-background text-foreground">
        <AnimatePresence mode="wait">
          {loadingInitial ? (
            <motion.div 
              key="initial-loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 gap-4"
            >
              <Loader2 className="size-10 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground animate-pulse">
                Fetching your resume information...
              </p>
            </motion.div>
          ) : !result ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mx-auto max-w-3xl pt-6 sm:pt-12"
            >
              <div className="mb-8 text-center">
                <Badge variant="outline" className="mb-4 gap-1.5 border-border">
                  <Sparkles className="size-3.5 text-primary animate-pulse" /> Free · AI Recruiter Analysis
                </Badge>
                <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Analyze your resume</h1>
                <p className="mt-3 text-muted-foreground text-sm">
                  Upload a PDF or DOCX and get a recruiter-grade breakdown in seconds. Every score is explained with evidence.
                </p>
              </div>
              <UploadZone onAnalyze={analyze} loading={loading} error={error} />
            </motion.div>
          ) : (
            <motion.div key="result" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {notice && (
                <div className="max-w-5xl mx-auto flex items-center justify-between bg-primary/10 border border-primary/20 rounded-lg p-3 text-xs text-foreground">
                  <span className="font-medium flex items-center gap-1.5">
                    <Sparkles className="size-4 text-indigo-500" />
                    {notice}
                  </span>
                  <button 
                    onClick={handleReset}
                    className="flex items-center gap-1 font-bold text-indigo-500 hover:text-indigo-600 transition-colors uppercase tracking-wider text-[10px]"
                  >
                    <RefreshCw className="size-3" />
                    Analyze Different Resume
                  </button>
                </div>
              )}
              <Dashboard result={result} onReset={handleReset} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}
