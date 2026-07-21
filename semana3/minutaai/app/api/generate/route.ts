import { NextRequest, NextResponse } from "next/server";
import { SYSTEM_PROMPT, DEFAULT_MODEL, buildUserPrompt } from "@/lib/prompt";
import { checkRateLimit, MAX_REQUESTS_PER_MINUTE } from "@/lib/ratelimit";
import { MAX_INPUT_CHARS, type GenerateResponse, type Minutes } from "@/lib/types";

/**
 * POST /api/generate — único punto de contacto con el LLM.
 *
 * Decisiones clave:
 * - La API key vive SOLO aquí (server-side). El browser nunca la ve.
 * - Privacidad: el texto de las notas no se persiste ni se loguea — ni en
 *   consola ni en analytics. Los catch loguean el tipo de error, nunca el
 *   contenido.
 * - El LLM puede fallar en devolver JSON válido: limpiamos fences y
 *   reintentamos 1 vez antes de rendirnos con un mensaje claro.
 */

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

function jsonError(status: number, error: string, headers?: HeadersInit) {
  return NextResponse.json<GenerateResponse>({ ok: false, error }, { status, headers });
}

function getClientIp(req: NextRequest): string {
  // Detrás de Vercel/proxy la IP real viaja en x-forwarded-for (primer valor).
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

/** Quita fences ```json ... ``` y texto alrededor del primer objeto JSON. */
function extractJson(raw: string): string {
  let text = raw.trim();
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) text = fenceMatch[1].trim();
  // Si aún hay ruido alrededor, quedarnos con el primer bloque { ... } completo.
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end > start) text = text.slice(start, end + 1);
  return text;
}

/** Validación estructural mínima — no confiar ciegamente en el LLM. */
function isMinutes(value: unknown): value is Minutes {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    (v.language === "es" || v.language === "en") &&
    typeof v.title === "string" &&
    typeof v.summary === "string" &&
    Array.isArray(v.decisions) &&
    v.decisions.every((d) => typeof d === "string") &&
    Array.isArray(v.actionItems) &&
    v.actionItems.every(
      (a) =>
        typeof a === "object" &&
        a !== null &&
        typeof (a as Record<string, unknown>).task === "string" &&
        typeof (a as Record<string, unknown>).owner === "string" &&
        typeof (a as Record<string, unknown>).dueDate === "string",
    ) &&
    Array.isArray(v.risks) &&
    v.risks.every(
      (r) =>
        typeof r === "object" &&
        r !== null &&
        typeof (r as Record<string, unknown>).text === "string" &&
        typeof (r as Record<string, unknown>).inferred === "boolean",
    ) &&
    Array.isArray(v.pending) &&
    v.pending.every((p) => typeof p === "string")
  );
}

async function callLlm(apiKey: string, notes: string): Promise<string> {
  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL ?? DEFAULT_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(notes) },
      ],
      temperature: 0.2,
      // Pedir modo JSON cuando el modelo lo soporte; el parseo defensivo
      // de abajo cubre a los que lo ignoran.
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    throw new Error(`LLM_HTTP_${res.status}`);
  }

  const data: unknown = await res.json();
  const content = (data as { choices?: { message?: { content?: unknown } }[] })
    ?.choices?.[0]?.message?.content;

  if (typeof content !== "string" || content.length === 0) {
    throw new Error("LLM_EMPTY_RESPONSE");
  }
  return content;
}

export async function POST(req: NextRequest): Promise<NextResponse<GenerateResponse>> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return jsonError(
      500,
      "El servidor no está configurado (falta OPENROUTER_API_KEY). Revisa .env.local.",
    );
  }

  // 1. Rate limit por IP — antes de leer el body, es lo más barato.
  const ip = getClientIp(req);
  const limit = checkRateLimit(ip);
  if (!limit.allowed) {
    return jsonError(
      429,
      `Alcanzaste el límite de ${MAX_REQUESTS_PER_MINUTE} minutas por minuto. Intenta de nuevo en ${limit.retryAfterSeconds}s.`,
      { "Retry-After": String(limit.retryAfterSeconds) },
    );
  }

  // 2. Validar input.
  let notes: string;
  try {
    const body: unknown = await req.json();
    notes = String((body as { notes?: unknown })?.notes ?? "");
  } catch {
    return jsonError(400, "El cuerpo de la petición no es JSON válido.");
  }

  notes = notes.trim();
  if (notes.length < 40) {
    return jsonError(
      400,
      "Las notas son demasiado cortas para generar una minuta. Pega al menos un par de líneas de contenido.",
    );
  }
  if (notes.length > MAX_INPUT_CHARS) {
    return jsonError(
      400,
      `El texto supera el límite de ${MAX_INPUT_CHARS.toLocaleString("es")} caracteres. Recorta las notas o divídelas en dos reuniones.`,
    );
  }

  // 3. LLM + parseo defensivo con 1 reintento.
  const MAX_ATTEMPTS = 2;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const raw = await callLlm(apiKey, notes);
      const parsed: unknown = JSON.parse(extractJson(raw));
      if (!isMinutes(parsed)) throw new Error("SCHEMA_MISMATCH");
      return NextResponse.json<GenerateResponse>({ ok: true, minutes: parsed });
    } catch (err) {
      // Nunca loguear las notas — solo el tipo de fallo.
      const reason = err instanceof Error ? err.message : "UNKNOWN";
      console.error(`[generate] intento ${attempt}/${MAX_ATTEMPTS} falló: ${reason}`);
      if (attempt === MAX_ATTEMPTS) {
        return jsonError(
          502,
          "No pudimos generar la minuta en este momento. Vuelve a intentarlo; si persiste, el servicio del modelo puede estar caído.",
        );
      }
    }
  }

  // Inalcanzable, pero TypeScript agradece el camino explícito.
  return jsonError(500, "Error inesperado.");
}
