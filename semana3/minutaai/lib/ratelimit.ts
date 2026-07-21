/**
 * Rate limiter en memoria por IP — sliding window simple.
 *
 * Aprendizaje del proyecto M.I.K.E.: para un MVP stateless desplegado en una
 * sola instancia, un Map en memoria es suficiente y evita sumar Redis/Upstash
 * al stack. Trade-off consciente: si la app escala a múltiples instancias
 * serverless, cada instancia tiene su propio contador — en ese momento se
 * migra a un store compartido, no antes.
 */

const WINDOW_MS = 60_000;
/** Máximo de requests por IP por ventana. */
export const MAX_REQUESTS_PER_MINUTE = 5;

const hits = new Map<string, number[]>();

/** Cada cuántas inserciones se barren entradas viejas del Map (evita crecer sin límite). */
const CLEANUP_EVERY = 100;
let insertions = 0;

export interface RateLimitResult {
  allowed: boolean;
  /** Segundos hasta que la IP puede volver a intentar (solo si !allowed). */
  retryAfterSeconds: number;
}

export function checkRateLimit(ip: string): RateLimitResult {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;

  const timestamps = (hits.get(ip) ?? []).filter((t) => t > windowStart);

  if (timestamps.length >= MAX_REQUESTS_PER_MINUTE) {
    const oldest = timestamps[0];
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((oldest + WINDOW_MS - now) / 1000)),
    };
  }

  timestamps.push(now);
  hits.set(ip, timestamps);

  insertions += 1;
  if (insertions % CLEANUP_EVERY === 0) {
    for (const [key, value] of hits) {
      const fresh = value.filter((t) => t > windowStart);
      if (fresh.length === 0) hits.delete(key);
      else hits.set(key, fresh);
    }
  }

  return { allowed: true, retryAfterSeconds: 0 };
}
