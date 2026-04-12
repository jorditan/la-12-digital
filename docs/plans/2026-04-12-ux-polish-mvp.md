# UX Polish MVP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implementar 4 mejoras de UX/UI (ISS-03, ISS-02, ISS-04, ISS-01) en la plataforma La 12 Digital como preparación para el lanzamiento del MVP.

**Architecture:** Cambios puramente de UI. No se toca lógica de negocio, fetching ni rutas. Se crea un nuevo componente `MatchUrgencyBadge`, se agrega un archivo de design tokens, y se ajustan clases Tailwind en componentes existentes.

**Tech Stack:** React + TypeScript + Tailwind CSS v3 · Design tokens en `tailwind.config.js` · Clases utilitarias personalizadas (bg-boca-*, text-boca-*, etc.)

---

## ISS-03 — Altura uniforme en botones de igual jerarquía

**Contexto:** En `CardPartido.tsx` el botón "Agregar al calendario" es un `<a>` con padding arbitrario. El button de H2H usa `w-7 h-7`. Ambos deben tener altura visual consistente de 40px (`h-10`).

### Task 1: Normalizar alturas en `CardPartido.tsx`

**Files:**
- Modify: `src/components/ProximosPartidos/CardPartido.tsx:96-128`

**Step 1: Abrir el archivo y localizar el footer de acciones**

El bloque de acciones está en las líneas ~93–129 de `CardPartido.tsx`. El link de calendario tiene clases `h-full` y padding vertical implícito. El botón H2H tiene `w-7 h-7`.

**Step 2: Reemplazar las clases del link de calendario**

Cambiar de:
```tsx
className="group flex h-full items-center gap-1.5 px-2 py-1 rounded-sm bg-white/[0.04] border border-white/[0.08] hover:bg-[#1a73e8]/10 hover:border-[#1a73e8]/30 transition-all duration-200 shrink-0"
```
A:
```tsx
className="group h-10 flex items-center gap-1.5 px-2 rounded-sm bg-white/[0.04] border border-white/[0.08] hover:bg-[#1a73e8]/10 hover:border-[#1a73e8]/30 transition-all duration-200 shrink-0"
```

**Step 3: Normalizar el botón H2H a `h-10 w-10`**

Cambiar de:
```tsx
className="flex items-center justify-center w-7 h-7 rounded-sm border ..."
```
A:
```tsx
className="flex items-center justify-center h-10 w-10 rounded-sm border ..."
```

**Step 4: Verificar que el ícono SVG inside tenga tamaño correcto**

El ícono `<History size={12} />` puede inflarse si se cambia el contenedor. Dejarlo en `size={14}` (ya es `w-4 h-4`). La imagen del calendario ya tiene `w-3.5 h-3.5 object-contain shrink-0`, está bien.

**Step 5: Commit**
```bash
git add src/components/ProximosPartidos/CardPartido.tsx
git commit -m "fix(ux): uniform h-10 for action buttons in CardPartido"
```

---

## ISS-02 — Componente centralizado `MatchUrgencyBadge`

**Contexto:** Existe `UrgencyBadge.tsx` en `src/components/ProximosPartidos/` que recibe `days: number`. El SPEC pide un componente nuevo `MatchUrgencyBadge` que reciba `matchDate: string | Date` y calcule la urgencia internamente via horas (no días). Este reemplaza al existente.

### Task 2: Crear `src/components/MatchUrgencyBadge.tsx`

**Files:**
- Create: `src/components/MatchUrgencyBadge.tsx`

**Step 1: Inspeccionar el `UrgencyBadge` existente**

El componente actual en `src/components/ProximosPartidos/UrgencyBadge.tsx` devuelve 3 variantes:
- `days === 0` → badge dorado con pulso "¡HOY!"
- `days === 1` → badge dorado suave "Mañana"
- `days <= 7` → badge blanco "En N días"
- `days > 7` → null

