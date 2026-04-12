# La 12 Digital — UX/UI Polish: Prompt para Claude Code

## Contexto del proyecto

Estás trabajando en **La 12 Digital**, una plataforma de hincha de Boca Juniors.

- **Stack:** React + Vite + TypeScript + Tailwind CSS
- **Deploy:** Cloudflare Workers
- **Design tokens activos:**
  - Background: `bg-[#031d46]`
  - Borders: `border-[#00396e]`
  - Text muted: `text-[#8BA3C7]`
  - Text accent: `text-[#FFD700]`

---

## Objetivo

Implementar 4 mejoras de UX/UI como preparación para el lanzamiento del MVP. Hacerlo todo en **un único PR** llamado `feat/ux-polish-mvp`. No tocar lógica de negocio ni llamadas a API. Solo cambios de UI y componentes.

---

## ISS-01 — Tabla compacta de próximos partidos en mobile

**Componentes afectados:** el que renderiza la lista de próximos partidos (probablemente `UpcomingMatches.tsx` o similar).

**Qué hacer:**

1. Identificar el componente que lista los próximos partidos.
2. Agregar un layout alternativo que se muestre **solo en mobile** (`< 640px`) usando clases condicionales de Tailwind:

```tsx
{/* Desktop/tablet: mantener el layout actual de cards */}
<div className="hidden sm:block">
  {/* layout existente sin cambios */}
</div>

{/* Mobile: nueva tabla compacta */}
<div className="block sm:hidden">
  <table className="w-full text-sm">
    <thead>
      <tr className="border-b border-[#00396e] text-[#8BA3C7] text-xs uppercase">
        <th className="py-2 text-left">Fecha</th>
        <th className="py-2 text-left">Rival</th>
        <th className="py-2 text-left">Hora</th>
        <th className="py-2 text-center">Estado</th>
      </tr>
    </thead>
    <tbody>
      {matches.map((match) => (
        <tr key={match.id} className="border-b border-[#00396e]/40 h-12 text-[#8BA3C7]">
          <td className="py-2 pr-3 whitespace-nowrap">{formatDate(match.date)}</td>
          <td className="py-2 pr-3 truncate max-w-[110px]">{match.opponent}</td>
          <td className="py-2 pr-3 whitespace-nowrap">{formatTime(match.time)}</td>
          <td className="py-2 text-center">
            <MatchUrgencyBadge matchDate={match.date} />
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

**Criterios:**
- Cada fila tiene altura mínima de `h-12` (48px) para target táctil correcto.
- No hay scroll horizontal en 375px.
- El layout de cards desktop no cambia en absoluto.

---

## ISS-02 — Componente centralizado `MatchUrgencyBadge`

**Qué hacer:**

Crear el archivo `src/components/MatchUrgencyBadge.tsx` con la siguiente lógica:

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

  if (diffHours < 0) return null;          // partido ya pasó
  if (diffHours <= 3) return 'critical';   // hoy / menos de 3 hs
  if (diffHours <= 24) return 'upcoming';  // mañana
  if (diffHours <= 72) return 'near';      // esta semana
  return null;
}


// Clase base FIJA — no sobreescribir con className externo
const BASE = 'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide';

export function MatchUrgencyBadge({ matchDate, showIcon = true }: MatchUrgencyBadgeProps) {
  const level = getUrgencyLevel(matchDate);
  if (!level) return null;

  const config = BADGE_CONFIG[level];

  return (
    <span className={`${BASE} ${config.className}`}>
      {showIcon && <span>{config.icon}</span>}
      {config.label}
    </span>
  );
}
```

Luego **reemplazar** todas las instancias anteriores de badges de urgencia hardcodeados en el proyecto por `<MatchUrgencyBadge matchDate={match.date} />`. Buscar con: `grep -r "HOY\|falta poco\|urgency\|badge" src/`.

---

## ISS-03 — Altura uniforme en botones de igual jerarquía

**Qué hacer:**

Buscar los botones "Ver últimos partidos" y "Agregar al calendario" (probablemente en `MatchCard.tsx` o en un componente de acciones).

