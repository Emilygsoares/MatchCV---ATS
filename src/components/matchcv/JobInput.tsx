import { Briefcase } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { MAX_JOB_CHARS } from "@/lib/matchcv-schema";

export function JobInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <Card className="flex h-full flex-col border-border/80 bg-card/70 shadow-card backdrop-blur">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-lg bg-gradient-brand-soft text-primary-foreground ring-1 ring-brand-blue/30">
            <Briefcase className="size-4" />
          </span>
          <div>
            <CardTitle className="text-lg">Descrição da vaga</CardTitle>
            <CardDescription>Cole a descrição completa da oportunidade.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-2">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, MAX_JOB_CHARS))}
          placeholder="Título da vaga, responsabilidades, requisitos obrigatórios e desejáveis, formação, tecnologias…"
          className="min-h-[300px] flex-1 resize-y bg-muted/40 text-sm leading-relaxed"
          aria-label="Descrição da vaga"
        />
        <p className="text-right text-xs text-muted-foreground">
          {value.length.toLocaleString("pt-BR")} / {MAX_JOB_CHARS.toLocaleString("pt-BR")} caracteres
        </p>
      </CardContent>
    </Card>
  );
}
