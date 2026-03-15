# SPEC: La 12 Digital — UX/UI Improvements
**Versión:** 1.0  
**Fecha:** Marzo 2026  
**Stack:** React + Vite + TypeScript + Tailwind CSS  
**Scope:** Solo frontend — no modificar Go backend ni Supabase  

---

## Design System de referencia

| Token | Valor |
|---|---|
| Color primario (azul) | `#003087` |
| Color secundario (dorado) | `#F5C518` |
| Color fondo oscuro | `#001a4d` o `#0a1628` |
| Victoria (verde) | `#1a5c3a` |
| Derrota (rojo/bordeaux) | `#5c1a1a` |
| Font display | Crimson Pro |
| Font body | Inter |

---

## MEJORA 1 — Fix SPA Routing en Cloudflare Workers
**Prioridad:** 🔴 CRÍTICA  
**Archivo a modificar:** `wrangler.toml` y/o `public/_routes.json`

### Problema
Navegar a `/plantel` o `/asistencia` cambia la URL pero renderiza el Home. El Worker no tiene un catch-all para rutas del SPA.

### Solución
Crear o editar el archivo `public/_routes.json` para que todas las rutas sirvan el `index.html`:

```json
{
  "version": 1,
  "include": ["/*"],
  "exclude": ["/assets/*", "/api/*"]
}
```

Si se usa `wrangler.toml`, verificar que exista:
```toml
[site]
bucket = "./dist"
```

Y en el Worker entry point, asegurarse de que rutas desconocidas devuelvan el `index.html`:
```ts
// Si hay un worker.ts custom, agregar fallback:
if (!response || response.status === 404) {
  return env.ASSETS.fetch(new Request(new URL("/index.html", request.url)));
}
```

### Criterio de aceptación
- `/plantel` renderiza la vista Plantel
- `/asistencia` renderiza la vista Asistencia a partidos
- Las rutas directas (deep links) funcionan correctamente al pegar en barra del browser

---

## MEJORA 2 — Navbar: Active State + Tooltips en íconos
**Prioridad:** 🟠 ALTA  
**Archivo a modificar:** `src/components/Navbar.tsx` (o similar)

### Problema
- Ningún ítem del nav muestra cuál es la ruta activa
- Los 3 íconos de estrella dorada en el extremo derecho no tienen label ni tooltip

### Solución A — Active state en NavLinks
Reemplazar los `<Link>` actuales por `<NavLink>` de React Router con clase dinámica:

```tsx
import { NavLink } from 'react-router-dom';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium transition-colors duration-150 pb-0.5 ${
    isActive
      ? 'text-[#F5C518] border-b-2 border-[#F5C518]'
      : 'text-white hover:text-[#F5C518]'
  }`;

// En el JSX:
<NavLink to="/" className={navLinkClass} end>Inicio</NavLink>
<NavLink to="/plantel" className={navLinkClass}>Plantel</NavLink>
<NavLink to="/asistencia" className={navLinkClass}>Asistencia a partidos</NavLink>
```

### Solución B — Tooltips en íconos de estrella
Agregar `title` y `aria-label` a cada ícono del extremo derecho del nav:

```tsx
// Identificar qué representa cada estrella y agregar:
<button
  title="Favoritos"
  aria-label="Ver favoritos"
  className="text-[#F5C518] hover:scale-110 transition-transform"
>
  <StarIcon className="w-5 h-5" />
</button>
```

### Criterio de aceptación
- El ítem activo del nav siempre tiene underline dorado
- Hover en íconos del nav muestra tooltip con descripción
- No se rompe el layout en ningún breakpoint

---

## MEJORA 3 — Ticker/Marquee: Velocidad + Pause on hover + Accesibilidad
**Prioridad:** 🟠 ALTA  
**Archivo a modificar:** `src/components/Ticker.tsx` o `Marquee.tsx` (o el componente que contenga el ticker de letras de canciones)

### Problema
- El ticker se mueve demasiado rápido — dificulta la lectura
- No pausa al hacer hover — experiencia frustrante
- No tiene `aria-hidden` — los screen readers lo leen innecesariamente

### Solución

```tsx
// En el componente del ticker, agregar aria-hidden y la clase de grupo para hover
<div
  className="overflow-hidden bg-[#F5C518] py-1 group"
  aria-hidden="true"
  role="presentation"