Cambiar cualquier uso de `py-*` suelto en botones secundarios por `h-10 flex items-center`:

```tsx
// ❌ Antes (problemático — py distinto genera alturas distintas)
<button className="py-3 px-4 rounded-lg border border-[#00396e] text-[#8BA3C7] ...">
  Ver últimos partidos
</button>
<button className="py-2 px-4 rounded-lg border border-[#00396e] text-[#8BA3C7] ...">
  Agregar al calendario
</button>

// ✅ Después (altura fija — idéntica siempre)
<button className="h-10 flex items-center px-4 rounded-lg border border-[#00396e] text-[#8BA3C7] hover:bg-[#00396e]/20 transition-colors ...">
  Ver últimos partidos
</button>
<button className="h-10 flex items-center px-4 rounded-lg border border-[#00396e] text-[#8BA3C7] hover:bg-[#00396e]/20 transition-colors ...">
  Agregar al calendario
</button>
```

Si algún botón tiene un ícono SVG adentro, asegurarse de que tenga `className="w-4 h-4"` para que no infle la altura.

---

## ISS-04 — Centralizar tokens de diseño

**Qué hacer:**

1. Crear el archivo `src/styles/design-tokens.ts`:

```ts
// src/styles/design-tokens.ts

export const tokens = {
  // Contenedores
  card: 'rounded-xl border border-[#00396e] bg-[#031d46]',
  cardHover: 'rounded-xl border border-[#00396e] bg-[#031d46] hover:border-[#FFD700]/40 transition-colors',

  // Tipografía
  textMuted: 'text-[#8BA3C7]',
  textAccent: 'text-[#FFD700]',
  textBase: 'text-white',

  // Botones
  btnSecondary: 'h-10 flex items-center px-4 rounded-lg border border-[#00396e] text-[#8BA3C7] hover:bg-[#00396e]/20 transition-colors',
  btnPrimary: 'h-10 flex items-center px-4 rounded-lg bg-[#FFD700] text-[#031d46] font-bold hover:bg-[#FFD700]/90 transition-colors',

  // Divisores
  divider: 'border-[#00396e]',
} as const;
```

2. Auditar el proyecto buscando clases ad-hoc inconsistentes:
   - `rounded-lg` vs `rounded-xl` en cards → unificar a `rounded-xl`
   - `text-blue-300` o variantes de opacity → reemplazar por `text-[#8BA3C7]`
   - `border-blue-800` o similares → reemplazar por `border-[#00396e]`

```bash
# Comandos útiles para encontrar inconsistencias:
grep -r "rounded-lg\|rounded-md\|rounded-xl" src/components/ | grep -v "btn\|badge\|input"
grep -r "text-blue\|opacity-60\|opacity-70" src/components/
```

3. Reemplazar las clases encontradas importando desde `design-tokens.ts` o aplicando los valores correctos directamente.

---

## Checklist de QA antes del merge

Verificar cada punto manualmente en el navegador a 375px de ancho:

- [ ] Próximos partidos muestra tabla (no cards) en mobile
- [ ] Cada fila de la tabla tiene al menos 48px de altura
- [ ] No hay scroll horizontal en la tabla
- [ ] El layout de cards en desktop no cambió
- [ ] Partido a +72hs → no muestra badge
- [ ] El badge es visualmente idéntico en tabla mobile y card desktop
- [ ] "Ver últimos partidos" y "Agregar al calendario" tienen igual altura
- [ ] Todas las cards tienen el mismo `border-radius`
- [ ] No hay colores de texto muted distintos entre componentes similares

---

## Notas finales

- No crear ramas adicionales. Todo en `feat/ux-polish-mvp`.
- No modificar lógica de fetching, tipos de datos ni rutas.
- Si encontrás algo roto que no está en este SPEC, abrí un comentario en el código con `// TODO: [descripción]` y seguí adelante.
- Prioridad de implementación: ISS-03 → ISS-02 → ISS-04 → ISS-01.