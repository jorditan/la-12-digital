# UX Layout Overhaul Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Mejorar la UX estructural de la app: aside flotante/plegable, reubicación de minijuegos, rediseño de la sección de videos con bento layout, y mejora visual del widget Bombonera.

**Architecture:** Cuatro mejoras independientes sobre `App.tsx` y componentes existentes. Sin cambios en servicios ni hooks de datos. Cada tarea es un commit aislado.

**Tech Stack:** React + TypeScript + Tailwind CSS v3, Lucide React (iconos), design tokens existentes en `tailwind.config.js` y `src/index.css`.

---

## Contexto del layout actual

```
App.tsx
├── <main>   BomboneraWidget · UltimosPartidos · ProximosPartidos · Noticias · CanalYoutube
└── <aside>  TablaPosiciones · IdolosGame · EquiposGame   ← sticky top-8, se ve raro al scrollear
```

El aside usa `sticky top-8` dentro de un flex row. En pantallas grandes funciona, pero con mucho contenido en el aside el sticky termina saliendo del viewport o quedando "colgado" visualmente.

---

## Tarea 1 — Aside flotante y plegable (desktop + mobile)

**Descripción:** Reemplazar el aside estático por un panel que en desktop sea fixed/flotante con toggle de collapse, y en mobile sea un drawer que sube desde abajo o desde la derecha.

**Archivos:**
- Crear: `src/components/Sidebar/Sidebar.tsx`
- Crear: `src/components/Sidebar/index.ts`
- Modificar: `src/App.tsx`

**Comportamiento esperado:**
- **Desktop (lg+):** Panel fixed en el lado derecho, `top-0 right-0 h-screen`, con un botón ‹ / › para colapsar/expandir. Ancho expandido `w-80 xl:w-96`, colapsado `w-10`. Contenido del aside (TablaPosiciones + juegos*) dentro con scroll interno (`overflow-y-auto`).
- **Mobile (<lg):** Botón flotante (FAB) fijo abajo a la derecha que abre un drawer desde abajo. El drawer toma `max-h-[80vh]` con scroll interno y se cierra con overlay o swipe.
- Estado de colapso persistido en `localStorage` (clave `sidebar-collapsed`).

> *Los juegos se van a mover en Tarea 2. En esta tarea el aside solo contendrá `TablaPosiciones`.*

**Step 1: Crear el componente Sidebar**

```tsx
// src/components/Sidebar/Sidebar.tsx
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, LayoutList } from 'lucide-react';
import { TablaPosiciones } from '../TablaPosiciones';

const STORAGE_KEY = 'sidebar-collapsed';

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(STORAGE_KEY) === 'true'
  );
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggle = () =>
    setCollapsed(prev => {
      localStorage.setItem(STORAGE_KEY, String(!prev));
      return !prev;
    });

  // Cerrar drawer al hacer resize a desktop
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const handler = (e: MediaQueryListEvent) => { if (e.matches) setDrawerOpen(false); };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <>
      {/* ── DESKTOP: panel fixed ── */}
      <aside
        className={`
          hidden lg:flex flex-col fixed top-0 right-0 h-screen z-30
          bg-boca-blue border-l border-boca-border transition-all duration-300
          ${collapsed ? 'w-10' : 'w-80 xl:w-96'}
        `}
      >
        {/* Toggle button */}
        <button
          onClick={toggle}
          aria-label={collapsed ? 'Expandir panel' : 'Colapsar panel'}
          className="absolute -left-3 top-20 z-10 w-6 h-6 rounded-full
            bg-boca-blue-light border border-boca-border
            flex items-center justify-center
            text-text-nav hover:text-boca-gold transition-colors"
        >
          {collapsed ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
        </button>

        {/* Contenido (oculto cuando colapsa) */}
        <div className={`flex-1 overflow-y-auto p-4 ${collapsed ? 'hidden' : 'block'}`}>
          <TablaPosiciones />
        </div>
      </aside>

      {/* ── MOBILE: FAB + drawer ── */}
      <div className="lg:hidden">
        {/* FAB */}
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Ver tabla de posiciones"
          className="fixed bottom-5 right-5 z-40 w-12 h-12 rounded-full
            bg-boca-gold text-text-on-gold shadow-lg
            flex items-center justify-center"
        >
          <LayoutList size={20} />
        </button>

        {/* Overlay */}
        {drawerOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60"
            onClick={() => setDrawerOpen(false)}
          />
        )}

        {/* Drawer */}
        <div
          className={`
            fixed bottom-0 left-0 right-0 z-50
            bg-boca-blue border-t border-boca-border rounded-t-2xl
            max-h-[80vh] overflow-y-auto p-4
            transition-transform duration-300
            ${drawerOpen ? 'translate-y-0' : 'translate-y-full'}
          `}
        >
          {/* Handle */}
          <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4" />
          <TablaPosiciones />
        </div>
      </div>
    </>
  );
}
```