>
  <div
    className={`
      flex whitespace-nowrap
      animate-marquee
      group-hover:[animation-play-state:paused]
    `}
  >
    {/* contenido del ticker */}
  </div>
</div>
```

En `tailwind.config.ts`, verificar o ajustar la duración de la animación:

```ts
// tailwind.config.ts
extend: {
  animation: {
    marquee: 'marquee 40s linear infinite', // aumentar de ~20s a 40s para leer mejor
  },
  keyframes: {
    marquee: {
      '0%': { transform: 'translateX(0%)' },
      '100%': { transform: 'translateX(-50%)' },
    },
  },
},
```

Si se usa CSS puro en lugar de Tailwind para la animación, editar el archivo `.css` correspondiente:
```css
.marquee-content {
  animation: marquee 40s linear infinite;
}
.marquee-wrapper:hover .marquee-content {
  animation-play-state: paused;
}
```

### Criterio de aceptación
- El ticker se puede leer cómodamente
- Al hacer hover sobre el ticker, la animación se detiene
- Los screen readers no anuncian el contenido del ticker

---

## MEJORA 4 — Cards "Próximos partidos": Ambos escudos + Badge V/L mejorado
**Prioridad:** 🟠 ALTA  
**Archivo a modificar:** `src/components/MatchCard.tsx` o `ProximosPartidos.tsx`

### Problema
- Las cards solo muestran el rival, sin mostrar a Boca Juniors como equipo local/visitante
- Los badges `V` y `L` son demasiado pequeños y sin contexto

### Solución

**Estructura visual sugerida para cada card:**

```tsx
// Reemplazar el layout actual por un layout matchup tipo:
// [Escudo Boca] vs [Escudo Rival]

<div className="flex items-center justify-between gap-2 mb-3">
  {/* Equipo local */}
  <div className="flex flex-col items-center gap-1">
    <img src={bocaShieldUrl} alt="Boca Juniors" className="w-8 h-8 object-contain" />
    <span className="text-xs text-white/70">Boca</span>
  </div>

  {/* VS central */}
  <span className="text-[#F5C518] font-bold text-sm">VS</span>

  {/* Rival */}
  <div className="flex flex-col items-center gap-1">
    <img src={match.rivalLogo} alt={match.rival} className="w-8 h-8 object-contain" />
    <span className="text-xs text-white/70 truncate max-w-[60px] text-center">
      {match.rival}
    </span>
  </div>
</div>

{/* Badge mejorado */}
<span
  className={`
    text-xs font-semibold px-2 py-0.5 rounded-full
    ${match.isHome
      ? 'bg-green-700/40 text-green-300 border border-green-600'
      : 'bg-blue-700/40 text-blue-300 border border-blue-600'
    }
  `}
>
  {match.isHome ? '🏟️ Local' : '✈️ Visitante'}
</span>
```

### Criterio de aceptación
- Cada card muestra visualmente los dos equipos enfrentados
- El badge de Local/Visitante es legible y tiene suficiente contraste
- El layout no se rompe en cards más angostas (responsive)

---

## MEJORA 5 — Tabla "Últimos partidos": Leyenda de colores
**Prioridad:** 🟡 MEDIA  
**Archivo a modificar:** `src/components/UltimosPartidos.tsx` o similar

### Problema
Las filas usan colores de fondo para indicar victoria/empate/derrota pero no hay ninguna leyenda. El usuario nuevo no puede interpretar el sistema.

### Solución
Agregar una leyenda pequeña debajo de la tabla:

```tsx
{/* Leyenda — agregar justo debajo del </table> o </div> de la tabla */}
<div className="flex items-center gap-4 mt-3 text-xs text-white/50">
  <div className="flex items-center gap-1.5">
    <span className="w-3 h-3 rounded-sm bg-[#1a5c3a] inline-block" />
    <span>Victoria</span>
  </div>
  <div className="flex items-center gap-1.5">
    <span className="w-3 h-3 rounded-sm bg-white/10 border border-white/20 inline-block" />
    <span>Empate</span>
  </div>
  <div className="flex items-center gap-1.5">
    <span className="w-3 h-3 rounded-sm bg-[#5c1a1a] inline-block" />
    <span>Derrota</span>
  </div>
