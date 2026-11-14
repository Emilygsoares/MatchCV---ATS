// Browser-only: builds real, ATS-friendly DOCX and PDF files from the edited resume.
import type { Resume } from "./matchcv-schema";

export const SECTION_TITLES = {
  summary: "Resumo Profissional",
  experience: "Experiência Profissional",
  education: "Formação Acadêmica",
  skills: "Competências",
  certifications: "Certificações",
  languages: "Idiomas",
};

const nonEmpty = (s: string | undefined | null) => !!s && s.trim().length > 0;

export function contactLine(r: Resume): string {
  const c = r.contact;
  return [c.email, c.phone, c.location, c.linkedin, c.other].filter(nonEmpty).map((s) => s.trim()).join(" | ");
}

export function resumeFileName(r: Resume, ext: "docx" | "pdf") {
  const base = (r.fullName || "curriculo")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
  return `curriculo-${base || "otimizado"}.${ext}`;
}

function experienceMeta(e: Resume["experiences"][number]) {
  return [e.company, e.location, e.period].filter(nonEmpty).join(" | ");
}

function educationLine(ed: Resume["education"][number]) {
  return [ed.institution, ed.period].filter(nonEmpty).join(" | ");
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

/* ------------------------------- DOCX ------------------------------- */

export async function buildDocx(r: Resume): Promise<Blob> {
  const { Document, Packer, Paragraph, TextRun, AlignmentType, LevelFormat, BorderStyle } = await import("docx");

  const FONT = "Calibri";
  const heading = (text: string) =>
    new Paragraph({
      spacing: { before: 240, after: 100 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "6D28D9", space: 2 } },
      children: [new TextRun({ text: text.toUpperCase(), bold: true, size: 24, font: FONT })],
    });
  const para = (text: string, opts: { bold?: boolean; italics?: boolean; after?: number } = {}) =>
    new Paragraph({
      spacing: { after: opts.after ?? 60 },
      children: [new TextRun({ text, bold: !!opts.bold, italics: !!opts.italics, font: FONT, size: 21 })],
    });
  const bullet = (text: string) =>
    new Paragraph({
      numbering: { reference: "bullets", level: 0 },
      spacing: { after: 40 },
      children: [new TextRun({ text, font: FONT, size: 21 })],
    });

  const children: InstanceType<typeof Paragraph>[] = [];
  children.push(
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { after: 40 },
      children: [new TextRun({ text: r.fullName || "Seu Nome", bold: true, size: 36, font: FONT })],
    }),
  );
  if (nonEmpty(r.headline)) children.push(para(r.headline, { bold: true }));
  const contact = contactLine(r);
  if (contact) children.push(para(contact, { after: 120 }));

  if (nonEmpty(r.summary)) {
    children.push(heading(SECTION_TITLES.summary));
    r.summary.split(/\n+/).filter(nonEmpty).forEach((p) => children.push(para(p)));
  }

  const exps = r.experiences.filter((e) => nonEmpty(e.role) || nonEmpty(e.company));
  if (exps.length) {
    children.push(heading(SECTION_TITLES.experience));
    exps.forEach((e, i) => {
      children.push(
        new Paragraph({
          spacing: { before: i === 0 ? 40 : 160, after: 20 },
          children: [new TextRun({ text: e.role, bold: true, font: FONT, size: 22 })],
        }),
      );
      const meta = experienceMeta(e);
      if (meta) children.push(para(meta, { italics: true }));
      e.bullets.filter(nonEmpty).forEach((b) => children.push(bullet(b)));
    });
  }

  const edus = r.education.filter((e) => nonEmpty(e.degree) || nonEmpty(e.institution));
  if (edus.length) {
    children.push(heading(SECTION_TITLES.education));
    edus.forEach((ed) => {
      children.push(
        new Paragraph({
          spacing: { before: 60, after: 20 },
          children: [new TextRun({ text: ed.degree, bold: true, font: FONT, size: 21 })],
        }),
      );
      const line = educationLine(ed);
      if (line) children.push(para(line));
      if (nonEmpty(ed.details)) children.push(para(ed.details));
    });
  }

  const skills = r.skills.filter(nonEmpty);
  if (skills.length) {
    children.push(heading(SECTION_TITLES.skills));
    children.push(para(skills.join(", ")));
  }

  const certs = r.certifications.filter(nonEmpty);
  if (certs.length) {
    children.push(heading(SECTION_TITLES.certifications));
    certs.forEach((c) => children.push(bullet(c)));
  }

  const langs = r.languages.filter(nonEmpty);
  if (langs.length) {
    children.push(heading(SECTION_TITLES.languages));
    langs.forEach((l) => children.push(bullet(l)));
  }

  r.extraSections
    .filter((s) => nonEmpty(s.title) && s.items.some(nonEmpty))
    .forEach((s) => {
      children.push(heading(s.title));
      s.items.filter(nonEmpty).forEach((it) => children.push(bullet(it)));
    });

  const doc = new Document({
    creator: "MatchCV",
    title: `Currículo - ${r.fullName}`,
    styles: { default: { document: { run: { font: FONT, size: 21 } } } },
    numbering: {
      config: [
        {
          reference: "bullets",
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: "•",
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 360, hanging: 240 } } },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1000, right: 1000, bottom: 1000, left: 1000 },
          },
        },
        children,
      },
    ],
  });
  return Packer.toBlob(doc);
}

