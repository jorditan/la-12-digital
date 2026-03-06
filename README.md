# La 12 Digital 💙💛

> El portal del hincha de Boca. Dashboard interactivo con información en tiempo real del club más grande de Argentina.

---

## Stack

- **React 18** + **Vite** + **TypeScript**
- **Tailwind CSS** con design tokens propios
- **SofaScore API** (proxy server-side via Vercel Functions)
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
│   └── sofascore.js        # Vercel Function — proxy SofaScore (evita CORS)
├── src/
│   ├── components/         # Componentes por feature
│   ├── services/
│   │   ├── sofascoreService.ts   # Integración SofaScore API
│   │   └── apifootball.ts        # Adaptador → interfaces de componentes
│   ├── types/              # Tipos TypeScript compartidos
│   └── utils/              # Cache (localStorage), helpers
├── design-system/          # Tokens y guías de diseño
├── vercel.json             # Rewrite /api/sofascore/* → Vercel Function
└── vite.config.ts          # Proxy dev: /api/sofascore → api.sofascore.com
```

## Desarrollo local

```bash
npm install
npm run dev       # http://localhost:3000
```

El proxy de Vite redirige `/api/sofascore/*` a `api.sofascore.com` durante el desarrollo, sin necesidad de variables de entorno.

## Deploy

El proyecto está configurado para Vercel. Cada push a `main` genera un deploy automático.

En producción, `vercel.json` redirige todas las llamadas a `/api/sofascore/*` a la Vercel Function `api/sofascore.js`, que actúa como proxy server-side hacia SofaScore (sin CORS).

---

**Identidad**: Azul `#001529` · Oro `#FFD700` · WCAG AA compliant

**Dale Boo! 💙💛**
