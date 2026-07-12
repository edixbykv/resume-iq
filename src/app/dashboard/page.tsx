"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Trash2, LogOut, ExternalLink, Loader2, BarChart3, User } from "lucide-react";
import Link from "next/link";

interface ResumeSummary {
  id: string;
  fileName: string | null;
  candidateName: string | null;
  overallScore: number;
  grade: string;
  bestFitRole: string | null;
  createdAt: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [resumes, setResumes] = useState<ResumeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchResumes = useCallback(async () => {
    try {
      const res = await fetch("/api/resumes");
      const data = await res.json();
      setResumes(data.resumes ?? []);
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin?callbackUrl=/dashboard");
      return;
    }
    if (status !== "authenticated") return;

    const handle = setTimeout(() => {
      fetchResumes();
    }, 0);
    return () => clearTimeout(handle);
  }, [status, router, fetchResumes]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this saved analysis? This cannot be undone.")) return;
    setDeleting(id);
    try {
      await fetch("/api/resumes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setResumes((prev) => prev.filter((r) => r.id !== id));
    } catch {
      // Silently fail
    } finally {
      setDeleting(null);
    }
  }

  if (status === "loading") {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex flex-1 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </main>
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="mt-1 text-muted-foreground">
                Welcome back{session?.user?.name ? `, ${session.user.name}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button asChild variant="gradient" size="sm">
                <Link href="/analyze"><BarChart3 className="size-4" /> New analysis</Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
                <LogOut className="size-4" /> Sign out
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <Card className="p-5">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                  <FileText className="size-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{resumes.length}</div>
                  <div className="text-xs text-muted-foreground">Saved analyses</div>
                </div>
              </div>
            </Card>
            <Card className="p-5">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-lg bg-emerald-500/10 text-emerald-500">
                  <BarChart3 className="size-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {resumes.length > 0
                      ? Math.round(resumes.reduce((a, r) => a + r.overallScore, 0) / resumes.length)
                      : "—"}
                  </div>
                  <div className="text-xs text-muted-foreground">Avg score</div>
                </div>
              </div>
            </Card>
            <Card className="p-5">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-lg bg-violet-500/10 text-violet-500">
                  <User className="size-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{session?.user?.name ?? "—"}</div>
                  <div className="text-xs text-muted-foreground">Account</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Saved analyses */}
          <h2 className="mb-4 text-xl font-semibold">Saved analyses</h2>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : resumes.length === 0 ? (
            <Card className="p-12 text-center">
              <FileText className="mx-auto size-12 text-muted-foreground/40" />
              <h3 className="mt-4 font-semibold">No saved analyses yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Analyze your resume and sign in to save your results here.
              </p>
              <Button asChild variant="gradient" className="mt-6">
                <Link href="/analyze">Analyze your resume</Link>
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {resumes.map((resume) => (
                <Card key={resume.id} className="flex items-center gap-4 p-4 transition-colors hover:border-primary/30">
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    <div className="grid size-12 shrink-0 place-items-center rounded-lg bg-primary/10">
                      <FileText className="size-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium">
                          {resume.candidateName || resume.fileName || "Untitled"}
                        </span>
                        <Badge variant={resume.overallScore >= 70 ? "success" : resume.overallScore >= 50 ? "warning" : "destructive"}>
                          {resume.grade}
                        </Badge>
                      </div>
                      <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                        <span>Score: {resume.overallScore}/100</span>
                        {resume.bestFitRole && <span>· {resume.bestFitRole}</span>}
                        <span>· {new Date(resume.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/dashboard/${resume.id}`}>
                        <ExternalLink className="size-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(resume.id)}
                      disabled={deleting === resume.id}
                      className="text-destructive hover:text-destructive"
                    >
                      {deleting === resume.id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Trash2 className="size-4" />
                      )}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}