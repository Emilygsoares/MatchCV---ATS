// Server-only: Lovable AI Gateway (OpenAI Responses) structured-output helper.
import { createOpenAI } from "@ai-sdk/openai";
import { APICallError, NoObjectGeneratedError, Output, streamText } from "ai";
import type { z } from "zod/v4";

const GATEWAY_BASE_URL = "https://ai.gateway.lovable.dev/v1";
const MODEL = "openai/gpt-6-astra";
const RUN_ID_HEADER = "X-Lovable-AIG-Run-ID";

function createRunIdFetch() {
  let runId: string | undefined;
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const headers = new Headers(init?.headers);
    if (runId && !headers.has(RUN_ID_HEADER)) headers.set(RUN_ID_HEADER, runId);
    const response = await fetch(input, { ...init, headers });
    runId ??= response.headers.get(RUN_ID_HEADER)?.trim() || undefined;
    return response;
  };
}

export class AiError extends Error {}

function friendlyMessage(error: unknown): string {
  const status = APICallError.isInstance(error) ? error.statusCode : undefined;
  if (status === 429) return "Muitas solicitações no momento. Aguarde alguns segundos e tente novamente.";
  if (status === 402 || status === 403)
    return "O serviço de IA atingiu o limite de uso disponível. Tente novamente mais tarde.";
  if (status === 400) return "Os textos enviados não puderam ser processados. Revise o conteúdo e tente novamente.";
  if (status && status >= 500) return "O serviço de IA está instável no momento. Tente novamente em instantes.";
  if (NoObjectGeneratedError.isInstance(error))
    return "A IA não retornou um resultado válido. Tente novamente.";
  return "Não foi possível concluir a solicitação. Tente novamente.";
}

export async function generateStructured<T>(opts: {
  schema: z.ZodType<T>;
  instructions: string;
  prompt: string;
  effort: "low" | "medium";
}): Promise<T> {
  const apiKey = process.env['LOVABLE_API_KEY'];
  if (!apiKey) throw new AiError("Configuração do serviço de IA ausente.");

  const provider = createOpenAI({
    baseURL: GATEWAY_BASE_URL,
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: createRunIdFetch(),
  });

  let streamError: unknown;
  const result = streamText({
    model: provider.responses(MODEL),
    instructions: opts.instructions,
    messages: [{ role: "user", content: opts.prompt }],
    output: Output.object({ schema: opts.schema }),
    onError: ({ error }) => {
      streamError = error;
    },
    providerOptions: {
      openai: {
        forceReasoning: true,
        reasoningEffort: opts.effort,
        reasoningSummary: "auto",
        store: false,
        include: ["reasoning.encrypted_content"],
      },
    },
  });

  try {
    const output = await result.output;
    if (!output) throw new AiError("A IA não retornou um resultado válido. Tente novamente.");
    return output as T;
  } catch (error) {
    const root = streamError ?? error;
    console.error("[ai-gateway]", root);
    if (root instanceof AiError) throw root;
    throw new AiError(friendlyMessage(root));
  }
}
