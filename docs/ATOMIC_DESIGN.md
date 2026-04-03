# Diseño Atómico — La 12 Digital

> Estructura de componentes del proyecto, reglas para clasificarlos y templates para crear nuevos.

## Índice
- [Mapa de componentes actual](#mapa-de-componentes-actual)
- [Reglas de clasificación](#reglas-de-clasificación)
- [Shared components](#shared-components)
- [Template: nuevo átomo](#template-nuevo-átomo)
- [Template: nueva sección (organismo)](#template-nueva-sección-organismo)
- [Checklist de nuevo componente](#checklist-de-nuevo-componente)

---

## Mapa de componentes actual

```
src/components/
│
├── ── ÁTOMOS ────────────────────────────────────────────────────
│   ├── Badge/              Pill de estado o categoría
│   │   ├── Badge.tsx       Variantes: blue | gold | local | visitante
│   │   └── index.ts        Barrel export
│   │
│   ├── Button/             Botón interactivo con variantes
│   │   ├── Button.tsx      Variantes: primary | secondary | ghost | outline | destructive
│   │   └── index.ts
│   │
│   ├── Separator/          Divisor visual horizontal
│   ├── TrofeoIcon/         SVG de trofeo decorativo
│   └── SelectDropdown/     Select estilizado (zona de tabla posiciones)
│
├── ── MOLÉCULAS ─────────────────────────────────────────────────
│   ├── NoticiaCard/        Card de noticia (imagen + título + fecha + badge)
│   ├── CardVideo/          Card de video de YouTube
│   ├── CanalSelector/      Selector horizontal de canal de YouTube
│   ├── GamePromoCard/      Card de promoción de juego (fondo imagen + CTA)
│   └── BannerMensaje/      Banner horizontal animado con mensaje del día
│
├── ── ORGANISMOS ────────────────────────────────────────────────
│   ├── Header/             Navbar con logo + navegación
│   ├── Sidebar/            Tabla de posiciones colapsable (desktop + mobile drawer)
│   │   ├── Sidebar.tsx
│   │   ├── DesktopSidebarBubble.tsx  Burbuja cuando está colapsado
│   │   └── MobileSidebarButton.tsx   Botón flotante en mobile
│   │
│   ├── BomboneraWidget/    Widget de clima y condiciones del estadio
│   │   ├── BomboneraWidget.tsx
│   │   ├── ConditionsBlock.tsx
│   │   ├── ModoNormal.tsx
│   │   └── hooks/
│   │       └── useBomboneraWidget.ts
│   │
│   ├── UltimosPartidos/    Lista de últimos resultados
│   ├── ProximosPartidos/   Cards scrolleables + vista tabla de fixture
│   │   ├── ProximosPartidos.tsx
│   │   └── FixtureTable.tsx
│   │
│   ├── TablaPosiciones/    Tabla con selectores de zona (con SelectDropdown)
│   ├── Noticias/           Scroll horizontal de cards de noticias
│   ├── CanalYoutube/       Grid de videos del canal oficial
│   │
│   ├── IdolosGame/         Juego "¿Qué ídolo es?" (lógica completa)
│   │   ├── IdolosGame.tsx      Solo render — usa GamePromoCard + GameModal
│   │   ├── GameModal.tsx       Modal del juego activo
│   │   ├── DificultadBadge.tsx Badge de dificultad del ídolo
│   │   ├── IdoloPlaceholder.tsx Placeholder mientras carga imagen
│   │   ├── TimerBar.tsx        [DEPRECADO — usar shared/TimerBar]
│   │   ├── types.ts            GameState, Score, etc.
│   │   └── hooks/
│   │       ├── useIdolosGame.ts   Lógica principal del juego
│   │       └── useModalEffects.ts Efectos del modal (focus, etc.)
│   │
│   └── EquiposGame/        Juego "¿Qué equipo es?" (mismo patrón que IdolosGame)
│       ├── EquiposGame.tsx
│       ├── GameModal.tsx
│       └── hooks/
│
└── shared/                 Componentes compartidos entre múltiples organismos
    └── TimerBar/
        └── TimerBar.tsx    Barra de cuenta regresiva (usada en ambos juegos)
```

---

## Reglas de clasificación

### Átomo
- No tiene dependencias de otros componentes del proyecto (solo `Badge`, `Button`, o primitivos HTML)
- Recibe todo por props, no hace fetching ni tiene estado complejo
- Es reutilizable en cualquier contexto sin modificar
- Ejemplos reales: `Badge`, `Button`, `Separator`, `TrofeoIcon`

### Molécula
- Compone 2 o más átomos del proyecto
- Puede tener estado local simple (hover, focus)
- Resuelve un patrón de UI específico y reutilizable
- Ejemplos reales: `NoticiaCard`, `CardVideo`, `GamePromoCard`

### Organismo
- Sección completa de la página con lógica propia
- Generalmente hace fetching de datos (API, localStorage)
- Maneja estados async (`loading | error | ok`)
- Contiene subcomponentes propios en su directorio
- Ejemplos reales: `ProximosPartidos`, `IdolosGame`, `Sidebar`, `BomboneraWidget`

### Shared
- Componentes que son reutilizados en **más de un organismo diferente**
- Viven en `src/components/shared/`, no en el directorio de ningún organismo
- Ejemplo real: `TimerBar` — usado en `IdolosGame` y `EquiposGame`

---

## Shared components

Cuando un subcomponente de un organismo se necesita en otro organismo, se mueve a `src/components/shared/`:

```
Antes:  src/components/IdolosGame/TimerBar.tsx
Después: src/components/shared/TimerBar/TimerBar.tsx
```

**Regla:** Un componente se vuelve "shared" cuando lo usan 2 o más organismos distintos. No moverlo antes.

---

## Template: nuevo átomo

```
src/components/NombreAtomo/
├── NombreAtomo.tsx
└── index.ts
```

### `NombreAtomo.tsx`
```tsx
// src/components/NombreAtomo/NombreAtomo.tsx

import type { ReactNode } from 'react';

// 1. Definir las variantes como constante fuera del componente
const VARIANTS = {
  default: 'bg-boca-blue text-white',
  gold:    'bg-boca-gold text-boca-blue',
} as const;

// 2. Interfaz de props con sufijo Props
interface NombreAtomoProps {
  variant?: keyof typeof VARIANTS;
  children: ReactNode;
  className?: string;
}

// 3. Exportación nombrada (nunca default en componentes)
export function NombreAtomo({
  variant = 'default',
  children,
  className = '',
}: NombreAtomoProps) {
  return (
    <div
      className={`type-ui-label inline-flex items-center px-3 py-1.5 rounded-sm ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </div>
  );
}
```

### `index.ts`
```ts
// src/components/NombreAtomo/index.ts
export { NombreAtomo } from './NombreAtomo';
// Exportar tipos si otros componentes los necesitan:
// export type { NombreAtomoProps } from './NombreAtomo';
```

---

## Template: nueva sección (organismo)

```
src/components/NuevaSección/
├── NuevaSección.tsx        Componente principal (render)
├── SubComponente.tsx       Subcomponentes del organismo
├── index.ts                Barrel export
├── types.ts                (opcional) Tipos específicos de la sección
└── hooks/
    └── useNuevaSección.ts  Lógica del organismo
```

### `NuevaSección.tsx`
```tsx
// src/components/NuevaSección/NuevaSección.tsx
import { useState, useEffect } from 'react';
import { fetchAlgo } from '../../services/algúnService';

// Tipos de estado async — patrón de proyecto
type Estado = 'loading' | 'error' | 'ok';

export function NuevaSección() {
  const [datos, setDatos] = useState<TipoDato[]>([]);
  const [estado, setEstado] = useState<Estado>('loading');

  const cargar = () => {
    setEstado('loading');
    fetchAlgo()
      .then((data) => { setDatos(data); setEstado('ok'); })
      .catch(() => setEstado('error'));
  };

  useEffect(() => { cargar(); }, []);

  return (
    <section aria-label="Descripción de la sección" className="bg-boca-blue-mid border border-boca-border rounded-sm overflow-hidden flex flex-col">
      {/* Header */}
      <div className="border-b border-boca-border-card px-6 pt-6 pb-3">
        <h2 className="type-section-title text-white">Nombre de sección</h2>
      </div>

      {/* Contenido */}
      <div className="px-6 pt-4 pb-6 flex flex-col gap-3">
        {estado === 'loading' && <Skeleton />}

        {estado === 'error' && (
          <div className="flex items-center gap-3 py-6 px-4 bg-boca-blue-light rounded-sm border border-boca-gold/10">
            <p className="font-sans text-sm text-text-secondary flex-1">
              No se pudo cargar la información
            </p>
            <button
              onClick={cargar}
              className="type-button text-boca-gold border border-boca-gold/30 rounded px-3 py-1.5 hover:bg-boca-gold/10 transition-colors shrink-0"
            >
              Reintentar
            </button>
          </div>
        )}

        {estado === 'ok' && datos.length === 0 && (
          <p className="font-sans text-sm text-white/50 py-6 text-center">
            No hay datos disponibles
          </p>
        )}

        {estado === 'ok' && datos.map((item) => (
          <SubComponente key={item.id} data={item} />
        ))}
      </div>
    </section>
  );
}

function Skeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="animate-pulse h-12 bg-boca-blue-light rounded-sm border border-boca-gold/5" />
      ))}
    </div>
  );
}
```

### `hooks/useNuevaSección.ts`
Usar cuando la sección tiene lógica compleja (juegos, formularios multi-paso, filtros).

```ts
// src/components/NuevaSección/hooks/useNuevaSección.ts
export interface NuevaSecciónState {
  // Estado que expone el hook al componente
  estado: 'loading' | 'error' | 'ok';
  datos: TipoDato[];
  cargar: () => void;
}

export function useNuevaSección(): NuevaSecciónState {
  // ... lógica aquí
  return { estado, datos, cargar };
}
```

---

## Checklist de nuevo componente

Antes de hacer merge, verificar:

- [ ] El componente está en su propio directorio `src/components/Nombre/`
- [ ] El directorio tiene un `index.ts` con barrel export
- [ ] La interfaz de props usa el sufijo `Props` (ej: `BadgeProps`)
- [ ] El componente usa exportación nombrada, no `export default`
- [ ] Se usan clases `type-*` para tipografía (no font/size manual)
- [ ] Se usan tokens Tailwind para colores (no valores hex directos)
- [ ] Si hay estado async, usa `type Estado = 'loading' | 'error' | 'ok'`
- [ ] Si el componente tiene lógica compleja, está extraída en un hook
- [ ] Los estados de error tienen un botón "Reintentar"
- [ ] Las imágenes tienen `alt` descriptivo
- [ ] Los botones tienen `aria-label` si no tienen texto visible

---

*Última actualización: 2026-04-02*
