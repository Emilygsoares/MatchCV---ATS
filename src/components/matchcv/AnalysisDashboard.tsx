import { useId } from "react";
import {
  CheckCircle2,
  CircleAlert,
  KeyRound,
  SearchX,
  Sparkles,
  Target,
  Wand2,
  Loader2,
  Award,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { Analysis, DimensionKey } from "@/lib/matchcv-schema";
import { DIMENSION_LABELS, DIMENSION_WEIGHTS, scoreTone } from "@/lib/scoring";

const TONE_TEXT = { high: "text-success", mid: "text-warning", low: "text-destructive" } as const;
const TONE_LABEL = { high: "Alta compatibilidade", mid: "Compatibilidade moderada", low: "Baixa compatibilidade" } as const;
const TONE_BAR = { high: "bg-gradient-brand", mid: "bg-gradient-brand", low: "bg-destructive" } as const;

function ScoreRing({ value }: { value: number }) {
  const id = useId();
  const r = 70;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative size-44">
      <svg viewBox="0 0 160 160" className="size-full -rotate-90">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" style={{ stopColor: "var(--primary)" }} />
            <stop offset="100%" style={{ stopColor: "var(--brand-blue)" }} />
          </linearGradient>
        </defs>
        <circle cx="80" cy="80" r={r} fill="none" className="stroke-muted" strokeWidth="12" />
        <circle
          cx="80"
          cy="80"
          r={r}
          fill="none"
          stroke={`url(#${id})`}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * value) / 100}
          className="transition-[stroke-dashoffset] duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-5xl font-bold tracking-tight">{value}%</span>
        <span className="text-xs uppercase tracking-widest text-muted-foreground">match</span>
      </div>
    </div>
  );
}

function SectionCard({
  icon: Icon,
  title,
  description,
  count,
  children,
  tone,
}: {
  icon: typeof Target;
  title: string;
  description: string;
  count: number;
  children: React.ReactNode;
  tone: "success" | "warning";
}) {
  return (
    <Card className="border-border/80 bg-card/70 shadow-card">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "grid size-9 place-items-center rounded-lg ring-1",
                tone === "success" ? "bg-success/10 text-success ring-success/30" : "bg-warning/10 text-warning ring-warning/30",
              )}
            >
              <Icon className="size-4" />
            </span>
            <div>
              <CardTitle className="text-base">{title}</CardTitle>
              <CardDescription className="text-xs">{description}</CardDescription>
            </div>
          </div>
          <span className={cn("font-display text-2xl font-semibold", tone === "success" ? "text-success" : "text-warning")}>
            {count}
          </span>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="text-sm text-muted-foreground">{text}</p>;
}

type Props = {
  analysis: Analysis;
  stale: boolean;
  generating: boolean;
  onGenerate: () => void;
};

