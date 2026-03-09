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
├── api/
│   └── sofascore/[...path].js  # Vercel Function (fallback para despliegues en Vercel)
├── functions/
│   └── api/sofascore/
│       └── [[path]].js         # Cloudflare Pages Function — proxy SofaScore (automático)
├── cf-worker/
│   └── index.js                # Cloudflare Worker independiente (opcional, máximo rendimiento)
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

## Despliegue en Cloudflare Pages

El proyecto está optimizado para **Cloudflare Pages**. La Pages Function en `functions/api/sofascore/[[path]].js` proxea automáticamente las peticiones a SofaScore sin configuración adicional.

### Configuración en Cloudflare Pages

1. **Conectar el repositorio** en [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages → Create application → Pages**

2. **Configurar el build**:
   - Build command: `npm run build`
   - Build output directory: `dist`

3. **Variables de entorno** (Settings → Environment Variables → Production):

   | Variable | Descripción | Requerida |
   |----------|-------------|-----------|
   | `VITE_YOUTUBE_KEY` | [Google YouTube Data API v3](https://console.cloud.google.com/) | ✅ Para videos |
   | `VITE_NEWS_API_KEY` | [NewsData.io](https://newsdata.io/) | ✅ Para noticias |
   | `VITE_OPENWEATHER_KEY` | [OpenWeatherMap](https://openweathermap.org/api) | ⚠️ Opcional (hay mock) |

   > **Importante**: al ser variables `VITE_*`, se inyectan en build-time. Después de guardar las variables, hacer un nuevo **Redeploy** desde el dashboard.

4. **Los datos de fútbol (SofaScore) funcionan solos** — la Pages Function en `functions/api/sofascore/[[path]].js` se encarga del proxy automáticamente.

---

## Cloudflare Worker independiente (opcional)

Si preferís máximo rendimiento o usás Vercel en vez de Cloudflare Pages, podés desplegar un Worker independiente como proxy de SofaScore.

### Pasos (5 minutos, plan gratuito de Cloudflare)

1. **Crear el Worker**:
   - Ir a **Workers & Pages → Create application → Create Worker**
   - Nombre: `sofascore-proxy`
   - Hacer click en **Deploy**

2. **Pegar el código**:
   - Hacer click en **Edit code**
   - Copiar y pegar el contenido de [`cf-worker/index.js`](cf-worker/index.js)
   - Hacer click en **Deploy**

3. **Copiar la URL del Worker**:
   ```
   https://sofascore-proxy.TU-NOMBRE.workers.dev
   ```

4. **Agregar la URL como variable de entorno** en tu hosting (Cloudflare Pages o Vercel):
   - Nombre: `VITE_SOFASCORE_PROXY_URL`
   - Valor: la URL del Worker del paso anterior
   - Hacer **Redeploy**

---

**Identidad**: Azul `#001529` · Oro `#FFD700` · WCAG AA compliant

**Dale Boo! 💙💛**