</div>
```

### Criterio de aceptación
- La leyenda aparece debajo de la tabla de resultados
- Los colores de la leyenda coinciden exactamente con los usados en las filas
- La leyenda no ocupa espacio excesivo

---

## MEJORA 6 — Renombrar "La bombonera en vivo"
**Prioridad:** 🟡 MEDIA  
**Archivo a modificar:** `src/components/BomboneraCard.tsx` o `StadiumWidget.tsx`

### Problema
El título "La bombonera en vivo" implica que hay un stream en tiempo real, pero el contenido es estático (foto + clima + próximo partido). Genera expectativa falsa.

### Solución
Cambiar el título del componente:

```tsx
// Antes:
<h2>La bombonera en vivo</h2>

// Después:
<h2>La Bombonera hoy</h2>
```

Si en el futuro se agrega un stream real, revertir el cambio con la condición:
```tsx
<h2>{isLive ? 'La Bombonera en vivo 🔴' : 'La Bombonera hoy'}</h2>
```

### Criterio de aceptación
- El título visible dice "La Bombonera hoy"
- No hay referencias al concepto "en vivo" en esta sección salvo que exista un stream activo

---

## MEJORA 7 — Carousel "Noticias": Accesibilidad + Dots + Títulos
**Prioridad:** 🟡 MEDIA  
**Archivo a modificar:** `src/components/NoticiasCarousel.tsx` o similar

### Problema
- Los botones `<` y `>` no tienen `aria-label`
- Los dots de navegación usan íconos de estrella (★☆☆), difícil de interpretar
- Los títulos de noticias están en ALL CAPS, reduciendo legibilidad

### Solución A — Aria-labels en botones
```tsx
<button
  onClick={prev}
  aria-label="Noticia anterior"
  className="..."
>
  ‹
</button>

<button
  onClick={next}
  aria-label="Noticia siguiente"
  className="..."
>
  ›
</button>
```

### Solución B — Reemplazar dots de estrella por dots estándar
```tsx
{/* Reemplazar los íconos de estrella por dots accesibles */}
<div className="flex justify-center gap-2 mt-3" role="tablist" aria-label="Noticias">
  {noticias.map((_, i) => (
    <button
      key={i}
      role="tab"
      aria-selected={i === currentIndex}
      aria-label={`Noticia ${i + 1}`}
      onClick={() => setCurrentIndex(i)}
      className={`
        w-2 h-2 rounded-full transition-all duration-200
        ${i === currentIndex
          ? 'bg-[#F5C518] w-4'
          : 'bg-white/30 hover:bg-white/50'
        }
      `}
    />
  ))}
</div>
```

### Solución C — Títulos de noticias: cambiar de ALL CAPS a normal
```tsx
// En el CSS del componente o en Tailwind, remover text-transform: uppercase
// Si está hardcodeado en Tailwind: quitar la clase `uppercase`

// Si los títulos vienen en mayúsculas desde la API, hacer transform en el render:
<p className="text-sm font-medium text-white leading-snug">
  {noticia.titulo
    .toLowerCase()
    .replace(/^\w/, c => c.toUpperCase()) // Sentence case
  }
</p>
```

### Criterio de aceptación
- Botones prev/next tienen aria-label descriptivo
- Los dots son círculos con estado activo claro (dot activo más ancho en dorado)
- Los títulos de noticias están en Sentence case, no en ALL CAPS

---

## MEJORA 8 — Sidebar: Separador entre tabla de posiciones y minijuegos
**Prioridad:** 🟡 MEDIA  
**Archivo a modificar:** `src/components/Sidebar.tsx` o el layout que agrupa estos widgets

### Problema
La tabla de posiciones y los widgets de juegos ("¿Qué ídolo es?", "¿Recordás el plantel?") aparecen pegados sin separación visual ni agrupación clara.

### Solución

```tsx
{/* Tabla de posiciones */}
<section aria-label="Tabla de posiciones">
  <TablaPosiciones />
</section>

{/* Separador */}
<hr className="border-white/10 my-4" />

{/* Minijuegos */}
<section aria-label="Minijuegos">
  <h3 className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-3">
    🎮 Minijuegos
  </h3>
  <AdivinarIdoloWidget />
  <CompletarPlantelWidget />
