import { createServerFn } from "@tanstack/react-start";
import { z } from "zod/v4";

import {
  analysisAiSchema,
  resumeSchema,
  MAX_JOB_CHARS,
  MAX_RESUME_CHARS,
  MIN_TEXT_CHARS,
  type Analysis,
  type Resume,
  type ServerResult,
} from "./matchcv-schema";
import { computeOverall, clampScore, reconcileKeywords } from "./scoring";

const inputSchema = z.object({
  resumeText: z.string().trim().min(MIN_TEXT_CHARS).max(MAX_RESUME_CHARS),
  jobText: z.string().trim().min(MIN_TEXT_CHARS).max(MAX_JOB_CHARS),
});

const ANALYSIS_INSTRUCTIONS = `Você é um recrutador técnico sênior e especialista em sistemas ATS (Applicant Tracking System).
Compare o CURRÍCULO com a DESCRIÇÃO DA VAGA de forma rigorosa, honesta e baseada exclusivamente nos textos fornecidos.

Regras:
- Avalie cinco dimensões com nota inteira de 0 a 100 e uma justificativa curta (1–2 frases) em português:
  technical (competências técnicas/ferramentas), experience (experiência profissional relevante), education (formação acadêmica e certificações exigidas),
  seniority (nível de senioridade esperado x demonstrado), requirements (requisitos obrigatórios e desejáveis atendidos).
- Se a vaga não menciona formação, avalie education considerando apenas se o currículo é compatível com o nível da vaga (não penalize sem motivo).
- keywordsFound: termos-chave importantes da VAGA (tecnologias, ferramentas, metodologias, certificações, competências) que aparecem LITERALMENTE no currículo. Use a grafia como aparece na vaga. Até 25 itens.
- keywordsMissing: termos-chave importantes da vaga que NÃO aparecem no currículo. Até 25 itens. Termos curtos (1–4 palavras).
- matchingSkills: competências do candidato compatíveis com a vaga, cada uma com uma evidência curta retirada do currículo. Até 12 itens.
- unmetRequirements: requisitos da vaga que não foram identificados no currículo, com uma observação curta. Até 12 itens.
- jobTitle: título da vaga (ou um título curto inferido da descrição).
- verdict: parecer objetivo em 2–3 frases sobre a aderência.
- Nunca invente informações que não estejam nos textos. Responda em português brasileiro.`;

const GENERATION_INSTRUCTIONS = `Você é um especialista em currículos otimizados para ATS.
Reescreva o CURRÍCULO ORIGINAL para a VAGA informada, mantendo-se 100% fiel aos fatos do currículo original.

REGRAS ABSOLUTAS (nunca viole):
- NÃO invente experiências, empresas, cargos, datas, competências, ferramentas, resultados, números, métricas, formação, certificações, idiomas ou qualificações.
- Só use uma palavra-chave da vaga se o currículo original comprovar aquela competência ou experiência (mesmo que com outras palavras). Caso contrário, não a inclua.
- Não adicione métricas ou percentuais que não estejam no original.
- Preserve todas as experiências e formações do original (você pode reordenar bullets e dar mais destaque às relevantes).
- Dados de contato: copie exatamente do original; use string vazia quando não houver.

O QUE FAZER:
- summary: resumo profissional em um único parágrafo (3–5 frases) adaptado à vaga, usando apenas fatos do original.
- headline: título profissional curto alinhado à vaga e compatível com a trajetória real.
- experiences: em ordem cronológica inversa; bullets claros com verbo de ação, destacando o que é relevante para a vaga e incorporando termos da vaga de forma natural quando comprovados. 3–6 bullets por experiência quando houver conteúdo.
- skills: lista organizada de competências reais do candidato, priorizando as pedidas na vaga.
- education, certifications, languages: conforme o original.
- extraSections: outras seções relevantes do original (ex.: Projetos, Voluntariado, Prêmios, Publicações). Use [] se não houver.
- Use o mesmo idioma do currículo original (normalmente português brasileiro). Use string vazia ou [] para campos sem informação.`;

export const analyzeCompatibility = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => inputSchema.parse(input))
  .handler(async ({ data }): Promise<ServerResult<Analysis>> => {
    const { generateStructured } = await import("./ai-gateway.server");
    try {
      const ai = await generateStructured({
        schema: analysisAiSchema,
        instructions: ANALYSIS_INSTRUCTIONS,
        prompt: `CURRÍCULO:\n"""\n${data.resumeText}\n"""\n\nDESCRIÇÃO DA VAGA:\n"""\n${data.jobText}\n"""`,
        effort: "low",
      });
      for (const d of Object.values(ai.dimensions)) d.score = clampScore(d.score);
      const keywords = reconcileKeywords(data.resumeText, ai.keywordsFound, ai.keywordsMissing);
      return {
        ok: true,
        data: {
          ...ai,
          keywordsFound: keywords.found,
          keywordsMissing: keywords.missing,
          overall: computeOverall(ai.dimensions),
          analyzedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : "Erro inesperado." };
    }
  });

export const generateOptimizedResume = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    inputSchema.extend({ missingKeywords: z.array(z.string()).max(60) }).parse(input),
  )
  .handler(async ({ data }): Promise<ServerResult<Resume>> => {
    const { generateStructured } = await import("./ai-gateway.server");
    try {
      const resume = await generateStructured({
        schema: resumeSchema,
        instructions: GENERATION_INSTRUCTIONS,
        prompt: `CURRÍCULO ORIGINAL:\n"""\n${data.resumeText}\n"""\n\nDESCRIÇÃO DA VAGA:\n"""\n${data.jobText}\n"""\n\nPalavras-chave da vaga ausentes no currículo (use SOMENTE se o original comprovar a competência): ${
          data.missingKeywords.join(", ") || "nenhuma"
        }`,
        effort: "medium",
      });
      return { ok: true, data: resume };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : "Erro inesperado." };
    }
  });
