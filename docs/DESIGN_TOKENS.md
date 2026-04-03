# Design Tokens — La 12 Digital

> Referencia completa de tokens del design system. Fuente de verdad: `design-system/tokens/`. Se consumen vía clases Tailwind o variables CSS `var(--color-*)`.

## Índice
- [Colores](#colores)
- [Tipografía](#tipografía)
- [Espaciado](#espaciado)
- [Border Radius](#border-radius)
- [Sombras](#sombras)
- [Z-Index](#z-index)
- [Gradientes](#gradientes)
- [Animaciones y Transiciones](#animaciones-y-transiciones)

---

## Colores

### Paleta primaria (Identidad Boca)

| Clase Tailwind | Valor hex | Variable CSS | Uso correcto | Uso incorrecto |
|---|---|---|---|---|
| `bg-boca-blue` / `text-boca-blue` | `#001529` | `--color-blue` | Fondo principal, texto sobre fondo dorado | Background de cards (muy oscuro) |
| `bg-boca-blue-light` | `#002140` | `--color-bg-card` | Fondo de cards, contenedores secundarios | Texto |
| `bg-boca-blue-mid` | `#031d46` | `--color-bg-mid-card` | Fondo de secciones, widgets, sidebar | Texto sobre fondos claros |
| `bg-boca-gold` / `text-boca-gold` | `#FFD700` | `--color-gold` | Botón primary, highlights, títulos clave | Fondos grandes (cansa la vista) |
| `bg-boca-gold-dark` | `#E5C100` | — | Estado hover/pressed de elementos dorados | Estado inicial |
| `bg-boca-gold-light` | `#FFC700` | — | Hover sutil sobre elementos dorados | — |

### Bordes

| Clase Tailwind | Valor | Uso |
|---|---|---|
| `border-boca-border` | `#00396e` | Borde sutil en cards y secciones |
| `border-boca-border-card` | `#003d7a` | Borde de cards estándar |
| `border-boca-gold/15` | `rgba(255,215,0, 0.15)` | Borde dorado muy sutil (estado reposo) |
| `border-boca-gold/35` | `rgba(255,215,0, 0.35)` | Borde dorado en hover |

### Texto

| Clase Tailwind | Valor hex | Cuándo usar |
|---|---|---|
| `text-white` | `#FFFFFF` | Texto principal sobre fondos oscuros |
| `text-text-nav` | `#e0e7ff` | Texto de navegación, header |
| `text-text-on-gold` | `#0052a3` | Texto azul sobre fondo dorado (ej: Badge gold) |
| `text-text-muted` | `#64748b` | Texto muy sutil, metadatos de baja jerarquía |
| `text-boca-gold` | `#FFD700` | Texto de énfasis, highlights de sección |

```tsx
// Correcto — usando tokens
<h2 className="type-section-title text-boca-gold">Próximos partidos</h2>
<p className="type-caption text-text-muted">Hace 3 horas</p>

// Incorrecto — valores mágicos
<h2 className="font-bold text-[#FFD700]">Próximos partidos</h2>
<p className="text-xs text-slate-500">Hace 3 horas</p>
```

### Estados de resultado de partido

| Clase Tailwind | Valor hex | Cuándo usar |
|---|---|---|
| `bg-status-win` | `#1A4D2E` | Fondo de victoria (pill, badge) |
| `bg-status-loss` | `#7A1F1F` | Fondo de derrota |
| `bg-status-draw` | `#4A5568` | Fondo de empate |
| `bg-status-win-subtle` | `#0E2B1A` | Fondo de fila en tabla (victoria) |
| `bg-status-loss-subtle` | `#2B1212` | Fondo de fila en tabla (derrota) |
| `bg-status-draw-subtle` | `#1E2636` | Fondo de fila en tabla (empate) |
| `text-status-negative` | `#f87171` | Números negativos en estadísticas |

### Otros tokens de color

| Clase Tailwind | Valor | Uso |
|---|---|---|
| `fill-deco-star` | `#4a9edd` | SVG decorativo de estrella en el fondo de App |
| `bg-pitch-green` | `#0d5c2a` | Fondo de cancha en juegos |
| `bg-pitch-green-dark` | `#0a4a22` | Gradiente oscuro de cancha |
| `bg-youtube-red` | `#cc0000` | Botón "Ver en YouTube" |
| `bg-overlay-dark` | `#031428` | Base del overlay en secciones de juego |

---

## Tipografía

### Fuentes

| Clase Tailwind | Fuente | Uso | Proporción |
|---|---|---|---|
| `font-serif` | Crimson Pro, Georgia, serif | Títulos, contenido editorial, nombres | 80% del contenido |
| `font-sans` | Geist, -apple-system, sans-serif | Botones, stats, labels de UI, datos tabulares | 20% del contenido |

### Clases tipográficas `.type-*`

Definidas en `src/index.css` `@layer components`. Usar **siempre** estas clases en lugar de componer font + size + weight manualmente.

| Clase | Fuente | Size | Weight | line-height | Cuándo usar |
|---|---|---|---|---|---|
| `.type-section-title` | Crimson Pro | 24px (1.5rem) | 700 (Bold) | 1.2 | Títulos de sección: "Próximos partidos", "Noticias" |
| `.type-card-title` | Crimson Pro | 18px (1.125rem) | 600 (SemiBold) | 1.5 | Títulos de cards de noticias, artículos |
| `.type-body` | Crimson Pro | 16px (1rem) | 400 (Regular) | 1.5 | Texto de contenido, descripciones |
| `.type-caption` | Crimson Pro | 14px (0.875rem) | 400 (Regular) | 1.5 | Fechas, metadatos, texto secundario |
| `.type-button` | Geist | 14px (0.875rem) | 500 (Medium) | — | Labels de botones, acciones, tabs |
| `.type-stat` | Geist | 20px (1.25rem) | 600 (SemiBold) | — | Goles, temperaturas, números destacados |
| `.type-ui-label` | Geist | 12px (0.75rem) | 600 (SemiBold) | 1 | Badges, cabeceras de tabla, pills |

```tsx
// Correcto
<h2 className="type-section-title text-white mb-4">Últimos partidos</h2>
<p className="type-caption text-text-muted">28 de marzo</p>
<span className="type-stat text-boca-gold">3</span>
<span className="type-ui-label">G</span>

// Incorrecto
<h2 className="font-serif text-2xl font-bold text-white mb-4">Últimos partidos</h2>
<p className="font-serif text-sm text-slate-400">28 de marzo</p>
```

### Escala de tamaños (referencia)

Definida en `design-system/tokens/typography.ts`:

| Token | Clase Tailwind | Valor | Uso típico |
|---|---|---|---|
| `xs` | `text-xs` | 12px | Metadatos muy pequeños |
| `sm` | `text-sm` | 14px | Texto secundario |
| `base` | `text-base` | 16px | Texto cuerpo |
| `md` | `text-md` | 18px | Texto destacado |
| `lg` | `text-lg` | 20px | Títulos pequeños |
| `xl` | `text-xl` | 24px | Títulos de sección |
| `2xl` | `text-2xl` | 32px | Títulos grandes |
| `3xl` | `text-3xl` | 40px | Títulos hero |
| `4xl` | `text-4xl` | 48px | Display |

---

## Espaciado

Sistema basado en escala de 4px. Definido en `design-system/tokens/spacing.ts`.

| Clase Tailwind | Valor | Cuándo usar |
|---|---|---|
| `gap-2` / `p-2` | 8px | Espacio entre elementos dentro de un componente |
| `gap-3` / `p-3` | 12px | Padding en filas de tabla |
| `gap-4` / `p-4` | 16px | Padding de cards pequeñas, gap entre componentes |
| `gap-6` / `p-6` | 24px | Padding de cards medianas, gap entre secciones |
| `gap-8` / `p-8` | 32px | Padding de cards grandes, gap entre columnas |
| `gap-10` / `mt-10` | 40px | Separación entre bloques de layout |
| `p-12` / `m-12` | 48px | Margen entre bloques grandes |

```tsx
// Convención de cards: padding lateral px-6, vertical py-6
<div className="px-6 pt-6 pb-3 border-b border-boca-border-card">
  {/* Header de sección */}
</div>
<div className="px-6 pt-4 pb-6">
  {/* Contenido */}
</div>
```

---

## Border Radius

Definido en `design-system/tokens/spacing.ts` (`borderRadius`):

| Clase Tailwind | Valor | Cuándo usar |
|---|---|---|
| `rounded-none` | 0 | Sin borde redondo |
| `rounded-sm` | 4px | Elementos pequeños (tags, chips internos) |
| `rounded` | 6px | Botones, inputs |
| `rounded-md` | 8px | Cards estándar |
| `rounded-lg` | 12px | Cards grandes, modales |
| `rounded-xl` | 16px | Elementos grandes |
| `rounded-full` | 9999px | Círculos, pills, avatares |

**Nota:** Las secciones y cards del proyecto usan principalmente `rounded-sm` (4px) para mantener una estética más angular y editorial, en consonancia con la identidad futbolera.

---

## Sombras

Definidas en `design-system/tokens/spacing.ts` (`shadows`):

| Clase Tailwind | Valor | Cuándo usar |
|---|---|---|
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Elevación mínima |
| `shadow` | `0 2px 8px rgba(0,0,0,0.1)` | Card en reposo |
| `shadow-md` | `0 4px 12px rgba(0,0,0,0.15)` | Card elevada |
| `shadow-lg` | `0 8px 24px rgba(0,0,0,0.2)` | Modales, drawers |
| `shadow-goldSm` | `0 2px 8px rgba(255,215,0,0.15)` | Hover sutil dorado |
| `shadow-goldMd` | `0 4px 12px rgba(255,215,0,0.2)` | Hover dorado estándar |
| `shadow-goldLg` | `0 8px 24px rgba(255,215,0,0.25)` | Hover dorado fuerte |
| `shadow-card` | `0px 4px 6px -1px rgba(0,0,0,0.5)...` | Card de noticia en hover (Figma) |

```tsx
// Sombra dorada en hover
<div className="hover:shadow-goldMd transition-shadow duration-300">
```

---

## Z-Index

Definido en `design-system/tokens/spacing.ts` (`zIndex`):

| Token | Valor | Uso |
|---|---|---|
| `z-0` | 0 | Flujo normal |
| `z-[10]` | 10 | Dropdowns |
| `z-[20]` | 20 | Sticky headers |
| `z-30` | 30 | Sidebar fixed |
| `z-40` | 40 | Backdrop de modal |
| `z-50` | 50 | Modales, drawers |
| `z-[60]` | 60 | Popovers |
| `z-[70]` | 70 | Tooltips |

---

## Gradientes

Definidos en `tailwind.config.js` (`backgroundImage`):

| Clase Tailwind | Descripción | Cuándo usar |
|---|---|---|
| `bg-app-bg` | Gradiente diagonal azul oscuro → azul medio | Fondo de toda la app (`App.tsx`) |
| `bg-overlay-game` | `to top` desde `#031428` hasta transparente | Overlay sobre imagen de fondo en juegos |
| `bg-pitch-field` | Verde cancha con gradiente vertical | Fondo de la cancha en juegos |
| `bg-banner-gradient` | Franja dorada muy sutil | BannerMensaje horizontal |
| `bg-bombonera-overlay` | Overlay negro hacia abajo | Sobre imagen de La Bombonera |

---

## Animaciones y Transiciones

### Duraciones estándar

| Clase Tailwind | Valor | Uso |
|---|---|---|
| `duration-150` | 150ms | Transiciones rápidas (hover de botones) |
| `duration-300` | 300ms | Transiciones estándar (aparición de paneles) |
| `duration-500` | 500ms | Transiciones lentas (cambios de layout) |
| `duration-1000` | 1000ms | TimerBar (countdown lineal) |

### Animaciones definidas en `src/index.css`

| Clase | Descripción | Cuándo usar |
|---|---|---|
| `animate-fade-in` | fadeIn 0.3s ease-out (opacity 0→1, translateY 10px→0) | Aparición de modales, cards cargadas |
| `animate-pulse` | Tailwind built-in | Skeletons de carga, hint de scroll |
| `marquee` | `translateX(0 → -50%)` | BannerMensaje animado |

```tsx
// Fade-in en modal o contenido que aparece
<div className="animate-fade-in">
  <GameModal ... />
</div>

// TimerBar usa duration-1000 con ease-linear
<div className={`h-full ${color} transition-all duration-1000 ease-linear`} />
```

### Transiciones de interacción

Patrón estándar para elementos interactivos:
```tsx
// Hover en cards
className="border border-boca-gold/10 hover:border-boca-gold/25 transition-colors"

// Hover con sombra dorada
className="hover:shadow-goldMd transition-shadow duration-300"

// Toggle de panel (sidebar)
className="transition-all duration-300"
```

---

*Última actualización: 2026-04-02*