**Step 2: Crear barrel**

```ts
// src/components/Sidebar/index.ts
export { Sidebar } from './Sidebar';
```

**Step 3: Actualizar App.tsx**

Reemplazar el bloque del aside y agregar el offset en main para compensar el panel fixed en desktop:

```tsx
// src/App.tsx — cambios:
import { Sidebar } from './components/Sidebar';

// Quitar: import de IdolosGame, EquiposGame del aside (se mueven en Tarea 2)
// Quitar: <Separator /> y el <aside> actual
// Agregar: <Sidebar /> fuera del flex container
// Agregar en main: className con lg:mr-80 xl:mr-96 para el offset

// Estructura resultante:
<div className="min-h-screen ...">
  {/* decoración */}
  <Header />
  <BannerMensaje />
  <Sidebar />  {/* ← nuevo, fixed */}
  <div className="w-full px-3 md:px-4 sm:px-6 py-3 sm:py-8 lg:mr-80 xl:mr-96">
    <main>
      {/* mismo contenido de main */}
    </main>
  </div>
</div>
```

**Step 4: Verificar visualmente**
- Desktop: panel visible a la derecha, botón toggle funciona, colapso persiste
- Mobile: FAB visible, drawer sube/baja, overlay cierra el drawer

**Step 5: Commit**
```bash
git add src/components/Sidebar/ src/App.tsx
git commit -m "feat: aside flotante con collapse en desktop y drawer mobile"
```

---

## Tarea 2 — Reubicar minijuegos al main

**Descripción:** Sacar `IdolosGame` y `EquiposGame` del aside y colocarlos entre `Noticias` y `CanalYoutube` en el main. Esto libera el aside para que solo tenga `TablaPosiciones` (más limpio) y pone los juegos en un lugar más visible del flujo principal.

**Archivos:**
- Modificar: `src/App.tsx`
- Modificar: `src/components/Sidebar/Sidebar.tsx`

**Layout resultante en main:**
```
BomboneraWidget + UltimosPartidos
ProximosPartidos
Noticias
── Sección minijuegos ──
CanalYoutube
```

**Step 1: Eliminar juegos del Sidebar**

En `Sidebar.tsx`, quitar los imports de `IdolosGame` y `EquiposGame`. El contenido del sidebar queda solo con `TablaPosiciones`.

**Step 2: Agregar juegos en App.tsx main**

```tsx
// En <main>, después de Noticias y antes de CanalYoutube:
<div className="mt-6 sm:mt-10">
  <Noticias />
</div>

{/* ── Minijuegos ── */}
<div className="mt-6 sm:mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
  <IdolosGame />
  <EquiposGame />
</div>

<div className="mt-6 sm:mt-10">
  <CanalYoutube />
</div>
```

Colocarlos en grid 2 columnas en desktop hace que los juegos se vean como una sección dedicada, no como widgets secundarios.

**Step 3: Verificar que los juegos siguen funcionando**
- Abrir la app, jugar una ronda de IdolosGame y EquiposGame
- Confirmar que la TimerBar y el estado de juego no se rompen

**Step 4: Commit**
```bash
git add src/App.tsx src/components/Sidebar/Sidebar.tsx
git commit -m "feat: mueve minijuegos del aside al main entre noticias y videos"
```

---

## Tarea 3 — Videos: bento layout + canal visible sin selector

**Descripción:** Reemplazar el `CanalSelector` (dropdown oculto) por tabs/pills de canales siempre visibles. Rediseñar el grid de videos con un layout bento donde el primer video es prominente y el resto secundarios.

**Archivos:**
- Modificar: `src/components/CanalYoutube/CanalYoutube.tsx`
- Eliminar: `src/components/CanalSelector/` (o dejar pero ya no se usa en CanalYoutube)

**Step 1: Agregar tabs de canal**

Reemplazar el `<CanalSelector>` por pills horizontales:

```tsx
// Dentro de CanalYoutube.tsx — reemplazar la fila de header
<div className="flex flex-col gap-3 mb-4">
  <div className="flex items-center gap-3">
    <Youtube size={20} className="text-boca-gold shrink-0" />
    <h2 className="font-serif font-bold text-[22px] sm:text-[32px] leading-tight text-boca-gold tracking-tight">
      Videos bosteros
    </h2>
  </div>
  {/* Pills de canal */}
  <div className="flex flex-wrap gap-2">
    {CANALES_YOUTUBE.map(c => (
      <button
        key={c.handle}
        onClick={() => setCanal(c)}
        className={`
          font-sans text-xs font-medium px-3 py-1.5 rounded-full border transition-colors
          ${canal.handle === c.handle
            ? 'bg-boca-gold text-text-on-gold border-boca-gold'
            : 'border-boca-border text-text-nav hover:border-boca-gold/50 hover:text-boca-gold'}
        `}
      >
        {c.nombre}
      </button>
    ))}
  </div>
</div>
```

