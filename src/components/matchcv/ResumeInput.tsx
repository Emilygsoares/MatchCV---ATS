import { useRef, useState } from "react";
import { FileText, FileUp, Loader2, X, ClipboardPaste, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ACCEPTED_RESUME_TYPES, extractTextFromFile } from "@/lib/file-extract";
import { MAX_RESUME_CHARS } from "@/lib/matchcv-schema";

type Props = {
  value: string;
  onChange: (v: string) => void;
  fileName: string | null;
  onFileName: (v: string | null) => void;
};

export function ResumeInput({ value, onChange, fileName, onFileName }: Props) {
  const [tab, setTab] = useState<"upload" | "text">("upload");
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setLoading(true);
    try {
      const text = await extractTextFromFile(file);
      onChange(text.slice(0, MAX_RESUME_CHARS));
      onFileName(file.name);
      toast.success("Currículo carregado", { description: "Confira o texto extraído na aba “Colar texto”." });
    } catch (e) {
      toast.error("Não foi possível ler o arquivo", {
        description: e instanceof Error ? e.message : "Tente outro arquivo ou cole o texto.",
      });
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <Card className="flex h-full flex-col border-border/80 bg-card/70 shadow-card backdrop-blur">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-lg bg-gradient-brand-soft text-primary-foreground ring-1 ring-primary/30">
            <FileText className="size-4" />
          </span>
          <div>
            <CardTitle className="text-lg">Meu currículo</CardTitle>
            <CardDescription>Envie um PDF ou DOCX, ou cole o texto.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        <Tabs value={tab} onValueChange={(v) => setTab(v as "upload" | "text")} className="flex flex-1 flex-col">
          <TabsList className="grid w-full grid-cols-2 bg-muted">
            <TabsTrigger value="upload" className="gap-2">
              <FileUp className="size-4" /> Enviar arquivo
            </TabsTrigger>
            <TabsTrigger value="text" className="gap-2">
              <ClipboardPaste className="size-4" /> Colar texto
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-4 flex flex-1 flex-col gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                void handleFile(e.dataTransfer.files?.[0]);
              }}
              disabled={loading}
              className={cn(
                "group flex min-h-[240px] flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-input bg-muted/40 p-6 text-center transition-colors hover:border-primary/60 hover:bg-primary/5",
                dragging && "border-primary bg-primary/10",
              )}
            >
              {loading ? (
                <Loader2 className="size-8 animate-spin text-primary" />
              ) : (
                <span className="grid size-12 place-items-center rounded-full bg-gradient-brand shadow-brand">
                  <FileUp className="size-5 text-primary-foreground" />
                </span>
              )}
              <div>
                <p className="font-medium">{loading ? "Lendo arquivo…" : "Arraste seu currículo aqui"}</p>
                <p className="text-sm text-muted-foreground">ou clique para selecionar · PDF ou DOCX até 10 MB</p>
              </div>
            </button>
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED_RESUME_TYPES}
              className="sr-only"
              aria-label="Selecionar arquivo do currículo"
              onChange={(e) => void handleFile(e.target.files?.[0])}
            />
            {fileName && value && (
              <div className="flex items-center justify-between gap-3 rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm">
                <span className="flex min-w-0 items-center gap-2 text-success">
                  <CheckCircle2 className="size-4 shrink-0" />
                  <span className="truncate">{fileName}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => setTab("text")}>
                    Ver texto
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Remover arquivo"
                    onClick={() => {
                      onFileName(null);
                      onChange("");
                    }}
                  >
                    <X />
                  </Button>
                </span>
              </div>
            )}
          </TabsContent>

          <TabsContent value="text" className="mt-4 flex flex-1 flex-col gap-2">
            <Textarea
              value={value}
              onChange={(e) => onChange(e.target.value.slice(0, MAX_RESUME_CHARS))}
              placeholder="Cole aqui o conteúdo completo do seu currículo: dados de contato, resumo, experiências, formação, competências…"
              className="min-h-[240px] flex-1 resize-y bg-muted/40 text-sm leading-relaxed"
              aria-label="Texto do currículo"
            />
            <p className="text-right text-xs text-muted-foreground">
              {value.length.toLocaleString("pt-BR")} / {MAX_RESUME_CHARS.toLocaleString("pt-BR")} caracteres
            </p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
