# SPEC.md — La 12 Digital

> Dashboard fan de Boca Juniors. Una app web moderna, rápida y visualmente inmersiva pensada para el hincha que quiere tener toda la info del club en un solo lugar.

---

## 🎯 Objetivo del Proyecto

Construir un **dashboard web** para fans de Boca Juniors que centralice fixture, tabla de posiciones, noticias y clima del estadio, con una identidad visual fuerte basada en los colores del club (azul y amarillo).

---

## 🛠️ Stack Tecnológico

| Capa            | Tecnología                            |
| --------------- | ------------------------------------- |
| Frontend        | React + Vite                          |
| Estilos         | CSS Modules o Tailwind CSS            |
| HTTP Client     | Axios                                 |
| APIs externas   | API-Football, NewsAPI, OpenWeatherMap |
| Deploy (futuro) | Vercel o Netlify                      |

---

## 📁 Estructura de Carpetas

```
la12-digital/
├── public/
│   └── boca-logo.png
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── fixture/
│   │   │   ├── FixtureCard.jsx
│   │   │   └── FixtureList.jsx
│   │   ├── standings/
│   │   │   └── StandingsTable.jsx
│   │   ├── news/
│   │   │   ├── NewsCard.jsx
│   │   │   └── NewsFeed.jsx
│   │   └── weather/
│   │       └── WeatherWidget.jsx
│   ├── services/
│   │   ├── footballApi.js
│   │   ├── newsApi.js
│   │   └── weatherApi.js
│   ├── hooks/
│   │   ├── useFixture.js
│   │   ├── useStandings.js
│   │   └── useNews.js
│   ├── pages/
│   │   └── Dashboard.jsx
│   ├── App.jsx
│   └── main.jsx
├── .env
├── .env.example
├── index.html
└── SPEC.md
```

---

## 🔌 APIs y Configuración

### 1. API-Football — `api-sports.io`

- **Plan:** Free (100 req/día)
- **Base URL:** `https://v3.football.api-sports.io`
- **Header requerido:** `x-apisports-key: TU_API_KEY`
- **ID de Boca Juniors:** `747`
- **ID Liga Profesional Argentina:** `128`
- **ID Copa Libertadores:** `13`

**Endpoints usados:**

```
GET /fixtures?team=747&next=5           → Próximos 5 partidos
GET /standings?league=128&season=2025   → Tabla de posiciones
GET /fixtures?team=747&last=5           → Últimos resultados
```

### 2. NewsAPI — `newsapi.org`

- **Plan:** Free (developer)
- **Base URL:** `https://newsapi.org/v2`
- **Query sugerida:** `Boca Juniors`

**Endpoints usados:**

```
GET /everything?q=Boca+Juniors&language=es&sortBy=publishedAt&pageSize=10
```

### 3. OpenWeatherMap

- **Plan:** Free (1000 req/día)
- **Base URL:** `https://api.openweathermap.org/data/2.5`
- **Coordenadas La Bombonera:** `lat=-34.6356, lon=-58.3644`

**Endpoints usados:**

```
GET /weather?lat=-34.6356&lon=-58.3644&appid=TU_KEY&units=metric&lang=es
```

---

## 🗂️ Variables de Entorno

Crear un archivo `.env` en la raíz con:

```env
VITE_FOOTBALL_API_KEY=tu_key_aqui
VITE_NEWS_API_KEY=tu_key_aqui
VITE_WEATHER_API_KEY=tu_key_aqui
```

> ⚠️ **Nunca commitear el `.env` al repositorio. Agregarlo al `.gitignore`.**

---

## 📦 Secciones del Dashboard

### ✅ Fase 1 — Fixture (PRIORIDAD)

- Mostrar los **próximos 5 partidos** de Boca Juniors
- Cada tarjeta debe mostrar:
  - Escudos de ambos equipos
  - Nombre de los equipos
  - Fecha y hora (convertida a zona horaria Argentina, `America/Argentina/Buenos_Aires`)
  - Competición (Liga Profesional, Copa Libertadores, etc.)
  - Estadio
- Estado visual: **próximo** / **en vivo** / **finalizado**
- Últimos 3 resultados con marcador

### 🔲 Fase 2 — Tabla de Posiciones

- Tabla de la Liga Profesional Argentina temporada 2025
- Columnas: Pos | Equipo | PJ | G | E | P | GF | GC | DG | Pts
- Resaltar la fila de Boca Juniors
- Indicador visual de zona de clasificación a Libertadores / descenso

### 🔲 Fase 3 — Noticias

- Feed de las últimas noticias relacionadas a Boca Juniors
- Cada card: imagen, título, fuente, fecha, link externo
- Filtro por categoría: Mercado de pases | Resultados | Opinión

### 🔲 Fase 4 — Widget del Clima

- Clima actual en La Bombonera
- Temperatura, condición, humedad, viento
- Útil para saber cómo ir a la cancha

---

## 🚀 Setup Inicial

```bash
# 1. Crear el proyecto
npm create vite@latest la12-digital -- --template react
cd la12-digital

# 2. Instalar dependencias
npm install axios

# 3. Crear el .env con las API keys

# 4. Correr en desarrollo
npm run dev
```

---

## 📋 Orden de Implementación Sugerido

1. **Setup del proyecto** (Vite + estructura de carpetas + `.env`)
2. **`footballApi.js`** — servicio base con Axios para API-Football
3. **`useFixture.js`** — hook que consume el servicio
4. **`FixtureCard.jsx`** — componente visual de cada partido
5. **`FixtureList.jsx`** — lista que renderiza las cards
6. **`Dashboard.jsx`** — página principal que integra todo
7. Repetir el ciclo para Standings, News y Weather

---

## 🔒 Consideraciones Importantes

- **CORS:** La NewsAPI en su plan free no permite requests desde el browser en producción. Para desarrollo local funciona. En producción se necesita un pequeño backend proxy o usar la versión de servidor.
- **Rate Limits:** Respetar los límites de cada API. Implementar caché local con `localStorage` o `sessionStorage` para no hacer requests repetidos innecesariamente.
- **Timezone:** Siempre convertir las fechas de la API (que vienen en UTC) a `America/Argentina/Buenos_Aires`.
- **API Keys:** Jamás exponerlas en el código. Solo via variables de entorno `VITE_`.

---

_Proyecto iniciado: Febrero 2026 | Stack: React + Vite | Club: Boca Juniors 💙💛_
