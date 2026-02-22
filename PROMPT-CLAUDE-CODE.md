# PROMPT PARA CLAUDE CODE - LA 12 DIGITAL

## 🎯 OBJETIVO DEL PROYECTO

Desarrollar "La 12 Digital", un dashboard interactivo para hinchas de Boca Juniors con información en tiempo real del club. El diseño completo está en Figma y el design system ya está implementado.

---

## 📐 DISEÑO DE REFERENCIA

**Figma**: https://www.figma.com/design/4Ty5qowi9OnRNAQs364G60/Design-System

**Vista principal**: Dashboard con layout 70/30
- 70% contenido principal (widgets, noticias, videos)
- 30% sidebar (tabla posiciones, quiz)

---

## 🏗️ ARQUITECTURA

### Stack Tecnológico
- **Frontend**: React 18+ con Vite
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS (configurado con design tokens)
- **UI**: Componentes custom basados en design system

### APIs a Integrar
1. **API-Football** (Principal)
   - Endpoint: https://api-football-v1.p.rapidapi.com/v3
   - Team ID: 451 (Boca Juniors)
   - League ID: 128 (Liga Profesional Argentina)
   - Temporada: 2025 o 2026 (según fecha actual)

2. **OpenWeather API** (Clima)
   - Para widget "La Bombonera en vivo"
   - Ubicación: Buenos Aires, AR (-34.6354, -58.3646)

3. **YouTube Data API** (Videos)
   - Canal oficial Boca: UCxwHmLY33JYIbyfew-kW7dQ
   - Últimos videos y highlights

4. **NewsAPI** (Opcional - Noticias)
   - Query: "Boca Juniors"
   - Language: es

---

## 📁 ESTRUCTURA YA CREADA

```
la-12-digital/
├── design-system/          ✅ COMPLETO
│   ├── tokens/            → Variables de diseño
│   ├── components/        → Especificaciones
│   └── guidelines/        → Guías de uso
├── src/
│   ├── main.tsx          ✅ Entry point
│   ├── App.tsx           ✅ Componente base
│   ├── index.css         ✅ Tailwind imports
│   └── components/       📂 Crear componentes aquí
├── index.html            ✅ Con fuentes cargadas
├── package.json          ✅ Dependencias listas
├── tailwind.config.js    ✅ Configurado con tokens
├── vite.config.ts        ✅ Con path aliases
└── tsconfig.json         ✅ TypeScript configurado
```

---

## 🎨 DESIGN SYSTEM DISPONIBLE

### Importar Tokens
```typescript
import { colors, typography, spacing } from '@design-system/tokens';
```

### Usar con Tailwind
```jsx
<div className="bg-boca-blue text-boca-gold font-serif p-6">
  Dale Booo!
</div>
```

### Colores Principales
- `bg-boca-blue` → #001529 (azul)
- `text-boca-gold` → #FFD700 (oro)
- `bg-boca-blue-light` → #002140 (backgrounds)

### Tipografía
- `font-serif` → Crimson Pro (80% contenido)
- `font-sans` → Geist (20% UI elements)

**Documentación completa**: `/design-system/README.md`

---

## 🧩 COMPONENTES A DESARROLLAR

### 1. Header
- Logo Boca (40x40px)
- Navegación: Inicio, Plantel, Historia
- 3 estrellas doradas (derecha)

### 2. Banner Mensaje Diario
- 6 estrellas doradas al inicio
- Mensajes rotativos por día de semana
- Ver especificación: `/design-system/components/README.md`

### 3. Widget La Bombonera
- Foto aérea del estadio
- Clima en tiempo real (OpenWeather API)
- Próximo partido en casa (días restantes)

### 4. Últimos Partidos
- Grid de 5 cards
- Colores según resultado:
  - Victoria: bg verde oscuro #1A4D2E
  - Derrota: bg rojo oscuro #7A1F1F
  - Empate: bg gris #4A5568

