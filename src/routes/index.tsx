import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { GitCompareArrows, Loader2, RotateCcw, ScanSearch, ShieldCheck, Zap, FileCheck2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ResumeInput } from "@/components/matchcv/ResumeInput";
import { JobInput } from "@/components/matchcv/JobInput";
import { AnalysisDashboard } from "@/components/matchcv/AnalysisDashboard";
import { ResumeEditor } from "@/components/matchcv/ResumeEditor";
import { analyzeCompatibility, generateOptimizedResume } from "@/lib/matchcv.functions";
import { MIN_TEXT_CHARS, type Analysis, type Resume } from "@/lib/matchcv-schema";
import { clearLocalState, useLocalState } from "@/lib/use-local-state";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MatchCV — Análise de compatibilidade e currículo ATS" },
      {
        name: "description",
        content:
          "Envie seu currículo, cole a vaga e veja sua porcentagem de match, palavras-chave ausentes e um currículo ATS otimizado para baixar em DOCX ou PDF.",
      },
      { property: "og:title", content: "MatchCV — Seu currículo no match certo com a vaga" },
      {
        property: "og:description",
        content: "Compare currículo e vaga, descubra palavras-chave ausentes e gere um currículo otimizado para ATS.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function scrollTo(id: string) {
  setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
}

function Index() {
  const [resumeText, setResumeText] = useLocalState("resumeText", "");
  const [fileName, setFileName] = useLocalState<string | null>("fileName", null);
  const [jobText, setJobText] = useLocalState("jobText", "");
  const [analysis, setAnalysis] = useLocalState<Analysis | null>("analysis", null);
  const [analyzedInputs, setAnalyzedInputs] = useLocalState<{ r: string; j: string } | null>("analyzedInputs", null);
  const [resume, setResume] = useLocalState<Resume | null>("resume", null);
  const [analyzing, setAnalyzing] = useState(false);
  const [generating, setGenerating] = useState(false);

  const analyzeFn = useServerFn(analyzeCompatibility);
  const generateFn = useServerFn(generateOptimizedResume);

  const stale = !!analysis && !!analyzedInputs && (analyzedInputs.r !== resumeText || analyzedInputs.j !== jobText);

  function validate() {
    if (resumeText.trim().length < MIN_TEXT_CHARS) {
      toast.error("Adicione seu currículo", {
        description: "Envie um PDF/DOCX ou cole o texto completo do currículo.",
      });
      return false;
    }
    if (jobText.trim().length < MIN_TEXT_CHARS) {
      toast.error("Adicione a descrição da vaga", { description: "Cole a descrição completa da oportunidade." });
      return false;
    }
    return true;
  }

  async function handleAnalyze() {
    if (!validate()) return;
    setAnalyzing(true);
    try {
      const res = await analyzeFn({ data: { resumeText, jobText } });
      if (!res.ok) {
        toast.error("Não foi possível analisar", { description: res.error });
        return;
      }
      setAnalysis(res.data);
      setAnalyzedInputs({ r: resumeText, j: jobText });
      setResume(null);
      scrollTo("resultado");
    } catch (e) {
      console.error(e);
      toast.error("Não foi possível analisar", { description: "Verifique sua conexão e tente novamente." });
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleGenerate() {
    if (!validate()) return;
    setGenerating(true);
    try {
      const res = await generateFn({
        data: { resumeText, jobText, missingKeywords: analysis?.keywordsMissing.slice(0, 60) ?? [] },
      });
      if (!res.ok) {
        toast.error("Não foi possível gerar o currículo", { description: res.error });
        return;
      }
      setResume(res.data);
      toast.success("Currículo otimizado gerado", { description: "Revise, edite e baixe em DOCX ou PDF." });
      scrollTo("curriculo");
    } catch (e) {
      console.error(e);
      toast.error("Não foi possível gerar o currículo", { description: "Verifique sua conexão e tente novamente." });
    } finally {
      setGenerating(false);
    }
  }

  function handleReset() {
    clearLocalState();
    setResumeText("");
    setFileName(null);
    setJobText("");
    setAnalysis(null);
    setAnalyzedInputs(null);
    setResume(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
    toast.success("Dados apagados deste navegador.");
  }

  const hasData = !!(resumeText || jobText || analysis || resume);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[640px] bg-glow" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[640px] bg-grid" />

      <header className="sticky top-0 z-30 h-16 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4">
          <a href="/" className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-lg bg-gradient-brand shadow-brand">
              <GitCompareArrows className="size-4 text-primary-foreground" />
            </span>
            <span className="font-display text-lg font-bold tracking-tight">
              Match<span className="text-gradient-brand">CV</span>
            </span>
          </a>
          {hasData && (
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <RotateCcw /> Limpar dados
            </Button>
          )}
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl space-y-14 px-4 pb-24 pt-12 sm:pt-16">
        <section className="mx-auto max-w-3xl text-center">
          <Badge variant="brand" className="mb-5 gap-1.5 rounded-full px-3 py-1">
            <Zap className="size-3.5" /> Sem cadastro · Análise com IA · Gratuito
          </Badge>
          <h1 className="text-4xl font-bold leading-[1.08] sm:text-5xl md:text-6xl">
            Seu currículo no <span className="text-gradient-brand">match certo</span> com a vaga
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Descubra sua compatibilidade, as palavras-chave que faltam e gere um currículo otimizado para ATS — pronto
            para baixar em DOCX ou PDF.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <ScanSearch className="size-4 text-primary" /> Análise por critérios
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-primary" /> Nada inventado
            </span>
            <span className="flex items-center gap-1.5">
              <FileCheck2 className="size-4 text-primary" /> Formato ATS
            </span>
          </div>
        </section>

        <section className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <ResumeInput value={resumeText} onChange={setResumeText} fileName={fileName} onFileName={setFileName} />
            <JobInput value={jobText} onChange={setJobText} />
          </div>
          <div className="flex flex-col items-center gap-3">
            <Button variant="hero" size="xl" onClick={handleAnalyze} disabled={analyzing} className="w-full sm:w-auto sm:min-w-72">
              {analyzing ? <Loader2 className="animate-spin" /> : <ScanSearch />}
              {analyzing ? "Analisando compatibilidade…" : "Analisar compatibilidade"}
            </Button>
            <p className="text-xs text-muted-foreground">
              Seus textos ficam salvos apenas neste navegador e são enviados somente para a análise.
            </p>
          </div>
        </section>

        {analysis && (
          <AnalysisDashboard analysis={analysis} stale={stale} generating={generating} onGenerate={handleGenerate} />
        )}

        {resume && <ResumeEditor resume={resume} onChange={setResume} />}
      </main>

      <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        MatchCV · Baixe seus documentos antes de sair — os dados ficam apenas temporariamente neste navegador.
      </footer>
    </div>
  );
}
