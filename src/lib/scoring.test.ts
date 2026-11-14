import { describe, expect, it } from "vitest";
import { computeOverall, reconcileKeywords, DIMENSION_WEIGHTS } from "./scoring";

const dims = (t: number, e: number, ed: number, s: number, r: number) => ({
  technical: { score: t, rationale: "" },
  experience: { score: e, rationale: "" },
  education: { score: ed, rationale: "" },
  seniority: { score: s, rationale: "" },
  requirements: { score: r, rationale: "" },
});

describe("compatibility score", () => {
  it("weights sum to 100%", () => {
    const sum = Object.values(DIMENSION_WEIGHTS).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1);
  });

  it("combines the five dimensions with their weights", () => {
    // 80*.35 + 60*.25 + 100*.10 + 50*.15 + 40*.15 = 28 + 15 + 10 + 7.5 + 6 = 66.5 → 67
    expect(computeOverall(dims(80, 60, 100, 50, 40))).toBe(67);
  });

  it("clamps out-of-range scores", () => {
    expect(computeOverall(dims(150, 150, 150, 150, 150))).toBe(100);
    expect(computeOverall(dims(-10, -10, -10, -10, -10))).toBe(0);
  });
});

describe("keyword grounding", () => {
  const resume = "Desenvolvedor com experiência em React, Node.js e Gestão de Projetos.";

  it("moves a 'found' keyword that is not in the resume to missing", () => {
    const r = reconcileKeywords(resume, ["React", "Kubernetes"], []);
    expect(r.found).toEqual(["React"]);
    expect(r.missing).toEqual(["Kubernetes"]);
  });

  it("moves a 'missing' keyword that is in the resume to found, ignoring accents and case", () => {
    const r = reconcileKeywords(resume, [], ["gestao de projetos"]);
    expect(r.found).toEqual(["gestao de projetos"]);
    expect(r.missing).toEqual([]);
  });

  it("does not match partial words", () => {
    const r = reconcileKeywords(resume, ["Reac"], []);
    expect(r.found).toEqual([]);
  });
});
