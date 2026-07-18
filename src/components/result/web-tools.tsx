"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Globe, Loader2, Star, Users, BookMarked } from "lucide-react";
import { Github, Linkedin } from "@/components/site/brand-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Textarea } from "@/components/ui/misc";
import { Progress } from "@/components/ui/progress";
import { ScoreRing } from "./score-ring";
import { scoreIndicatorClass } from "@/lib/score-color";
import type { GithubReport, LinkedInReport, PortfolioReport } from "@/lib/engine";

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold">{value}%</span>
      </div>
      <Progress value={value} className="h-1.5" indicatorClassName={scoreIndicatorClass(value)} />
    </div>
  );
}

/** Compute personal brand score from whichever pillars are present (client-side). */
function brand(resume: number, gh?: number, li?: number, pf?: number) {
  const pillars = [
    { w: 0.4, s: resume },
    { w: 0.25, s: li },
    { w: 0.2, s: gh },
    { w: 0.15, s: pf },
  ].filter((p) => typeof p.s === "number") as { w: number; s: number }[];
  const tw = pillars.reduce((a, p) => a + p.w, 0) || 1;
  return Math.round(pillars.reduce((a, p) => a + p.s * p.w, 0) / tw);
}

export function WebTools({ resumeScore, githubUrl }: { resumeScore: number; githubUrl: string | null }) {
  const [gh, setGh] = useState(githubUrl ?? "");
  const [ghRes, setGhRes] = useState<GithubReport | null>(null);
  const [ghLoad, setGhLoad] = useState(false);

  const [li, setLi] = useState("");
  const [liRes, setLiRes] = useState<LinkedInReport | null>(null);
  const [liLoad, setLiLoad] = useState(false);

  const [pf, setPf] = useState("");
  const [pfRes, setPfRes] = useState<PortfolioReport | null>(null);
  const [pfLoad, setPfLoad] = useState(false);

  async function call<T>(url: string, body: object, setLoad: (b: boolean) => void, setRes: (r: T) => void) {
    setLoad(true);
    try {
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      setRes(await res.json());
    } finally {
      setLoad(false);
    }
  }

  const brandScore = brand(resumeScore, ghRes?.found ? ghRes.githubScore : undefined, liRes?.linkedinScore, pfRes?.reachable ? pfRes.portfolioScore : undefined);

  return (
    <div className="space-y-4">
      {/* Brand score */}
      <Card className="overflow-hidden">
        <div className="grid gap-4 bg-secondary/40 p-6 sm:grid-cols-[auto_1fr] sm:items-center">
          <ScoreRing score={brandScore} label="Brand Score" size={120} stroke={10} />
          <div>
            <h3 className="font-semibold">Personal Brand Score</h3>
            <p className="text-sm text-muted-foreground">A unified score across Resume, GitHub, LinkedIn & Portfolio. Analyze each below to complete it.</p>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[["Resume", resumeScore, true], ["GitHub", ghRes?.githubScore ?? 0, !!ghRes?.found], ["LinkedIn", liRes?.linkedinScore ?? 0, !!liRes], ["Portfolio", pfRes?.portfolioScore ?? 0, !!pfRes?.reachable]].map(([l, v, on]) => (
                <div key={l as string} className="rounded-lg border border-border bg-card/60 p-2 text-center">
                  <div className="text-xs text-muted-foreground">{l as string}</div>
                  <div className={`text-lg font-bold ${on ? "text-primary" : "text-muted-foreground/40"}`}>{on ? (v as number) : "—"}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* GitHub */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Github className="size-4" /> GitHub Analyzer</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input value={gh} onChange={(e) => setGh(e.target.value)} placeholder="github.com/username" />
            <Button className="w-full" variant="outline" disabled={ghLoad || !gh.trim()} onClick={() => call("/api/github", { url: gh }, setGhLoad, setGhRes)}>
              {ghLoad ? <Loader2 className="size-4 animate-spin" /> : <Github className="size-4" />} Analyze
            </Button>
            {ghRes && (ghRes.found ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 pt-1">
                <div className="flex items-center justify-around text-center">
                  <div><div className="text-xl font-bold text-primary">{ghRes.githubScore}</div><div className="text-[11px] text-muted-foreground">Score</div></div>
                  <div><div className="text-xl font-bold text-primary">{ghRes.credibilityScore}</div><div className="text-[11px] text-muted-foreground">Credibility</div></div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <span className="flex flex-col items-center gap-0.5"><BookMarked className="size-3.5 text-muted-foreground" />{ghRes.publicRepos} repos</span>
                  <span className="flex flex-col items-center gap-0.5"><Star className="size-3.5 text-muted-foreground" />{ghRes.totalStars} stars</span>
                  <span className="flex flex-col items-center gap-0.5"><Users className="size-3.5 text-muted-foreground" />{ghRes.followers}</span>
                </div>
                <div className="flex flex-wrap gap-1">{ghRes.topLanguages.map((l) => <Badge key={l.language} variant="secondary" className="text-[10px]">{l.language}</Badge>)}</div>
                {ghRes.recommendations.slice(0, 2).map((r, i) => <p key={i} className="text-xs text-muted-foreground">• {r}</p>)}
              </motion.div>
            ) : <p className="text-xs text-rose-500">{ghRes.recommendations[0]}</p>)}
          </CardContent>
        </Card>

        {/* LinkedIn */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Linkedin className="size-4" /> LinkedIn Optimizer</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Textarea value={li} onChange={(e) => setLi(e.target.value)} placeholder="Paste your LinkedIn headline + About section…" className="min-h-[90px] text-xs" />
            <Button className="w-full" variant="outline" disabled={liLoad || li.trim().length < 30} onClick={() => call("/api/linkedin", { profileText: li }, setLiLoad, setLiRes)}>
              {liLoad ? <Loader2 className="size-4 animate-spin" /> : <Linkedin className="size-4" />} Analyze
            </Button>
            {liRes && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2 pt-1">
                <div className="text-center"><span className="text-2xl font-bold text-primary">{liRes.linkedinScore}</span><span className="text-xs text-muted-foreground">/100</span></div>
                <Metric label="Headline" value={liRes.metrics.headline} />
                <Metric label="About" value={liRes.metrics.about} />
                <Metric label="Keywords" value={liRes.metrics.keywords} />
                <Metric label="Branding" value={liRes.metrics.branding} />
                {liRes.recommendations.slice(0, 2).map((r, i) => <p key={i} className="text-xs text-muted-foreground">• {r}</p>)}
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Portfolio */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Globe className="size-4" /> Portfolio Audit</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input value={pf} onChange={(e) => setPf(e.target.value)} placeholder="yourportfolio.com" />
            <Button className="w-full" variant="outline" disabled={pfLoad || !pf.trim()} onClick={() => call("/api/portfolio", { url: pf }, setPfLoad, setPfRes)}>
              {pfLoad ? <Loader2 className="size-4 animate-spin" /> : <Globe className="size-4" />} Analyze
            </Button>
            {pfRes && (pfRes.reachable ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2 pt-1">
                <div className="text-center"><span className="text-2xl font-bold text-primary">{pfRes.portfolioScore}</span><span className="text-xs text-muted-foreground">/100</span></div>
                <Metric label="SEO" value={pfRes.metrics.seo} />
                <Metric label="Mobile" value={pfRes.metrics.mobile} />
                <Metric label="Performance" value={pfRes.metrics.performance} />
                <Metric label="Accessibility" value={pfRes.metrics.accessibility} />
                {pfRes.recommendations.slice(0, 2).map((r, i) => <p key={i} className="text-xs text-muted-foreground">• {r}</p>)}
              </motion.div>
            ) : <p className="text-xs text-rose-500">{pfRes.recommendations[0]}</p>)}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
