# MinutaAI — Generador de minutas de reunión con IA

Herramienta para project managers: convierte notas crudas o transcripts de reuniones
(Teams, Meet, Zoom) en una minuta estructurada y lista para compartir.

**Semana 3** del portfolio "herramientas con IA que resuelven problemas reales de equipos".

## Qué hace

Pegas tus notas → obtienes una minuta con: resumen ejecutivo, decisiones tomadas,
tabla de action items (tarea / responsable / fecha límite), riesgos y bloqueos
(marcando cuáles son inferidos) y temas pendientes para la próxima reunión.

Exportación con un clic: **copiar como Markdown** o **copiar como email** (asunto incluido).

Privacidad por diseño: las notas no se persisten ni se loguean. Sin base de datos.

## Stack

- Next.js 15 (App Router) + TypeScript estricto
- Tailwind CSS 4
- OpenRouter como proveedor de LLM (key solo server-side)
- Rate limiting por IP en memoria, sin dependencias externas

## Estructura

```
app/
├── page.tsx               # UI: input + vista de resultado
└── api/generate/route.ts  # POST → LLM, parseo defensivo del JSON
components/
├── MinutesInput.tsx       # textarea con contador y detección de idioma
├── MinutesResult.tsx      # render de la minuta por secciones
└── ExportButtons.tsx      # copiar Markdown / copiar email
lib/
├── types.ts               # contrato compartido UI ↔ API
├── prompt.ts              # system prompt + esquema JSON de salida
├── format.ts              # serializadores Markdown / email (funciones puras)
└── ratelimit.ts           # rate limit por IP, sliding window en memoria
```

## Correr en local

```bash
npm install
cp .env.example .env.local   # y completar OPENROUTER_API_KEY
npm run dev                  # http://localhost:3000
```

## Comandos

```bash
npm run dev      # desarrollo
npm run build    # build de producción
npm run lint     # eslint
```

## Estado del roadmap

- [x] Fase 1 — MVP: notas → minuta estructurada, con rate limit y límite de 15.000 caracteres
- [x] Fase 2 — Exportaciones: copiar como Markdown y como email
- [ ] Fase 3 — Plantillas de minuta (standup, sprint review, cliente, retro)
- [ ] Fase 4 — Upload de .txt/.vtt, modo oscuro, deploy en Vercel
