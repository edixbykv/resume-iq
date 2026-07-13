"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles, Upload, BrainCircuit, UserCheck, Target,
  FileText, ArrowRight, Zap,
} from "lucide-react";
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
  { icon: BrainCircuit, title: "AI Resume Analyzer", desc: "Get an instant recruiter-grade analysis with 10 detailed sub-scores.", tag: "Core" },
  { icon: Target, title: "Job Description Match", desc: "Paste any job description to get your match percentage and fix gaps.", tag: "Core" },
  { icon: FileText, title: "Resume Builder", desc: "Create high-converting resumes with beautiful, print-ready templates.", tag: "New" },
  { icon: UserCheck, title: "Recruiter Simulator", desc: "Find out if a recruiter would shortlist you and check your hiring probability.", tag: "Core" },
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
                <Link href="/builder"><FileText className="size-4 mr-2" /> Create from scratch</Link>
              </Button>
            </motion.div>
            <motion.p variants={fadeUp} custom={4} className="mt-4 text-xs text-muted-foreground">
              No sign-up required · PDF & DOCX · Your privacy matters —{" "}
              <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">
                see how we handle data
              </Link>
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
