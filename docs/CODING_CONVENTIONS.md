# Convenciones de Código — La 12 Digital

> Reglas de nomenclatura, estructura y TypeScript que garantizan consistencia en toda la base de código.

## Índice
- [Nomenclatura de archivos y directorios](#nomenclatura-de-archivos-y-directorios)
- [Nomenclatura de props e interfaces](#nomenclatura-de-props-e-interfaces)
- [Orden de importaciones](#orden-de-importaciones)
- [Union types vs booleans para estados](#union-types-vs-booleans-para-estados)
- [Estructura interna de un componente](#estructura-interna-de-un-componente)
- [Cuándo crear un hook personalizado](#cuándo-crear-un-hook-personalizado)
- [Convenciones de TypeScript](#convenciones-de-typescript)
- [Exportaciones](#exportaciones)

---

## Nomenclatura de archivos y directorios

| Tipo | Convención | Ejemplo |
|---|---|---|
| Directorio de componente | PascalCase | `ProximosPartidos/` |
| Archivo de componente | PascalCase | `ProximosPartidos.tsx` |
| Archivo de hook | camelCase con prefijo `use` | `useHorizontalScroll.ts` |
| Archivo de tipos | camelCase o `types.ts` | `types.ts` |
| Archivo de servicio | camelCase con sufijo `Service` | `footballApiService.ts` |
| Archivo de datos estáticos | camelCase | `bocaEquipos.ts` |
| Barrel export | siempre `index.ts` | `index.ts` |
| Utilidades | camelCase | `stringMatch.ts`, `gameConfig.ts` |

```
src/components/
├── Badge/               # PascalCase para directorios de componentes
│   ├── Badge.tsx        # PascalCase para archivos de componentes
│   └── index.ts         # siempre index.ts (minúsculas)
├── IdolosGame/
│   ├── hooks/
│   │   └── useIdolosGame.ts   # camelCase para hooks
│   └── types.ts               # tipos del organismo

src/hooks/
├── useHorizontalScroll.ts     # camelCase
└── useAsyncData.ts
```

---

## Nomenclatura de props e interfaces

### Interfaz de props: siempre sufijo `Props`

```tsx
// Correcto
interface BadgeProps {
  variant?: 'blue' | 'gold';
  children: ReactNode;
  className?: string;
}

// Correcto — extender HTML attributes
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

// Incorrecto — sin sufijo, o con prefijo I
interface Badge { /* ... */ }
interface IBadge { /* ... */ }
```

### Tipos de retorno de hooks: sufijo `State`

```ts
// src/components/IdolosGame/hooks/useIdolosGame.ts
export interface IdolosGameState {
  state: GameState;
  idolo: Idolo | null;
  score: Score;
  startRound: () => void;
  // ...
}

export function useIdolosGame(): IdolosGameState { /* ... */ }
```

### Tipos de union para variantes: sufijo del concepto

```tsx
// Button.tsx
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

// ProximosPartidos.tsx
type Vista = 'cards' | 'tabla';
type Estado = 'loading' | 'error' | 'ok';
```

---

## Orden de importaciones

El orden es: React y librerías externas primero, luego todo lo interno del proyecto, agrupado por tipo.

```tsx
// 1. React
import { useState, useEffect, useRef, useCallback } from 'react';

// 2. Librerías externas (iconos, utils de terceros)
import { MapPin, ChevronRight, LayoutGrid } from 'lucide-react';

// 3. Componentes internos (por carpeta, relativos)
import { useHorizontalScroll } from '../../hooks/useHorizontalScroll';
import { Badge } from '../Badge';
import { FixtureTable } from './FixtureTable';

// 4. Servicios y utils
import { fetchUpcomingMatches, BOCA_ID, type ProximoPartido } from '../../services/apifootball';

// 5. Datos estáticos
import { ESCUDO_VACIO } from '../../data/equipos';
```

**Regla:** No mezclar grupos. Una línea en blanco entre cada grupo.

---

## Union types vs booleans para estados

**Nunca usar múltiples booleans para representar un estado mutuamente excluyente.** Usar un tipo union.

```tsx
// Correcto — tipo union para estado async
type Estado = 'loading' | 'error' | 'ok';
const [estado, setEstado] = useState<Estado>('loading');

// Correcto — tipo union para estado de juego (cuatro valores posibles)
type GameState = 'waiting' | 'playing' | 'correct' | 'timeout';
const [state, setState] = useState<GameState>('waiting');

// Correcto — tipo union para vista alternativa
type Vista = 'cards' | 'tabla';
const [vista, setVista] = useState<Vista>('cards');

// Incorrecto — booleans que generan estados imposibles (isLoading=true y isError=true a la vez)
const [isLoading, setIsLoading] = useState(true);
const [isError, setIsError] = useState(false);
const [isSuccess, setIsSuccess] = useState(false);
```

**Excepción:** Un booleano es correcto para estados simples de toggle (abierto/cerrado, colapsado/expandido):

```tsx
// Correcto — estado binario real
const [isMenuOpen, setIsMenuOpen] = useState(false);
const [collapsed, setCollapsed] = useState(false);
const [drawerOpen, setDrawerOpen] = useState(false);
```

---

## Estructura interna de un componente

El orden dentro de un componente debe ser siempre consistente:

```tsx
// src/components/ProximosPartidos/ProximosPartidos.tsx

// ── 1. Tipos locales (si no están en types.ts) ────────────────────────────────
type Vista = 'cards' | 'tabla';
type Estado = 'loading' | 'error' | 'ok';

// ── 2. Funciones helpers puras (fuera del componente) ─────────────────────────
function formatFecha(isoDate: string): string {
  const d = new Date(isoDate);
  return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' });
}

// ── 3. Constantes de arrays/mapas (fuera del componente) ──────────────────────
const NAV_ITEMS = [/* ... */];

const VARIANTS = {
  blue: 'bg-boca-border-card text-white',
  gold: 'bg-boca-blue text-boca-gold',
};

// ── 4. El componente ──────────────────────────────────────────────────────────
export function ProximosPartidos() {
  // 4a. Estado
  const [partidos, setPartidos] = useState<ProximoPartido[]>([]);
  const [estado, setEstado] = useState<Estado>('loading');
  const [vista, setVista] = useState<Vista>('cards');

  // 4b. Refs
  const inputRef = useRef<HTMLInputElement>(null);

  // 4c. Hooks externos / custom
  const { ref, canScrollLeft } = useHorizontalScroll();

  // 4d. Funciones que cargan datos
  const cargar = () => {
    setEstado('loading');
    fetchUpcomingMatches()
      .then((data) => { setPartidos(data); setEstado('ok'); })
      .catch(() => setEstado('error'));
  };

  // 4e. Effects
  useEffect(() => { cargar(); }, []);

  // 4f. Handlers de eventos
  const handleClick = (id: string) => { /* ... */ };

  // 4g. Render
  return (
    <section>
      {/* ... */}
    </section>
  );
}

// ── 5. Subcomponentes locales (no exportados) ─────────────────────────────────
function SkeletonRow() { /* ... */ }
function CardPartido({ partido }: { partido: ProximoPartido }) { /* ... */ }
```

---

## Cuándo crear un hook personalizado

Crear un hook cuando se cumple **al menos una** de estas condiciones:

| Condición | Ejemplo real |
|---|---|
| La lógica tiene más de 3 `useEffect` o `useState` | `useIdolosGame` — maneja timer, score, input, pistas |
| La lógica se reutiliza en 2+ componentes | `useHorizontalScroll` — usado en ProximosPartidos, Noticias, CanalYoutube |
| El componente mezcla lógica de negocio y render y dificulta leerlo | IdolosGame, EquiposGame |
| Hay efectos con cleanup complejos (intervals, ResizeObserver) | `useHorizontalScroll` (ResizeObserver + scroll listener) |

**No crear un hook** solo para mover 1 `useState` fuera del componente. El overhead no vale la pena.

### Dónde vivir el hook

```
# Hook local (solo usa un componente de ese organismo)
src/components/IdolosGame/hooks/useIdolosGame.ts

# Hook compartido (2+ organismos distintos lo usan)
src/hooks/useHorizontalScroll.ts
src/hooks/useAsyncData.ts
```

---

## Convenciones de TypeScript

### `interface` vs `type`

| Usar `interface` cuando... | Usar `type` cuando... |
|---|---|
| Definir props de componentes | Definir union types (`'loading' \| 'error' \| 'ok'`) |
| Definir el retorno de hooks | Definir aliases de tipos primitivos |
| Extender otros tipos de HTML (`extends ButtonHTMLAttributes`) | Definir tipos de variante (`ButtonVariant`) |

```ts
// interface — para props y estructuras de datos
interface BadgeProps {
  variant?: 'blue' | 'gold';
  children: ReactNode;
}

export interface IdolosGameState {
  state: GameState;
  idolo: Idolo | null;
}

// type — para unions y aliases
type Estado = 'loading' | 'error' | 'ok';
type GameState = 'waiting' | 'playing' | 'correct' | 'timeout';
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'destructive';
```

### Generics: nombrar con letra mayúscula + nombre descriptivo

```ts
// useAsyncData.ts — T describe el tipo de data que retorna
type AsyncState<T> =
  | { status: 'loading'; data: null; error: null }
  | { status: 'error'; data: null; error: Error }
  | { status: 'ok'; data: T; error: null };

export function useAsyncData<T>(fetcher: () => Promise<T>): AsyncState<T> & { retry: () => void }
```

### Aserciones de tipo: evitar, preferir type guards

```tsx
// Correcto — aserción tipada en lugar de `as any`
const el = ref.current as HTMLDivElement;

// Correcto — type guard
if (!idolo) return;

// Incorrecto — any
const el = ref.current as any;
```

### Tipos de React: importar desde `react`

```tsx
import type { ReactNode, RefObject, ChangeEvent, FormEvent, PointerEvent } from 'react';

// En props de callbacks, usar los tipos de React
interface GameModalProps {
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  inputRef: React.RefObject<HTMLInputElement>;
}
```

---

## Exportaciones

### Reglas de exportación

```tsx
// Componentes: SIEMPRE exportación nombrada (nunca default)
export function Badge({ ... }: BadgeProps) { /* ... */ }

// Correcto
import { Badge } from '../Badge';

// Incorrecto — default export en componentes
export default Badge;
import Badge from '../Badge';
```

### Qué exportar desde `index.ts`

```ts
// src/components/Badge/index.ts

// Siempre: el componente principal
export { Badge } from './Badge';

// Solo si otros componentes necesitan el tipo:
export type { BadgeProps } from './Badge';

// Solo si son tipos de variante que se usan en otros lugares:
export type { ButtonVariant, ButtonSize } from './Button';
```

### Qué NO exportar

- Subcomponentes internos (`SkeletonRow`, `CardPartido`) — no se usan fuera del organismo
- Constantes de variantes (`VARIANTS`, `SIZES`) — son detalles de implementación
- Helpers puros locales (`formatFecha`, `isMatch`) — son detalles de implementación

---

*Última actualización: 2026-04-02*