El nuevo debe usar horas para mayor precisión y usar los tokens del design system.

**Step 2: Crear el archivo**

```tsx
// src/components/MatchUrgencyBadge.tsx

interface MatchUrgencyBadgeProps {
  matchDate: string | Date;
  showIcon?: boolean;
}

type UrgencyLevel = 'critical' | 'upcoming' | 'near' | null;

function getUrgencyLevel(matchDate: string | Date): UrgencyLevel {
  const now = new Date();
  const date = new Date(matchDate);
  const diffHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (diffHours < 0) return null;
  if (diffHours <= 3) return 'critical';
  if (diffHours <= 24) return 'upcoming';
  if (diffHours <= 72) return 'near';
  return null;
}

const BASE = 'inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wide';

const BADGE_CONFIG: Record<NonNullable<UrgencyLevel>, { className: string; icon: string; label: string }> = {
  critical: {
    className: 'bg-boca-gold text-boca-blue',
    label: 'Hoy!',
  },
  upcoming: {
    className: 'bg-boca-gold/20 text-boca-gold border border-boca-gold/30',
    label: 'Mañana',
  },
  near: {
    className: 'bg-white/5 text-white/60 border border-white/10',
    label: 'Pronto',
  },
};

export function MatchUrgencyBadge({ matchDate, showIcon = true }: MatchUrgencyBadgeProps) {
  const level = getUrgencyLevel(matchDate);
  if (!level) return null;

  const config = BADGE_CONFIG[level];

  return (
    <span className={`${BASE} ${config.className}`}>
      {showIcon && <span aria-hidden="true">{config.icon}</span>}
      {config.label}
    </span>
  );
}
```

**Nota:** Se usa `rounded-sm` en lugar de `rounded-full` para mantener coherencia con el design system existente (que usa `rounded-sm` en badges). Si el SPEC pide `rounded-full`, cambiar aquí.

**Step 3: Crear barrel export en `src/components/MatchUrgencyBadge/index.ts`**

No crear carpeta, exportar directamente desde el archivo. Agregar re-export al barrel más cercano si existe.

**Step 4: Commit**
```bash
git add src/components/MatchUrgencyBadge.tsx
git commit -m "feat(ux): add MatchUrgencyBadge component with hour-based urgency"
```

---

### Task 3: Migrar `CardPartido.tsx` a `MatchUrgencyBadge`

**Files:**
- Modify: `src/components/ProximosPartidos/CardPartido.tsx`

**Step 1: Inspeccionar el uso actual de `UrgencyBadge`**

En `CardPartido.tsx` línea 89:
```tsx
{days >= 0 && days <= 7 && <UrgencyBadge days={days} />}
```

El hook `useCardPartido` ya calcula `days` y el componente tiene acceso a `partido.date`.

**Step 2: Reemplazar el import y el uso**

Cambiar el import de:
```tsx
import { UrgencyBadge } from './UrgencyBadge';
```
A:
```tsx
import { MatchUrgencyBadge } from '../MatchUrgencyBadge';
```

Cambiar el JSX de:
```tsx
{days >= 0 && days <= 7 && <UrgencyBadge days={days} />}
```
A:
```tsx
<MatchUrgencyBadge matchDate={partido.date} />
```

**Step 3: Verificar que `days` siga siendo usado en otro lugar del componente**

En `useCardPartido.ts`, `days` se usa para calcular `isUrgent` (que afecta el borde de la card). Por lo tanto `days` **no** se puede eliminar del hook todavía. Solo reemplazar el badge.

**Step 4: Commit**
```bash
git add src/components/ProximosPartidos/CardPartido.tsx
git commit -m "refactor(ux): use MatchUrgencyBadge in CardPartido"
```

---

### Task 4: Verificar si `FixtureTable.tsx` usa algún badge de urgencia

**Files:**
- Read: `src/components/ProximosPartidos/FixtureTable.tsx`

**Step 1: Buscar usos de badge en FixtureTable**

