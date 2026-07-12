/**
 * ResumeIQ Resume Builder — structured data types.
 *
 * These types represent a fully structured resume that users can build
 * using the Resume Builder UI. The data can be exported to different
 * templates and used for PDF generation.
 */

export interface BuilderResume {
  id?: string;
  title: string;
  targetRole?: string;
  template: ResumeTemplate;
  contact: ContactInfo;
  summary: string;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: SkillEntry[];
  projects: ProjectEntry[];
  certifications: CertificationEntry[];
  links: LinkEntry[];
  languages: LanguageEntry[];
  sections: SectionConfig[];
  metadata: BuilderMetadata;
}

export type ResumeTemplate = "modern-professional" | "classic-ats" | "minimal-fresher" | "technical" | "executive";

export interface ContactInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  github?: string;
  website?: string;
}

export interface ExperienceEntry {
  id: string;
  company: string;
  title: string;
  location?: string;
  startDate: string;
  endDate?: string; // undefined = present
  current: boolean;
  bullets: string[];
}

export interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  field?: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  achievements?: string[];
}

export interface SkillEntry {
  id: string;
  name: string;
  category: "technical" | "soft" | "language" | "tool" | "other";
  level?: "beginner" | "intermediate" | "advanced" | "expert";
}

export interface ProjectEntry {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  url?: string;
  startDate?: string;
  endDate?: string;
  highlights?: string[];
}

export interface CertificationEntry {
  id: string;
  name: string;
  issuer: string;
  date?: string;
  url?: string;
  expires?: string;
}

export interface LinkEntry {
  id: string;
  label: string;
  url: string;
}

export interface LanguageEntry {
  id: string;
  language: string;
  proficiency: "native" | "fluent" | "advanced" | "intermediate" | "basic";
}

export interface SectionConfig {
  id: string;
  key: string;
  label: string;
  visible: boolean;
  order: number;
}

export interface BuilderMetadata {
  createdAt: string;
  updatedAt: string;
  version: number;
  autoSaved: boolean;
}

export function createEmptyResume(): BuilderResume {
  const now = new Date().toISOString();
  return {
    title: "Untitled Resume",
    template: "modern-professional",
    contact: {
      fullName: "",
      email: "",
      phone: "",
      location: "",
    },
    summary: "",
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    links: [],
    languages: [],
    sections: [
      { id: "summary", key: "summary", label: "Professional Summary", visible: true, order: 0 },
      { id: "experience", key: "experience", label: "Experience", visible: true, order: 1 },
      { id: "education", key: "education", label: "Education", visible: true, order: 2 },
      { id: "skills", key: "skills", label: "Skills", visible: true, order: 3 },
      { id: "projects", key: "projects", label: "Projects", visible: true, order: 4 },
      { id: "certifications", key: "certifications", label: "Certifications", visible: true, order: 5 },
      { id: "links", key: "links", label: "Links", visible: true, order: 6 },
      { id: "languages", key: "languages", label: "Languages", visible: true, order: 7 },
    ],
    metadata: {
      createdAt: now,
      updatedAt: now,
      version: 1,
      autoSaved: false,
    },
  };
}

export const TEMPLATE_LABELS: Record<ResumeTemplate, string> = {
  "modern-professional": "Modern Professional",
  "classic-ats": "Classic ATS-Safe",
  "minimal-fresher": "Minimal (Fresher)",
  "technical": "Technical / Project-Focused",
  "executive": "Executive / Experienced",
};