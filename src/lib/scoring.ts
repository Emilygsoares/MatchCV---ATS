import type { AnalysisAi, DimensionKey } from "./matchcv-schema";

/** Weight of each dimension in the overall compatibility percentage (sums to 1). */
export const DIMENSION_WEIGHTS: Record<DimensionKey, number> = {
  technical: 0.35,
  experience: 0.25,
  requirements: 0.15,
  seniority: 0.15,
  education: 0.1,
};

export const DIMENSION_LABELS: Record<DimensionKey, string> = {
  technical: "Competências técnicas",
  experience: "Experiência profissional",
  education: "Formação acadêmica",
  seniority: "Senioridade",
  requirements: "Requisitos da vaga",
};

export function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function computeOverall(dimensions: AnalysisAi["dimensions"]): number {
  let total = 0;
  for (const key of Object.keys(DIMENSION_WEIGHTS) as DimensionKey[]) {
    total += clampScore(dimensions[key].score) * DIMENSION_WEIGHTS[key];
  }
  return clampScore(total);
}

export function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** True when the keyword appears literally (accent/case-insensitive, whole term) in the text. */
export function containsKeyword(normalizedHaystack: string, keyword: string): boolean {
  const kw = normalizeText(keyword);
  if (!kw) return false;
  const re = new RegExp(`(^|[^a-z0-9])${escapeRegExp(kw)}($|[^a-z0-9])`);
  return re.test(normalizedHaystack);
}

function dedupe(list: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of list) {
    const clean = item.trim();
    const key = normalizeText(clean);
    if (!clean || seen.has(key)) continue;
    seen.add(key);
    out.push(clean);
  }
  return out;
}

/**
 * Grounds the AI keyword lists in the actual resume text: a keyword only counts as
 * "found" when it literally appears in the resume; otherwise it is reported as missing.
 */
export function reconcileKeywords(
  resumeText: string,
  found: string[],
  missing: string[],
): { found: string[]; missing: string[] } {
  const haystack = normalizeText(resumeText);
  const all = dedupe([...found, ...missing]);
  const outFound: string[] = [];
  const outMissing: string[] = [];
  for (const kw of all) {
    (containsKeyword(haystack, kw) ? outFound : outMissing).push(kw);
  }
  return { found: outFound, missing: outMissing };
}

export function scoreTone(score: number): "high" | "mid" | "low" {
  if (score >= 75) return "high";
  if (score >= 50) return "mid";
  return "low";
}
