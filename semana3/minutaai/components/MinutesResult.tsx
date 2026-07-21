"use client";

import {
  FileText,
  CheckCircle2,
  ListTodo,
  AlertTriangle,
  CalendarClock,
  type LucideIcon,
} from "lucide-react";
import type { Minutes } from "@/lib/types";

interface Props {
  minutes: Minutes;
}

const T = {
  es: {
    summary: "Resumen ejecutivo",
    decisions: "Decisiones tomadas",
    actionItems: "Action items",
    task: "Tarea",
    owner: "Responsable",
    dueDate: "Fecha límite",
    risks: "Riesgos y bloqueos",
    inferred: "Inferido",
    pending: "Temas pendientes",
    empty: "Nada registrado en esta sección.",
    tbd: "Por definir",
  },
  en: {
    summary: "Executive summary",
    decisions: "Decisions",
    actionItems: "Action items",
    task: "Task",
    owner: "Owner",
    dueDate: "Due date",
    risks: "Risks & blockers",
    inferred: "Inferred",
    pending: "Open topics",
    empty: "Nothing recorded in this section.",
    tbd: "TBD",
  },
} as const;

/** Header de sección: icono en cuadrado 32×32 con tinte indigo al 10%. */
function SectionHeader({ icon: Icon, title }: { icon: LucideIcon; title: string }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600/10">
        <Icon className="h-4 w-4 text-indigo-600" strokeWidth={2} />
      </span>
      <h2 className="text-xl font-semibold leading-7 text-brand">{title}</h2>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
      {children}
    </section>
  );
}

function EmptyNote({ text }: { text: string }) {
  return <p className="text-base leading-6 text-slate-600">{text}</p>;
}

/** Badge "Por definir": alto contraste sobre fondo desaturado. */
function TbdBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex rounded-full bg-slate-100 px-3 py-0.5 text-xs font-semibold text-slate-700">
      {label}
    </span>
  );
}

function OwnerOrDate({ value, tbd }: { value: string; tbd: string }) {
  const isTbd = value === tbd || value.toLowerCase() === "por definir" || value.toLowerCase() === "tbd";
  return isTbd ? <TbdBadge label={tbd} /> : <span>{value}</span>;
}

export default function MinutesResult({ minutes }: Props) {
  const t = T[minutes.language] ?? T.es;

  return (
    <div className="space-y-8">
      <h1 className="headline-tracking text-2xl font-semibold leading-8 text-brand md:text-[32px] md:leading-10">
        {minutes.title}
      </h1>

      <Card>
        <SectionHeader icon={FileText} title={t.summary} />
        <p className="whitespace-pre-line text-base leading-6 text-slate-900">{minutes.summary}</p>
      </Card>

      <Card>
        <SectionHeader icon={CheckCircle2} title={t.decisions} />
        {minutes.decisions.length ? (
          <ul className="space-y-2">
            {minutes.decisions.map((d, i) => (
              <li key={i} className="flex gap-3 text-base leading-6 text-slate-900">
                <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-600" />
                {d}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyNote text={t.empty} />
        )}
      </Card>

      <Card>
        <SectionHeader icon={ListTodo} title={t.actionItems} />
        {minutes.actionItems.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left">
              <thead>
                <tr className="bg-[#F1F5F9]">
                  <th className="rounded-l-lg px-4 py-2.5 text-xs font-semibold text-slate-600">{t.task}</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-slate-600">{t.owner}</th>
                  <th className="rounded-r-lg px-4 py-2.5 text-xs font-semibold text-slate-600">{t.dueDate}</th>
                </tr>
              </thead>
              <tbody>
                {minutes.actionItems.map((a, i) => (
                  <tr key={i} className="border-b border-slate-200 last:border-0">
                    <td className="px-4 py-3 text-base leading-6 text-slate-900">{a.task}</td>
                    <td className="px-4 py-3 text-base leading-6 text-slate-900">
                      <OwnerOrDate value={a.owner} tbd={t.tbd} />
                    </td>
                    <td className="px-4 py-3 text-base leading-6 text-slate-900">
                      <OwnerOrDate value={a.dueDate} tbd={t.tbd} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyNote text={t.empty} />
        )}
      </Card>

      <Card>
        <SectionHeader icon={AlertTriangle} title={t.risks} />
        {minutes.risks.length ? (
          <ul className="space-y-3">
            {minutes.risks.map((r, i) => (
              <li key={i} className="flex flex-wrap items-start gap-2 text-base leading-6 text-slate-900">
                <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-700" />
                <span className="flex-1">{r.text}</span>
                {r.inferred && (
                  <span className="rounded-full bg-amber-50 px-3 py-0.5 text-xs font-semibold text-amber-800">
                    {t.inferred}
                  </span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyNote text={t.empty} />
        )}
      </Card>

      <Card>
        <SectionHeader icon={CalendarClock} title={t.pending} />
        {minutes.pending.length ? (
          <ul className="space-y-2">
            {minutes.pending.map((p, i) => (
              <li key={i} className="flex gap-3 text-base leading-6 text-slate-900">
                <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                {p}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyNote text={t.empty} />
        )}
      </Card>
    </div>
  );
}
