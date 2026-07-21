/**
 * Serializadores de la minuta (Fase 2): Markdown y email.
 *
 * Viven en `lib/` y son funciones puras — así se testean sin renderizar UI y
 * los componentes de exportación quedan reducidos a "llamar + copiar".
 */

import type { Minutes } from "./types";

interface Labels {
  summary: string;
  decisions: string;
  actionItems: string;
  task: string;
  owner: string;
  dueDate: string;
  risks: string;
  inferred: string;
  pending: string;
  none: string;
  emailSubject: string;
  emailIntro: string;
}

const LABELS: Record<Minutes["language"], Labels> = {
  es: {
    summary: "Resumen ejecutivo",
    decisions: "Decisiones tomadas",
    actionItems: "Action items",
    task: "Tarea",
    owner: "Responsable",
    dueDate: "Fecha límite",
    risks: "Riesgos y bloqueos",
    inferred: "inferido",
    pending: "Temas pendientes",
    none: "—",
    emailSubject: "Minuta",
    emailIntro: "Hola a todos,\n\nComparto la minuta de la reunión:",
  },
  en: {
    summary: "Executive summary",
    decisions: "Decisions",
    actionItems: "Action items",
    task: "Task",
    owner: "Owner",
    dueDate: "Due date",
    risks: "Risks & blockers",
    inferred: "inferred",
    pending: "Open topics",
    none: "—",
    emailSubject: "Meeting minutes",
    emailIntro: "Hi all,\n\nSharing the minutes from our meeting:",
  },
};

function list(items: string[], none: string): string {
  return items.length ? items.map((i) => `- ${i}`).join("\n") : none;
}

export function toMarkdown(m: Minutes): string {
  const l = LABELS[m.language] ?? LABELS.es;

  const actionRows = m.actionItems.length
    ? m.actionItems
        .map((a) => `| ${a.task} | ${a.owner} | ${a.dueDate} |`)
        .join("\n")
    : `| ${l.none} | ${l.none} | ${l.none} |`;

  const risks = m.risks.length
    ? m.risks
        .map((r) => `- ${r.text}${r.inferred ? ` _(${l.inferred})_` : ""}`)
        .join("\n")
    : l.none;

  return [
    `# ${m.title}`,
    ``,
    `## ${l.summary}`,
    ``,
    m.summary,
    ``,
    `## ${l.decisions}`,
    ``,
    list(m.decisions, l.none),
    ``,
    `## ${l.actionItems}`,
    ``,
    `| ${l.task} | ${l.owner} | ${l.dueDate} |`,
    `| --- | --- | --- |`,
    actionRows,
    ``,
    `## ${l.risks}`,
    ``,
    risks,
    ``,
    `## ${l.pending}`,
    ``,
    list(m.pending, l.none),
    ``,
  ].join("\n");
}

/**
 * Email en texto plano (asunto + cuerpo). Texto plano y no HTML a propósito:
 * pega limpio en Outlook/Gmail y sobrevive a cualquier cliente de correo.
 */
export function toEmail(m: Minutes): { subject: string; body: string } {
  const l = LABELS[m.language] ?? LABELS.es;

  const actions = m.actionItems.length
    ? m.actionItems
        .map((a) => `- ${a.task} — ${l.owner}: ${a.owner} — ${l.dueDate}: ${a.dueDate}`)
        .join("\n")
    : l.none;

  const risks = m.risks.length
    ? m.risks
        .map((r) => `- ${r.text}${r.inferred ? ` (${l.inferred})` : ""}`)
        .join("\n")
    : l.none;

  const body = [
    l.emailIntro,
    ``,
    `${l.summary.toUpperCase()}`,
    m.summary,
    ``,
    `${l.decisions.toUpperCase()}`,
    list(m.decisions, l.none),
    ``,
    `${l.actionItems.toUpperCase()}`,
    actions,
    ``,
    `${l.risks.toUpperCase()}`,
    risks,
    ``,
    `${l.pending.toUpperCase()}`,
    list(m.pending, l.none),
    ``,
  ].join("\n");

  return { subject: `${l.emailSubject}: ${m.title}`, body };
}

export function emailAsClipboardText(m: Minutes): string {
  const { subject, body } = toEmail(m);
  const subjectLabel = m.language === "en" ? "Subject" : "Asunto";
  return `${subjectLabel}: ${subject}\n\n${body}`;
}