Correr: `grep -n "UrgencyBadge\|urgency\|HOY\|badge" src/components/ProximosPartidos/FixtureTable.tsx`

La tabla desktop (`FixtureTable.tsx`) no muestra actualmente un badge de urgencia — tiene `UrgencyBadge` solo en `CardPartido`. No hay nada que migrar aquí.

**Step 2: Buscar en todo el proyecto por si hay más usos**

```bash
grep -rn "UrgencyBadge\|HOY.*badge\|urgency" src/ --include="*.tsx"
```

Si se encuentran más, migrarlos igual que en el Task 3.

**Step 3: Commit (solo si se encontraron otros usos)**
```bash
git commit -m "refactor(ux): migrate remaining urgency badges to MatchUrgencyBadge"
```

---

## ISS-04 — Centralizar tokens de diseño

**Contexto:** El proyecto ya tiene tokens en `tailwind.config.js` (bg-boca-*, text-boca-*, etc.) y CSS variables en `src/index.css`. El SPEC pide además un archivo `src/styles/design-tokens.ts` con cadenas de clases Tailwind reutilizables (no CSS variables).

### Task 5: Crear `src/styles/design-tokens.ts`

**Files:**
- Create: `src/styles/design-tokens.ts`

**Step 1: Crear el directorio y el archivo**

```ts
// src/styles/design-tokens.ts

export const tokens = {
  // Contenedores
  card: 'rounded-sm border border-boca-border bg-boca-blue-mid',
  cardHover: 'rounded-sm border border-boca-border bg-boca-blue-mid hover:border-boca-gold/40 transition-colors',

  // Tipografía (alias de las clases semánticas ya definidas en index.css)
  textMuted: 'text-text-muted',
  textAccent: 'text-boca-gold',
  textBase: 'text-white',

  // Botones (h-10 garantiza altura uniforme)
  btnSecondary: 'h-10 flex items-center px-4 rounded-sm border border-boca-border text-text-muted hover:bg-boca-border/20 transition-colors',
  btnPrimary: 'h-10 flex items-center px-4 rounded-sm bg-boca-gold text-boca-blue font-bold hover:bg-boca-gold/90 transition-colors',

  // Divisores
  divider: 'border-boca-border',
} as const;
```

**Nota:** Se usa `rounded-sm` (no `rounded-xl` del SPEC) porque el proyecto entero usa `rounded-sm` como estándar (ver `CODING_CONVENTIONS.md` y todos los componentes existentes). Usar `rounded-xl` rompería la consistencia. Se usan los tokens semánticos de Tailwind en lugar de valores hex literales.

**Step 2: Commit**
```bash
git add src/styles/design-tokens.ts
git commit -m "feat(ux): add design-tokens.ts with reusable Tailwind class strings"
```

---

### Task 6: Auditar y corregir inconsistencias de border-radius en cards

**Files:**
- Modify: (varios, según hallazgos)

**Step 1: Buscar mixed `rounded-lg` / `rounded-xl` en cards**

```bash
grep -rn "rounded-lg\|rounded-xl\|rounded-md" src/components/ --include="*.tsx" | grep -v "btn\|badge\|input\|select\|modal"
```

**Step 2: Identificar inconsistencias reales**

Según la exploración previa, se encontró `rounded-lg` en:
- `src/components/Auth/LoginForm.tsx` — inputs de formulario (NO tocar, son inputs no cards)
- `src/components/Auth/LoginForm.tsx:70` — botón del form (evaluar)
- `src/components/BomboneraWidget/ModoNormal.tsx` — elementos internos del widget (evaluar si son cards)

**Step 3: Solo corregir cards de contenido principal (no inputs, no elementos internos)**

Para cada `rounded-lg` encontrado en un card de contenido: cambiar a `rounded-sm` para alinear con el estándar del proyecto.

**Step 4: Verificar que no se rompió nada visualmente**

Revisar en el browser las secciones afectadas.

