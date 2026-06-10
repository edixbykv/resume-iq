"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { UploadZone } from "@/components/result/upload-zone";
import { Dashboard } from "@/components/result/dashboard";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import type { AnalysisResult } from "@/lib/engine";

export default function AnalyzePage() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function analyze(payload: { file?: File; text?: string }) {
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
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mx-auto max-w-3xl pt-6 sm:pt-12"
            >
              <div className="mb-8 text-center">
                <Badge variant="outline" className="mb-4 gap-1.5">
                  <Sparkles className="size-3.5 text-primary" /> Free · No sign-up
                </Badge>
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Analyze your resume</h1>
                <p className="mt-3 text-muted-foreground">
                  Upload a PDF or DOCX and get a recruiter-grade breakdown in seconds. Every score is explained with evidence.
                </p>
              </div>
              <UploadZone onAnalyze={analyze} loading={loading} error={error} />
            </motion.div>
          ) : (
            <motion.div key="result" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <Dashboard result={result} onReset={() => { setResult(null); setError(null); }} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}
