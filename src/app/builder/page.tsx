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
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

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

  const triggerPayment = () => {
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
      handler: function () {
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
  };

  const updateContact = useCallback((field: string, value: string) => {
    setResume((r) => ({ ...r, contact: { ...r.contact, [field]: value } }));
  }, []);

  const updateSummary = useCallback((value: string) => {
    setResume((r) => ({ ...r, summary: value }));
  }, []);

  const setTemplate = useCallback((template: ResumeTemplate) => {
    setResume((r) => ({ ...r, template }));
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
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Editor */}
            <div className="space-y-4">
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
                </TabsList>

                <TabsContent value="contact" className="space-y-4 pt-4">
                  <Card className="p-4 space-y-3">
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
                  <Card className="p-4">
                    <label className="mb-2 block text-sm font-medium">Professional Summary</label>
                    <textarea
                      className="min-h-[120px] w-full rounded-lg border border-input bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
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
                    <Card key={exp.id} className="p-4">
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
                        <div>
                          <label className="mb-1 block text-sm font-medium">Bullets</label>
                          {exp.bullets.map((bullet, i) => (
                            <div key={i} className="mb-2 flex items-start gap-2">
                              <textarea
                                className="min-h-[60px] flex-1 rounded-lg border border-input bg-background p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
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
                    <Card key={edu.id} className="p-4">
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
                  <Card className="p-4">
                    <div className="space-y-3">
                      {resume.skills.map((skill) => (
                        <div key={skill.id} className="flex items-center gap-2">
                          <input
                            className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Skill name"
                            value={skill.name}
                            onChange={(e) => updateSkill(skill.id, "name", e.target.value)}
                          />
                          <select
                            className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
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
                    <Card key={proj.id} className="p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm font-medium">{proj.name || "New Project"}</span>
                        <Button variant="ghost" size="sm" onClick={() => removeProject(proj.id)}>
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </div>
                      <div className="space-y-3">
                        <InputField label="Project Name" value={proj.name} onChange={(v) => updateProject(proj.id, "name", v)} />
                        <div>
                          <label className="mb-1 block text-sm font-medium">Description</label>
                          <textarea
                            className="min-h-[80px] w-full rounded-lg border border-input bg-background p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
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
                    <Card key={cert.id} className="p-4">
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

                <TabsContent value="template" className="pt-4">
                  <Card className="p-4">
                    <label className="mb-3 block text-sm font-medium">Resume Template</label>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {(Object.entries(TEMPLATE_LABELS) as [ResumeTemplate, string][]).map(([key, label]) => (
                        <button
                          key={key}
                          className={`rounded-lg border p-3 text-left text-sm transition-colors ${
                            resume.template === key
                              ? "border-primary bg-primary/10"
                              : "border-input hover:border-primary/40"
                          }`}
                          onClick={() => setTemplate(key)}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Preview */}
            <div className="hidden lg:block">
              <div className="sticky top-24">
                <div className="mb-3 flex items-center gap-2">
                  <Eye className="size-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Live Preview</span>
                  <Badge variant="secondary" className="ml-auto">{TEMPLATE_LABELS[resume.template]}</Badge>
                </div>
                <Card className="overflow-hidden">
                  <div className="max-h-[calc(100vh-200px)] overflow-y-auto p-6 print:p-0">
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
          <Card className="w-full max-w-md p-6 space-y-6 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Sparkles className="size-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight text-foreground">Sign In Required</h3>
              <p className="mt-2 text-sm text-muted-foreground text-center">
                Please sign in using Google/Gmail to secure your data and complete your export.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button variant="gradient" onClick={() => signIn("google")}>
                Sign In with Google
              </Button>
              <Button variant="ghost" onClick={() => setShowLoginModal(false)}>
                Cancel
              </Button>
            </div>
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
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      <input
        type={type}
        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function ResumePreview({ resume }: { resume: BuilderResume }) {
  const { template, contact, summary, experience, education, skills, projects, certifications } = resume;

  // Modern Professional Layout
  if (template === "modern-professional" || template === "executive") {
    return (
      <div className="font-sans text-sm text-slate-800 space-y-5 print:text-black">
        {/* Accent Header */}
        <div className="border-t-4 border-indigo-600 pt-4 text-center">
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
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 border-b pb-0.5">
              Professional Summary
            </h2>
            <p className="text-xs leading-relaxed text-slate-700 print:text-black">{summary}</p>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 border-b pb-0.5">
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
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 border-b pb-0.5">
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
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 border-b pb-0.5">
              Skills
            </h2>
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {skills.filter((s) => s.name).map((s) => (
                <span
                  key={s.id}
                  className="rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 px-2.5 py-0.5 text-xs font-medium print:bg-transparent print:border-slate-200 print:text-black"
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
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 border-b pb-0.5">
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
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 border-b pb-0.5">
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