**Step 5: Commit**
```bash
git add <archivos modificados>
git commit -m "fix(ux): unify card border-radius to rounded-sm across components"
```

---

## ISS-01 — Tabla compacta de próximos partidos en mobile

**Contexto:** El componente `ProximosPartidos` tiene dos vistas: "cards" (ScrollRow) y "tabla" (FixtureTable). Ambas se muestran independientemente del breakpoint. El SPEC pide que en mobile (<640px) los "cards" se reemplacen por una tabla compacta, sin modificar el layout desktop.

**Decisión de arquitectura:** En lugar de crear un tercer componente, la vista "cards" en mobile renderiza una tabla compacta. La vista "tabla" (FixtureTable) ya existe para desktop. Hay que evaluar si usar responsive CSS o un flag en el estado.

La solución más simple: en `ScrollRow.tsx` agregar una tabla mobile que se muestre solo en `sm:hidden`, manteniendo el scroll row visible solo en `hidden sm:flex`.

### Task 7: Crear `MobileFixtureTable.tsx`

**Files:**
- Create: `src/components/ProximosPartidos/MobileFixtureTable.tsx`

**Step 1: Crear el componente**

```tsx
// src/components/ProximosPartidos/MobileFixtureTable.tsx

import type { ProximoPartido } from '../../services/apifootball';
import { MatchUrgencyBadge } from '../MatchUrgencyBadge';
import { getFixtureTeams } from './utils';
import { formatFechaCorta, formatDia } from './utils';

interface MobileFixtureTableProps {
  partidos: ProximoPartido[];
}

export function MobileFixtureTable({ partidos }: MobileFixtureTableProps) {
  return (
    <div className="block sm:hidden overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-boca-border text-text-muted">
            <th className="py-2 pr-3 text-left type-ui-label uppercase tracking-wider text-xs">Fecha</th>
            <th className="py-2 pr-3 text-left type-ui-label uppercase tracking-wider text-xs">Rival</th>
            <th className="py-2 pr-3 text-left type-ui-label uppercase tracking-wider text-xs">Hora</th>
            <th className="py-2 text-center type-ui-label uppercase tracking-wider text-xs">Estado</th>
          </tr>
        </thead>
        <tbody>
          {partidos.map((match) => {
            const { rival } = getFixtureTeams(match);
            return (
              <tr
                key={match.fixtureId}
                className="border-b border-boca-border/40 h-12 text-text-muted"
              >
                <td className="py-2 pr-3 whitespace-nowrap">
                  <div className="flex flex-col leading-tight">
                    <span className="type-ui-label uppercase text-boca-gold/40 text-[10px]">
                      {formatDia(match.date)}
                    </span>
                    <span className="text-xs tabular-nums">{formatFechaCorta(match.date)}</span>
                  </div>
                </td>
                <td className="py-2 pr-3">
                  <span className="truncate block max-w-[110px] text-white text-xs">{rival.name}</span>
                </td>
                <td className="py-2 pr-3 whitespace-nowrap text-xs tabular-nums">{match.time}</td>
                <td className="py-2 text-center">
                  <MatchUrgencyBadge matchDate={match.date} showIcon={false} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
```

**Step 2: Verificar que `text-text-muted` existe en tailwind.config.js**

En el design system del proyecto, `text-text-muted` es `text-[#64748b]` (ver MEMORY). Verificar que esté configurado en `tailwind.config.js`.

**Step 3: Commit**
```bash
git add src/components/ProximosPartidos/MobileFixtureTable.tsx
git commit -m "feat(ux): add MobileFixtureTable component for compact mobile view"
```

---

### Task 8: Integrar `MobileFixtureTable` en `ScrollRow.tsx`

**Files:**
- Modify: `src/components/ProximosPartidos/ScrollRow.tsx`

**Step 1: Agregar la tabla mobile al tope del componente**

