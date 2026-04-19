# Estándares de Frontend — La 12 Digital

> Guía índice del sistema de documentación técnica del proyecto. Todo desarrollador debe leer este documento primero.

## Índice

- [Quick Start](#quick-start)
- [Stack del proyecto](#stack-del-proyecto)
- [Documentos disponibles](#documentos-disponibles)
- [Decisiones de arquitectura](#decisiones-de-arquitectura)

---

## Quick Start

5 puntos para empezar a trabajar en el proyecto sin errores:

**1. Usar siempre tokens del design system, nunca valores mágicos.**

```tsx
// Correcto
<div className="bg-boca-blue text-boca-gold border border-boca-border" />

// Incorrecto
<div style={{ backgroundColor: '#001529', color: '#FFD700' }} />
```

**2. Aplicar clases tipográficas `.type-*` para texto, no definir font/size manual.**

```tsx
// Correcto
<h2 className="type-section-title text-boca-gold">Próximos partidos</h2>

// Incorrecto
<h2 className="font-serif text-2xl font-bold text-yellow-400">Próximos partidos</h2>
```

**3. Manejar estados async con el tipo union `'loading' | 'error' | 'ok'`.**

```tsx
type Estado = "loading" | "error" | "ok";
const [estado, setEstado] = useState<Estado>("loading");
```

**4. Crear hooks propios para lógica de componentes complejos. El componente solo renderiza.**

```tsx
// IdolosGame.tsx — solo render
export function IdolosGame() {
  const game = useIdolosGame(); // toda la lógica en el hook
  return <GamePromoCard ... />;
}
```

**5. Usar `useHorizontalScroll` para cualquier fila scrolleable con drag.**

```tsx
const {
  ref,
  canScrollLeft,
  canScrollRight,
  onPointerDown,
  onPointerMove,
  stopDrag,
} = useHorizontalScroll();
```

---

## Stack del proyecto

| Tecnología         | Versión | Rol                                |
| ------------------ | ------- | ---------------------------------- |
| React              | 18+     | UI                                 |
| TypeScript         | 5+      | Tipado estático                    |
| Vite               | 5+      | Build tool                         |
| Tailwind CSS       | v3      | Estilos (utility-first)            |
| Cloudflare Workers | —       | Deploy + proxy de APIs             |
| Crimson Pro        | —       | Fuente serif (80% del contenido)   |
| Geist              | —       | Fuente sans (UI elements, números) |

**Importante:** La app NO usa React Router. Es una SPA simple; la navegación se maneja con `window.location.pathname`.

---

## Documentos disponibles

| Documento                                                              | Contenido                                                                                      |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| [`DESIGN_TOKENS.md`](./DESIGN_TOKENS.md)                               | Colores, tipografía, espaciado, sombras, bordes, animaciones                                   |
| [`ATOMIC_DESIGN.md`](./ATOMIC_DESIGN.md)                               | Mapa de componentes, templates para crear nuevos, checklist                                    |
| [`COMPONENT_PATTERNS.md`](./COMPONENT_PATTERNS.md)                     | Patrones de código: estado async, hooks de juego, scroll horizontal, variantes, barrel exports |
| [`CODING_CONVENTIONS.md`](./CODING_CONVENTIONS.md)                     | Nomenclatura, orden de imports, union types, estructura interna de componente, TypeScript      |
| [`RESPONSIVE_AND_ACCESSIBILITY.md`](./RESPONSIVE_AND_ACCESSIBILITY.md) | Breakpoints, mobile-first, patrones responsive reales, checklist a11y                          |

---

## Decisiones de arquitectura

### Por qué no React Router

La app es un dashboard de una sola vista. Sin rutas, sin complejidad de router.

### Por qué Tailwind v3 con tokens custom

Los tokens en `design-system/tokens/` se importan en `tailwind.config.js` y generan clases de utilidad. Así el design system tiene una única fuente de verdad en TypeScript, no en CSS o JSON.

### Por qué Crimson Pro como fuente principal

Identidad editorial: Boca tiene una historia de 120 años. La serif serif aporta peso visual y tradición. Geist se usa solo en elementos de UI (botones, stats, labels) donde la legibilidad a tamaño pequeño importa más.

### Por qué el patrón de hook + componente render

Los organismos complejos (IdolosGame, EquiposGame) separan completamente la lógica (hook) del render (componente). Esto facilita testing del hook de forma aislada y mantiene el JSX limpio.

---

_Última actualización: 2026-04-02_
