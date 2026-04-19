# La 12 Digital 💙💛

> El portal del hincha de Boca. Dashboard interactivo con información en tiempo real del club más grande de Argentina.

---

## ¿Por qué existe este proyecto?

Seguir a Boca requiere abrir 5 apps distintas: el sitio del club para noticias, Twitter para reacciones, una app de estadísticas, otra de clima antes de ir a la cancha, YouTube para los videos... La 12 Digital centraliza todo eso en un solo lugar.

### Usuario objetivo

**Martín, 32 años — "El Hincha Analítico"**

Trabaja en tecnología, va a la cancha cuando puede. Sigue a Boca diariamente pero tiene poco tiempo. Le gusta entender el _por qué_ detrás de los resultados, no solo el marcador. Consume estadísticas y análisis, no titulares. Necesita el panorama completo de un vistazo.

### User story

> _"Como hincha de Boca con poco tiempo, necesito una forma rápida de entender cómo viene el equipo y qué esperar del próximo partido, para poder tomar decisiones informadas sin tener que investigar en múltiples fuentes."_

### Jobs to be Done

| Tipo      | Job                                                       |
| --------- | --------------------------------------------------------- |
| Funcional | Verificar próximos partidos y resultados recientes        |
| Funcional | Entender la posición en la tabla y contexto competitivo   |
| Funcional | Conocer el estado actual del plantel                      |
| Emocional | Sentirse informado y "en tema" antes de hablar con amigos |
| Emocional | Reducir la ansiedad pre-partido con información clara     |
| Social    | Tener argumentos basados en datos para discusiones        |

### Principios de diseño

1. **Scannable first, deep second** — La info más importante se entiende en menos de 30 segundos
2. **Datos + contexto = insight** — Priorizar interpretación sobre números crudos
3. **Una sola fuente de verdad** — Todo lo que necesitás sobre Boca, sin abrir otra pestaña

---

## Widgets

| Widget                   | Descripción                                                            |
| ------------------------ | ---------------------------------------------------------------------- |
| 🏟️ La Bombonera          | Clima actual en el estadio + cuenta regresiva al próximo partido local |
| 📅 Últimos partidos      | Resultados recientes con escudos y resultado visual (V/E/D)            |
| 🗓️ Próximos partidos     | Fixture con estadio, horario en AR y competencia                       |
| 🏆 Tabla de posiciones   | Liga Profesional temporada actual, con Boca destacado                  |
| 📰 Noticias              | Feed de noticias con scroll horizontal en mobile                       |
| 📺 Canal YouTube         | Últimos videos del canal oficial                                       |
| 🎮 ¿Quién es este ídolo? | Quiz interactivo con foto borroneada y dificultades                    |
| 👕 ¿Recordás el plantel? | Trivia del plantel actual con formación táctica                        |

---

## Stack técnico

- **React 18** + **Vite** + **TypeScript**
- **Tailwind CSS** con design tokens propios (`design-system/tokens/`)
- **Cloudflare Workers** — proxy de APIs + hosting de la SPA
- **Crimson Pro** (serif, títulos) + **Geist** (sans, UI/datos)

### APIs utilizadas

| API                      | Uso                      | Dónde se llama        |
| ------------------------ | ------------------------ | --------------------- |
| API-Football / LiveScore | Partidos, tabla, fixture | `worker.js` (proxy)   |
| NewsData.io              | Noticias del club        | `worker.js` (proxy)   |
| YouTube Data v3          | Videos oficiales         | `worker.js` (proxy)   |
| Open-Meteo               | Clima en La Bombonera    | Directo desde cliente |
| Wikipedia REST           | Fotos de ídolos          | Directo desde cliente |

> Todas las API keys se almacenan como **Cloudflare Secrets** — nunca en el bundle del frontend.

---

## Estructura

```
la-12-digital/
├── worker.js                    # Cloudflare Worker: proxy APIs + headers de seguridad
├── wrangler.jsonc               # Configuración Cloudflare Workers
├── design-system/tokens/        # Colores, tipografía, spacing, shadows
├── src/
│   ├── App.tsx                  # Layout principal
│   ├── index.css                # Tailwind + CSS custom properties (UI tokens)
│   ├── components/
│   │   ├── shared/TimerBar/     # Componente compartido entre juegos
│   │   └── [feature]/           # Un directorio por widget
│   ├── hooks/
│   │   ├── useHorizontalScroll.ts  # Drag-scroll compartido
│   │   └── useAsyncData.ts         # Hook genérico loading/error/ok
│   ├── services/                # Llamadas a APIs (todas con timeout de 8s)
│   ├── utils/
│   │   ├── fetchWithTimeout.ts  # Fetch con AbortController
│   │   ├── stringMatch.ts       # normalize() para comparaciones
│   │   └── gameConfig.ts        # Constantes de los mini-juegos
│   └── data/                    # Datos estáticos (ídolos, equipos, canales)
└── vite.config.ts               # Proxy dev → APIs locales
```

---

## Desarrollo local

```bash
npm install
npm run dev       # http://localhost:5173
```

El proxy de Vite redirige `/api/*` durante el desarrollo sin necesidad de variables de entorno.

---

## Despliegue en Cloudflare Workers

El proyecto usa **Cloudflare Workers** con **Workers Assets** para servir la SPA y manejar el proxy de APIs.

### 1. Variables de entorno

Configurar en el dashboard → Settings → Environment Variables → Production:

| Variable               | Descripción                                                     | Requerida   |
| ---------------------- | --------------------------------------------------------------- | ----------- |
| `VITE_YOUTUBE_KEY`     | [Google YouTube Data API v3](https://console.cloud.google.com/) | ✅          |
| `VITE_NEWS_API_KEY`    | [NewsData.io](https://newsdata.io/)                             | ✅          |
| `LIVESCORE_KEY`        | API-Football / LiveScore key                                    | ✅          |
| `LIVESCORE_SECRET`     | LiveScore secret                                                | ✅          |
| `VITE_OPENWEATHER_KEY` | [OpenWeatherMap](https://openweathermap.org/api)                | ⚠️ Opcional |

> Después de guardar variables, hacer un nuevo **Redeploy** desde el dashboard.

### 2. Deploy

```bash
npm run deploy    # tsc + vite build + wrangler deploy
```

---

## Design system

Los tokens están en `design-system/tokens/` y se exponen como:

- **Clases Tailwind**: `bg-boca-blue`, `text-boca-gold`, `bg-boca-blue-mid`, `border-boca-border`, etc.
- **CSS custom properties**: `var(--color-bg-card)`, `var(--gradient-app-bg)`, etc.

Clases tipográficas disponibles: `.type-section-title`, `.type-card-title`, `.type-body`, `.type-caption`, `.type-button`, `.type-stat`, `.type-ui-label`

**Identidad**: Azul `#001529` · Oro `#FFD700` · WCAG AA compliant

---

**Dale Boo! 💙💛**
