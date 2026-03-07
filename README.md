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
│   └── sofascore/[...path].js  # Vercel Function (fallback when CF Worker not configured)
├── cf-worker/
│   └── index.js                # Cloudflare Worker — proxy SofaScore
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

## Configuración del Cloudflare Worker

SofaScore usa Cloudflare Bot Management que **bloquea peticiones desde los servidores de Vercel** (IPs de datacenter). Para que los datos se carguen en producción, se usa un **Cloudflare Worker** como proxy: al correr en la red de Cloudflare, las peticiones no son detectadas como bots.

### Pasos (5 minutos, plan gratuito de Cloudflare)

1. **Crear cuenta** en [dash.cloudflare.com](https://dash.cloudflare.com) (gratuito, no requiere tarjeta).

2. **Crear el Worker**:
   - Ir a **Workers & Pages → Create application → Create Worker**
   - Nombre: `sofascore-proxy` (o el que quieras)
   - Hacer click en **Deploy**

3. **Pegar el código**:
   - Hacer click en **Edit code**
   - Borrar el contenido por defecto
   - Copiar y pegar el contenido de [`cf-worker/index.js`](cf-worker/index.js)
   - Hacer click en **Deploy**

4. **Copiar la URL del Worker**, que tiene el formato:
   ```
   https://sofascore-proxy.TU-NOMBRE.workers.dev
   ```

5. **Agregar la URL como variable de entorno en Vercel**:
   - Ir a tu proyecto en [vercel.com](https://vercel.com) → **Settings → Environment Variables**
   - Nombre: `VITE_SOFASCORE_PROXY_URL`
   - Valor: la URL del Worker del paso anterior
   - Hacer click en **Save** y luego **Redeploy**

Con eso los tres widgets de fútbol (últimos partidos, próximos partidos y tabla) leerán datos reales de SofaScore en producción.

---

**Identidad**: Azul `#001529` · Oro `#FFD700` · WCAG AA compliant

**Dale Boo! 💙💛**
