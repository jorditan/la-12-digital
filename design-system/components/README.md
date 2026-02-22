# Componentes - La 12 Digital

Documentación de componentes del design system basados en el diseño de Figma.

## 📋 Índice de Componentes

### Navigation
- [Header](#header)
- [Banner Mensaje Diario](#banner-mensaje-diario)

### Cards
- [Card Noticia](#card-noticia)
- [Card Video](#card-video)
- [Card Partido](#card-partido)
- [Widget La Bombonera](#widget-la-bombonera)

### Buttons
- [Button Primary](#button-primary)
- [Button Secondary](#button-secondary)
- [Button Navigation (Carousel)](#button-navigation)

### Lists & Tables
- [Tabla Posiciones](#tabla-posiciones)
- [Lista Partidos](#lista-partidos)

### Carousels
- [Carousel Noticias](#carousel-noticias)
- [Carousel Videos](#carousel-videos)

---

## Header

**Ubicación**: Top de la página  
**Altura**: 60px  
**Background**: `colors.background.primary` (#001529)

### Elementos:
- Logo Boca (40x40px)
- Navegación: "Inicio", "Plantel", "Historia del proyecto"
- 3 estrellas doradas (derecha)

### Estados:
- Default
- Sticky (scroll)

---

## Banner Mensaje Diario

**Ubicación**: Debajo del header  
**Altura**: 44px

### Variantes:
- Lunes a Domingo (mensajes diferentes)
- Día de partido (mensaje especial)
- Victoria ayer (celebración)

### Diseño:
```typescript
{
  background: 'rgba(0, 21, 41, 0.4)',
  borderTop: '1px solid rgba(255, 215, 0, 0.15)',
  borderBottom: '1px solid rgba(255, 215, 0, 0.15)',
  padding: '12px 24px',
  textAlign: 'center',
  fontFamily: 'Crimson Pro Medium',
  fontSize: '15px',
  color: '#FFD700'
}
```

### Iconos:
- 6 estrellas doradas al inicio (⭐⭐⭐⭐⭐⭐)
- Representa las 6 Copas Libertadores

---

## Card Noticia

**Dimensiones**: 280px × auto  
**Border**: 2px solid rgba(255, 215, 0, 0.15)  
**Border Radius**: 8px  
**Padding**: 0 (imagen full-width)

### Estados:

**Default:**
```typescript
{
  border: '2px solid rgba(255, 215, 0, 0.15)',
  boxShadow: 'none',
  transform: 'translateY(0)'
}
```

**Hover:**
```typescript
{
  border: '2px solid rgba(255, 215, 0, 0.4)',
  boxShadow: '0 8px 24px rgba(255, 215, 0, 0.25)',
  transform: 'translateY(-4px)',
  cursor: 'pointer',
  transition: 'all 0.3s ease'
}
```

### Estructura:
```html
<div class="card-noticia">
  <img src="..." alt="..." />
  <div class="content">
    <h3>Título de la noticia</h3>
    <div class="rating">⭐⭐⭐⭐⭐</div>
  </div>
</div>
```

### Typography:
- Título: Crimson Pro SemiBold 16px
- Color título: #FFFFFF

---

## Card Video

**Dimensiones**: 280px × auto  
**Border**: 2px solid rgba(255, 215, 0, 0.15)  
**Border Radius**: 8px

### Estados:

**Default:**
```typescript
{
  border: '2px solid rgba(255, 215, 0, 0.15)',
  opacity: 1
}
```

**Hover:**
```typescript
{
  border: '2px solid rgba(255, 215, 0, 0.35)',
  transform: 'scale(1.02)',
  transition: 'all 0.3s ease'
}
```

### Elementos:
- Thumbnail de YouTube
- Overlay con play button
- Título debajo
- Duración en esquina

---

## Card Partido

**Dimensiones**: Variable (responsive)  
**Padding**: 16px  
**Border Radius**: 8px

### Variantes por resultado:

**Victoria:**
```typescript
{
  background: '#1A4D2E',  // Verde oscuro
  border: '1px solid rgba(34, 197, 94, 0.3)'
}
```

**Derrota:**
```typescript
{
  background: '#7A1F1F',  // Rojo oscuro
  border: '1px solid rgba(239, 68, 68, 0.3)'
}
```

**Empate:**
```typescript
{
  background: '#4A5568',  // Gris
  border: '1px solid rgba(148, 163, 184, 0.3)'
}
```

### Estructura:
```
Fecha: 08/02
Rival: Vélez
Resultado: 1-2 o Próximo
Estadio: Nombre + Hora
```

---

## Widget La Bombonera

**Dimensiones**: 508px × 320px  
**Border Radius**: 8px

### Elementos:
- Foto aérea del estadio (200px height)
- Overlay con gradiente oscuro
- Info:
  - Título: "Bombonera 360°"
  - Clima: "24°C · ☀️ Despejado"
  - Próximo partido: "5 días"

### Typography:
- Título: Crimson Pro Medium 16px
- Info: Crimson Pro Regular 14px

---

## Button Primary

**Ejemplo**: "¡Dale Bo!"

### Estados:

**Default:**
```typescript
{
  background: '#FFD700',
  color: '#001529',
  padding: '12px 24px',
  borderRadius: '6px',
  fontFamily: 'Inter Medium',
  fontSize: '14px',
  border: 'none',
  cursor: 'pointer'
}
```

**Hover:**
```typescript
{
  background: '#FFC700',
  boxShadow: '0 4px 12px rgba(255, 215, 0, 0.4)',
  transform: 'translateY(-2px)',
  transition: 'all 0.2s ease'
}
```

**Pressed:**
```typescript
{
  background: '#E5C100',
  transform: 'translateY(0)',
  boxShadow: '0 2px 4px rgba(255, 215, 0, 0.3)'
}
```

**Disabled:**
```typescript
{
  background: '#6B8CAE',
  opacity: 0.5,
  cursor: 'not-allowed'
}
```

---

## Button Navigation (Carousel)

**Dimensiones**: 40px × 40px (circular)

### Estados:

**Default:**
```typescript
{
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  background: 'rgba(255, 215, 0, 0.12)',
  border: '1px solid rgba(255, 215, 0, 0.25)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}
```

**Hover:**
```typescript
{
  background: 'rgba(255, 215, 0, 0.25)',
  border: '1px solid rgba(255, 215, 0, 0.45)',
  transform: 'scale(1.05)',
  cursor: 'pointer'
}
```

### Iconos:
- Flecha izquierda: ◀
- Flecha derecha: ▶
- Color: #FFD700
- Tamaño: 20px

---

## Tabla Posiciones

**Width**: 100%  
**Border**: none

### Row:
```typescript
{
  padding: '12px 16px',  // Espacioso
  borderBottom: '1px solid rgba(255, 215, 0, 0.1)'
}
```

### Row Boca (destacado):
```typescript
{
  background: 'rgba(255, 215, 0, 0.08)',
  borderLeft: '4px solid #FFD700',
  fontWeight: 600
}
```

### Headers:
```typescript
{
  padding: '16px',
  fontFamily: 'Inter SemiBold',
  fontSize: '12px',
  color: '#8BA3C7',
  textTransform: 'uppercase'
}
```

### Zebra Striping (opcional):
```typescript
tr:nth-child(even) {
  background: 'rgba(255, 255, 255, 0.02)'
}
```

---

## Carousel Noticias

**Elementos visibles**: 3 cards  
**Gap**: 16px  
**Scroll**: Horizontal smooth

### Controles:
- Flechas circulares 40px
- Posición: Centro vertical, extremos

### Comportamiento:
- Click flecha: scroll 1 card
- Swipe (mobile): scroll fluid
- Auto-scroll: Opcional (cada 5 seg)

---

## Carousel Videos

Similar a Carousel Noticias pero con:
- Cards de video (YouTube thumbnails)
- 4 items visibles (desktop)
- Overlay play button

---

## 🎨 Convenciones de Naming

```
Componente/Estado/Variante

Ejemplos:
- Card-Noticia/Default
- Card-Noticia/Hover
- Button-Primary/Default
- Button-Primary/Hover
- Button-Primary/Pressed
- Button-Primary/Disabled
```

---

## 📱 Responsive

### Desktop (1440px+)
- Layout 70/30 (contenido/sidebar)
- 3 cards visibles en carousels

### Tablet (768px - 1439px)
- Stack vertical
- 2 cards visibles en carousels

### Mobile (< 768px)
- Stack vertical completo
- 1.2 cards visibles (peek next)
- Scroll horizontal en tabla

---

**Última actualización**: Basado en diseño Figma final  
**Versión**: 1.0  
**Autor**: Matías - UX/UI Designer 💙💛
