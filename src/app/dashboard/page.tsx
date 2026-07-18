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

  // Resume Builder States
  const [builderResume, setBuilderResume] = useState<any | null>(null);
  const [loadingBuilder, setLoadingBuilder] = useState(true);

  const fetchBuilderResume = useCallback(async () => {
    try {
      const res = await fetch("/api/builder");
      const data = await res.json();
      setBuilderResume(data.resume ?? null);
    } catch {
      // ignore
    } finally {
      setLoadingBuilder(false);
    }
  }, []);

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
      fetchBuilderResume();
    }, 0);
    return () => clearTimeout(handle);
  }, [status, router, fetchResumes, fetchApplications, fetchBuilderResume]);

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

  const hasBuilderContent = builderResume && (
    builderResume.contact?.fullName?.trim() ||
    builderResume.summary?.trim() ||
    (builderResume.experience && builderResume.experience.some((exp: any) => exp.role?.trim() || exp.company?.trim())) ||
    (builderResume.skills && builderResume.skills.length > 0)
  );

  const builderCard = !hasBuilderContent ? (
    <Card className="p-6 bg-card border border-border border-dashed flex flex-col items-center justify-center text-center">
      <p className="text-sm text-muted-foreground mb-4">
        You haven't built a resume using the Interactive Builder yet.
      </p>
      <Button asChild variant="gradient" size="sm">
        <Link href="/builder">Create New Resume</Link>
      </Button>
    </Card>
  ) : (
    <Card className="p-5 bg-card border border-border hover:border-primary/20 transition-all shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center gap-4 min-w-0">
        <div className="grid size-12 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary border border-primary/10">
          <FileText className="size-6" />
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-sm text-foreground truncate">
            {builderResume.title || "Untitled Resume"}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 truncate">
            Candidate: {builderResume.contact?.fullName || "Not Specified"} · Role: {builderResume.metadata?.targetRole || builderResume.title || "Not Specified"}
          </p>
          {builderResume.metadata?.updatedAt && (
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Last updated: {new Date(builderResume.metadata.updatedAt).toLocaleString()}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <Button asChild variant="outline" size="sm">
          <Link href="/builder">Edit Resume</Link>
        </Button>
        <Button asChild variant="gradient" size="sm">
          <Link href="/analyze?source=builder">Analyze & Score</Link>
        </Button>
      </div>
    </Card>
  );

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-10">
          
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-6">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Career Dashboard</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Welcome back{session?.user?.name ? `, ${session.user.name}` : ""} · Manage your career progression.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button asChild variant="gradient" size="sm">
                <Link href="/analyze"><BarChart3 className="size-4 mr-2" /> New analysis</Link>
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" onClick={() => signOut({ callbackUrl: "/" })}>
                <LogOut className="size-4 mr-2" /> Sign out
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-4">
            <Card className="p-5 bg-card border border-border hover:border-primary/20 transition-all shadow-sm">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                  <FileText className="size-5" />
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-foreground">{resumes.length}</div>
                  <div className="text-xs text-muted-foreground font-medium">Saved analyses</div>
                </div>
              </div>
            </Card>
            
            <Card className="p-5 bg-card border border-border hover:border-emerald-500/20 transition-all shadow-sm">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-lg bg-emerald-500/10 text-emerald-500">
                  <BarChart3 className="size-5" />
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-foreground">
                    {resumes.length > 0
                      ? Math.round(resumes.reduce((a, r) => a + r.overallScore, 0) / resumes.length)
                      : "—"}
                  </div>
                  <div className="text-xs text-muted-foreground font-medium">Avg score</div>
                </div>
              </div>
            </Card>

            <Card className="p-5 bg-card border border-border hover:border-primary/20 transition-all shadow-sm">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Briefcase className="size-5" />
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-foreground">{applications.length}</div>
                  <div className="text-xs text-muted-foreground font-medium">Applications</div>
                </div>
              </div>
            </Card>

            <Card className="p-5 bg-card border border-border hover:border-accent/20 transition-all shadow-sm">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-lg bg-accent/10 text-accent">
                  <User className="size-5" />
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-foreground truncate max-w-[120px]">
                    {session?.user?.name || session?.user?.email?.split("@")[0] || "User"}
                  </div>
                  <div className="text-xs text-muted-foreground font-medium">Account profile</div>
                </div>
              </div>
            </Card>
          </div>          {/* Resume Builder Document Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Plus className="size-5 text-primary" />
              My Builder Resume
            </h2>
            {loadingBuilder ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="size-6 animate-spin text-primary" />
              </div>
            ) : (
              builderCard
            )}
          </div>

          {/* Saved analyses */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <FileText className="size-5 text-primary" />
              Saved Resume Reports
            </h2>
            
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="size-6 animate-spin text-primary" />
              </div>
            ) : resumes.length === 0 ? (
              <Card className="p-12 text-center bg-card border border-border border-dashed">
                <FileText className="mx-auto size-12 text-muted-foreground" />
                <h3 className="mt-4 font-bold text-foreground">No saved analyses yet</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Analyze your resume and sign in to save your results here.
                </p>
                <Button asChild variant="gradient" className="mt-6">
                  <Link href="/analyze">Analyze your resume</Link>
                </Button>
              </Card>
            ) : (
              <div className="space-y-3">
                {resumes.map((resume) => (
                  <Card key={resume.id} className="flex items-center gap-4 p-4 bg-card border border-border hover:border-primary/20 transition-all shadow-sm">
                    <div className="flex min-w-0 flex-1 items-center gap-4">
                      <div className="grid size-12 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                        <FileText className="size-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-semibold text-sm text-foreground">
                            {resume.candidateName || resume.fileName || "Untitled"}
                          </span>
                          <Badge variant={resume.overallScore >= 70 ? "success" : resume.overallScore >= 50 ? "warning" : "destructive"} className="text-[10px] px-1.5 py-0.5">
                            {resume.grade}
                          </Badge>
                        </div>
                        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                          <span>Score: {resume.overallScore}/100</span>
                          {resume.bestFitRole && <span>· {resume.bestFitRole}</span>}
                          <span>· {new Date(resume.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Button asChild variant="ghost" size="sm" className="hover:bg-accent hover:text-accent-foreground">
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
          <div className="border-t border-border pt-10 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Briefcase className="size-5 text-primary" />
                  One-click Apply Tracker
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Track your job applications, interview timelines, and hiring statuses in one central portal.
                </p>
              </div>
              <Button onClick={() => setShowAddApp(!showAddApp)} variant="outline" size="sm" className="border-input hover:bg-accent hover:text-accent-foreground">
                <Plus className="size-4 mr-1.5" /> {showAddApp ? "Close form" : "Add Application"}
              </Button>
            </div>

            {showAddApp && (
              <Card className="p-5 border border-border bg-card space-y-4 animate-in slide-in-from-top-4 duration-200 shadow-lg">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Company Name</label>
                    <input
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground placeholder-muted-foreground shadow-sm transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="e.g. Google"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Target Role</label>
                    <input
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground placeholder-muted-foreground shadow-sm transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="e.g. Backend Engineer"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Current Status</label>
                    <select
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground shadow-sm transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
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
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Notes / Details (Optional)</label>
                  <textarea
                    className="w-full min-h-[60px] rounded-lg border border-input bg-background p-3 text-xs text-foreground placeholder-muted-foreground shadow-sm transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="e.g. Recruiter contacted via LinkedIn, Round 1 scheduled on Friday..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" className="hover:bg-accent hover:text-accent-foreground text-muted-foreground" onClick={() => setShowAddApp(false)}>
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
                <Loader2 className="size-6 animate-spin text-primary" />
              </div>
            ) : applications.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground border border-dashed border-border bg-card/50">
                <ClipboardList className="mx-auto size-10 text-muted-foreground" />
                <p className="text-sm mt-3">No jobs tracked yet. Start organizing your applications!</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {applications.map((app) => {
                  const companyInitial = app.company ? app.company.charAt(0).toUpperCase() : "?";
                  
                  return (
                    <Card key={app.id} className="p-4 flex items-center justify-between gap-4 bg-card border border-border hover:border-primary/10 transition-all shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary font-extrabold text-sm shrink-0 border border-primary/10">
                          {companyInitial}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-foreground">{app.company}</span>
                            <span className="text-xs text-muted-foreground font-medium">— {app.role}</span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                            <span className="flex items-center gap-1"><Calendar className="size-3" /> {new Date(app.date).toLocaleDateString()}</span>
                            {app.notes && <span className="truncate max-w-[200px] sm:max-w-[400px]">· {app.notes}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <select
                          className="rounded-lg border border-input bg-background px-2.5 py-1 text-xs text-foreground focus:outline-none focus:border-primary"
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