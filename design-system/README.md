# Design System - La 12 Digital 💙💛

Sistema de diseño completo para el portal del hincha de Boca Juniors.

## 📋 Contenido

### 1. [Tokens](./tokens/)

Variables de diseño reutilizables:

- **Colores** (`colors.ts`): Paleta oficial Boca + estados + históricos
- **Tipografía** (`typography.ts`): Crimson Pro (80%) + Inter (20%)
- **Espaciado** (`spacing.ts`): Sistema 8px + shadows + transitions + breakpoints

### 2. [Componentes](./components/)

Especificaciones de todos los componentes UI:

- Cards (Noticia, Video, Partido)
- Buttons (Primary, Secondary, Navigation)
- Widgets (La Bombonera, Quiz)
- Tables (Posiciones, Partidos)
- Carousels (Noticias, Videos)
- Navigation (Header, Banner)

### 3. [Guidelines](./guidelines/)

Guías de uso y mejores prácticas:

- Principios de diseño
- Cuándo usar cada tipografía
- Estados interactivos
- Sistema de espaciado
- Responsive design
- Errores comunes a evitar

## 🎨 Identidad Visual

### Colores Principales

```
Azul Boca:  #001529
Oro Boca:   #FFD700
```

### Tipografía

```
Serif:  Crimson Pro (80% contenido)
Sans:   Inter (20% UI elements)
```

### Espaciado

```
Sistema base: 8px
Valores comunes: 12px, 16px, 24px, 48px
Easter eggs: 10px (Riquelme), 12px (La 12), 19px (1905)
```

## 🚀 Quick Start

### 1. Importar tokens en React:

```typescript
import { colors, typography, spacing } from "@/design-system/tokens";
```

### 2. Usar con Tailwind:

```jsx
<div className="bg-boca-blue text-boca-gold font-serif p-6">Dale Booo!</div>
```

### 3. Usar directamente en CSS:

```css
.mi-componente {
  background: #001529;
  color: #ffd700;
  font-family: "Crimson Pro", Georgia, serif;
  padding: 24px;
}
```

## 📐 Estructura de Archivos

```
design-system/
├── tokens/
│   ├── colors.ts          # Paleta de colores
│   ├── typography.ts      # Sistema tipográfico
│   ├── spacing.ts         # Espaciado, shadows, transitions
│   └── index.ts          # Export central
│
├── components/
│   └── README.md         # Especificaciones de componentes
│
├── guidelines/
│   └── README.md         # Guías de uso
│
└── README.md            # Este archivo
```

## 🎯 Principios de Diseño

1. **Identidad Boquense**
   - Colores oficiales en todo momento
   - Referencias históricas sutiles (easter eggs)
   - Tradición (serif) + Modernidad (sans)

2. **Accesibilidad WCAG AA**
   - Contraste mínimo 4.5:1
   - Focus states visibles
   - Navegación por teclado

3. **Consistencia**
   - Usar componentes documentados
   - Mantener sistema de 8px
   - Estados interactivos definidos

## 🔧 Configuración Tailwind

El archivo `tailwind.config.js` en la raíz ya incluye todos los tokens:

```javascript
import { colors } from "./design-system/tokens/colors";
// ...configuración automática
```

## 📱 Responsive Breakpoints

```
sm:   640px  (Mobile landscape)
md:   768px  (Tablet)
lg:   1024px (Desktop small)
xl:   1280px (Desktop)
2xl:  1440px (Desktop large - base)
```

## ✅ Checklist de Implementación

Antes de codear un componente:

- [ ] Consultar especificaciones en `/components/`
- [ ] Usar tokens de `/tokens/`
- [ ] Verificar estados (hover, focus, active)
- [ ] Implementar responsive
- [ ] Probar accesibilidad
- [ ] Validar con guías de `/guidelines/`

## 🏆 Easter Eggs Históricos

El design system incluye referencias sutiles a la historia de Boca:

- **Duraciones**: 0.1905s (año fundación), 0.012s (La 12)
- **Spacing**: 12px (La 12), 10px (número 10), 19px (1905)
- **Colores**: Variables con años históricos
- **6 estrellas**: En banner (6 Libertadores)

## 📚 Recursos Adicionales

- [Diseño Figma](https://figma.com/design/4Ty5qowi9OnRNAQs364G60/)
- [API-Football Docs](https://www.api-football.com/documentation-v3)
- [Crimson Pro Font](https://fonts.google.com/specimen/Crimson+Pro)
- [Inter Font](https://fonts.google.com/specimen/Inter)

## 🤝 Contribuir

Para agregar o modificar componentes:

1. Actualizar especificaciones en `/components/README.md`
2. Documentar estados y variantes
3. Agregar ejemplos de código
4. Actualizar tokens si es necesario
5. Seguir convención de naming: `Componente/Estado/Variante`

---

## 📝 Versión

**Versión**: 1.0  
**Última actualización**: Febrero 2026  
**Basado en**: Diseño Figma final  
**Autor**: Matías - UX/UI Designer

---

**Dale Booo! 💙💛**

_"Yo no soy de Boca, soy Boca"_