/* -------------------------------- PDF -------------------------------- */

// Standard PDF fonts cover Latin-1; map common typographic characters outside it.
function pdfSafe(text: string) {
  return text
    .replace(/[\u2018\u2019\u201A]/g, "'")
    .replace(/[\u201C\u201D\u201E]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/[\u2022\u25CF\u25AA]/g, "-")
    .replace(/\u00A0/g, " ")
    .replace(/[^\u0000-\u00FF]/g, "");
}

export async function buildPdf(r: Resume): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  doc.setProperties({ title: `Currículo - ${r.fullName}`, creator: "MatchCV" });

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const M = 50;
  const W = pageW - M * 2;
  let y = M;

  const ensure = (h: number) => {
    if (y + h > pageH - M) {
      doc.addPage();
      y = M;
    }
  };
  const write = (
    text: string,
    o: { size?: number; style?: "normal" | "bold" | "italic"; indent?: number; gap?: number; lh?: number } = {},
  ) => {
    const size = o.size ?? 10.5;
    const indent = o.indent ?? 0;
    doc.setFont("helvetica", o.style ?? "normal");
    doc.setFontSize(size);
    const lh = size * (o.lh ?? 1.35);
    const lines: string[] = doc.splitTextToSize(pdfSafe(text), W - indent);
    for (const line of lines) {
      ensure(lh);
      doc.text(line, M + indent, y + size * 0.8);
      y += lh;
    }
    y += o.gap ?? 2;
  };
  const heading = (title: string) => {
    ensure(40);
    y += 10;
    write(title.toUpperCase(), { size: 11.5, style: "bold", gap: 0 });
    doc.setDrawColor(109, 40, 217);
    doc.setLineWidth(0.8);
    doc.line(M, y + 1, M + W, y + 1);
    y += 8;
  };
  const bullet = (text: string) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    const lines: string[] = doc.splitTextToSize(pdfSafe(text), W - 14);
    const lh = 10.5 * 1.35;
    lines.forEach((line, i) => {
      ensure(lh);
      if (i === 0) doc.text("-", M + 2, y + 8.4);
      doc.text(line, M + 14, y + 8.4);
      y += lh;
    });
    y += 2;
  };

  write(r.fullName || "Seu Nome", { size: 20, style: "bold", gap: 4, lh: 1.2 });
  if (nonEmpty(r.headline)) write(r.headline, { size: 11.5, style: "bold" });
  const contact = contactLine(r);
  if (contact) write(contact, { size: 10 });

  if (nonEmpty(r.summary)) {
    heading(SECTION_TITLES.summary);
    r.summary.split(/\n+/).filter(nonEmpty).forEach((p) => write(p, { gap: 4 }));
  }

  const exps = r.experiences.filter((e) => nonEmpty(e.role) || nonEmpty(e.company));
  if (exps.length) {
    heading(SECTION_TITLES.experience);
    exps.forEach((e, i) => {
      if (i > 0) y += 6;
      ensure(40);
      write(e.role, { size: 11, style: "bold", gap: 0 });
      const meta = experienceMeta(e);
      if (meta) write(meta, { size: 10, style: "italic", gap: 3 });
      e.bullets.filter(nonEmpty).forEach(bullet);
    });
  }

  const edus = r.education.filter((e) => nonEmpty(e.degree) || nonEmpty(e.institution));
  if (edus.length) {
    heading(SECTION_TITLES.education);
    edus.forEach((ed) => {
      write(ed.degree, { style: "bold", gap: 0 });
      const line = educationLine(ed);
      if (line) write(line, { size: 10 });
      if (nonEmpty(ed.details)) write(ed.details, { size: 10 });
      y += 3;
    });
  }

  const skills = r.skills.filter(nonEmpty);
  if (skills.length) {
    heading(SECTION_TITLES.skills);
    write(skills.join(", "));
  }
  const certs = r.certifications.filter(nonEmpty);
  if (certs.length) {
    heading(SECTION_TITLES.certifications);
    certs.forEach(bullet);
  }
  const langs = r.languages.filter(nonEmpty);
  if (langs.length) {
    heading(SECTION_TITLES.languages);
    langs.forEach(bullet);
  }
  r.extraSections
    .filter((s) => nonEmpty(s.title) && s.items.some(nonEmpty))
    .forEach((s) => {
      heading(s.title);
      s.items.filter(nonEmpty).forEach(bullet);
    });

  return doc.output("blob");
}
