"use client";

import { useState } from "react";
import { ClipboardCopy, Mail, Check } from "lucide-react";
import type { Minutes } from "@/lib/types";
import { toMarkdown, emailAsClipboardText } from "@/lib/format";

interface Props {
  minutes: Minutes;
}

type Copied = "markdown" | "email" | null;

/**
 * Sticky action bar (Fase 2): copiar como Markdown / copiar como email.
 * Sticky + backdrop-blur según el design system, para que las acciones de
 * exportación queden siempre a mano en minutas largas — clave en mobile.
 */
export default function ExportButtons({ minutes }: Props) {
  const [copied, setCopied] = useState<Copied>(null);

  async function copy(kind: Exclude<Copied, null>) {
    const text = kind === "markdown" ? toMarkdown(minutes) : emailAsClipboardText(minutes);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // Clipboard API puede fallar fuera de HTTPS/localhost; no romper la UI.
      window.prompt("Copia manualmente:", text);
    }
  }

  const en = minutes.language === "en";

  return (
    <div className="sticky bottom-0 z-10 -mx-4 border-t border-slate-200 bg-white/90 px-4 py-3 backdrop-blur-[12px] md:-mx-0 md:rounded-xl md:border md:px-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-xs font-semibold text-slate-600">
          {en ? "Export" : "Exportar"}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => copy("markdown")}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 sm:flex-none"
          >
            {copied === "markdown" ? (
              <Check className="h-4 w-4" strokeWidth={2} />
            ) : (
              <ClipboardCopy className="h-4 w-4" strokeWidth={2} />
            )}
            {copied === "markdown" ? (en ? "Copied!" : "¡Copiado!") : en ? "Copy Markdown" : "Copiar Markdown"}
          </button>
          <button
            type="button"
            onClick={() => copy("email")}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-indigo-600 px-4 py-2 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-50 sm:flex-none"
          >
            {copied === "email" ? (
              <Check className="h-4 w-4" strokeWidth={2} />
            ) : (
              <Mail className="h-4 w-4" strokeWidth={2} />
            )}
            {copied === "email" ? (en ? "Copied!" : "¡Copiado!") : en ? "Copy as email" : "Copiar como email"}
          </button>
        </div>
      </div>
    </div>
  );
}