export function AnalysisDashboard({ analysis, stale, generating, onGenerate }: Props) {
  const tone = scoreTone(analysis.overall);
  const dims = Object.keys(DIMENSION_WEIGHTS) as DimensionKey[];

  return (
    <section id="resultado" className="scroll-mt-24 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-primary">Resultado da análise</p>
          <h2 className="text-2xl font-semibold sm:text-3xl">{analysis.jobTitle || "Compatibilidade com a vaga"}</h2>
        </div>
        {stale && (
          <Badge variant="warning" className="gap-1.5 py-1">
            <CircleAlert className="size-3.5" /> Textos alterados — analise novamente para atualizar
          </Badge>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="relative overflow-hidden border-primary/30 bg-card/80 shadow-card lg:col-span-2">
          <div className="pointer-events-none absolute inset-0 bg-glow opacity-80" />
          <CardContent className="relative flex flex-col items-center gap-5 p-6 text-center">
            <ScoreRing value={analysis.overall} />
            <div className="space-y-2">
              <p className={cn("font-display text-lg font-semibold", TONE_TEXT[tone])}>{TONE_LABEL[tone]}</p>
              <p className="text-sm leading-relaxed text-muted-foreground">{analysis.verdict}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/70 shadow-card lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="size-4 text-primary" /> Critérios avaliados
            </CardTitle>
            <CardDescription className="text-xs">
              A porcentagem final é a média ponderada destes critérios.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {dims.map((k) => {
              const d = analysis.dimensions[k];
              const t = scoreTone(d.score);
              return (
                <div key={k} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium">
                      {DIMENSION_LABELS[k]}{" "}
                      <span className="text-xs font-normal text-muted-foreground">
                        · peso {Math.round(DIMENSION_WEIGHTS[k] * 100)}%
                      </span>
                    </span>
                    <span className={cn("font-display font-semibold", TONE_TEXT[t])}>{d.score}%</span>
                  </div>
                  <Progress value={d.score} className="h-2 bg-muted" indicatorClassName={TONE_BAR[t]} />
                  <p className="text-xs leading-relaxed text-muted-foreground">{d.rationale}</p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <SectionCard
          icon={KeyRound}
          title="Palavras-chave encontradas"
          description="Termos da vaga presentes no seu currículo"
          count={analysis.keywordsFound.length}
          tone="success"
        >
          {analysis.keywordsFound.length ? (
            <div className="flex flex-wrap gap-2">
              {analysis.keywordsFound.map((k) => (
                <Badge key={k} variant="success">
                  {k}
                </Badge>
              ))}
            </div>
          ) : (
            <Empty text="Nenhuma palavra-chave da vaga foi encontrada literalmente no currículo." />
          )}
        </SectionCard>

        <SectionCard
          icon={SearchX}
          title="Palavras-chave ausentes"
          description="Termos da vaga que não aparecem no currículo"
          count={analysis.keywordsMissing.length}
          tone="warning"
        >
          {analysis.keywordsMissing.length ? (
            <div className="flex flex-wrap gap-2">
              {analysis.keywordsMissing.map((k) => (
                <Badge key={k} variant="warning">
                  {k}
                </Badge>
              ))}
            </div>
          ) : (
            <Empty text="Todas as palavras-chave identificadas já constam no currículo." />
          )}
        </SectionCard>

        <SectionCard
          icon={Award}
          title="Competências compatíveis"
          description="Com evidência encontrada no currículo"
          count={analysis.matchingSkills.length}
          tone="success"
        >
          {analysis.matchingSkills.length ? (
            <ul className="space-y-3">
              {analysis.matchingSkills.map((s, i) => (
                <li key={i} className="flex gap-2.5 text-sm">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                  <span>
                    <span className="font-medium">{s.skill}</span>
                    {s.evidence && <span className="block text-xs text-muted-foreground">{s.evidence}</span>}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty text="Nenhuma competência compatível identificada." />
          )}
        </SectionCard>

        <SectionCard
          icon={CircleAlert}
          title="Requisitos não identificados"
          description="Pedidos pela vaga e não encontrados no currículo"
          count={analysis.unmetRequirements.length}
          tone="warning"
        >
          {analysis.unmetRequirements.length ? (
            <ul className="space-y-3">
              {analysis.unmetRequirements.map((s, i) => (
                <li key={i} className="flex gap-2.5 text-sm">
                  <CircleAlert className="mt-0.5 size-4 shrink-0 text-warning" />
                  <span>
                    <span className="font-medium">{s.requirement}</span>
                    {s.note && <span className="block text-xs text-muted-foreground">{s.note}</span>}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty text="Todos os requisitos da vaga foram identificados no currículo." />
          )}
        </SectionCard>
      </div>

      <Card className="relative overflow-hidden border-primary/30 bg-gradient-brand-soft">
        <CardContent className="flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-1 size-5 shrink-0 text-primary" />
            <div>
              <p className="font-display text-lg font-semibold">Gerar currículo otimizado para esta vaga</p>
              <p className="text-sm text-muted-foreground">
                Reescrevemos resumo, experiências e competências usando apenas informações reais do seu currículo.
              </p>
            </div>
          </div>
          <Button variant="hero" size="xl" onClick={onGenerate} disabled={generating} className="w-full sm:w-auto">
            {generating ? <Loader2 className="animate-spin" /> : <Wand2 />}
            {generating ? "Gerando currículo…" : "Gerar currículo otimizado"}
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
