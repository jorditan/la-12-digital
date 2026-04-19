# Guía de Uso - Design System La 12 Digital

## 🎯 Principios de Diseño

### 1. Identidad Boquense

- **Colores oficiales**: Azul (#001529) y Oro (#FFD700) en todas las interfaces
- **Tradición + Modernidad**: 80% serif tradicional + 20% sans moderna
- **Mística del club**: Easter eggs históricos integrados sutilmente

### 2. Accesibilidad (WCAG AA)

- Contraste mínimo texto/fondo: 4.5:1
- Navegación por teclado en todos los elementos
- Alt text descriptivo en imágenes
- Focus states visibles con outline dorado

### 3. Consistencia

- Usar componentes documentados
- Mantener spacing system (8px)
- Aplicar estados (hover, active, disabled) consistentemente

---

## 📐 Cuándo Usar Cada Tipografía

### Crimson Pro (Serif) - 80% del contenido

**✅ Usar para:**

- Títulos de secciones
- Nombres de equipos
- Títulos de noticias y artículos
- Descripciones y textos largos
- Nombres de jugadores
- Mensajes del banner diario
- Cualquier contenido narrativo

**Ejemplo:**

```css
.section-title {
  font-family: "Crimson Pro", Georgia, serif;
  font-size: 20px;
  font-weight: 700;
  color: #ffd700;
}
```

### Inter (Sans) - 20% del contenido

**✅ Usar para:**

- Inputs y formularios
- Botones
- Números y estadísticas
- Fechas y horas
- Labels de UI
- Navegación
- Tablas de datos

**Ejemplo:**

```css
.button {
  font-family: "Inter", sans-serif;
  font-size: 14px;
  font-weight: 500;
}
```

---

## 🎨 Jerarquía Visual

### Colores de Texto

**Primario (Títulos importantes):**

```css
color: #ffd700; /* Dorado */
font-family: "Crimson Pro";
font-weight: 700;
```

**Secundario (Contenido principal):**

```css
color: #ffffff; /* Blanco */
font-family: "Crimson Pro";
font-weight: 400;
```

**Terciario (Metadatos, fechas):**

```css
color: #8ba3c7; /* Gris claro */
font-family: "Inter";
font-weight: 400;
```

---

## 🖱️ Estados Interactivos

### Hover

Todos los elementos clickeables deben tener hover state:

```css
.card:hover {
  border-color: rgba(255, 215, 0, 0.4);
  box-shadow: 0 8px 24px rgba(255, 215, 0, 0.25);
  transform: translateY(-4px);
  transition: all 0.3s ease;
}
```

### Focus

Navegación por teclado:

```css
*:focus-visible {
  outline: 2px solid #ffd700;
  outline-offset: 2px;
}
```

### Active/Pressed

Feedback táctil:

```css
.button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(255, 215, 0, 0.3);
}
```

---

## 📏 Espaciado

### Sistema de 8px

Todo el espaciado debe ser múltiplo de 8:

```
4px  → Muy pequeño
8px  → Pequeño
16px → Medio (más común)
24px → Grande
32px → Muy grande
48px → Extra grande
```

### Ejemplos de Uso

**Padding en cards:**

```css
.card {
  padding: 24px; /* spacing.6 */
}
```

**Gap entre elementos:**

```css
.container {
  display: flex;
  gap: 16px; /* spacing.4 */
}
```

**Margin entre secciones:**

```css
.section {
  margin-bottom: 48px; /* spacing.12 */
}
```

---

## 🔲 Borders y Sombras

### Borders Dorados

**Sutil (Default):**

```css
border: 2px solid rgba(255, 215, 0, 0.15);
```

**Visible (Hover):**

```css
border: 2px solid rgba(255, 215, 0, 0.4);
```

**Destacado (Boca en tabla):**

```css
border-left: 4px solid #ffd700;
```

### Sombras

**Card elevado:**

```css
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
```

**Hover dorado:**

```css
box-shadow: 0 8px 24px rgba(255, 215, 0, 0.25);
```

---

## 🎭 Easter Eggs Boquenses

### Duraciones de Animación

```css
/* Año fundación 1905 */
transition: 0.1905s;

/* La 12 */
animation-delay: 0.012s;

/* 6 Libertadores */
animation-iteration-count: 6;
```

### Valores de Spacing

```css
/* La 12 */
gap: 12px;

/* Número 10 */
padding: 10px;

/* 1905 (19+05=24, pero redondeamos a 19) */
margin: 19px;
```

---

## 📱 Responsive Design

### Breakpoints

```typescript
const breakpoints = {
  sm: "640px", // Mobile landscape
  md: "768px", // Tablet
  lg: "1024px", // Desktop small
  xl: "1280px", // Desktop
  "2xl": "1440px", // Desktop large (base)
};
```

### Layout

**Desktop (1440px+):**

```css
.layout {
  display: grid;
  grid-template-columns: 70% 30%;
  gap: 32px;
}
```

**Tablet (768px - 1439px):**

```css
.layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}
```

**Mobile (< 768px):**

```css
.layout {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
```

---

## ⚠️ Errores Comunes a Evitar

### ❌ NO HACER:

1. **Usar colores fuera del sistema**

   ```css
   /* ❌ MAL */
   color: #ff0000;
   background: #00ff00;
   ```

   ```css
   /* ✅ BIEN */
   color: colors.text.primary;
   background: colors.status.win;
   ```

2. **Espaciado arbitrario**

   ```css
   /* ❌ MAL */
   padding: 13px 17px;
   ```

   ```css
   /* ✅ BIEN */
   padding: 12px 16px; /* Múltiplos de 8 o históricos */
   ```

3. **Tipografía incorrecta**

   ```css
   /* ❌ MAL - Título en sans */
   .title {
     font-family: "Inter";
   }
   ```

   ```css
   /* ✅ BIEN - Título en serif */
   .title {
     font-family: "Crimson Pro";
   }
   ```

4. **Hover sin transición**

   ```css
   /* ❌ MAL */
   .card:hover {
     transform: translateY(-4px);
   }
   ```

   ```css
   /* ✅ BIEN */
   .card:hover {
     transform: translateY(-4px);
     transition: all 0.3s ease;
   }
   ```

5. **Borders muy gruesos**
   ```css
   /* ❌ MAL */
   border: 5px solid #ffd700;
   ```
   ```css
   /* ✅ BIEN */
   border: 2px solid rgba(255, 215, 0, 0.15);
   ```

---

## ✅ Checklist Pre-Deploy

Antes de publicar un componente, verifica:

- [ ] Colores del sistema oficial
- [ ] Tipografía 80/20 (Crimson Pro / Inter)
- [ ] Espaciado múltiplo de 8px
- [ ] Estados hover/focus/active definidos
- [ ] Transiciones suaves (0.3s ease)
- [ ] Contraste WCAG AA mínimo
- [ ] Responsive en 3 breakpoints
- [ ] Focus visible con outline dorado
- [ ] Alt text en imágenes
- [ ] Nomenclatura consistente

---

## 📚 Recursos

- [Tokens de diseño](../tokens/)
- [Componentes documentados](../components/)
- [Diseño Figma](https://figma.com/design/4Ty5qowi9OnRNAQs364G60/)

---

**Dale Booo! 💙💛**
