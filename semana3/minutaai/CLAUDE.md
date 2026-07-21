# MinutaAI — Generador de minutas de reunión con IA

Herramienta para project managers: convierte notas crudas o transcripts de reuniones
(Teams, Meet, Zoom) en una minuta estructurada y lista para compartir.

## Qué produce

A partir del texto pegado por el usuario, genera:
1. **Resumen ejecutivo** (3-5 líneas).
2. **Decisiones tomadas** (lista clara, una por línea).
3. **Action items** — tabla con: tarea, responsable, fecha límite. Si el responsable o
   la fecha no se mencionan en las notas, marcar como "Por definir", nunca inventar.
4. **Riesgos y bloqueos detectados** (explícitos o inferidos del tono/contexto, marcando
   cuáles son inferencia).
5. **Temas pendientes** para la próxima reunión.

Salidas: vista en pantalla + copiar como Markdown + copiar como email listo para enviar
(asunto incluido).

## Stack

- Next.js 15+ (App Router) + TypeScript
- OpenRouter para el LLM (mismo patrón que el proyecto M.I.K.E.) — key en `OPENROUTER_API_KEY`
- Sin base de datos en el MVP: todo es stateless, el texto nunca se persiste
  (punto de venta de privacidad: "tus notas no se guardan")
- Tailwind CSS para la UI

## Arquitectura

```
app/
├── page.tsx               # UI: textarea grande + botón generar + vista de resultado
└── api/generate/route.ts  # POST → LLM con prompt estructurado, devuelve JSON
components/
├── MinutesInput.tsx       # textarea con contador de caracteres y detección de idioma
├── MinutesResult.tsx      # render de la minuta por secciones
└── ExportButtons.tsx      # copiar Markdown / copiar email
lib/
├── prompt.ts              # system prompt: instrucciones + esquema JSON de salida
└── ratelimit.ts           # rate limit por IP en memoria (aprendizaje del proyecto M.I.K.E.)
```

## Reglas del proyecto

- **API key solo server-side.** Todo pasa por `app/api/generate/route.ts`.
- **El LLM responde SOLO JSON** con el esquema definido en `lib/prompt.ts`
  (summary, decisions[], actionItems[{task, owner, dueDate}], risks[], pending[]).
  Parsear con try/catch, limpiar fences ```json si aparecen, y reintentar 1 vez si
  el parseo falla antes de mostrar error al usuario.
- **Nunca inventar datos.** Si las notas no mencionan responsable o fecha, el campo
  queda "Por definir". Los riesgos inferidos (no explícitos) se marcan como tales.
- **Idioma de salida = idioma de las notas** (detectado por el LLM). La UI soporta
  minutas en español o inglés sin configuración.
- **Rate limiting desde el día 1**: máximo N requests por IP por minuto y límite de
  ~15.000 caracteres en el input. Rechazar con mensaje claro, no con error genérico.
- **Privacidad**: no persistir el texto ni loguearlo. Ni en consola ni en analytics.
- TypeScript estricto, componentes funcionales, sin `any`.
- Responsive: un PM va a usar esto también desde el teléfono saliendo de una reunión.

## Guía de diseño (design system de Stitch)

Estética: **minimalismo enterprise** — precisión, confianza, foco. Contenido sobre
contenedor, whitespace generoso, cero "ruido de UI". Debe sentirse profesional y
autoritativo, nunca experimental ni de tutorial.

### Colores (mapear a la paleta nativa de Tailwind)

| Rol | Hex | Tailwind | Uso |
| --- | --- | --- | --- |
| Primary | `#4F46E5` | `indigo-600` | SOLO CTAs primarios, estados activos, progreso |
| Brand deep | `#2D336B` | custom `brand` | Sidebar, headings de alto nivel |
| Texto secundario | `#475569` | `slate-600` | Texto de apoyo, iconos |
| Fondo | `#F8FAFC` | `slate-50` | Background general |
| Bordes | `#E2E8F0` | `slate-200` | Divisiones sutiles, bordes de cards |
| Error | `#BA1A1A` | `red-700` aprox | Estados de error |

### Tipografía

- **Inter** en toda la app (usar `next/font/google`).
- Headers estructurales: weight 600. Cuerpo y transcripts: weight 400.
- Escala: headline 32/40 (24/32 en mobile), title 20/28, body 16/24, label 14/20
  medium, badge 12/16 semibold.
- Tracking levemente negativo (-0.01em a -0.02em) solo en títulos grandes.

### Espaciado y layout

- **Regla de 4px**: todo espaciado es múltiplo de 4.
- 32px (`space-y-8`) entre secciones mayores de la minuta.
- Contenedor máximo 1280px (`max-w-7xl`), márgenes de página 48px en desktop.
- Breakpoints: mobile < 768px (1 columna), tablet 768–1024, desktop > 1024.

### Profundidad y formas

- Aesthetic plano: nada de sombras pesadas. Cards = borde 1px `slate-200` +
  sombra suave `0 1px 3px rgba(0,0,0,0.05)`; hover `0 4px 12px rgba(0,0,0,0.08)`.
- Radios: botones/inputs 8px (`rounded-lg`), cards 12px (`rounded-xl`),
  chips/badges pill (`rounded-full`).
- Iconos: lucide-react, stroke 2px.
- Sticky action bar (exportar/copiar): fondo blanco 90% + `backdrop-blur` 12px +
  borde superior fino.

### Componentes clave

- **Botones**: primary sólido indigo/texto blanco; secondary borde+texto indigo
  sobre transparente; ghost sin borde hasta hover (acciones de tabla).
- **Chips de plantilla** (Standup, Retro, etc.): activo = fondo indigo texto blanco;
  inactivo = borde slate sobre `slate-50`.
- **Tabla de action items**: header `12px semibold` sobre `#F1F5F9`; badges de
  estado ("Por definir") con texto de alto contraste sobre fondo desaturado.
- **Headers de sección**: icono en cuadrado 32×32 `rounded-lg` con tinte indigo
  al 10% de opacidad.

## Comandos

```bash
npm run dev      # desarrollo (localhost:3000)
npm run build    # build de producción
npm run lint     # eslint
```

## Variables de entorno (.env.local — nunca commitear)

```
OPENROUTER_API_KEY=
```

## Roadmap

1. **Fase 1 (MVP):** textarea → minuta estructurada en pantalla, con rate limit incluido.
2. **Fase 2:** exportaciones — copiar como Markdown y como email (asunto + cuerpo).
3. **Fase 3:** plantillas de minuta (standup, sprint review, reunión con cliente,
   retro) que ajustan el prompt según el tipo de reunión.
4. **Fase 4:** pulido — upload de archivo .txt/.vtt (transcripts de Teams exportados),
   modo oscuro, deploy en Vercel bajo subdominio del portfolio.

## Notas para Claude

- Explicar brevemente el porqué de las decisiones de arquitectura: Michael tiene 20+
  años de experiencia web y un máster en gestión de proyectos, pero está refrescando
  el ecosistema Next.js/React moderno — el "por qué" importa tanto como el "qué".
- Preferir soluciones simples y nativas antes que dependencias nuevas; proponer y
  justificar cualquier librería adicional antes de instalarla.
- Este proyecto es parte de un portfolio que cuenta una historia: "herramientas con IA
  que resuelven problemas reales de equipos". El diseño debe verse profesional, no
  como demo de tutorial.