El componente actual solo renderiza el scroll horizontal. Envolverlo en un fragmento y agregar la tabla mobile:

```tsx
import { ChevronRight } from 'lucide-react';
import { useHorizontalScroll } from '../../hooks/useHorizontalScroll';
import type { ProximoPartido } from '../../services/apifootball';
import { CardPartido } from './CardPartido';
import { MobileFixtureTable } from './MobileFixtureTable';

interface ScrollRowProps {
  partidos: ProximoPartido[];
}

export function ScrollRow({ partidos }: ScrollRowProps) {
  const { ref, canScrollLeft, canScrollRight, onPointerDown, onPointerMove, stopDrag } = useHorizontalScroll();

  return (
    <>
      {/* Mobile: tabla compacta */}
      <MobileFixtureTable partidos={partidos} />

      {/* Desktop/tablet: scroll de cards */}
      <div className="relative hidden sm:block">
        <div
          ref={ref}
          className="flex gap-4 overflow-x-auto pb-2 cursor-grab active:cursor-grabbing select-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={stopDrag}
          onPointerLeave={stopDrag}
        >
          {partidos.map((p) => (
            <CardPartido key={p.fixtureId} partido={p} />
          ))}
        </div>

        {canScrollLeft && (
          <div className="pointer-events-none absolute left-0 top-0 h-[calc(100%-8px)] w-12 bg-gradient-to-r from-boca-blue-mid to-transparent" />
        )}

        {canScrollRight && (
          <div className="pointer-events-none absolute right-0 top-0 h-[calc(100%-8px)] w-16 bg-gradient-to-l from-boca-blue-mid to-transparent flex items-center justify-end pr-1">
            <ChevronRight size={18} className="text-boca-gold/60 animate-pulse" />
          </div>
        )}
      </div>
    </>
  );
}
```

**Step 2: Verificar los criterios del SPEC**
- [ ] Tabla se muestra en mobile (<640px), cards se ocultan
- [ ] Cada fila tiene `h-12` mínimo (48px)
- [ ] Sin scroll horizontal en 375px (la columna rival tiene `max-w-[110px] truncate`)
- [ ] Cards en desktop sin cambios

**Step 3: Commit**
```bash
git add src/components/ProximosPartidos/ScrollRow.tsx
git commit -m "feat(ux): show compact mobile table in ScrollRow on small screens"
```

---

## Checklist de QA

Antes de abrir el PR, verificar en el browser con DevTools a 375px:

- [ ] Vista cards muestra tabla (no cards) en <640px
- [ ] Vista tabla (FixtureTable) no se toca en ningún breakpoint
- [ ] Cada fila de la tabla mobile mide al menos 48px
- [ ] No hay scroll horizontal en 375px
- [ ] Badge "¡HOY!" aparece para partidos a <3hs
- [ ] Badge "Mañana" aparece para partidos a <24hs
- [ ] Badge "Pronto" aparece para partidos a <72hs
- [ ] Sin badge para partidos a >72hs
- [ ] Badge en tabla mobile y card desktop son visualmente similares
- [ ] Botones de acción en CardPartido tienen altura uniforme (~40px)
- [ ] `src/styles/design-tokens.ts` existe y exporta `tokens`
- [ ] TypeScript compila sin errores: `npx tsc --noEmit`

---

## Orden de commits esperado

1. `fix(ux): uniform h-10 for action buttons in CardPartido` (ISS-03)
2. `feat(ux): add MatchUrgencyBadge component with hour-based urgency` (ISS-02)
3. `refactor(ux): use MatchUrgencyBadge in CardPartido` (ISS-02)
4. `feat(ux): add design-tokens.ts with reusable Tailwind class strings` (ISS-04)
5. `fix(ux): unify card border-radius to rounded-sm across components` (ISS-04)
6. `feat(ux): add MobileFixtureTable component for compact mobile view` (ISS-01)
7. `feat(ux): show compact mobile table in ScrollRow on small screens` (ISS-01)