### 5. Próximos Partidos
- Grid responsive de 4 cards
- Info: rival, fecha, hora, estadio
- Estado hover elevado

### 6. Tabla de Posiciones
- 15 equipos
- Fila Boca destacada (bg dorado 8% opacity)
- Padding vertical 12px por row
- Responsive: scroll horizontal en mobile

### 7. Carousel Noticias
- 3 cards visibles
- Border dorado sutil
- Hover: lift + shadow dorado
- Controles: círculos 40px con flechas

### 8. Carousel Videos YouTube
- 4 videos visibles (desktop)
- Thumbnails de YouTube
- Título debajo de cada video

### 9. Quiz "¿Quién es este ídolo?"
- Foto del jugador
- Input para nombre
- Botón "¡Dale Bo!"

### 10. Jugadores Lesionados/Expulsados
- Contador grande
- Texto secundario
- Link "Ver detalle"

---

## 🔑 CONFIGURACIÓN DE APIs

### Crear archivo .env
```bash
cp .env.example .env
```

Luego completar con tus API keys.

### API-Football - Endpoints Principales

**Últimos partidos:**
```
GET /fixtures?team=451&last=5&season=2025
```

**Próximos partidos:**
```
GET /fixtures?team=451&next=4&season=2025
```

**Tabla de posiciones:**
```
GET /standings?league=128&season=2025
```

**Plantel:**
```
GET /players/squads?team=451
```

**Lesionados:**
```
GET /injuries?team=451&season=2025
```

### OpenWeather API

**Clima actual:**
```
GET /weather?lat=-34.6354&lon=-58.3646&units=metric&lang=es
```

### YouTube Data API

**Últimos videos canal Boca:**
```
GET /search?part=snippet&channelId=UCxwHmLY33JYIbyfew-kW7dQ&maxResults=4&order=date
```

---

## 📝 CONVENCIONES DE CÓDIGO

### Naming de Componentes
```
src/components/
├── Header/
│   ├── Header.tsx
│   ├── Header.module.css (si necesario)
│   └── index.ts
├── BannerMensaje/
│   ├── BannerMensaje.tsx
│   └── index.ts
└── ...
```

### Nomenclatura de Archivos
- Componentes: PascalCase (ej: `CardNoticia.tsx`)
- Utilities: camelCase (ej: `formatDate.ts`)
- Constantes: UPPER_SNAKE_CASE (ej: `API_ENDPOINTS.ts`)

### Estructura de Componente
```typescript
import { colors } from '@design-system/tokens';

interface CardNoticiaProps {
  title: string;
  imageUrl: string;
  date: string;
}

export function CardNoticia({ title, imageUrl, date }: CardNoticiaProps) {
  return (
    <div className="card-noticia">
      {/* Implementación */}
    </div>
  );
}
```

---

## 🎭 EASTER EGGS A IMPLEMENTAR

### Mensajes por Día
```typescript
const MENSAJES_SEMANALES = {
  0: "⭐⭐⭐⭐⭐⭐ Domingo: día de comunión azul y oro",
  1: "⭐⭐⭐⭐⭐⭐ Comienza una nueva semana en La Ribera",
  2: "⭐⭐⭐⭐⭐⭐ La tradición se vive cada día del año",
  3: "⭐⭐⭐⭐⭐⭐ Mitad de semana, mitad + 1 siempre",
  4: "⭐⭐⭐⭐⭐⭐ Un día más cerca del domingo boquense",
  5: "⭐⭐⭐⭐⭐⭐ Se acerca el día del hincha xeneize",
  6: "⭐⭐⭐⭐⭐⭐ El día en que los hinchas peregrinan a La Bombonera"
};
```

### Duraciones Históricas
```css
transition: 0.1905s; /* 1905 - año fundación */
animation-delay: 0.012s; /* La 12 */
```

### Valores Numéricos
```typescript
const LA_DOCE = 12;
const DIEZ_ROMAN = 10;
const FUNDACION = 1905;
```

---

