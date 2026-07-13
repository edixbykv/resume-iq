"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  createEmptyResume,
  type BuilderResume,
  type ResumeTemplate,
  TEMPLATE_LABELS,
} from "@/lib/builder-types";
import {
  Plus, Trash2, Save, Download, Eye, ArrowLeft, Sparkles,
} from "lucide-react";
import Link from "next/link";

let idCounter = 0;
function uid() { return `e${++idCounter}`; }

export default function BuilderPage() {
  const { status } = useSession();
  const [resume, setResume] = useState<BuilderResume>(createEmptyResume);
  const [activeTab, setActiveTab] = useState("contact");

  const TABS_ORDER = ["contact", "summary", "experience", "education", "skills", "projects", "certifications", "template", "optimize"];

  const handleNextTab = () => {
    const currentIndex = TABS_ORDER.indexOf(activeTab);
    if (currentIndex < TABS_ORDER.length - 1) {
      setActiveTab(TABS_ORDER[currentIndex + 1]);
    }
  };

  const handlePrevTab = () => {
    const currentIndex = TABS_ORDER.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(TABS_ORDER[currentIndex - 1]);
    }
  };

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Job Description Optimization States
  const [jdInput, setJdInput] = useState("");
  const [optimizing, setOptimizing] = useState(false);
  const [optimizeSuccess, setOptimizeSuccess] = useState(false);

  const handleJdOptimize = async () => {
    if (!jdInput) {
      alert("Please paste a Job Description first!");
      return;
    }
    setOptimizing(true);
    setOptimizeSuccess(false);
    try {
      const res = await fetch("/api/builder/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, jobDescription: jdInput }),
      });
      const data = await res.json();
      if (res.ok && data.resume) {
        setResume(data.resume);
        setOptimizeSuccess(true);
        setTimeout(() => setOptimizeSuccess(false), 5000);
      } else {
        alert(data.error || "Failed to optimize resume.");
      }
    } catch {
      alert("An error occurred during optimization.");
    } finally {
      setOptimizing(false);
    }
  };

  // OTP Email Verification States
  const [emailInput, setEmailInput] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState("");


  const handleSendOtp = async () => {
    if (!emailInput || !emailInput.includes("@")) {
      setOtpError("Please enter a valid email address.");
      return;
    }
    setSendingOtp(true);
    setOtpError("");
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput }),
      });
      const data = await res.json();
      if (res.ok) {
        setOtpSent(true);
      } else {
        setOtpError(data.error || "Failed to send verification code.");
      }
    } catch {
      setOtpError("An error occurred. Please try again.");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length !== 6) {
      setOtpError("Please enter the 6-digit verification code.");
      return;
    }
    setVerifyingOtp(true);
    setOtpError("");
    try {
      const result = await signIn("credentials", {
        email: emailInput,
        code: otpCode,
        redirect: false,
      });

      if (result?.error) {
        setOtpError("Invalid or expired verification code.");
      } else {
        setShowLoginModal(false);
        setOtpSent(false);
        setOtpCode("");
        window.location.href = "/builder?pay=true";
      }
    } catch {
      setOtpError("An error occurred during verification.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Dynamic Razorpay Checkout load
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Load resume data on mount
  useEffect(() => {
    async function loadData() {
      const local = localStorage.getItem("resume_iq_builder_state");
      let localResume: BuilderResume | null = null;
      if (local) {
        try {
          localResume = JSON.parse(local);
        } catch {
          // ignore
        }
      }

      if (status === "authenticated") {
        try {
          const res = await fetch("/api/builder");
          const data = await res.json();
          if (data.resume) {
            setResume(data.resume);
          } else if (localResume) {
            setResume(localResume);
            await fetch("/api/builder", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(localResume),
            });
          }
        } catch {
          if (localResume) setResume(localResume);
        }
      } else {
        if (localResume) {
          setResume(localResume);
        }
      }
    }
    loadData();
  }, [status]);

  // LocalStorage save
  useEffect(() => {
    if (resume.contact.fullName || resume.summary || resume.experience.length > 0) {
      localStorage.setItem("resume_iq_builder_state", JSON.stringify(resume));
    }
  }, [resume]);

  const autoSave = useCallback(async () => {
    if (status === "authenticated") {
      setSaving(true);
      try {
        const res = await fetch("/api/builder", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...resume,
            metadata: { ...resume.metadata, autoSaved: true, updatedAt: new Date().toISOString() },
          }),
        });
        if (res.ok) {
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        }
      } catch {
        // Silently fail
      } finally {
        setSaving(false);
      }
    } else {
      localStorage.setItem("resume_iq_builder_state", JSON.stringify(resume));
      setSaved(true);
      setTimeout(() => setSaved(false), 1000);
    }
  }, [status, resume]);

  // Autosave every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      autoSave();
    }, 30000);
    return () => clearInterval(interval);
  }, [autoSave]);

  const triggerPayment = useCallback(() => {
    if (status !== "authenticated") {
      setShowLoginModal(true);
      return;
    }

    const options = {
      key: "rzp_live_T1MMMfUMUEWNru",
      amount: 900, // ₹9.00 in paise
      currency: "INR",
      name: "ResumeIQ",
      description: "Export Premium Resume PDF",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      handler: async function (response: any) {
        try {
          await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpayOrderId: response.razorpay_order_id || `pay_${Math.random().toString(36).slice(2, 10)}`,
              razorpayPaymentId: response.razorpay_payment_id || `ord_${Math.random().toString(36).slice(2, 10)}`,
              amount: 900,
            }),
          });
        } catch {
          // ignore verification log error
        }
        window.print();
      },
      prefill: {
        name: resume.contact.fullName || "",
        email: resume.contact.email || "",
        contact: resume.contact.phone || "",
      },
      theme: {
        color: "#6366f1",
      },
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  }, [status, resume.contact]);

  // Trigger payment automatically if ?pay=true query parameter is present on page load
  useEffect(() => {
    if (typeof window !== "undefined" && status === "authenticated") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("pay") === "true") {
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
        setTimeout(() => {
          triggerPayment();
        }, 800);
      }
    }
  }, [status, triggerPayment]);

  const updateContact = useCallback((field: string, value: string) => {
    setResume((r) => ({ ...r, contact: { ...r.contact, [field]: value } }));
  }, []);

  const updateSummary = useCallback((value: string) => {
    setResume((r) => ({ ...r, summary: value }));
  }, []);

  const setTemplate = useCallback((template: ResumeTemplate) => {
    setResume((r) => ({ ...r, template }));
  }, []);

  const updateStyle = useCallback((field: string, value: string) => {
    setResume((r) => ({
      ...r,
      styles: {
        ...(r.styles || {
          fontFamily: "font-sans",
          primaryColor: "indigo",
          spacing: "normal",
          margin: "normal",
        }),
        [field]: value,
      },
    }));
  }, []);

  function addExperience() {
    setResume((r) => ({
      ...r,
      experience: [...r.experience, {
        id: uid(), company: "", title: "", startDate: "", endDate: "",
        current: false, bullets: [""],
      }],
    }));
  }

  function updateExperience(id: string, field: string, value: unknown) {
    setResume((r) => ({
      ...r,
      experience: r.experience.map((e) => e.id === id ? { ...e, [field]: value } : e),
    }));
  }

  function removeExperience(id: string) {
    setResume((r) => ({ ...r, experience: r.experience.filter((e) => e.id !== id) }));
  }

  function addBullet(expId: string) {
    setResume((r) => ({
      ...r,
      experience: r.experience.map((e) =>
        e.id === expId ? { ...e, bullets: [...e.bullets, ""] } : e,
      ),
    }));
  }

  function updateBullet(expId: string, idx: number, value: string) {
    setResume((r) => ({
      ...r,
      experience: r.experience.map((e) =>
        e.id === expId
          ? { ...e, bullets: e.bullets.map((b, i) => (i === idx ? value : b)) }
          : e,
      ),
    }));
  }

  function removeBullet(expId: string, idx: number) {
    setResume((r) => ({
      ...r,
      experience: r.experience.map((e) =>
        e.id === expId
          ? { ...e, bullets: e.bullets.filter((_, i) => i !== idx) }
          : e,
      ),
    }));
  }

  function addEducation() {
    setResume((r) => ({
      ...r,
      education: [...r.education, {
        id: uid(), institution: "", degree: "", field: "", startDate: "", endDate: "",
      }],
    }));
  }

  function updateEducation(id: string, field: string, value: string) {
    setResume((r) => ({
      ...r,
      education: r.education.map((e) => e.id === id ? { ...e, [field]: value } : e),
    }));
  }

  function removeEducation(id: string) {
    setResume((r) => ({ ...r, education: r.education.filter((e) => e.id !== id) }));
  }

  function addSkill() {
    setResume((r) => ({
      ...r,
      skills: [...r.skills, { id: uid(), name: "", category: "technical" as const }],
    }));
  }

  function updateSkill(id: string, field: string, value: string) {
    setResume((r) => ({
      ...r,
      skills: r.skills.map((s) => s.id === id ? { ...s, [field]: value } : s),
    }));
  }

  function removeSkill(id: string) {
    setResume((r) => ({ ...r, skills: r.skills.filter((s) => s.id !== id) }));
  }

  function addProject() {
    setResume((r) => ({
      ...r,
      projects: [...r.projects, {
        id: uid(), name: "", description: "", technologies: [],
      }],
    }));
  }

  function updateProject(id: string, field: string, value: unknown) {
    setResume((r) => ({
      ...r,
      projects: r.projects.map((p) => p.id === id ? { ...p, [field]: value } : p),
    }));
  }

  function removeProject(id: string) {
    setResume((r) => ({ ...r, projects: r.projects.filter((p) => p.id !== id) }));
  }

  function addCertification() {
    setResume((r) => ({
      ...r,
      certifications: [...r.certifications, {
        id: uid(), name: "", issuer: "",
      }],
    }));
  }

  function updateCertification(id: string, field: string, value: string) {
    setResume((r) => ({
      ...r,
      certifications: r.certifications.map((c) => c.id === id ? { ...c, [field]: value } : c),
    }));
  }

  function removeCertification(id: string) {
    setResume((r) => ({ ...r, certifications: r.certifications.filter((c) => c.id !== id) }));
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#070a13] text-slate-100">
      <Navbar />
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between no-print">
            <div className="flex items-center gap-3">
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard"><ArrowLeft className="size-4" /></Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Resume Builder</h1>
                <p className="text-sm text-muted-foreground">
                  Build your resume with structured sections and live preview
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {saved && <Badge variant="success">Saved</Badge>}
              <Button variant="outline" size="sm" onClick={autoSave} disabled={saving}>
                <Save className="size-4" /> {saving ? "Saving..." : "Save"}
              </Button>
              <Button variant="gradient" size="sm" onClick={triggerPayment}>
                <Download className="size-4" /> Export PDF
              </Button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2 print:block">
            {/* Editor */}
            <div className="space-y-4 no-print">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="flex-wrap">
                  <TabsTrigger value="contact">Contact</TabsTrigger>
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="experience">Experience</TabsTrigger>
                  <TabsTrigger value="education">Education</TabsTrigger>
                  <TabsTrigger value="skills">Skills</TabsTrigger>
                  <TabsTrigger value="projects">Projects</TabsTrigger>
                  <TabsTrigger value="certifications">Certs</TabsTrigger>
                  <TabsTrigger value="template">Template</TabsTrigger>
                  <TabsTrigger value="optimize" className="text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400">AI Optimize</TabsTrigger>
                </TabsList>

                <TabsContent value="contact" className="space-y-4 pt-4">
                  <Card className="p-5 space-y-3 bg-[#0e1322]/80 border-slate-800/80 hover:border-indigo-500/10 transition-all shadow-xl">
                    <InputField label="Full Name" value={resume.contact.fullName} onChange={(v) => updateContact("fullName", v)} />
                    <InputField label="Email" type="email" value={resume.contact.email} onChange={(v) => updateContact("email", v)} />
                    <InputField label="Phone" value={resume.contact.phone} onChange={(v) => updateContact("phone", v)} />
                    <InputField label="Location" value={resume.contact.location} onChange={(v) => updateContact("location", v)} />
                    <InputField label="LinkedIn URL" value={resume.contact.linkedin ?? ""} onChange={(v) => updateContact("linkedin", v)} />
                    <InputField label="GitHub URL" value={resume.contact.github ?? ""} onChange={(v) => updateContact("github", v)} />
                    <InputField label="Website" value={resume.contact.website ?? ""} onChange={(v) => updateContact("website", v)} />
                  </Card>
                </TabsContent>

                <TabsContent value="summary" className="pt-4">
                  <Card className="p-5 bg-[#0e1322]/80 border-slate-800/80 hover:border-indigo-500/10 transition-all shadow-xl space-y-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Professional Summary</label>
                    <textarea
                      className="min-h-[120px] w-full rounded-lg border border-slate-800 bg-[#0c101d] p-3 text-xs text-slate-100 placeholder-slate-500 shadow-inner transition-all focus:border-indigo-500 focus:bg-[#0f1526] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="Write a brief professional summary..."
                      value={resume.summary}
                      onChange={(e) => updateSummary(e.target.value)}
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      {resume.summary.split(/\s+/).filter(Boolean).length} words
                    </p>
                  </Card>
                </TabsContent>

                <TabsContent value="experience" className="space-y-4 pt-4">
                  {resume.experience.map((exp) => (
                    <Card key={exp.id} className="p-5 bg-[#0e1322]/80 border-slate-800/80 hover:border-indigo-500/10 transition-all shadow-xl">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm font-medium">{exp.company || "New Experience"}</span>
                        <Button variant="ghost" size="sm" onClick={() => removeExperience(exp.id)}>
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </div>
                      <div className="space-y-3">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <InputField label="Company" value={exp.company} onChange={(v) => updateExperience(exp.id, "company", v)} />
                          <InputField label="Title" value={exp.title} onChange={(v) => updateExperience(exp.id, "title", v)} />
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <InputField label="Start Date" value={exp.startDate} onChange={(v) => updateExperience(exp.id, "startDate", v)} />
                          <InputField label="End Date" value={exp.endDate ?? ""} onChange={(v) => updateExperience(exp.id, "endDate", v)} />
                        </div>
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={exp.current}
                            onChange={(e) => updateExperience(exp.id, "current", e.target.checked)}
                            className="rounded"
                          />
                          I currently work here
                        </label>
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Bullets</label>
                          {exp.bullets.map((bullet, i) => (
                            <div key={i} className="mb-2 flex items-start gap-2">
                              <textarea
                                className="min-h-[60px] flex-1 rounded-lg border border-slate-800 bg-[#0c101d] p-2.5 text-xs text-slate-100 placeholder-slate-500 shadow-inner transition-all focus:border-indigo-500 focus:bg-[#0f1526] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                placeholder="Describe your achievement..."
                                value={bullet}
                                onChange={(e) => updateBullet(exp.id, i, e.target.value)}
                              />
                              <Button variant="ghost" size="sm" onClick={() => removeBullet(exp.id, i)}>
                                <Trash2 className="size-3 text-destructive" />
                              </Button>
                            </div>
                          ))}
                          <Button variant="outline" size="sm" onClick={() => addBullet(exp.id)}>
                            <Plus className="size-3" /> Add bullet
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                  <Button variant="outline" className="w-full" onClick={addExperience}>
                    <Plus className="size-4" /> Add Experience
                  </Button>
                </TabsContent>

                <TabsContent value="education" className="space-y-4 pt-4">
                  {resume.education.map((edu) => (
                    <Card key={edu.id} className="p-5 bg-[#0e1322]/80 border-slate-800/80 hover:border-indigo-500/10 transition-all shadow-xl">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm font-medium">{edu.institution || "New Education"}</span>
                        <Button variant="ghost" size="sm" onClick={() => removeEducation(edu.id)}>
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </div>
                      <div className="space-y-3">
                        <InputField label="Institution" value={edu.institution} onChange={(v) => updateEducation(edu.id, "institution", v)} />
                        <div className="grid gap-3 sm:grid-cols-2">
                          <InputField label="Degree" value={edu.degree} onChange={(v) => updateEducation(edu.id, "degree", v)} />
                          <InputField label="Field of Study" value={edu.field ?? ""} onChange={(v) => updateEducation(edu.id, "field", v)} />
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <InputField label="Start Date" value={edu.startDate} onChange={(v) => updateEducation(edu.id, "startDate", v)} />
                          <InputField label="End Date" value={edu.endDate} onChange={(v) => updateEducation(edu.id, "endDate", v)} />
                        </div>
                        <InputField label="GPA (optional)" value={edu.gpa ?? ""} onChange={(v) => updateEducation(edu.id, "gpa", v)} />
                      </div>
                    </Card>
                  ))}
                  <Button variant="outline" className="w-full" onClick={addEducation}>
                    <Plus className="size-4" /> Add Education
                  </Button>
                </TabsContent>

                <TabsContent value="skills" className="space-y-4 pt-4">
                  <Card className="p-5 bg-[#0e1322]/80 border-slate-800/80 hover:border-indigo-500/10 transition-all shadow-xl">
                    <div className="space-y-3">
                      {resume.skills.map((skill) => (
                        <div key={skill.id} className="flex items-center gap-2">
                          <input
                            className="flex-1 rounded-lg border border-slate-800 bg-[#0c101d] px-3 py-2 text-xs text-slate-100 placeholder-slate-500 shadow-inner transition-all focus:border-indigo-500 focus:bg-[#0f1526] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder="Skill name"
                            value={skill.name}
                            onChange={(e) => updateSkill(skill.id, "name", e.target.value)}
                          />
                          <select
                            className="rounded-lg border border-slate-800 bg-[#0c101d] px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                            value={skill.category}
                            onChange={(e) => updateSkill(skill.id, "category", e.target.value)}
                          >
                            <option value="technical">Technical</option>
                            <option value="soft">Soft</option>
                            <option value="tool">Tool</option>
                            <option value="language">Language</option>
                            <option value="other">Other</option>
                          </select>
                          <Button variant="ghost" size="sm" onClick={() => removeSkill(skill.id)}>
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" size="sm" className="mt-3" onClick={addSkill}>
                      <Plus className="size-3" /> Add Skill
                    </Button>
                  </Card>
                </TabsContent>

                <TabsContent value="projects" className="space-y-4 pt-4">
                  {resume.projects.map((proj) => (
                    <Card key={proj.id} className="p-5 bg-[#0e1322]/80 border-slate-800/80 hover:border-indigo-500/10 transition-all shadow-xl">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm font-medium">{proj.name || "New Project"}</span>
                        <Button variant="ghost" size="sm" onClick={() => removeProject(proj.id)}>
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </div>
                      <div className="space-y-3">
                        <InputField label="Project Name" value={proj.name} onChange={(v) => updateProject(proj.id, "name", v)} />
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Description</label>
                          <textarea
                            className="min-h-[80px] w-full rounded-lg border border-slate-800 bg-[#0c101d] p-2.5 text-xs text-slate-100 placeholder-slate-500 shadow-inner transition-all focus:border-indigo-500 focus:bg-[#0f1526] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            value={proj.description}
                            onChange={(e) => updateProject(proj.id, "description", e.target.value)}
                          />
                        </div>
                        <InputField label="Technologies (comma-separated)" value={proj.technologies.join(", ")} onChange={(v) => updateProject(proj.id, "technologies", v.split(",").map((s) => s.trim()))} />
                        <InputField label="URL (optional)" value={proj.url ?? ""} onChange={(v) => updateProject(proj.id, "url", v)} />
                      </div>
                    </Card>
                  ))}
                  <Button variant="outline" className="w-full" onClick={addProject}>
                    <Plus className="size-4" /> Add Project
                  </Button>
                </TabsContent>

                <TabsContent value="certifications" className="space-y-4 pt-4">
                  {resume.certifications.map((cert) => (
                    <Card key={cert.id} className="p-5 bg-[#0e1322]/80 border-slate-800/80 hover:border-indigo-500/10 transition-all shadow-xl">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm font-medium">{cert.name || "New Certification"}</span>
                        <Button variant="ghost" size="sm" onClick={() => removeCertification(cert.id)}>
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </div>
                      <div className="space-y-3">
                        <InputField label="Name" value={cert.name} onChange={(v) => updateCertification(cert.id, "name", v)} />
                        <InputField label="Issuer" value={cert.issuer} onChange={(v) => updateCertification(cert.id, "issuer", v)} />
                        <InputField label="Date (optional)" value={cert.date ?? ""} onChange={(v) => updateCertification(cert.id, "date", v)} />
                      </div>
                    </Card>
                  ))}
                  <Button variant="outline" className="w-full" onClick={addCertification}>
                    <Plus className="size-4" /> Add Certification
                  </Button>
                </TabsContent>

                <TabsContent value="template" className="pt-4 space-y-4">
                  <Card className="p-5 space-y-4 bg-[#0e1322]/80 border-slate-800/80 hover:border-indigo-500/10 transition-all shadow-xl">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Resume Template Layout</label>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {(Object.entries(TEMPLATE_LABELS) as [ResumeTemplate, string][]).map(([key, label]) => (
                          <button
                            key={key}
                            className={`rounded-lg border p-3 text-left text-sm transition-colors ${
                              resume.template === key
                                ? "border-primary bg-primary/10 font-medium"
                                : "border-input hover:border-primary/40"
                            }`}
                            onClick={() => setTemplate(key)}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="h-px bg-border/60 my-4" />

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-foreground">Font Style</label>
                      <div className="grid gap-2 grid-cols-3">
                        {[
                          { key: "font-sans", label: "Clean Sans" },
                          { key: "font-serif", label: "Classic Serif" },
                          { key: "font-mono", label: "Developer Mono" },
                        ].map((f) => (
                          <button
                            key={f.key}
                            className={`rounded-lg border p-2 text-center text-xs transition-colors ${
                              (resume.styles?.fontFamily || "font-sans") === f.key
                                ? "border-primary bg-primary/10 font-medium"
                                : "border-input hover:border-primary/40"
                            }`}
                            onClick={() => updateStyle("fontFamily", f.key)}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="h-px bg-border/60 my-4" />

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-foreground">Accent Color</label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { key: "indigo", label: "Indigo", hex: "#4f46e5" },
                          { key: "rose", label: "Rose", hex: "#e11d48" },
                          { key: "emerald", label: "Emerald", hex: "#059669" },
                          { key: "amber", label: "Amber", hex: "#d97706" },
                          { key: "slate", label: "Slate", hex: "#475569" },
                        ].map((c) => (
                          <button
                            key={c.key}
                            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                              (resume.styles?.primaryColor || "indigo") === c.key
                                ? "border-primary bg-primary/10 font-medium"
                                : "border-input hover:border-primary/40"
                            }`}
                            onClick={() => updateStyle("primaryColor", c.key)}
                          >
                            <span className="size-3.5 rounded-full" style={{ backgroundColor: c.hex }} />
                            {c.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="h-px bg-border/60 my-4" />

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-foreground">Layout Spacing</label>
                      <div className="grid gap-2 grid-cols-3">
                        {[
                          { key: "compact", label: "Compact" },
                          { key: "normal", label: "Normal" },
                          { key: "loose", label: "Loose" },
                        ].map((s) => (
                          <button
                            key={s.key}
                            className={`rounded-lg border p-2 text-center text-xs transition-colors ${
                              (resume.styles?.spacing || "normal") === s.key
                                ? "border-primary bg-primary/10 font-medium"
                                : "border-input hover:border-primary/40"
                            }`}
                            onClick={() => updateStyle("spacing", s.key)}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="optimize" className="pt-4 space-y-4">
                  <Card className="p-5 space-y-4 bg-[#0e1322]/80 border-slate-800/80 hover:border-indigo-500/10 transition-all shadow-xl">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <Sparkles className="size-4 text-indigo-400 animate-pulse" />
                        AI Job Description Tailoring
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Paste the target job description. Our AI will automatically rewrite your profile summary, highlight critical technical keywords in your skills list, and align your work experience bullet points to match the job specifications.
                      </p>
                    </div>

                    {optimizeSuccess && (
                      <div className="bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 text-xs rounded-lg p-3 text-center font-medium">
                        ✨ Resume successfully optimized and updated! View the changes in the Live Preview.
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Job Description (JD)</label>
                      <textarea
                        className="min-h-[160px] w-full rounded-lg border border-slate-800 bg-[#0c101d] p-3 text-xs text-slate-100 placeholder-slate-500 shadow-inner transition-all focus:border-indigo-500 focus:bg-[#0f1526] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="Paste the job requirements description here (e.g. Seeking a Full Stack Engineer with 3+ years experience in React, Node.js, and AWS)..."
                        value={jdInput}
                        onChange={(e) => setJdInput(e.target.value)}
                      />
                    </div>

                    <Button variant="gradient" className="w-full" onClick={handleJdOptimize} disabled={optimizing}>
                      {optimizing ? "Optimizing Resume..." : "Tailor Resume for this Job"}
                    </Button>
                  </Card>
                </TabsContent>

                <div className="flex justify-between items-center pt-4 border-t border-slate-800/60 mt-4 no-print">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevTab}
                    disabled={activeTab === "contact"}
                    className="border-slate-800 text-slate-300 hover:bg-slate-900/60"
                  >
                    ← Back
                  </Button>
                  {activeTab !== "optimize" ? (
                    <Button
                      variant="gradient"
                      size="sm"
                      onClick={handleNextTab}
                    >
                      Next Step →
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">Final optimization step!</span>
                  )}
                </div>
              </Tabs>
            </div>

            {/* Preview */}
            <div className="hidden lg:block print:block print:w-full">
              <div className="sticky top-24 print:static print:top-0">
                <div className="mb-3 flex items-center gap-2 no-print">
                  <Eye className="size-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Live Preview</span>
                  <Badge variant="secondary" className="ml-auto">{TEMPLATE_LABELS[resume.template]}</Badge>
                </div>
                <Card className="overflow-hidden print:border-none print:shadow-none print:bg-transparent">
                  <div className="max-h-[calc(100vh-200px)] overflow-y-auto p-6 print:p-0 print:max-h-none print:overflow-visible">
                    <ResumePreview resume={resume} />
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center space-y-2">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Sparkles className="size-6 animate-pulse" />
              </div>
              <h3 className="text-xl font-bold tracking-tight text-foreground flex items-center justify-center gap-1.5">
                <Sparkles className="size-5 text-indigo-500" />
                Unlock Premium Download (₹9)
              </h3>
              <p className="text-xs text-muted-foreground text-center">
                {!otpSent 
                  ? "Enter your email to verify account. Get premium access and unlock print for a flat rate of ₹9 per resume."
                  : `We sent a 6-digit verification code to ${emailInput}.`
                }
              </p>
            </div>

            {otpError && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-lg p-3 text-center">
                {otpError}
              </div>
            )}

            {!otpSent ? (
              <div className="space-y-3">
                <input
                  type="email"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="name@company.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                />
                <Button variant="gradient" className="w-full" onClick={handleSendOtp} disabled={sendingOtp}>
                  {sendingOtp ? "Sending..." : "Send Verification Code"}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  maxLength={6}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-center text-lg font-semibold tracking-widest focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="0 0 0 0 0 0"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                />
                <Button variant="gradient" className="w-full" onClick={handleVerifyOtp} disabled={verifyingOtp}>
                  {verifyingOtp ? "Verify & Export" : "Verify & Export"}
                </Button>
                <button 
                  className="text-xs text-primary hover:underline block mx-auto pt-1"
                  onClick={() => setOtpSent(false)}
                >
                  Change Email
                </button>
              </div>
            )}

            <Button variant="ghost" className="w-full" onClick={() => {
              setShowLoginModal(false);
              setOtpSent(false);
              setOtpError("");
            }}>
              Cancel
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}

// ---- Helper Components ----

function InputField({ label, value, onChange, type = "text" }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div className="space-y-1 text-left">
      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</label>
      <input
        type={type}
        className="w-full rounded-lg border border-slate-800 bg-[#0c101d] px-3 py-2 text-xs text-slate-100 placeholder-slate-500 shadow-inner transition-all focus:border-indigo-500 focus:bg-[#0f1526] focus:outline-none focus:ring-1 focus:ring-indigo-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function ResumePreview({ resume }: { resume: BuilderResume }) {
  const { template, contact, summary, experience, education, skills, projects, certifications } = resume;

  const styles = resume.styles || {
    fontFamily: "font-sans",
    primaryColor: "indigo",
    spacing: "normal",
    margin: "normal",
  };

  const fontClass = styles.fontFamily || "font-sans";

  const colorMap = {
    indigo: {
      border: "border-indigo-600",
      text: "text-indigo-600",
      bg: "bg-indigo-50",
      badgeText: "text-indigo-700",
      badgeBorder: "border-indigo-100",
      headerBorder: "border-indigo-600",
    },
    rose: {
      border: "border-rose-600",
      text: "text-rose-600",
      bg: "bg-rose-50",
      badgeText: "text-rose-700",
      badgeBorder: "border-rose-100",
      headerBorder: "border-rose-600",
    },
    emerald: {
      border: "border-emerald-600",
      text: "text-emerald-600",
      bg: "bg-emerald-50",
      badgeText: "text-emerald-700",
      badgeBorder: "border-emerald-100",
      headerBorder: "border-emerald-600",
    },
    amber: {
      border: "border-amber-600",
      text: "text-amber-600",
      bg: "bg-amber-50",
      badgeText: "text-amber-700",
      badgeBorder: "border-amber-100",
      headerBorder: "border-amber-600",
    },
    slate: {
      border: "border-slate-800",
      text: "text-slate-800",
      bg: "bg-slate-100",
      badgeText: "text-slate-900",
      badgeBorder: "border-slate-300",
      headerBorder: "border-slate-800",
    },
  };

  const colors = colorMap[styles.primaryColor as keyof typeof colorMap] || colorMap.indigo;

  const spacingMap = {
    compact: "space-y-3.5",
    normal: "space-y-5",
    loose: "space-y-7",
  };
  const spacingClass = spacingMap[styles.spacing as keyof typeof spacingMap] || spacingMap.normal;

  // Modern Professional / Executive / Technical Layout
  if (template === "modern-professional" || template === "executive" || template === "technical") {
    return (
      <div className={`${fontClass} text-sm text-slate-800 ${spacingClass} print:text-black`}>
        {/* Accent Header */}
        <div className={`border-t-4 ${colors.headerBorder} pt-4 text-center`}>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 print:text-black">
            {contact.fullName || "Your Name"}
          </h1>
          <div className="mt-2 text-xs flex flex-wrap justify-center gap-x-3 gap-y-1 text-slate-500 print:text-slate-600">
            {contact.email && <span>{contact.email}</span>}
            {contact.phone && <span>· {contact.phone}</span>}
            {contact.location && <span>· {contact.location}</span>}
          </div>
          <div className="mt-1 text-xs flex flex-wrap justify-center gap-x-3 gap-y-1 text-slate-400 print:text-slate-500">
            {contact.linkedin && <span className="hover:underline">{contact.linkedin}</span>}
            {contact.github && <span className="hover:underline">{contact.github}</span>}
            {contact.website && <span className="hover:underline">{contact.website}</span>}
          </div>
        </div>

        {/* Summary */}
        {summary && (
          <div className="space-y-1.5">
            <h2 className={`text-xs font-bold uppercase tracking-wider ${colors.text} border-b pb-0.5`}>
              Professional Summary
            </h2>
            <p className="text-xs leading-relaxed text-slate-700 print:text-black">{summary}</p>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div className="space-y-3">
            <h2 className={`text-xs font-bold uppercase tracking-wider ${colors.text} border-b pb-0.5`}>
              Work Experience
            </h2>
            <div className="space-y-3">
              {experience.map((exp) => (
                <div key={exp.id} className="space-y-1">
                  <div className="flex flex-wrap items-start justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 print:text-black">{exp.title}</span>
                      {exp.company && <span className="text-slate-500"> @ {exp.company}</span>}
                    </div>
                    <span className="text-slate-500 print:text-slate-700 font-medium">
                      {exp.startDate} — {exp.current ? "Present" : exp.endDate}
                    </span>
                  </div>
                  {exp.bullets.length > 0 && (
                    <ul className="list-disc pl-4 text-xs space-y-0.5 text-slate-600 print:text-black">
                      {exp.bullets.filter(Boolean).map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div className="space-y-3">
            <h2 className={`text-xs font-bold uppercase tracking-wider ${colors.text} border-b pb-0.5`}>
              Education
            </h2>
            <div className="space-y-2">
              {education.map((edu) => (
                <div key={edu.id} className="text-xs">
                  <div className="flex flex-wrap items-start justify-between">
                    <div>
                      <span className="font-bold text-slate-900 print:text-black">{edu.degree}</span>
                      {edu.field && <span> in {edu.field}</span>}
                    </div>
                    <span className="text-slate-500 print:text-slate-700">
                      {edu.startDate} — {edu.endDate}
                    </span>
                  </div>
                  <div className="text-slate-500 print:text-slate-700">
                    {edu.institution}{edu.gpa ? ` · GPA: ${edu.gpa}` : ""}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div className="space-y-1.5">
            <h2 className={`text-xs font-bold uppercase tracking-wider ${colors.text} border-b pb-0.5`}>
              Skills
            </h2>
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {skills.filter((s) => s.name).map((s) => (
                <span
                  key={s.id}
                  className={`rounded-md ${colors.bg} border ${colors.badgeBorder} ${colors.badgeText} px-2.5 py-0.5 text-xs font-medium print:bg-transparent print:border-slate-200 print:text-black`}
                >
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div className="space-y-3">
            <h2 className={`text-xs font-bold uppercase tracking-wider ${colors.text} border-b pb-0.5`}>
              Projects
            </h2>
            <div className="space-y-2">
              {projects.filter((p) => p.name).map((p) => (
                <div key={p.id} className="text-xs space-y-0.5">
                  <div className="font-bold text-slate-900 print:text-black">{p.name}</div>
                  <p className="text-slate-600 print:text-black leading-relaxed">{p.description}</p>
                  {p.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {p.technologies.map((t, i) => (
                        <span key={i} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600 print:bg-transparent print:border print:border-slate-200">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <div className="space-y-1.5">
            <h2 className={`text-xs font-bold uppercase tracking-wider ${colors.text} border-b pb-0.5`}>
              Certifications
            </h2>
            <div className="grid gap-1 sm:grid-cols-2 text-xs">
              {certifications.filter((c) => c.name).map((c) => (
                <div key={c.id} className="text-slate-700 print:text-black">
                  <span className="font-semibold">{c.name}</span>
                  {c.issuer && <span className="text-slate-500"> — {c.issuer}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Classic ATS-Safe Layout (Serif, Traditional Black & White formatting)
  if (template === "classic-ats") {
    return (
      <div className="font-serif text-[13px] text-zinc-900 space-y-4 leading-normal print:leading-relaxed">
        {/* Simple Centered Header */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold tracking-wide uppercase">{contact.fullName || "YOUR NAME"}</h1>
          <div className="text-xs space-x-1.5 text-zinc-800">
            {[contact.email, contact.phone, contact.location].filter(Boolean).join("  |  ")}
          </div>
          <div className="text-xs space-x-1.5 text-zinc-700">
            {[contact.linkedin, contact.github, contact.website].filter(Boolean).join("  |  ")}
          </div>
        </div>

        {/* Summary */}
        {summary && (
          <div className="space-y-1">
            <h2 className="text-xs font-bold uppercase tracking-wider border-b border-black pb-0.5">
              Professional Summary
            </h2>
            <p className="text-xs leading-relaxed text-zinc-900">{summary}</p>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider border-b border-black pb-0.5">
              Experience
            </h2>
            <div className="space-y-2.5">
              {experience.map((exp) => (
                <div key={exp.id} className="space-y-0.5">
                  <div className="flex justify-between font-semibold text-xs">
                    <div>
                      <span>{exp.title}</span>
                      {exp.company && <span>, {exp.company}</span>}
                    </div>
                    <span>{exp.startDate} — {exp.current ? "Present" : exp.endDate}</span>
                  </div>
                  {exp.bullets.length > 0 && (
                    <ul className="list-disc pl-5 text-xs space-y-0.5">
                      {exp.bullets.filter(Boolean).map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider border-b border-black pb-0.5">
              Education
            </h2>
            <div className="space-y-1.5">
              {education.map((edu) => (
                <div key={edu.id} className="text-xs">
                  <div className="flex justify-between font-semibold">
                    <span>{edu.institution}</span>
                    <span>{edu.startDate} — {edu.endDate}</span>
                  </div>
                  <div className="flex justify-between text-zinc-800">
                    <span>{edu.degree}{edu.field ? ` in ${edu.field}` : ""}</span>
                    {edu.gpa && <span>GPA: {edu.gpa}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div className="space-y-1">
            <h2 className="text-xs font-bold uppercase tracking-wider border-b border-black pb-0.5">
              Skills
            </h2>
            <p className="text-xs leading-relaxed">
              <span className="font-semibold">Core Competencies: </span>
              {skills.filter((s) => s.name).map((s) => s.name).join(", ")}
            </p>
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider border-b border-black pb-0.5">
              Projects
            </h2>
            <div className="space-y-2">
              {projects.filter((p) => p.name).map((p) => (
                <div key={p.id} className="text-xs space-y-0.5">
                  <div className="font-semibold">{p.name}</div>
                  <p className="text-zinc-800">{p.description}</p>
                  {p.technologies.length > 0 && (
                    <div className="text-[11px] text-zinc-600 font-medium">
                      Technologies: {p.technologies.join(", ")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <div className="space-y-1">
            <h2 className="text-xs font-bold uppercase tracking-wider border-b border-black pb-0.5">
              Certifications
            </h2>
            <p className="text-xs">
              {certifications.filter((c) => c.name).map((c) => `${c.name} (${c.issuer || "Self-issued"})`).join("; ")}
            </p>
          </div>
        )}
      </div>
    );
  }

  // Minimalist / Fresher Layout (Clean Sans, Left-aligned, Light formatting)
  return (
    <div className="font-sans text-xs text-zinc-700 space-y-4 leading-relaxed">
      {/* Left-Aligned Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-zinc-900">{contact.fullName || "Your Name"}</h1>
        <div className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-[11px] text-zinc-500">
          {contact.email && <span>{contact.email}</span>}
          {contact.phone && <span>· {contact.phone}</span>}
          {contact.location && <span>· {contact.location}</span>}
        </div>
        <div className="mt-0.5 flex flex-wrap gap-x-2 gap-y-0.5 text-[11px] text-zinc-400">
          {contact.linkedin && <span>{contact.linkedin}</span>}
          {contact.github && <span>· {contact.github}</span>}
          {contact.website && <span>· {contact.website}</span>}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className="space-y-1">
          <h2 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Summary</h2>
          <p className="leading-relaxed text-zinc-600">{summary}</p>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Experience</h2>
          <div className="space-y-2">
            {experience.map((exp) => (
              <div key={exp.id} className="space-y-0.5">
                <div className="flex justify-between font-semibold text-zinc-900">
                  <span>{exp.title}{exp.company ? ` - ${exp.company}` : ""}</span>
                  <span className="text-zinc-500 font-normal">{exp.startDate} — {exp.current ? "Present" : exp.endDate}</span>
                </div>
                {exp.bullets.length > 0 && (
                  <ul className="list-disc pl-4 text-zinc-500 space-y-0.5">
                    {exp.bullets.filter(Boolean).map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Education</h2>
          <div className="space-y-1.5">
            {education.map((edu) => (
              <div key={edu.id} className="flex justify-between text-zinc-900">
                <div>
                  <span className="font-semibold">{edu.institution}</span>
                  <span className="text-zinc-500"> - {edu.degree}{edu.field ? ` in ${edu.field}` : ""}</span>
                </div>
                <span className="text-zinc-500">{edu.startDate} — {edu.endDate}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="space-y-1">
          <h2 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Skills</h2>
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {skills.filter((s) => s.name).map((s) => (
              <span key={s.id} className="rounded bg-zinc-100 px-2 py-0.5 text-zinc-600">{s.name}</span>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Projects</h2>
          <div className="space-y-1.5">
            {projects.filter((p) => p.name).map((p) => (
              <div key={p.id} className="space-y-0.5 text-zinc-600">
                <span className="font-semibold text-zinc-900">{p.name}</span>
                <p className="leading-relaxed">{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <div className="space-y-1">
          <h2 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Certifications</h2>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-zinc-600">
            {certifications.filter((c) => c.name).map((c) => (
              <span key={c.id}>• {c.name} ({c.issuer || "Self"})</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}