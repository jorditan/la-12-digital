# Patrones de Componentes — La 12 Digital

> Patrones de código recurrentes en el proyecto, basados en implementaciones reales. Seguir estos patrones garantiza consistencia.

## Índice
- [Patrón de estado async](#patrón-de-estado-async)
- [Patrón de hook de juego](#patrón-de-hook-de-juego)
- [Patrón de scroll horizontal con drag](#patrón-de-scroll-horizontal-con-drag)
- [Patrón de estructura de archivos](#patrón-de-estructura-de-archivos)
- [Patrón de props con className](#patrón-de-props-con-classname)
- [Patrón de barrel exports](#patrón-de-barrel-exports)
- [Patrón de constantes de variantes](#patrón-de-constantes-de-variantes)
- [Patrón de subcomponentes locales](#patrón-de-subcomponentes-locales)

---

## Patrón de estado async

**Dónde se usa:** `ProximosPartidos`, `UltimosPartidos`, `TablaPosiciones`, `Noticias`, `CanalYoutube`, `BomboneraWidget`.

El proyecto usa un tipo union explícito para estados asíncronos. No usar booleans separados (`isLoading`, `hasError`).

```tsx
// src/components/ProximosPartidos/ProximosPartidos.tsx (líneas 9-11)
type Estado = 'loading' | 'error' | 'ok';

export function ProximosPartidos() {
  const [partidos, setPartidos] = useState<ProximoPartido[]>([]);
  const [estado, setEstado] = useState<Estado>('loading');

  const cargar = () => {
    setEstado('loading');
    fetchUpcomingMatches()
      .then((data) => { setPartidos(data); setEstado('ok'); })
      .catch(() => setEstado('error'));
  };

  useEffect(() => { cargar(); }, []);
```

### Render de los tres estados

Siempre renderizar los tres estados en este orden: loading → error → ok.

```tsx
return (
  <section>
    {/* 1. Loading */}
    {estado === 'loading' && <SkeletonRow />}

    {/* 2. Error con botón reintentar */}
    {estado === 'error' && (
      <div className="flex items-center gap-3 py-6 px-4 bg-boca-blue-light rounded-sm border border-boca-gold/10">
        <p className="font-sans text-sm text-text-secondary flex-1">
          No se pudieron cargar los próximos partidos
        </p>
        <button
          onClick={cargar}
          className="type-button text-boca-gold border border-boca-gold/30 rounded px-3 py-1.5 hover:bg-boca-gold/10 transition-colors shrink-0"
        >
          Reintentar
        </button>
      </div>
    )}

    {/* 3. Empty state */}
    {estado === 'ok' && partidos.length === 0 && (
      <p className="font-sans text-sm text-white/50 py-6 text-center">
        No hay próximos partidos disponibles
      </p>
    )}

    {/* 4. Contenido */}
    {estado === 'ok' && partidos.length > 0 && (
      <ScrollRow partidos={partidos} />
    )}
  </section>
);
```

### Alternativa: `useAsyncData` (hook genérico)

Disponible en `src/hooks/useAsyncData.ts`. Todavía no está migrado en todos los componentes, pero es la forma recomendada para nuevos componentes:

```tsx
// src/hooks/useAsyncData.ts
const { status, data, error, retry } = useAsyncData(() => fetchAlgo(), []);

// status: 'loading' | 'error' | 'ok'
// data: T | null
// error: Error | null
// retry(): void — para el botón "Reintentar"
```

Ventaja: previene actualizaciones de estado en componentes desmontados (usa flag `cancelled`).

### Skeleton de carga

Cada sección tiene su propio skeleton. Usar `animate-pulse` con `bg-boca-blue-light` y `bg-white/10`:

```tsx
function SkeletonRow() {
  return (
    <div className="flex gap-4 overflow-hidden pb-2">
      {Array.from({ length: 8 }, (_, i) => (
        <div
          key={i}
          className="animate-pulse flex flex-col gap-3 p-4 bg-boca-blue-light border border-boca-gold/5 rounded-sm shrink-0 w-48"
        >
          <div className="h-3 flex-1 bg-white/10 rounded" />
          <div className="h-4 w-28 bg-white/10 rounded" />
        </div>
      ))}
    </div>
  );
}
```

---

## Patrón de hook de juego

**Dónde se usa:** `IdolosGame`, `EquiposGame`.

El componente de juego es solo render. Toda la lógica vive en el hook.

### Estructura del hook (`useIdolosGame.ts`)

```
src/components/IdolosGame/hooks/useIdolosGame.ts
```

```ts
// 1. Exportar la interfaz de retorno del hook
export interface IdolosGameState {
  state: GameState;       // 'waiting' | 'playing' | 'correct' | 'timeout'
  idolo: Idolo | null;
  timer: number;
  visibleClues: number;
  input: string;
  inputError: boolean;
  score: Score;
  bgIdolo: Idolo;         // Ídolo para el fondo decorativo (estático)
  inputRef: React.RefObject<HTMLInputElement>;
  startRound: () => void;
  closeModal: () => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

export function useIdolosGame(): IdolosGameState {
  // Estado del juego
  const [state, setState] = useState<GameState>('waiting');
  // ... resto del estado

  // Efecto de countdown
  useEffect(() => {
    if (state !== 'playing') return;
    // setInterval para countdown...
    return () => clearInterval(roundIv.current); // siempre limpiar
  }, [state, finishRound]);

  // Efecto de auto-cierre cuando termina el tiempo
  useEffect(() => {
    if (state !== 'timeout') return;
    const t = setTimeout(() => setState('waiting'), RESULT_SECS * 1000);
    return () => clearTimeout(t);
  }, [state]);

  // Retornar todo lo que necesita el componente de render
  return { state, idolo, timer, /* ... */ };
}
```

### Componente de render (`IdolosGame.tsx`)

```tsx
export function IdolosGame() {
  const game = useIdolosGame();
  const { state, idolo, score, bgIdolo, startRound, closeModal } = game;

  return (
    <>
      <GamePromoCard /* props del estado */ />
      {state !== 'waiting' && idolo && (
        <GameModal /* props del juego activo */ />
      )}
    </>
  );
}
```

### Constantes de juego

Las constantes de tiempo están en `src/utils/gameConfig.ts`, no hardcodeadas:

```ts
// src/utils/gameConfig.ts
export const ROUND_SECS = 30;
export const RESULT_SECS = 4;
export const INPUT_FOCUS_DELAY_MS = 150;
export const INPUT_ERROR_DURATION_MS = 600;
```

---

## Patrón de scroll horizontal con drag

**Dónde se usa:** `ProximosPartidos` (`ScrollRow`), `Noticias`, `CanalYoutube`.

Hook en `src/hooks/useHorizontalScroll.ts`. Provee drag-to-scroll + indicadores de overflow.

```tsx
function ScrollRow({ partidos }: { partidos: ProximoPartido[] }) {
  const {
    ref,
    canScrollLeft,
    canScrollRight,
    onPointerDown,
    onPointerMove,
    stopDrag,
  } = useHorizontalScroll();

  return (
    <div className="relative">
      {/* Contenedor scrolleable */}
      <div
        ref={ref}
        className="flex gap-4 overflow-x-auto pb-2 cursor-grab active:cursor-grabbing select-none"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={stopDrag}
        onPointerLeave={stopDrag}
      >
        {partidos.map((p) => <CardPartido key={p.fixtureId} partido={p} />)}
      </div>

      {/* Gradiente izquierdo (indica contenido oculto a la izquierda) */}
      {canScrollLeft && (
        <div className="pointer-events-none absolute left-0 top-0 h-[calc(100%-8px)] w-12 bg-gradient-to-r from-boca-blue-mid to-transparent" />
      )}

      {/* Gradiente + hint de scroll derecho */}
      {canScrollRight && (
        <div className="pointer-events-none absolute right-0 top-0 h-[calc(100%-8px)] w-16 bg-gradient-to-l from-boca-blue-mid to-transparent flex items-center justify-end pr-1">
          <ChevronRight size={18} className="text-boca-gold/60 animate-pulse" />
        </div>
      )}
    </div>
  );
}
```

**Nota:** El color del gradiente (`from-boca-blue-mid`) debe coincidir con el fondo del contenedor padre. Cambiar según el contexto.

---

## Patrón de estructura de archivos

Cada componente vive en su propio directorio con barrel export.

### Átomo (estructura mínima)
```
Badge/
├── Badge.tsx       Implementación
└── index.ts        export { Badge } from './Badge';
```

### Organismo con subcomponentes y hooks
```
ProximosPartidos/
├── ProximosPartidos.tsx    Componente principal
├── FixtureTable.tsx        Subcomponente (vista alternativa)
└── index.ts                export { ProximosPartidos } from './ProximosPartidos';

IdolosGame/
├── IdolosGame.tsx          Componente principal (solo render)
├── GameModal.tsx           Modal del juego
├── DificultadBadge.tsx     Badge específico del juego
├── IdoloPlaceholder.tsx    Placeholder de imagen
├── types.ts                GameState, Score (tipos compartidos en el organismo)
├── index.ts
└── hooks/
    ├── useIdolosGame.ts    Lógica principal
    └── useModalEffects.ts  Efectos secundarios del modal
```

---

## Patrón de props con className

Los componentes que deben ser composables (átomos y moléculas) aceptan `className` para permitir overrides de posicionamiento y layout desde el padre. Los organismos (secciones completas) generalmente NO reciben `className`.

```tsx
// Átomo: acepta className — el padre puede posicionarlo
interface BadgeProps {
  className?: string;  // Para override de posicionamiento
}

// Organismo: no recibe className — es una sección autónoma
export function ProximosPartidos() { /* sin className prop */ }
```

### Manejo del className en el componente

```tsx
// Correcto: className al final, con string vacío como default
export function Badge({ variant = 'blue', children, className = '' }: BadgeProps) {
  return (
    <span className={`type-ui-label inline-flex px-2.5 py-1 ${VARIANTS[variant]} ${className}`}>
      {children}
    </span>
  );
}

// Correcto: con array.join para clases condicionales largas (patrón de Button)
<button
  className={[
    'inline-flex items-center justify-center gap-2',
    'font-sans cursor-pointer transition-colors duration-150',
    VARIANTS[variant],
    SIZES[size],
    className,
  ].join(' ')}
>
```

---

## Patrón de barrel exports

Todo componente expone su API pública a través de `index.ts`. Las importaciones siempre usan el directorio, nunca el archivo directamente.

```ts
// src/components/Badge/index.ts
export { Badge } from './Badge';

// Si hay tipos que otros necesitan:
export type { BadgeProps } from './Badge';
// (requiere exportar la interfaz en Badge.tsx)
```

```tsx
// Correcto — importar desde el directorio
import { Badge } from '../Badge';
import { Button } from '../Button';

// Incorrecto — importar el archivo directamente
import { Badge } from '../Badge/Badge';
```

---

## Patrón de constantes de variantes

Cuando un componente tiene múltiples variantes visuales, las clases se definen como objeto constante **fuera del componente**, nunca con condicionales inline.

```tsx
// Correcto — objeto de variantes fuera del componente (Badge.tsx)
const VARIANTS = {
  blue:      'bg-boca-border-card text-white',
  gold:      'bg-boca-blue text-boca-gold',
  local:     'bg-green-900/50 text-green-300 border border-green-700/60',
  visitante: 'bg-boca-border/60 text-blue-200 border border-boca-border',
};

export function Badge({ variant = 'blue' }: BadgeProps) {
  return <span className={`... ${VARIANTS[variant]}`} />;
}

// Incorrecto — condicionales inline
<span className={`... ${variant === 'gold' ? 'bg-boca-blue text-boca-gold' : variant === 'local' ? '...' : '...'}`} />
```

El mismo patrón para sizes:
```tsx
// Button.tsx
const SIZES: Record<ButtonSize, string> = {
  sm:   'px-3 py-1.5 text-xs rounded-sm',
  md:   'px-4 py-2 text-sm rounded-sm',
  lg:   'px-6 py-3 text-base rounded-sm',
  icon: 'p-1.5 rounded-sm',
};
```

---

## Patrón de subcomponentes locales

Los subcomponentes que solo usa un organismo se definen en el mismo archivo o en el mismo directorio, sin exportar.

```tsx
// ProximosPartidos.tsx — subcomponentes locales, no exportados
function ScrollRow({ partidos }: { partidos: ProximoPartido[] }) { /* ... */ }
function CardPartido({ partido }: { partido: ProximoPartido }) { /* ... */ }
function SkeletonRow() { /* ... */ }

export function ProximosPartidos() {
  // Usa ScrollRow, CardPartido, SkeletonRow internamente
}
```

Si el subcomponente crece y necesita su propio archivo, se crea en el mismo directorio (`FixtureTable.tsx`) pero sin exponerlo en el `index.ts` (a menos que otro componente lo necesite).

---

*Última actualización: 2026-04-02*
