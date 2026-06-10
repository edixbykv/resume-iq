"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles, Upload, BrainCircuit, UserCheck, Target, TrendingUp,
  FileText, Globe, GraduationCap, IndianRupee,
  ShieldCheck, BarChart3, ArrowRight, Check, Zap,
} from "lucide-react";
import { Github, Linkedin } from "@/components/site/brand-icons";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.5, ease: "easeOut" as const } }),
};

const features = [
  { icon: BrainCircuit, title: "AI Resume Analyzer", desc: "10 sub-scores — ATS, skills, experience, leadership, technical depth & more.", tag: "Core" },
  { icon: ShieldCheck, title: "ATS Compatibility", desc: "Detect parsing risks, missing sections & keyword gaps with fixes.", tag: "Free" },
  { icon: Target, title: "Job Description Match", desc: "Paste any JD for a match %, missing skills and gap analysis.", tag: "Core" },
  { icon: UserCheck, title: "Recruiter Simulation", desc: "Would I shortlist? YES / MAYBE / NO with hiring probability.", tag: "Premium" },
  { icon: FileText, title: "Resume Rewrite Engine", desc: "Weak bullets rewritten into quantified, recruiter-friendly impact.", tag: "Premium" },
  { icon: IndianRupee, title: "Salary Intelligence", desc: "India, remote & global salary bands based on your real profile.", tag: "Premium" },
  { icon: TrendingUp, title: "Skill Gap & 90-Day Plan", desc: "Target a role, see missing skills and a phased upskilling plan.", tag: "Premium" },
  { icon: Github, title: "GitHub Analyzer", desc: "Live repo quality, stars, languages & developer credibility score.", tag: "Core" },
  { icon: Linkedin, title: "LinkedIn Optimizer", desc: "Headline, About & branding scored with optimization tips.", tag: "Core" },
  { icon: Globe, title: "Portfolio Audit", desc: "Real SEO, mobile, performance & accessibility checks of your site.", tag: "Core" },
  { icon: GraduationCap, title: "Interview Prep", desc: "Technical, behavioral & project questions from your resume.", tag: "Premium" },
  { icon: BarChart3, title: "Benchmark & Brand Score", desc: "Percentile vs peers + a unified personal brand score.", tag: "Premium" },
];

