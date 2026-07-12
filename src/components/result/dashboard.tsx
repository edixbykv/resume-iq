"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Download, RefreshCw, CheckCircle2, AlertTriangle, XCircle, Target, Loader2,
  Sparkles, FileText, IndianRupee, Globe2, Award, ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/misc";
import { ScoreRing } from "./score-ring";
import { SubScoreCard } from "./sub-score-card";
import { WebTools } from "./web-tools";
import { ReportPrint } from "./report-print";
import { scoreIndicatorClass, scoreColor } from "@/lib/score-color";
import { cn } from "@/lib/utils";
import { ROLE_OPTIONS } from "@/lib/roles";
import type { AnalysisResult, JdMatchResult, RecruiterSimulation, SkillGapResult } from "@/lib/engine";

const inr = (n: number) =>
  n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${(n / 1000).toFixed(0)}K`;
const usd = (n: number) => `$${Math.round(n / 83 / 1000)}K`;

function Stat({ label, value, score }: { label: string; value: string | number; score?: number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={cn("mt-1 text-xl font-bold", score !== undefined && scoreColor(score).text)}>{value}</div>
    </div>
  );
}

function Bar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold tabular-nums">{value}%</span>
      </div>
      <Progress value={value} indicatorClassName={scoreIndicatorClass(value)} />
    </div>
  );
}

const decisionMeta = {
  YES: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10", label: "Would Shortlist" },
  MAYBE: { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10", label: "Borderline" },
  NO: { icon: XCircle, color: "text-rose-500", bg: "bg-rose-500/10", label: "Would Pass" },
};

export function Dashboard({ result, onReset }: { result: AnalysisResult; onReset: () => void }) {
  const { fields, subScores, ats, recruiter: baseRecruiter, careerPath, salary, benchmark, healthDashboard, aiInsights } = result;

  const [jd, setJd] = useState("");
  const [jdLoading, setJdLoading] = useState(false);
  const [jdResult, setJdResult] = useState<JdMatchResult | null>(null);
  const [recruiter, setRecruiter] = useState<RecruiterSimulation>(baseRecruiter);

  const [role, setRole] = useState(careerPath.bestFitRole);
  const [gap, setGap] = useState<SkillGapResult | null>(null);
  const [gapLoading, setGapLoading] = useState(false);

  async function runJd() {
    if (jd.trim().length < 30) return;
    setJdLoading(true);
    try {
      const res = await fetch("/api/jd-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields, subScores, overallScore: result.overallScore, jd }),
      });
      const data = await res.json();
      if (data.match) {
        setJdResult(data.match);
        if (data.recruiter) setRecruiter(data.recruiter);
      }
    } finally {
      setJdLoading(false);
    }
  }

  async function runGap(targetRole: string) {
    setRole(targetRole);
    setGapLoading(true);
    try {
      const res = await fetch("/api/skill-gap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields, targetRole }),
      });
      setGap(await res.json());
    } finally {
      setGapLoading(false);
    }
  }

  const dm = decisionMeta[recruiter.decision];

  return (
    <div className="mx-auto max-w-6xl">
      <ReportPrint result={result} recruiter={recruiter} jd={jdResult} gap={gap} />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="overflow-hidden">
          <div className="relative bg-gradient-to-br from-violet-600/10 via-primary/5 to-indigo-600/10 p-6 sm:p-8">
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col items-center gap-5 sm:flex-row sm:text-left">
                <ScoreRing score={result.overallScore} showGrade={result.grade} label="Overall" />
                <div className="text-center sm:text-left">
                  <h1 className="text-2xl font-bold">{fields.name ?? "Your Resume"}</h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {careerPath.bestFitRole} · {fields.experienceYears || "<1"} yrs · {benchmark.level}
                  </p>
                  <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                    <Badge variant="secondary">{fields.skills.length} skills</Badge>
                    <Badge variant="secondary">{fields.degree.label}</Badge>
                    <Badge variant={ats.score >= 75 ? "success" : "warning"}>ATS {ats.score}</Badge>
                    <Badge variant="default">{benchmark.statement}</Badge>
                  </div>
                </div>
              </div>
              <div className="flex w-full gap-2 sm:w-auto sm:flex-col">
                <Button variant="gradient" className="flex-1" onClick={() => window.print()}>
                  <Download className="size-4" /> Download report
                </Button>
                <Button variant="outline" className="flex-1" onClick={onReset}>
                  <RefreshCw className="size-4" /> New resume
                </Button>
              </div>
            </div>

            {/* Recruiter verdict strip */}
            <div className={cn("mt-6 flex flex-col items-start gap-3 rounded-xl p-4 sm:flex-row sm:items-center sm:justify-between", dm.bg)}>
              <div className="flex items-center gap-3">
                <dm.icon className={cn("size-7", dm.color)} />
                <div>
                  <div className={cn("font-bold", dm.color)}>Recruiter verdict: {dm.label}</div>
                  <div className="text-xs text-muted-foreground">{recruiter.verdict}</div>
                </div>
              </div>
              <div className="flex gap-4 text-center text-xs">
                <div><div className="text-lg font-bold">{recruiter.interviewProbability}%</div><div className="text-muted-foreground">Interview</div></div>
                <div><div className="text-lg font-bold">{recruiter.recruiterConfidence}%</div><div className="text-muted-foreground">Confidence</div></div>
                <div><div className="text-lg font-bold">{recruiter.timeToHireDays}d</div><div className="text-muted-foreground">Time-to-hire</div></div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="mt-6">
        <div className="no-print -mx-4 overflow-x-auto px-4 pb-1">
          <TabsList className="w-max">
            {[
              ["overview", "Overview"], ["ats", "ATS"], ["match", "Job Match"],
              ["recruiter", "Recruiter"], ["rewrite", "AI Rewrite"], ["career", "Career & Salary"],
              ["skills", "Skill Gap"], ["interview", "Interview"], ["web", "GitHub & Web"],
            ].map(([v, l]) => (
              <TabsTrigger key={v} value={v}>{l}</TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* OVERVIEW */}
        <TabsContent value="overview">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Object.values(subScores).map((d, i) => (
              <SubScoreCard key={d.key} detail={d} index={i} />
            ))}
          </div>

          <h3 className="mb-3 mt-8 text-lg font-semibold">Resume Health Dashboard</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Career Health" value={healthDashboard.careerHealth} score={healthDashboard.careerHealth} />
            <Stat label="Market Readiness" value={healthDashboard.marketReadiness} score={healthDashboard.marketReadiness} />
            <Stat label="Employability" value={healthDashboard.employability} score={healthDashboard.employability} />
            <Stat label="Growth Potential" value={healthDashboard.growthPotential} score={healthDashboard.growthPotential} />
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <Card><CardHeader><CardTitle className="text-base text-emerald-500">Strength Areas</CardTitle></CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {healthDashboard.strengths.length ? healthDashboard.strengths.map((s) => <Badge key={s} variant="success">{s}</Badge>) : <p className="text-sm text-muted-foreground">Keep improving to unlock strengths.</p>}
              </CardContent>
            </Card>
            <Card><CardHeader><CardTitle className="text-base text-amber-500">Focus Areas</CardTitle></CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {healthDashboard.weaknesses.length ? healthDashboard.weaknesses.map((s) => <Badge key={s} variant="warning">{s}</Badge>) : <p className="text-sm text-muted-foreground">No major weaknesses detected. 🎉</p>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ATS */}
        <TabsContent value="ats">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-1">
              <CardContent className="flex flex-col items-center justify-center py-8">
                <ScoreRing score={ats.score} label="ATS Score" />
                <p className="mt-4 text-center text-sm text-muted-foreground">Parsing accuracy</p>
                <Progress value={ats.parsingAccuracy} className="mt-2 w-40" indicatorClassName={scoreIndicatorClass(ats.parsingAccuracy)} />
                <span className="mt-1 text-xs font-medium">{ats.parsingAccuracy}%</span>
              </CardContent>
            </Card>
            <div className="space-y-4 lg:col-span-2">
              <IssueList title="Missing Sections" items={ats.missingSections} tone="warning" empty="All key sections present." />
              <IssueList title="Formatting Issues" items={ats.formattingIssues} tone="warning" empty="Formatting looks clean." />
              <IssueList title="ATS Risks" items={ats.atsRisks} tone="destructive" empty="No major parsing risks." />
              <IssueList title="Recommendations" items={ats.recommendations} tone="primary" empty="" />
            </div>
          </div>
        </TabsContent>

        {/* JOB MATCH */}
        <TabsContent value="match">
          <Card>
            <CardHeader><CardTitle className="text-base">Paste a Job Description</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Textarea value={jd} onChange={(e) => setJd(e.target.value)} placeholder="Paste the full job description to see your match…" className="min-h-[140px]" />
              <Button variant="gradient" onClick={runJd} disabled={jdLoading || jd.trim().length < 30}>
                {jdLoading ? <Loader2 className="size-4 animate-spin" /> : <Target className="size-4" />} Match against this job
              </Button>
            </CardContent>
          </Card>

          {jdResult && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-4 grid gap-4 lg:grid-cols-3">
              <Card className="lg:col-span-1">
                <CardContent className="flex flex-col items-center py-8">
                  <ScoreRing score={jdResult.matchPercentage} label="Match" />
                </CardContent>
              </Card>
              <Card className="lg:col-span-2">
                <CardContent className="space-y-4 py-6">
                  <Bar label="Skills Match" value={jdResult.skillsMatch} />
                  <Bar label="Experience Match" value={jdResult.experienceMatch} />
                  <Bar label="Education Match" value={jdResult.educationMatch} />
                  <Bar label="Project Match" value={jdResult.projectMatch} />
                </CardContent>
              </Card>
              <Card className="lg:col-span-3">
                <CardContent className="grid gap-4 py-6 md:grid-cols-2">
                  <div>
                    <p className="mb-2 text-sm font-semibold text-emerald-500">Matched Skills</p>
                    <div className="flex flex-wrap gap-1.5">{jdResult.matchedSkills.map((s) => <Badge key={s} variant="success">{s}</Badge>)}</div>
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-semibold text-rose-500">Missing Skills</p>
                    <div className="flex flex-wrap gap-1.5">{jdResult.missingSkills.length ? jdResult.missingSkills.map((s) => <Badge key={s} variant="destructive">{s}</Badge>) : <span className="text-sm text-muted-foreground">None — full coverage!</span>}</div>
                  </div>
                  <IssueList title="Gap Analysis" items={jdResult.gapAnalysis} tone="primary" empty="" className="md:col-span-2" />
                </CardContent>
              </Card>
            </motion.div>
          )}
        </TabsContent>

        {/* RECRUITER */}
        <TabsContent value="recruiter">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className={cn("lg:col-span-1", dm.bg)}>
              <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                <dm.icon className={cn("size-14", dm.color)} />
                <div className={cn("mt-3 text-2xl font-bold", dm.color)}>{recruiter.decision}</div>
                <div className="text-sm text-muted-foreground">{dm.label}</div>
              </CardContent>
            </Card>
            <Card className="lg:col-span-2">
              <CardContent className="grid grid-cols-2 gap-4 py-6 sm:grid-cols-4">
                <Stat label="Hiring Prob." value={`${recruiter.hiringProbability}%`} score={recruiter.hiringProbability} />
                <Stat label="Interview Prob." value={`${recruiter.interviewProbability}%`} score={recruiter.interviewProbability} />
                <Stat label="Confidence" value={`${recruiter.recruiterConfidence}%`} score={recruiter.recruiterConfidence} />
                <Stat label="Time-to-hire" value={`${recruiter.timeToHireDays}d`} />
              </CardContent>
            </Card>
            <IssueList title="Why I'd consider them" items={recruiter.reasons} tone="success" empty="" className="lg:col-span-3 md:col-span-1" />
            {recruiter.concerns.length > 0 && (
              <IssueList title="Concerns" items={recruiter.concerns} tone="warning" empty="" className="lg:col-span-3" />
            )}
          </div>
        </TabsContent>

        {/* AI REWRITE */}
        <TabsContent value="rewrite">
          {aiInsights && (
            <div className="space-y-4">
              <Card>
                <CardHeader className="flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base"><Sparkles className="size-4 text-primary" /> Improved Summary</CardTitle>
                  {result.aiEnriched ? <Badge variant="default">AI-generated</Badge> : <Badge variant="secondary">Rule-based</Badge>}
                </CardHeader>
                <CardContent>
                  <p className="rounded-lg bg-muted/50 p-4 text-sm leading-relaxed">{aiInsights.improvedSummarySection}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2 text-base"><FileText className="size-4 text-primary" /> Bullet Rewrites — Before vs After</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {aiInsights.rewrittenBullets.map((b, i) => (
                    <div key={i} className="grid gap-2 rounded-lg border border-border p-3 sm:grid-cols-2">
                      <div className="rounded-md bg-rose-500/5 p-2.5 text-sm">
                        <span className="mb-1 block text-xs font-semibold text-rose-500">Before</span>
                        <span className="text-muted-foreground line-through decoration-rose-500/30">{b.before}</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-md bg-emerald-500/5 p-2.5 text-sm">
                        <ArrowRight className="hidden size-4 shrink-0 text-emerald-500 sm:block" />
                        <div><span className="mb-1 block text-xs font-semibold text-emerald-500">After</span>{b.after}</div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="grid gap-4 md:grid-cols-2">
                <IssueList title="Top Strengths" items={aiInsights.topStrengths} tone="success" empty="" />
                <IssueList title="Red Flags" items={aiInsights.redFlags} tone="warning" empty="" />
              </div>
            </div>
          )}
        </TabsContent>

        {/* CAREER & SALARY */}
        <TabsContent value="career">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Award className="size-4 text-primary" /> Career Roadmap</CardTitle></CardHeader>
              <CardContent>
                <div className="mb-4 flex items-center gap-2">
                  <Badge variant="default">Best fit: {careerPath.bestFitRole}</Badge>
                  <Badge variant="secondary">{careerPath.matchScore}% match</Badge>
                </div>
                <ol className="relative space-y-4 border-l border-border pl-5">
                  {careerPath.roadmap.map((r, i) => (
                    <li key={i} className="relative">
                      <span className="absolute -left-[27px] grid size-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">{i + 1}</span>
                      <p className="text-sm font-medium">{r.stage}</p>
                      <p className="text-xs text-muted-foreground">{r.description}</p>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2 text-base"><IndianRupee className="size-4 text-primary" /> Salary Intelligence</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <SalaryRow label="India" min={inr(salary.india.min)} max={inr(salary.india.max)} />
                  <SalaryRow label="Remote" min={inr(salary.remote.min)} max={inr(salary.remote.max)} />
                  <SalaryRow label="Global" min={usd(salary.global.min)} max={usd(salary.global.max)} />
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {salary.basis.map((b) => <Badge key={b} variant="outline" className="text-[11px]">{b}</Badge>)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Globe2 className="size-4 text-primary" /> Industry Benchmark</CardTitle></CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">{benchmark.percentile}<span className="text-base text-muted-foreground">th percentile</span></div>
                  <p className="mt-1 text-sm text-muted-foreground">{benchmark.statement}</p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {careerPath.suggestedRoles.map((r) => (
                      <div key={r.role} className="rounded-lg border border-border p-2.5">
                        <div className="text-xs font-medium">{r.role}</div>
                        <Progress value={r.fit} className="mt-1.5 h-1.5" indicatorClassName={scoreIndicatorClass(r.fit)} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* SKILL GAP */}
        <TabsContent value="skills">
          <Card>
            <CardHeader><CardTitle className="text-base">Target a Role</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {ROLE_OPTIONS.map((r) => (
                  <Button key={r} size="sm" variant={role === r ? "gradient" : "outline"} onClick={() => runGap(r)} disabled={gapLoading}>
                    {gapLoading && role === r ? <Loader2 className="size-3.5 animate-spin" /> : null}{r}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {gap && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="text-xs text-muted-foreground">Coverage for {gap.targetRole}</div>
                  <div className="mt-1 text-2xl font-bold text-primary">{gap.coverage}%</div>
                  <Progress value={gap.coverage} className="mt-2" indicatorClassName={scoreIndicatorClass(gap.coverage)} />
                </div>
                <div className="rounded-xl border border-border bg-card p-4 sm:col-span-2">
                  <div className="mb-2 text-xs font-semibold text-emerald-500">You already have</div>
                  <div className="flex flex-wrap gap-1.5">{gap.currentSkills.map((s) => <Badge key={s} variant="success">{s}</Badge>)}</div>
                  <div className="mb-2 mt-3 text-xs font-semibold text-rose-500">Missing</div>
                  <div className="flex flex-wrap gap-1.5">{gap.missingSkills.length ? gap.missingSkills.map((s) => <Badge key={s} variant="destructive">{s}</Badge>) : <span className="text-sm text-muted-foreground">All core skills covered!</span>}</div>
                </div>
              </div>

              <Card>
                <CardHeader><CardTitle className="text-base">90-Day Upskilling Plan</CardTitle></CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-3">
                  {gap.plan.map((p, i) => (
                    <div key={i} className="rounded-xl border border-border p-4">
                      <Badge variant="default" className="mb-2">{p.phase}</Badge>
                      <p className="text-sm text-muted-foreground">{p.focus}</p>
                      <div className="my-2 flex flex-wrap gap-1.5">{p.skills.map((s) => <Badge key={s} variant="secondary">{s}</Badge>)}</div>
                      <p className="text-xs text-primary">🎯 {p.outcome}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </TabsContent>

        {/* INTERVIEW */}
        <TabsContent value="interview">
          {aiInsights && (
            <div className="grid gap-4 md:grid-cols-3">
              <QuestionCard title="Technical" items={aiInsights.interviewQuestions.technical} />
              <QuestionCard title="Behavioral" items={aiInsights.interviewQuestions.behavioral} />
              <QuestionCard title="Project" items={aiInsights.interviewQuestions.project} />
            </div>
          )}
        </TabsContent>

        {/* WEB / GITHUB / LINKEDIN / PORTFOLIO / BRAND */}
        <TabsContent value="web">
          <WebTools resumeScore={result.overallScore} githubUrl={fields.github} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function IssueList({ title, items, tone, empty, className }: { title: string; items: string[]; tone: "warning" | "destructive" | "primary" | "success"; empty: string; className?: string }) {
  const toneColor = { warning: "text-amber-500", destructive: "text-rose-500", primary: "text-primary", success: "text-emerald-500" }[tone];
  const Icon = { warning: AlertTriangle, destructive: XCircle, primary: Target, success: CheckCircle2 }[tone];
  if (items.length === 0 && !empty) return null;
  return (
    <Card className={className}>
      <CardHeader><CardTitle className={cn("text-base", toneColor)}>{title}</CardTitle></CardHeader>
      <CardContent>
        {items.length ? (
          <ul className="space-y-2">
            {items.map((it, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <Icon className={cn("mt-0.5 size-4 shrink-0", toneColor)} /> <span className="text-muted-foreground">{it}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="flex items-center gap-2 text-sm text-emerald-500"><CheckCircle2 className="size-4" /> {empty}</p>
        )}
      </CardContent>
    </Card>
  );
}

function SalaryRow({ label, min, max }: { label: string; min: string; max: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border p-3">
      <span className="text-sm font-medium">{label}</span>
      <span className="font-semibold text-primary">{min} – {max}</span>
    </div>
  );
}

function QuestionCard({ title, items }: { title: string; items: string[] }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">{title} Questions</CardTitle></CardHeader>
      <CardContent>
        <ol className="space-y-2.5">
          {items.map((q, i) => (
            <li key={i} className="flex gap-2 text-sm">
              <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">{i + 1}</span>
              <span className="text-muted-foreground">{q}</span>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
