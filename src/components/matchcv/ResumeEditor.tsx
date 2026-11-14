import { useId, useState } from "react";
import { FileDown, FileType2, Loader2, Plus, Trash2, PencilLine, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Resume } from "@/lib/matchcv-schema";
import { buildDocx, buildPdf, downloadBlob, resumeFileName, SECTION_TITLES } from "@/lib/resume-export";

const toLines = (arr: string[]) => arr.join("\n");
const fromLines = (s: string) => s.split("\n");

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const id = useId();
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </Label>
      <Input id={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="bg-muted/40" />
    </div>
  );
}

function Area({
  label,
  value,
  onChange,
  rows = 4,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  hint?: string;
}) {
  const id = useId();
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
        {hint && <span className="ml-1 font-normal opacity-80">· {hint}</span>}
      </Label>
      <Textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="resize-y bg-muted/40 text-sm leading-relaxed"
      />
    </div>
  );
}

function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <Card className="border-border/80 bg-card/70 shadow-card">
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 pb-4">
        <CardTitle className="text-base">{title}</CardTitle>
        {action}
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

export function ResumeEditor({ resume, onChange }: { resume: Resume; onChange: (r: Resume) => void }) {
  const [busy, setBusy] = useState<"docx" | "pdf" | null>(null);
  const set = <K extends keyof Resume>(key: K, value: Resume[K]) => onChange({ ...resume, [key]: value });

  async function download(kind: "docx" | "pdf") {
    setBusy(kind);
    try {
      const blob = kind === "docx" ? await buildDocx(resume) : await buildPdf(resume);
      downloadBlob(blob, resumeFileName(resume, kind));
      toast.success(kind === "docx" ? "DOCX gerado" : "PDF gerado", { description: "O download foi iniciado." });
    } catch (e) {
      console.error(e);
      toast.error("Não foi possível gerar o arquivo. Tente novamente.");
    } finally {
      setBusy(null);
    }
  }

  const updateExp = (i: number, patch: Partial<Resume["experiences"][number]>) =>
    set("experiences", resume.experiences.map((e, j) => (j === i ? { ...e, ...patch } : e)));
  const updateEdu = (i: number, patch: Partial<Resume["education"][number]>) =>
    set("education", resume.education.map((e, j) => (j === i ? { ...e, ...patch } : e)));
  const updateExtra = (i: number, patch: Partial<Resume["extraSections"][number]>) =>
    set("extraSections", resume.extraSections.map((e, j) => (j === i ? { ...e, ...patch } : e)));

  return (
    <section id="curriculo" className="scroll-mt-24 space-y-6">
      <div className="sticky top-16 z-20 -mx-4 border-y border-border/60 bg-background/85 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-xl sm:border">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <PencilLine className="size-5 text-primary" />
            <div>
              <p className="font-display font-semibold">Currículo otimizado</p>
              <p className="text-xs text-muted-foreground">Edite qualquer seção. As alterações ficam salvas neste navegador.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="glass" onClick={() => download("docx")} disabled={!!busy} className="flex-1 sm:flex-none">
              {busy === "docx" ? <Loader2 className="animate-spin" /> : <FileType2 />}
              Baixar DOCX
            </Button>
            <Button variant="hero" onClick={() => download("pdf")} disabled={!!busy} className="flex-1 sm:flex-none">
              {busy === "pdf" ? <Loader2 className="animate-spin" /> : <FileDown />}
              Baixar PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-2.5 rounded-xl border border-success/25 bg-success/5 p-4 text-sm">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" />
        <p className="text-muted-foreground">
          Revise o conteúdo antes de baixar. A versão gerada usa apenas informações do seu currículo original — confirme
          que tudo está correto.
        </p>
      </div>

      <Section title="Dados pessoais">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome completo" value={resume.fullName} onChange={(v) => set("fullName", v)} />
          <Field label="Título profissional" value={resume.headline} onChange={(v) => set("headline", v)} />
          <Field label="E-mail" value={resume.contact.email} onChange={(v) => set("contact", { ...resume.contact, email: v })} />
          <Field label="Telefone" value={resume.contact.phone} onChange={(v) => set("contact", { ...resume.contact, phone: v })} />
          <Field
            label="Localização"
            value={resume.contact.location}
            onChange={(v) => set("contact", { ...resume.contact, location: v })}
          />
          <Field
            label="LinkedIn"
            value={resume.contact.linkedin}
            onChange={(v) => set("contact", { ...resume.contact, linkedin: v })}
          />
          <div className="sm:col-span-2">
            <Field
              label="Outros (portfólio, GitHub…)"
              value={resume.contact.other}
              onChange={(v) => set("contact", { ...resume.contact, other: v })}
            />
          </div>
        </div>
      </Section>

      <Section title={SECTION_TITLES.summary}>
        <Area label="Resumo" value={resume.summary} onChange={(v) => set("summary", v)} rows={5} />
      </Section>

      <Section
        title={SECTION_TITLES.experience}
        action={
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              set("experiences", [...resume.experiences, { role: "", company: "", location: "", period: "", bullets: [] }])
            }
          >
            <Plus /> Adicionar
          </Button>
        }
      >
        {resume.experiences.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma experiência.</p>}
        {resume.experiences.map((e, i) => (
          <div key={i} className="space-y-4 rounded-xl border border-border/70 bg-background/40 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Experiência {i + 1}</span>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Remover experiência"
                onClick={() => set("experiences", resume.experiences.filter((_, j) => j !== i))}
              >
                <Trash2 />
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Cargo" value={e.role} onChange={(v) => updateExp(i, { role: v })} />
              <Field label="Empresa" value={e.company} onChange={(v) => updateExp(i, { company: v })} />
              <Field label="Local" value={e.location} onChange={(v) => updateExp(i, { location: v })} />
              <Field label="Período" value={e.period} onChange={(v) => updateExp(i, { period: v })} placeholder="Ex.: Jan 2021 – Atual" />
            </div>
            <Area
              label="Atividades e resultados"
              hint="um item por linha"
              value={toLines(e.bullets)}
              onChange={(v) => updateExp(i, { bullets: fromLines(v) })}
              rows={5}
            />
          </div>
        ))}
      </Section>

      <Section
        title={SECTION_TITLES.education}
        action={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => set("education", [...resume.education, { degree: "", institution: "", period: "", details: "" }])}
          >
            <Plus /> Adicionar
          </Button>
        }
      >
        {resume.education.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma formação.</p>}
        {resume.education.map((ed, i) => (
          <div key={i} className="space-y-4 rounded-xl border border-border/70 bg-background/40 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Formação {i + 1}</span>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Remover formação"
                onClick={() => set("education", resume.education.filter((_, j) => j !== i))}
              >
                <Trash2 />
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Curso / grau" value={ed.degree} onChange={(v) => updateEdu(i, { degree: v })} />
              <Field label="Instituição" value={ed.institution} onChange={(v) => updateEdu(i, { institution: v })} />
              <Field label="Período" value={ed.period} onChange={(v) => updateEdu(i, { period: v })} />
              <Field label="Detalhes" value={ed.details} onChange={(v) => updateEdu(i, { details: v })} />
            </div>
          </div>
        ))}
      </Section>

      <div className="grid gap-6 lg:grid-cols-3">
        <Section title={SECTION_TITLES.skills}>
          <Area
            label="Competências"
            hint="uma por linha"
            value={toLines(resume.skills)}
            onChange={(v) => set("skills", fromLines(v))}
            rows={8}
          />
        </Section>
        <Section title={SECTION_TITLES.certifications}>
          <Area
            label="Certificações"
            hint="uma por linha"
            value={toLines(resume.certifications)}
            onChange={(v) => set("certifications", fromLines(v))}
            rows={8}
          />
        </Section>
        <Section title={SECTION_TITLES.languages}>
          <Area
            label="Idiomas"
            hint="um por linha"
            value={toLines(resume.languages)}
            onChange={(v) => set("languages", fromLines(v))}
            rows={8}
          />
        </Section>
      </div>

      <Section
        title="Outras seções"
        action={
          <Button variant="ghost" size="sm" onClick={() => set("extraSections", [...resume.extraSections, { title: "", items: [] }])}>
            <Plus /> Adicionar
          </Button>
        }
      >
        {resume.extraSections.length === 0 && (
          <CardDescription>Projetos, voluntariado, prêmios ou outras informações do seu currículo.</CardDescription>
        )}
        {resume.extraSections.map((s, i) => (
          <div key={i} className="space-y-4 rounded-xl border border-border/70 bg-background/40 p-4">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Field label="Título da seção" value={s.title} onChange={(v) => updateExtra(i, { title: v })} />
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Remover seção"
                onClick={() => set("extraSections", resume.extraSections.filter((_, j) => j !== i))}
              >
                <Trash2 />
              </Button>
            </div>
            <Area
              label="Itens"
              hint="um por linha"
              value={toLines(s.items)}
              onChange={(v) => updateExtra(i, { items: fromLines(v) })}
              rows={4}
            />
          </div>
        ))}
      </Section>
    </section>
  );
}
