"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { Button } from "@/components/ui/button";
import { Dashboard } from "@/components/result/dashboard";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { AnalysisResult } from "@/lib/engine";

export default function ResumeDetailPage() {
  const { status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResume = useCallback(async () => {
    try {
      const res = await fetch(`/api/resumes/${params.id}`);
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to load resume.");
        return;
      }
      const data = await res.json();
      setResult(data.analysis as AnalysisResult);
    } catch {
      setError("Failed to load resume.");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
      return;
    }
    if (status !== "authenticated" || !params.id) return;

    const handle = setTimeout(() => {
      fetchResume();
    }, 0);
    return () => clearTimeout(handle);
  }, [status, params.id, router, fetchResume]);

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex flex-1 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <p className="text-destructive">{error}</p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/dashboard">Back to dashboard</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <Button asChild variant="ghost" size="sm" className="mb-6">
            <Link href="/dashboard"><ArrowLeft className="size-4" /> Back to dashboard</Link>
          </Button>
          <Dashboard result={result} onReset={() => router.push("/dashboard")} />
        </div>
      </main>
      <Footer />
    </div>
  );
}