# Responsive y Accesibilidad — La 12 Digital

> Breakpoints del proyecto, patrones mobile-first, y checklist de accesibilidad para componentes.

## Índice
- [Breakpoints](#breakpoints)
- [Enfoque mobile-first](#enfoque-mobile-first)
- [Patrones responsive del proyecto](#patrones-responsive-del-proyecto)
- [Checklist de accesibilidad](#checklist-de-accesibilidad)
- [Patrones de a11y del proyecto](#patrones-de-a11y-del-proyecto)

---

## Breakpoints

Definidos en `design-system/tokens/spacing.ts` (`breakpoints`) e importados en `tailwind.config.js`:

| Prefijo Tailwind | Valor | Dispositivo típico |
|---|---|---|
| *(sin prefijo)* | 0px+ | Mobile portrait (base) |
| `sm:` | 640px+ | Mobile landscape / phablet |
| `md:` | 768px+ | Tablet |
| `lg:` | 1024px+ | Desktop pequeño |
| `xl:` | 1280px+ | Desktop estándar |
| `2xl:` | 1440px+ | Desktop grande (diseño base Figma) |

**El diseño base de Figma está a 1440px** (`2xl`). Se adapta hacia abajo (mobile-first).

---

## Enfoque mobile-first

Tailwind aplica estilos sin prefijo a **todas** las pantallas. Los prefijos agregan reglas para pantallas más grandes.

```tsx
// Leer así: "columna en mobile, fila en sm+"
<div className="flex flex-col sm:flex-row">

// Leer así: "oculto en mobile, visible en sm+"
<nav className="hidden sm:block">

// Leer así: "texto base en mobile, texto grande en md+"
<h2 className="text-lg md:text-xl">
```

**Regla:** Diseñar primero el layout mobile (sin prefijo), luego agregar overrides para pantallas más grandes.

```tsx
// Correcto — mobile first
<div className="px-3 py-3 sm:px-6 sm:py-8 lg:px-10">

// Incorrecto — desktop first con overrides para mobile
<div className="px-10 lg:px-10 sm:px-6 xs:px-3">
```

---

## Patrones responsive del proyecto

### Layout principal (`App.tsx`)

El contenido principal deja espacio al sidebar (desktop) y se expande cuando está colapsado:

```tsx
// App.tsx — margen derecho ajustado al estado del sidebar
<div
  className={[
    'w-full px-3 py-3 md:px-4 sm:px-6 sm:py-8 lg:px-10 transition-[margin] duration-300',
    sidebarCollapsed ? 'lg:mr-20 xl:mr-24' : 'lg:mr-[23rem] xl:mr-[27rem]',
  ].join(' ')}
>
```

### Sidebar: fixed en desktop, bottom drawer en mobile

```tsx
// Sidebar.tsx
// Desktop: fixed a la derecha, visible solo en lg+
<aside className="hidden lg:block fixed right-4 xl:right-6 top-[7.5rem] bottom-6 z-30">

// Mobile: bottom drawer, visible solo debajo de lg
<div className="lg:hidden">
  <MobileSidebarButton onClick={() => setDrawerOpen(true)} />
  <div className={`fixed bottom-0 left-0 right-0 z-50 max-h-[80vh] transition-transform duration-300 ${
    drawerOpen ? 'translate-y-0' : 'translate-y-full'
  }`}>
```

### Header: nav colapsada en mobile, hamburger menu

```tsx
// Header.tsx
// Nav visible solo en sm+
<nav className="hidden sm:block">

// Hamburger solo en mobile
<button className="sm:hidden">
```

El menú mobile se cierra automáticamente al redimensionar a desktop:
```tsx
useEffect(() => {
  const handleResize = () => { if (window.innerWidth >= 640) setIsMenuOpen(false); };
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);
```

### Grid de dos columnas (`App.tsx`)

```tsx
// Widget Bombonera + Últimos Partidos: columna en mobile, fila en sm+
<div className="flex flex-col gap-4 sm:flex-row sm:gap-8 sm:items-stretch">

// IdolosGame + EquiposGame: columna en mobile, 2 columnas en md+
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
```

### Separación entre secciones

```tsx
// Espaciado entre bloques: más compacto en mobile, más amplio en desktop
<div className="mt-6 sm:mt-10">
```

### Scroll horizontal en mobile

Las filas scrolleables (`ProximosPartidos`, `Noticias`, `CanalYoutube`) permiten scroll horizontal en mobile con drag. No hay grid en mobile — la grilla aparece solo en pantallas con espacio suficiente.

```tsx
// Siempre ocultar la scrollbar nativa
style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
className="overflow-x-auto cursor-grab active:cursor-grabbing select-none"
```

### Ancho de cards en fila horizontal

Las cards de scroll horizontal tienen ancho fijo (`shrink-0`), no porcentual:

```tsx
// ProximosPartidos — card de ancho fijo
<article className="shrink-0 w-60">

// Para garantizar que las cards no se compriman con flex
className="flex gap-4 overflow-x-auto"
```

---

## Checklist de accesibilidad

Verificar antes de hacer merge:

### Estructura semántica
- [ ] Secciones usan `<section>` con `aria-label` descriptivo
- [ ] El header global usa `role="banner"`
- [ ] La navegación usa `<nav>` con `aria-label` (distinguir nav principal de nav móvil)
- [ ] Las listas de navegación usan `<ul>` + `<li>` con `role="list"`
- [ ] Títulos de sección usan `<h2>` (no saltar niveles)
- [ ] Los artículos de contenido usan `<article>` cuando corresponde

### Imágenes
- [ ] Toda imagen tiene `alt` descriptivo
- [ ] Imágenes decorativas tienen `alt=""` (o están en SVGs con `aria-hidden="true"`)
- [ ] Escudos de equipos tienen `alt="Nombre del equipo"`

### Interactividad
- [ ] Botones sin texto visible tienen `aria-label`
- [ ] El botón hamburger tiene `aria-expanded` y `aria-label` que cambia según el estado
- [ ] Los toggle de vista tienen `aria-label` descriptivo (`"Vista tarjetas"`, `"Vista tabla"`)
- [ ] Los links de navegación activos tienen `aria-current="page"`
- [ ] Los elementos interactivos son alcanzables por teclado (no solo por mouse)

### Focus
- [ ] Los elementos interactivos tienen estilos `focus-visible` visibles
- [ ] El foco no queda atrapado fuera de los modales mientras están abiertos
- [ ] Cuando un modal se abre, el foco se mueve al primer elemento interactivo dentro

### Color y contraste
- [ ] No se usa el color como único medio de comunicar información (ej: badges de victoria/derrota tienen texto, no solo color)
- [ ] El texto `text-text-secondary` (`#8BA3C7`) sobre fondos azul oscuro cumple WCAG AA
- [ ] El texto `text-text-muted` (`#64748b`) solo se usa para información de baja jerarquía donde no es crítico el contraste

### Formularios (juegos)
- [ ] Los inputs tienen `<label>` asociado o `aria-label`
- [ ] Los errores de validación se anuncian (atributo `aria-invalid` o mensaje visible)

---

## Patrones de a11y del proyecto

### Patrón de elementos decorativos

Los SVGs decorativos y los íconos que complementan texto con `aria-hidden="true"`:

```tsx
// App.tsx — estrella decorativa de fondo, invisible para lectores de pantalla
<div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
  <svg /* ... */ aria-hidden="true" />
</div>

// Header.tsx — íconos de estrella junto a label descriptivo en el contenedor
<div aria-label="3 Copas Libertadores" title="3 Copas Libertadores">
  <Star size={16} fill="currentColor" aria-hidden="true" />
  <Star size={16} fill="currentColor" aria-hidden="true" />
  <Star size={16} fill="currentColor" aria-hidden="true" />
</div>
```

### Patrón de botón hamburger

```tsx
// Header.tsx — aria-label y aria-expanded dinámicos
<button
  className="sm:hidden p-1 text-boca-gold"
  onClick={() => setIsMenuOpen(o => !o)}
  aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
  aria-expanded={isMenuOpen}
>
  {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
</button>
```

### Patrón de link activo en navegación

```tsx
// Header.tsx — aria-current="page" en el link activo
<a
  href={href}
  aria-current={isActive ? 'page' : undefined}
  className={isActive ? 'text-boca-gold' : 'text-text-nav hover:text-boca-gold'}
>
  {label}
</a>
```

**Nota:** Usar `undefined` en vez de `false` para omitir el atributo cuando no aplica. `aria-current={false}` es válido pero `undefined` limpia el atributo del DOM.

### Patrón de sección con estado async

Las secciones usan `<section>` con `aria-label` para que los lectores de pantalla puedan navegar entre ellas:

```tsx
// ProximosPartidos.tsx
<section aria-label="Próximos partidos" className="bg-boca-blue-mid border border-boca-border rounded-sm">
  <h2 className="type-section-title text-white">Próximos partidos</h2>
  {/* ... */}
</section>
```

### Patrón de focus en input de juego

El foco se mueve al input del juego cuando el modal abre, con un delay que permite que el modal termine de renderizar:

```tsx
// useIdolosGame.ts
useEffect(() => {
  if (state !== 'playing') return;
  const t = setTimeout(() => inputRef.current?.focus(), INPUT_FOCUS_DELAY_MS); // 150ms
  return () => clearTimeout(t);
}, [state]);
```

### Patrón de imágenes con fallback

Los escudos de equipos tienen fallback cuando la imagen falla:

```tsx
// ProximosPartidos.tsx
<img
  src={rival.logo}
  alt={rival.name}
  onError={(e) => { (e.currentTarget as HTMLImageElement).src = ESCUDO_VACIO; }}
  draggable={false}
/>
```

### Patrón de backdrop de modal accesible

El backdrop del drawer mobile captura clicks para cerrar:

```tsx
// Sidebar.tsx — backdrop como zona de cierre
{drawerOpen && (
  <div
    className="fixed inset-0 z-40 bg-black/60"
    onClick={() => setDrawerOpen(false)}
  />
)}
```

Para modales complejos (juegos), considerar también `onKeyDown` para cerrar con Escape:

```tsx
useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') closeModal();
  };
  document.addEventListener('keydown', handler);
  return () => document.removeEventListener('keydown', handler);
}, [closeModal]);
```

---

*Última actualización: 2026-04-02*