</section>
```

### Criterio de aceptación
- Existe separación visual clara entre la tabla de posiciones y los minijuegos
- El header "Minijuegos" agrupa semánticamente los widgets de juego
- El layout del sidebar no se rompe en pantallas más angostas

---

## MEJORA 9 — Reemplazar emojis de UI por íconos SVG
**Prioridad:** 🟢 BAJA  
**Archivos a modificar:** `BomboneraCard.tsx` y cualquier componente que use 📍 o 🌤️ en la UI

### Problema
La card del estadio usa emojis `📍` y `🌤️` mezclados con íconos SVG del resto de la UI. Esto genera inconsistencia visual.

### Solución
Usar íconos de Lucide React (ya incluido en el proyecto o fácil de instalar):

```tsx
import { MapPin, Sun, Cloud, CloudRain } from 'lucide-react';

// Antes: 📍 Brandsen 805
// Después:
<span className="flex items-center gap-1 text-sm">
  <MapPin className="w-3.5 h-3.5 text-[#F5C518]" />
  Brandsen 805
</span>

// Para el clima, mapear condición a ícono:
const weatherIcon = {
  'Despejado': <Sun className="w-4 h-4 text-yellow-400" />,
  'Nublado': <Cloud className="w-4 h-4 text-gray-300" />,
  'Lluvioso': <CloudRain className="w-4 h-4 text-blue-300" />,
}[weatherCondition] ?? <Sun className="w-4 h-4 text-yellow-400" />;
```

### Criterio de aceptación
- No hay emojis en los datos de ubicación o clima de la card del estadio
- Se usan íconos SVG de tamaño consistente (w-4 h-4 por defecto)
- Los emojis en el ticker de canciones se mantienen (son parte del contenido, no de la UI)

---

## MEJORA 10 — Dropdown "Videos bosteros": Hover y Focus states
**Prioridad:** 🟢 BAJA  
**Archivo a modificar:** `src/components/VideosSection.tsx` o el componente del selector de canal

### Problema
El selector de canal de YouTube ("El Canal de Boca") no tiene hover ni focus state visible, parece un elemento estático.

### Solución
Agregar clases de interacción al `<select>` o al componente custom:

```tsx
<select
  className={`
    bg-[#001a4d] text-white text-sm px-3 py-1.5 rounded
    border border-white/20
    hover:border-[#F5C518]/50
    focus:outline-none focus:ring-2 focus:ring-[#F5C518]/40
    transition-all duration-150
    cursor-pointer
  `}
>
  {/* opciones */}
</select>
```

### Criterio de aceptación
- El selector tiene un border visible en hover (dorado semitransparente)
- El foco por teclado tiene un ring visible
- El cursor cambia a `pointer` al hacer hover

---

## Checklist de implementación para Claude Code

```
[ ] 1. Fix SPA routing — wrangler.toml + _routes.json catch-all
[ ] 2. NavLink active state — border-b dorado en ruta activa
[ ] 3. Ticker — reducir velocidad + pause-on-hover + aria-hidden
[ ] 4. MatchCard — mostrar ambos escudos + badge "Local"/"Visitante"
[ ] 5. UltimosPartidos — agregar leyenda de colores abajo de la tabla
[ ] 6. BomboneraCard — renombrar título a "La Bombonera hoy"
[ ] 7. NoticiasCarousel — aria-labels + dots estándar + sentence case en títulos
[ ] 8. Sidebar — separador hr + header "🎮 Minijuegos"
[ ] 9. BomboneraCard — reemplazar emojis 📍🌤️ por íconos Lucide
[ ] 10. VideosSection selector — agregar hover/focus states
```

---

## Notas para Claude Code

- **No instalar librerías nuevas** salvo `lucide-react` si aún no está en el proyecto (verificar con `cat package.json | grep lucide`)
- **No modificar archivos del backend** (Go, Supabase, Worker lógica de negocio)
- **Mantener el design system:** azul `#003087`, dorado `#F5C518`, Crimson Pro + Inter
- **Priorizar en orden:** críticas → altas → medias → bajas
- Después de cada cambio, verificar que el build no rompe: `npm run build`