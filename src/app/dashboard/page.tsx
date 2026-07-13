"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, Trash2, LogOut, ExternalLink, Loader2, BarChart3, User, 
  Calendar, ClipboardList, Plus, Briefcase
} from "lucide-react";
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

  // Job Application Tracker States
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [applications, setApplications] = useState<any[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [notes, setNotes] = useState("");
  const [appStatus, setAppStatus] = useState("APPLIED");
  const [showAddApp, setShowAddApp] = useState(false);
  const [savingApp, setSavingApp] = useState(false);

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

  const fetchApplications = useCallback(async () => {
    try {
      const res = await fetch("/api/applications");
      const data = await res.json();
      setApplications(data.applications ?? []);
    } catch {
      // ignore
    } finally {
      setLoadingApps(false);
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
      fetchApplications();
    }, 0);
    return () => clearTimeout(handle);
  }, [status, router, fetchResumes, fetchApplications]);

  const handleCreateApplication = async () => {
    if (!company || !role) {
      alert("Please enter company name and role.");
      return;
    }
    setSavingApp(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company, role, status: appStatus, notes }),
      });
      const data = await res.json();
      if (res.ok && data.application) {
        setApplications((prev) => [data.application, ...prev]);
        setCompany("");
        setRole("");
        setNotes("");
        setAppStatus("APPLIED");
        setShowAddApp(false);
      }
    } catch {
      alert("Failed to save application.");
    } finally {
      setSavingApp(false);
    }
  };

  const handleUpdateStatus = async (id: string, nextStatus: string) => {
    try {
      const res = await fetch("/api/applications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: nextStatus }),
      });
      if (res.ok) {
        setApplications((prev) =>
          prev.map((app) => (app.id === id ? { ...app, status: nextStatus } : app))
        );
      }
    } catch {
      alert("Failed to update status.");
    }
  };

  const handleDeleteApplication = async (id: string) => {
    if (!confirm("Are you sure you want to delete this job tracking record?")) return;
    try {
      const res = await fetch("/api/applications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setApplications((prev) => prev.filter((app) => app.id !== id));
      }
    } catch {
      alert("Failed to delete record.");
    }
  };

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
    <div className="flex min-h-screen flex-col bg-[#070a13] text-slate-100">
      <Navbar />
      <main className="flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-10">
          
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/60 pb-6">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white">Career Dashboard</h1>
              <p className="mt-1 text-sm text-slate-400">
                Welcome back{session?.user?.name ? `, ${session.user.name}` : ""} · Manage your career progression.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button asChild variant="gradient" size="sm">
                <Link href="/analyze"><BarChart3 className="size-4 mr-2" /> New analysis</Link>
              </Button>
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white" onClick={() => signOut({ callbackUrl: "/" })}>
                <LogOut className="size-4 mr-2" /> Sign out
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-4">
            <Card className="p-5 bg-[#0e1322]/80 border-slate-800/80 hover:border-primary/30 transition-all">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                  <FileText className="size-5" />
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-white">{resumes.length}</div>
                  <div className="text-xs text-slate-400 font-medium">Saved analyses</div>
                </div>
              </div>
            </Card>
            
            <Card className="p-5 bg-[#0e1322]/80 border-slate-800/80 hover:border-emerald-500/30 transition-all">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-lg bg-emerald-500/10 text-emerald-400">
                  <BarChart3 className="size-5" />
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-white">
                    {resumes.length > 0
                      ? Math.round(resumes.reduce((a, r) => a + r.overallScore, 0) / resumes.length)
                      : "—"}
                  </div>
                  <div className="text-xs text-slate-400 font-medium">Avg score</div>
                </div>
              </div>
            </Card>

            <Card className="p-5 bg-[#0e1322]/80 border-slate-800/80 hover:border-indigo-500/30 transition-all">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Briefcase className="size-5" />
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-white">{applications.length}</div>
                  <div className="text-xs text-slate-400 font-medium">Applications</div>
                </div>
              </div>
            </Card>

            <Card className="p-5 bg-[#0e1322]/80 border-slate-800/80 hover:border-violet-500/30 transition-all">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-lg bg-violet-500/10 text-violet-400">
                  <User className="size-5" />
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-white truncate max-w-[120px]">
                    {session?.user?.name || session?.user?.email?.split("@")[0] || "User"}
                  </div>
                  <div className="text-xs text-slate-400 font-medium">Account profile</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Saved analyses */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="size-5 text-indigo-500" />
              Saved Resume Reports
            </h2>
            
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="size-6 animate-spin text-indigo-500" />
              </div>
            ) : resumes.length === 0 ? (
              <Card className="p-12 text-center bg-[#0e1322]/40 border-slate-800 border-dashed">
                <FileText className="mx-auto size-12 text-slate-600" />
                <h3 className="mt-4 font-bold text-white">No saved analyses yet</h3>
                <p className="mt-1 text-xs text-slate-400">
                  Analyze your resume and sign in to save your results here.
                </p>
                <Button asChild variant="gradient" className="mt-6">
                  <Link href="/analyze">Analyze your resume</Link>
                </Button>
              </Card>
            ) : (
              <div className="space-y-3">
                {resumes.map((resume) => (
                  <Card key={resume.id} className="flex items-center gap-4 p-4 bg-[#0e1322]/50 border-slate-800 hover:border-primary/40 transition-all">
                    <div className="flex min-w-0 flex-1 items-center gap-4">
                      <div className="grid size-12 shrink-0 place-items-center rounded-lg bg-[#141b2f] text-primary">
                        <FileText className="size-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-semibold text-sm text-slate-200">
                            {resume.candidateName || resume.fileName || "Untitled"}
                          </span>
                          <Badge variant={resume.overallScore >= 70 ? "success" : resume.overallScore >= 50 ? "warning" : "destructive"} className="text-[10px] px-1.5 py-0.5">
                            {resume.grade}
                          </Badge>
                        </div>
                        <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
                          <span>Score: {resume.overallScore}/100</span>
                          {resume.bestFitRole && <span>· {resume.bestFitRole}</span>}
                          <span>· {new Date(resume.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Button asChild variant="ghost" size="sm" className="hover:bg-slate-800">
                        <Link href={`/dashboard/${resume.id}`}>
                          <ExternalLink className="size-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(resume.id)}
                        disabled={deleting === resume.id}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
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

          {/* Job Application Tracker */}
          <div className="border-t border-slate-800/80 pt-10 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Briefcase className="size-5 text-indigo-500" />
                  One-click Apply Tracker
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Track your job applications, interview timelines, and hiring statuses in one central portal.
                </p>
              </div>
              <Button onClick={() => setShowAddApp(!showAddApp)} variant="outline" size="sm" className="border-slate-800 text-slate-300 hover:bg-slate-900">
                <Plus className="size-4 mr-1.5" /> {showAddApp ? "Close form" : "Add Application"}
              </Button>
            </div>

            {showAddApp && (
              <Card className="p-5 border border-indigo-500/20 bg-[#0e1322]/80 space-y-4 animate-in slide-in-from-top-4 duration-200">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Company Name</label>
                    <input
                      className="w-full rounded-lg border border-slate-800 bg-[#0c101d] px-3 py-2 text-xs text-slate-100 placeholder-slate-500 shadow-inner transition-all focus:border-indigo-500 focus:bg-[#0f1526] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="e.g. Google"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Target Role</label>
                    <input
                      className="w-full rounded-lg border border-slate-800 bg-[#0c101d] px-3 py-2 text-xs text-slate-100 placeholder-slate-500 shadow-inner transition-all focus:border-indigo-500 focus:bg-[#0f1526] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="e.g. Backend Engineer"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Status</label>
                    <select
                      className="w-full rounded-lg border border-slate-800 bg-[#0c101d] px-3 py-2 text-xs text-slate-100 shadow-inner transition-all focus:border-indigo-500 focus:bg-[#0f1526] focus:outline-none"
                      value={appStatus}
                      onChange={(e) => setAppStatus(e.target.value)}
                    >
                      <option value="APPLIED">Applied</option>
                      <option value="INTERVIEWING">Interviewing</option>
                      <option value="OFFERED">Offered</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Notes / Details (Optional)</label>
                  <textarea
                    className="w-full min-h-[60px] rounded-lg border border-slate-800 bg-[#0c101d] p-3 text-xs text-slate-100 placeholder-slate-500 shadow-inner transition-all focus:border-indigo-500 focus:bg-[#0f1526] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="e.g. Recruiter contacted via LinkedIn, Round 1 scheduled on Friday..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" className="hover:bg-slate-800 text-slate-300" onClick={() => setShowAddApp(false)}>
                    Cancel
                  </Button>
                  <Button variant="gradient" size="sm" onClick={handleCreateApplication} disabled={savingApp}>
                    {savingApp ? "Saving..." : "Add to Tracker"}
                  </Button>
                </div>
              </Card>
            )}

            {loadingApps ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="size-6 animate-spin text-indigo-500" />
              </div>
            ) : applications.length === 0 ? (
              <Card className="p-8 text-center text-slate-500 border border-dashed border-slate-800 bg-[#0e1322]/20">
                <ClipboardList className="mx-auto size-10 text-slate-700" />
                <p className="text-sm mt-3">No jobs tracked yet. Start organizing your applications!</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {applications.map((app) => {
                  const companyInitial = app.company ? app.company.charAt(0).toUpperCase() : "?";
                  
                  return (
                    <Card key={app.id} className="p-4 flex items-center justify-between gap-4 bg-[#0e1322]/50 border-slate-800 hover:border-indigo-500/20 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="grid size-10 place-items-center rounded-lg bg-indigo-500/10 text-indigo-400 font-extrabold text-sm shrink-0 border border-indigo-500/10">
                          {companyInitial}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-slate-200">{app.company}</span>
                            <span className="text-xs text-slate-400 font-medium">— {app.role}</span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
                            <span className="flex items-center gap-1"><Calendar className="size-3" /> {new Date(app.date).toLocaleDateString()}</span>
                            {app.notes && <span className="truncate max-w-[200px] sm:max-w-[400px]">· {app.notes}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <select
                          className="rounded-lg border border-slate-800 bg-[#0c101d] px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                          value={app.status}
                          onChange={(e) => handleUpdateStatus(app.id, e.target.value)}
                        >
                          <option value="APPLIED">Applied</option>
                          <option value="INTERVIEWING">Interviewing</option>
                          <option value="OFFERED">Offered</option>
                          <option value="REJECTED">Rejected</option>
                        </select>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 p-2"
                          onClick={() => handleDeleteApplication(app.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}