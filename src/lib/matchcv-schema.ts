// Client-safe schemas and types shared by the server functions and the UI.
import { z } from "zod/v4";

const dimension = z.object({
  score: z.number(),
  rationale: z.string(),
});

export const analysisAiSchema = z.object({
  jobTitle: z.string(),
  verdict: z.string(),
  dimensions: z.object({
    technical: dimension,
    experience: dimension,
    education: dimension,
    seniority: dimension,
    requirements: dimension,
  }),
  keywordsFound: z.array(z.string()),
  keywordsMissing: z.array(z.string()),
  matchingSkills: z.array(z.object({ skill: z.string(), evidence: z.string() })),
  unmetRequirements: z.array(z.object({ requirement: z.string(), note: z.string() })),
});

export type AnalysisAi = z.infer<typeof analysisAiSchema>;
export type DimensionKey = keyof AnalysisAi["dimensions"];

export type Analysis = AnalysisAi & { overall: number; analyzedAt: string };

export const resumeSchema = z.object({
  fullName: z.string(),
  headline: z.string(),
  contact: z.object({
    email: z.string(),
    phone: z.string(),
    location: z.string(),
    linkedin: z.string(),
    other: z.string(),
  }),
  summary: z.string(),
  experiences: z.array(
    z.object({
      role: z.string(),
      company: z.string(),
      location: z.string(),
      period: z.string(),
      bullets: z.array(z.string()),
    }),
  ),
  education: z.array(
    z.object({
      degree: z.string(),
      institution: z.string(),
      period: z.string(),
      details: z.string(),
    }),
  ),
  skills: z.array(z.string()),
  certifications: z.array(z.string()),
  languages: z.array(z.string()),
  extraSections: z.array(z.object({ title: z.string(), items: z.array(z.string()) })),
});

export type Resume = z.infer<typeof resumeSchema>;

export const MAX_RESUME_CHARS = 40000;
export const MAX_JOB_CHARS = 25000;
export const MIN_TEXT_CHARS = 80;

export type ServerResult<T> = { ok: true; data: T } | { ok: false; error: string };