const steps = [
  { icon: Upload, title: "Upload your resume", desc: "PDF or DOCX, or paste text. Parsed instantly, privately." },
  { icon: BrainCircuit, title: "Get scored", desc: "20+ analytics computed from real content — every score explainable." },
  { icon: ArrowRight, title: "Act & improve", desc: "Apply fixes, match a job, download your report, get hired." },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" />
        <div className="pointer-events-none absolute -top-40 left-1/2 size-[680px] -translate-x-1/2 rounded-full bg-gradient-to-br from-violet-600/25 via-primary/15 to-indigo-500/10 blur-3xl animate-float" />

        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-20 sm:px-6 sm:pt-28 lg:px-8">
          <motion.div initial="hidden" animate="show" className="mx-auto max-w-3xl text-center">
            <motion.div variants={fadeUp}>
              <Badge variant="outline" className="mb-5 gap-1.5 px-3 py-1 text-xs">
                <Sparkles className="size-3.5 text-primary" /> AI Resume Intelligence · by KVAI Solutions
              </Badge>
            </motion.div>
            <motion.h1 variants={fadeUp} custom={1} className="text-balance text-4xl font-bold tracking-tight sm:text-6xl">
              Your resume, reviewed like a{" "}
              <span className="bg-gradient-to-r from-violet-500 via-primary to-indigo-500 bg-clip-text text-transparent">
                real recruiter would
              </span>
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
              Not just another ATS checker. ResumeIQ is a complete career intelligence system —
              deep scoring, recruiter simulation, job matching, salary insights and a 90-day plan to get hired.
            </motion.p>
            <motion.div variants={fadeUp} custom={3} className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild variant="gradient" size="lg" className="w-full sm:w-auto">
                <Link href="/analyze"><Zap className="size-4" /> Analyze my resume — free</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <Link href="/#features">Explore features</Link>
              </Button>
            </motion.div>
            <motion.p variants={fadeUp} custom={4} className="mt-4 text-xs text-muted-foreground">
              No sign-up required · PDF &amp; DOCX · Your file never leaves the request
            </motion.p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={5}
            className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4"
          >
            {[
              ["20+", "Analytics modules"],
              ["10", "Resume sub-scores"],
              ["0-100", "Recruiter score"],
              ["90-day", "Upskilling plan"],
            ].map(([n, l]) => (
              <Card key={l} className="p-5 text-center">
                <div className="text-2xl font-bold text-primary sm:text-3xl">{n}</div>
                <div className="mt-1 text-xs text-muted-foreground sm:text-sm">{l}</div>
              </Card>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-3">Everything you need</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">One platform. Every career signal.</h2>
          <p className="mt-4 text-muted-foreground">Each module reads your real content and explains every score with evidence.</p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              variants={fadeUp}
              custom={i}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
            >
              <Card className="group h-full p-6 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
                <div className="flex items-start justify-between">
                  <div className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <f.icon className="size-5" />
                  </div>
                  <Badge variant={f.tag === "Premium" ? "warning" : f.tag === "Free" ? "success" : "secondary"}>{f.tag}</Badge>
                </div>
                <h3 className="mt-4 font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="scroll-mt-20 border-y border-border/60 bg-card/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="secondary" className="mb-3">How it works</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">From upload to offer-ready in minutes</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((s, i) => (
              <motion.div key={s.title} variants={fadeUp} custom={i} initial="hidden" whileInView="show" viewport={{ once: true }}>
                <Card className="relative h-full p-6">
                  <span className="absolute right-5 top-5 text-5xl font-bold text-muted/40">{i + 1}</span>
                  <div className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
                    <s.icon className="size-5" />
                  </div>
                  <h3 className="mt-4 font-semibold">{s.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{s.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-5xl scroll-mt-20 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-3">Pricing</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Start free. Upgrade when ready.</h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <Card className="p-8">
            <h3 className="text-lg font-semibold">Free</h3>
            <p className="mt-1 text-sm text-muted-foreground">For a quick health check</p>
            <div className="mt-4 text-4xl font-bold">₹0</div>
            <ul className="mt-6 space-y-3 text-sm">
              {["Overall resume score", "ATS compatibility scan", "Skill & section detection", "GitHub & portfolio audit"].map((x) => (
                <li key={x} className="flex items-center gap-2"><Check className="size-4 text-emerald-500" /> {x}</li>
              ))}
            </ul>
            <Button asChild variant="outline" className="mt-8 w-full"><Link href="/analyze">Get started</Link></Button>
          </Card>

          <Card className="relative overflow-hidden border-primary/40 p-8 shadow-lg shadow-primary/10">
            <div className="absolute right-0 top-0 rounded-bl-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-1 text-xs font-semibold text-white">
              Most popular
            </div>
            <h3 className="text-lg font-semibold">Premium</h3>
            <p className="mt-1 text-sm text-muted-foreground">Full career intelligence</p>
            <div className="mt-4 text-4xl font-bold">₹499<span className="text-base font-normal text-muted-foreground">/mo</span></div>
            <ul className="mt-6 space-y-3 text-sm">
              {["Everything in Free", "Recruiter simulation", "Salary intelligence", "Skill-gap 90-day plan", "Resume rewrite engine", "Downloadable PDF report"].map((x) => (
                <li key={x} className="flex items-center gap-2"><Check className="size-4 text-primary" /> {x}</li>
              ))}
            </ul>
            <Button asChild variant="gradient" className="mt-8 w-full"><Link href="/analyze">Analyze now</Link></Button>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-violet-600/15 via-primary/10 to-indigo-600/10 p-10 text-center sm:p-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">See what recruiters really think.</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">Upload your resume and get a recruiter-grade verdict in under a minute.</p>
          <Button asChild variant="gradient" size="lg" className="mt-8">
            <Link href="/analyze"><Sparkles className="size-4" /> Analyze my resume</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
