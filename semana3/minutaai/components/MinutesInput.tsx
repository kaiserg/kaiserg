"use client";

import { Sparkles, ShieldCheck, LoaderCircle } from "lucide-react";
import { MAX_INPUT_CHARS } from "@/lib/types";

interface Props {
  value: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
  loading: boolean;
}

/**
 * Detección de idioma "de cortesía" para la UI (el veredicto final lo da el
 * LLM). Heurística barata basada en stopwords — suficiente para mostrar un
 * hint sin sumar una librería de detección de idioma al bundle.
 */
function guessLanguage(text: string): "es" | "en" | null {
  const sample = text.toLowerCase();
  if (sample.trim().split(/\s+/).length < 12) return null;
  const esHits = (sample.match(/\b(que|de|la|el|los|una|para|con|por|como|pero|más|está|hay)\b/g) ?? []).length;
  const enHits = (sample.match(/\b(the|and|of|to|that|for|with|will|are|was|but|have|this)\b/g) ?? []).length;
  if (esHits === enHits) return null;
  return esHits > enHits ? "es" : "en";
}

export default function MinutesInput({ value, onChange, onGenerate, loading }: Props) {
  const remaining = MAX_INPUT_CHARS - value.length;
  const overLimit = remaining < 0;
  const language = guessLanguage(value);
  const canGenerate = !loading && !overLimit && value.trim().length >= 40;

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
      <div className="p-6">
        <label htmlFor="notes" className="mb-2 block text-sm font-medium text-slate-600">
          Notas o transcript de la reunión
        </label>
        <textarea
          id="notes"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Pega aquí tus notas crudas o el transcript exportado de Teams, Meet o Zoom…"
          rows={12}
          className="w-full resize-y rounded-lg border border-slate-200 bg-slate-50 p-4 text-base leading-6 text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
        />

        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className={overLimit ? "text-red-700" : "text-slate-600"}>
              {value.length.toLocaleString("es")} / {MAX_INPUT_CHARS.toLocaleString("es")} caracteres
            </span>
            {language && (
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-600">
                {language === "es" ? "Español detectado" : "English detected"}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onGenerate}
            disabled={!canGenerate}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
          >
            {loading ? (
              <LoaderCircle className="h-4 w-4 animate-spin" strokeWidth={2} />
            ) : (
              <Sparkles className="h-4 w-4" strokeWidth={2} />
            )}
            {loading ? "Generando minuta…" : "Generar minuta"}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-b-xl border-t border-slate-200 bg-slate-50 px-6 py-3 text-xs text-slate-600">
        <ShieldCheck className="h-4 w-4 shrink-0 text-indigo-600" strokeWidth={2} />
        Tus notas no se guardan: se procesan y se descartan. Sin base de datos, sin logs.
      </div>
    </section>
  );
}
