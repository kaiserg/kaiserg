/**
 * Tipos compartidos entre el API route y la UI.
 *
 * Mantenerlos en `lib/` (y no dentro de un componente) permite que el
 * servidor y el cliente importen exactamente el mismo contrato: si el
 * esquema del LLM cambia, TypeScript rompe en ambos lados a la vez.
 */

export interface ActionItem {
  task: string;
  /** "Por definir" cuando las notas no mencionan responsable. */
  owner: string;
  /** "Por definir" cuando las notas no mencionan fecha. */
  dueDate: string;
}

export interface Risk {
  text: string;
  /** true cuando el riesgo es inferido del tono/contexto, no explícito. */
  inferred: boolean;
}

export interface Minutes {
  /** Idioma detectado de las notas: "es" | "en". La UI etiqueta según esto. */
  language: "es" | "en";
  /** Título corto de la reunión propuesto por el LLM. */
  title: string;
  summary: string;
  decisions: string[];
  actionItems: ActionItem[];
  risks: Risk[];
  pending: string[];
}

export interface GenerateOk {
  ok: true;
  minutes: Minutes;
}

export interface GenerateError {
  ok: false;
  /** Mensaje pensado para mostrarse tal cual al usuario. */
  error: string;
}

export type GenerateResponse = GenerateOk | GenerateError;

/** Límite de caracteres del input — compartido entre UI y API. */
export const MAX_INPUT_CHARS = 15000;
