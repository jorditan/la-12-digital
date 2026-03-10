# La 12 Digital 💙💛

> El portal del hincha de Boca. Dashboard interactivo con información en tiempo real del club más grande de Argentina.

---

## Stack

- **React 18** + **Vite** + **TypeScript**
- **Tailwind CSS** con design tokens propios
- **SofaScore API** (proxy via Cloudflare Worker — ver abajo)
- **Crimson Pro** (serif) + **Inter** (sans-serif)

## Características

| Widget | Descripción |
|---|---|
| 🏟️ La Bombonera en vivo | Clima actual + próximo partido local |
| 📅 Últimos partidos | Resultados recientes con escudos |
| 🗓️ Próximos partidos | Fixture con estadio y horario (AR) |
| 🏆 Tabla de posiciones | Liga Profesional temporada actual |
| 📰 Noticias | Feed del club |
| 📺 Canal YouTube | Últimos videos oficiales |
| 🎮 ¿Quién es este ídolo? | Quiz interactivo con foto borroneada |
| 👕 ¿Recordás el plantel? | Trivia del plantel actual |

## Estructura

```
la-12-digital/
├── worker.js                   # ⭐ Cloudflare Worker entry point (proxy + SPA)
├── wrangler.jsonc              # Cloudflare Workers configuration
├── api/
│   └── sofascore/[...path].js  # Vercel Function (fallback para despliegues en Vercel)
├── functions/
│   └── api/sofascore/
│       └── [[path]].js         # Cloudflare Pages Function (fallback para Pages)
├── cf-worker/
│   └── index.js                # Standalone Worker independiente (referencia)
├── src/
│   ├── components/             # Componentes por feature
│   ├── services/
│   │   ├── sofascoreService.ts # Integración SofaScore API
│   │   └── apifootball.ts      # Adaptador → interfaces de componentes
│   ├── types/                  # Tipos TypeScript compartidos
│   └── utils/                  # Cache (localStorage), helpers
├── design-system/              # Tokens y guías de diseño
└── vite.config.ts              # Proxy dev: /api/sofascore → api.sofascore.com
```

## Desarrollo local

```bash
npm install
npm run dev       # http://localhost:3000
```

El proxy de Vite redirige `/api/sofascore/*` → `api.sofascore.com/api/v1/*` durante el desarrollo, sin necesidad de variables de entorno.

## Despliegue en Cloudflare Workers (recomendado)

El proyecto usa **Cloudflare Workers** con **Workers Assets** para servir la SPA estática y manejar el proxy de SofaScore. El archivo `wrangler.jsonc` ya está incluido en el repo con toda la configuración necesaria.

### Configuración en el dashboard de Cloudflare

1. **Verificar la configuración de build** en tu Worker → Settings → Builds:
   - Build command: `npm run build`
   - Deploy command: `npx wrangler versions upload`

2. **Variables de entorno** (Settings → Environment Variables → Production):

   | Variable | Descripción | Requerida |
   |----------|-------------|-----------|
   | `VITE_YOUTUBE_KEY` | [Google YouTube Data API v3](https://console.cloud.google.com/) | ✅ Para videos |
   | `VITE_NEWS_API_KEY` | [NewsData.io](https://newsdata.io/) | ✅ Para noticias |
   | `VITE_OPENWEATHER_KEY` | [OpenWeatherMap](https://openweathermap.org/api) | ⚠️ Opcional (hay mock) |

   > **Importante**: las variables `VITE_*` se inyectan en build-time. Después de guardarlas, hacer un nuevo **Redeploy** desde el dashboard.

3. **Los datos de fútbol (SofaScore) funcionan solos** — `worker.js` proxea `/api/sofascore/*` automáticamente sin configuración adicional.

### Deploy manual desde CLI

```bash
npm install
npm run deploy    # = tsc + vite build + wrangler deploy
```

---

**Identidad**: Azul `#001529` · Oro `#FFD700` · WCAG AA compliant

**Dale Boo! 💙💛**
