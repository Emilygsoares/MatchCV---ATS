// Browser-only: extracts plain text from uploaded PDF or DOCX resumes.
// Libraries load lazily so they never run during SSR.

export const ACCEPTED_RESUME_TYPES = ".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
export const MAX_FILE_BYTES = 10 * 1024 * 1024;

function cleanup(text: string) {
  return text
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

async function extractPdf(buffer: ArrayBuffer): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  const { default: workerUrl } = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    let text = "";
    for (const item of content.items) {
      if ("str" in item) {
        text += item.str;
        text += item.hasEOL ? "\n" : " ";
      }
    }
    pages.push(text);
  }
  return pages.join("\n\n");
}

async function extractDocx(buffer: ArrayBuffer): Promise<string> {
  const mammoth = await import("mammoth/mammoth.browser.js");
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  return result.value;
}

export async function extractTextFromFile(file: File): Promise<string> {
  if (file.size > MAX_FILE_BYTES) throw new Error("O arquivo é maior que 10 MB.");
  const name = file.name.toLowerCase();
  const buffer = await file.arrayBuffer();
  let text: string;
  if (name.endsWith(".pdf") || file.type === "application/pdf") {
    text = await extractPdf(buffer);
  } else if (name.endsWith(".docx")) {
    text = await extractDocx(buffer);
  } else {
    throw new Error("Formato não suportado. Envie um arquivo PDF ou DOCX.");
  }
  const cleaned = cleanup(text);
  if (cleaned.length < 30) {
    throw new Error(
      "Não foi possível ler texto neste arquivo (pode ser uma imagem escaneada). Cole o texto do currículo manualmente.",
    );
  }
  return cleaned;
}
