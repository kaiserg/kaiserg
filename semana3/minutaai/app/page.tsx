"use client";

import { useState } from "react";
import { NotebookPen, CircleAlert } from "lucide-react";
import MinutesInput from "@/components/MinutesInput";
import MinutesResult from "@/components/MinutesResult";
import ExportButtons from "@/components/ExportButtons";
import type { GenerateResponse, Minutes } from "@/lib/types";

/**
 * Página única del MVP. Client component porque todo el estado (notas,
 * minuta, loading) vive en el browser — coherente con la promesa de
 * privacidad: nada se persiste, un refresh borra todo.
 */
export default function Home() {
  const [notes, setNotes] = useState("");
  const [minutes, setMinutes] = useState<Minutes | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      const data: GenerateResponse = await res.json();
      if (data.ok) {
        setMinutes(data.minutes);
      } else {
        setError(data.error);
      }
    } catch {
      setError("No pudimos conectar con el servidor. Revisa tu conexión e intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto min-h-screen max-w-7xl px-4 py-8 md:px-12 md:py-12">
      <header className="mb-8 md:mb-12">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand">
            <NotebookPen className="h-5 w-5 text-white" strokeWidth={2} />
          </span>
          <div>
            <h1 className="headline-tracking text-2xl font-semibold leading-8 text-brand md:text-[32px] md:leading-10">
              MinutaAI
            </h1>
            <p className="text-sm leading-5 text-slate-600">
              De notas crudas a minuta lista para compartir, en segundos.
            </p>
          </div>
        </div>
      </header>

      <main className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <MinutesInput
            value={notes}
            onChange={setNotes}
            onGenerate={handleGenerate}
            loading={loading}
          />
          {error && (
            <div
              role="alert"
              className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm leading-5 text-red-700"
            >
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
              {error}
            </div>
          )}
        </div>

        <div>
          {minutes ? (
            <div className="space-y-4">
              <MinutesResult minutes={minutes} />
              <ExportButtons minutes={minutes} />
            </div>
          ) : (
            <div className="flex h-full min-h-[280px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white/50 p-8 text-center">
              <p className="max-w-sm text-base leading-6 text-slate-600">
                La minuta aparecerá aquí: resumen, decisiones, action items,
                riesgos y pendientes.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