**Step 2: Bento grid de videos (desktop)**

```tsx
// Reemplazar el grid desktop en CanalYoutube.tsx
{estado === 'ok' && videos.length > 0 && (
  <>
    {/* Mobile: scroll horizontal (sin cambios) */}
    <div className="sm:hidden">
      <VideoScrollRow videos={videos} />
    </div>

    {/* Desktop: bento */}
    <div className="hidden sm:grid gap-3" style={{ gridTemplateColumns: '2fr 1fr 1fr', gridTemplateRows: 'auto auto' }}>
      {/* Video destacado — ocupa 2 filas */}
      <div className="row-span-2">
        <CardVideo video={videos[0]} featured />
      </div>
      {/* Resto: hasta 4 videos secundarios */}
      {videos.slice(1, 5).map(video => (
        <CardVideo key={video.id} video={video} />
      ))}
    </div>
  </>
)}
```

**Step 3: Agregar prop `featured` a CardVideo**

En `src/components/CardVideo/CardVideo.tsx`, agregar la prop opcional `featured?: boolean` que hace el título más grande y agrega una descripción si está disponible:

```tsx
// En CardVideo — agregar al tipo de props:
featured?: boolean;

// En el JSX del título:
<p className={`font-serif font-semibold text-white leading-snug
  ${featured ? 'text-base sm:text-lg' : 'text-sm'}`}>
  {video.title}
</p>
```

**Step 4: Verificar**
- Cambiar entre canales con los pills
- Confirmar que el bento se ve bien en desktop (video grande a la izquierda, 4 pequeños a la derecha)
- Confirmar mobile scroll horizontal intacto

**Step 5: Commit**
```bash
git add src/components/CanalYoutube/ src/components/CardVideo/
git commit -m "feat: videos con tabs de canal visibles y bento layout desktop"
```

---

## Tarea 4 — Mejora visual BomboneraWidget (@frontend-design)

**Descripción:** Aplicar la skill `frontend-design` para elevar la UI del widget "Días restantes para ir a la Bombonera". El componente a modificar es `ModoNormal.tsx`.

**Archivos:**
- Modificar: `src/components/BomboneraWidget/ModoNormal.tsx`
- (opcional) Modificar: `src/components/BomboneraWidget/StatsGrid.tsx`, `ForecastRows.tsx`

**Antes de tocar el código, invocar la skill:**
```
@.claude/skills/frontend-design
```

**Dirección estética propuesta:** El widget debe sentirse como un "tablero de cuenta regresiva de estadio" — mezcla de scorecard deportivo y póster de partido. Elementos clave a elevar:

- El número de días (`diasHastaPartido`) debe ser el protagonista visual: grande, con tratamiento tipográfico dramático (quizás con un fondo sutil o separación visual clara).
- El escudo del rival debe tener más presencia (bordes, brillo sutil).
- El pronóstico del tiempo debe integrarse más como un "bloque de condiciones de partido", no como una lista genérica.
- Usar los tokens de color existentes: `boca-gold`, `boca-blue-mid`, `boca-border-card`.
- Mantener todos los props y la lógica existente — solo cambiar el JSX/clases de `ModoNormal.tsx`.

**Step 1: Leer el archivo actual entero**
```
Read: src/components/BomboneraWidget/ModoNormal.tsx
Read: src/components/BomboneraWidget/StatsGrid.tsx
```

**Step 2: Aplicar mejoras visuales con frontend-design**

Con la skill activa, reescribir `ModoNormal.tsx` manteniendo los mismos props y lógica, solo elevando el diseño visual. No eliminar ningún dato que ya se muestra.

**Step 3: Verificar en loading state**
- Confirmar que el skeleton (animate-pulse) sigue viéndose bien con el nuevo layout.

**Step 4: Commit**
```bash
git add src/components/BomboneraWidget/
git commit -m "design: mejora visual BomboneraWidget con tratamiento de scorecard"
```

---

## Orden de ejecución sugerido

| Tarea | Impacto | Complejidad | Dependencias |
|-------|---------|-------------|--------------|
| Tarea 2 (mover juegos) | Alto | Baja | — |
| Tarea 1 (aside flotante) | Alto | Media | Tarea 2 (los juegos ya no están en aside) |
| Tarea 3 (videos bento) | Medio | Baja | — |
| Tarea 4 (bombonera UI) | Medio | Baja | — |

Tareas 3 y 4 son completamente independientes entre sí y de 1+2.