## ⚠️ IMPORTANTE - REGLAS DE DESARROLLO

### ✅ SIEMPRE HACER:
1. **Usar el design system existente**
   - Importar tokens de `/design-system/tokens`
   - Consultar especificaciones en `/design-system/components`
   - Seguir guías de `/design-system/guidelines`

2. **Tipografía correcta**
   - 80% Crimson Pro (serif): títulos, contenido, nombres
   - 20% Inter (sans): inputs, botones, números, UI

3. **Estados interactivos**
   - Hover: lift + shadow dorado
   - Focus: outline dorado 2px
   - Active: pressed state
   - Disabled: opacity 50%

4. **Responsive**
   - Mobile first approach
   - Breakpoints: sm (640), md (768), lg (1024), xl (1280), 2xl (1440)

5. **Accesibilidad**
   - Alt text en imágenes
   - ARIA labels donde corresponda
   - Contraste WCAG AA mínimo
   - Navegación por teclado

### ❌ NUNCA HACER:
1. Colores fuera del sistema (#FF0000, #00FF00, etc.)
2. Espaciado que no sea múltiplo de 8px
3. Tipografía sans en títulos/contenido principal
4. Hover sin transición
5. Borders gruesos (>3px)

---

## 🚀 WORKFLOW DE DESARROLLO

### Fase 1: Setup Inicial
1. ✅ Instalar dependencias: `npm install`
2. ✅ Crear `.env` con API keys
3. ✅ Verificar que `npm run dev` funcione

### Fase 2: Componentes Base
1. Header
2. Banner Mensaje Diario
3. Layout principal (70/30)

### Fase 3: Widgets e Integraciones
1. Widget La Bombonera (+ OpenWeather API)
2. Últimos Partidos (+ API-Football)
3. Próximos Partidos (+ API-Football)
4. Tabla Posiciones (+ API-Football)

### Fase 4: Contenido Multimedia
1. Carousel Noticias
2. Carousel Videos (+ YouTube API)

### Fase 5: Elementos Interactivos
1. Quiz ídolo
2. Contadores lesionados/expulsados

### Fase 6: Polish
1. Loading states
2. Error handling
3. Animaciones
4. Optimización

---

## 📊 OPTIMIZACIÓN Y PERFORMANCE

### Caching
```typescript
// LocalStorage para responses de API
localStorage.setItem('tabla-posiciones', JSON.stringify(data));

// Refresh cada 10 minutos
const CACHE_DURATION = 10 * 60 * 1000;
```

### Límites de API
- **API-Football**: 100 req/día (free tier)
  - Optimizar: ~4-5 llamadas/día con caching
- **OpenWeather**: 1000 req/día
  - Refresh cada 10 min
- **YouTube**: 10,000 units/día
  - 1 búsqueda = 100 units

---

## 🧪 TESTING

### Verificar antes de commit:
- [ ] Componente renderiza correctamente
- [ ] Estados hover/focus funcionan
- [ ] Responsive en 3 tamaños (mobile, tablet, desktop)
- [ ] Accesibilidad básica (alt, aria)
- [ ] Sin console.errors
- [ ] API calls con error handling

---

## 📚 REFERENCIAS ÚTILES

- [Design System](./design-system/README.md)
- [Componentes](./design-system/components/README.md)
- [Guidelines](./design-system/guidelines/README.md)
- [API-Football Docs](https://www.api-football.com/documentation-v3)
- [OpenWeather Docs](https://openweathermap.org/api)
- [YouTube API Docs](https://developers.google.com/youtube/v3)

---

## 🎯 OBJETIVO FINAL

Dashboard funcional con:
- ✅ Identidad visual Boca perfecta
- ✅ Datos en tiempo real
- ✅ Interactividad fluida
- ✅ Responsive completo
- ✅ Accesible WCAG AA
- ✅ Easter eggs boquenses
- ✅ Performance optimizada

---

**¡Dale Booo! Empecemos a desarrollar 💙💛**
