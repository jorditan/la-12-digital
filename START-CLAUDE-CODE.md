# 🚀 INICIO RÁPIDO PARA CLAUDE CODE

## ✅ TODO ESTÁ LISTO

El proyecto tiene:
- ✅ Design system completo (`/design-system/`)
- ✅ Configuración Vite + React + TypeScript
- ✅ Tailwind configurado con tokens
- ✅ Estructura de carpetas creada
- ✅ Componente base funcionando
- ✅ Fuentes Google Fonts cargadas

---

## 📋 PASOS PARA EMPEZAR

### 1. Instalar dependencias
```bash
npm install
```

### 2. Crear archivo .env
```bash
cp .env.example .env
```

Luego editar `.env` y agregar tus API keys.

### 3. Iniciar desarrollo
```bash
npm run dev
```

Debería abrir en http://localhost:3000

---

## 🎨 RECURSOS DISPONIBLES

### Design System
```typescript
// Importar tokens
import { colors, typography, spacing } from '@design-system/tokens';

// Usar en código
const styles = {
  backgroundColor: colors.primary.blue.DEFAULT,
  fontFamily: typography.fonts.serif,
  padding: spacing[6]
};
```

### Tailwind Classes
```jsx
<div className="bg-boca-blue text-boca-gold font-serif p-6">
  ¡Dale Booo!
</div>
```

### Documentación
- **Design System General**: `/design-system/README.md`
- **Componentes**: `/design-system/components/README.md`
- **Guidelines**: `/design-system/guidelines/README.md`
- **Prompt Completo**: `/PROMPT-CLAUDE-CODE.md`

---

## 🧩 COMPONENTES A DESARROLLAR

Orden sugerido:

1. **Header** (simple, sin APIs)
2. **BannerMensaje** (lógica de días, sin APIs)
3. **Layout** (estructura 70/30)
4. **WidgetBombonera** (integrar OpenWeather API)
5. **UltimosPartidos** (integrar API-Football)
6. **ProximosPartidos** (integrar API-Football)
7. **TablaPoisciones** (integrar API-Football)
8. **CarouselNoticias** (datos mock primero)
9. **CarouselVideos** (integrar YouTube API)
10. **Quiz** (lógica local)

---

## 🔑 APIs NECESARIAS

Registrate en:

1. **API-Football**: https://www.api-football.com/
   - Plan gratuito: 100 requests/día
   
2. **OpenWeather**: https://openweathermap.org/api
   - Plan gratuito: 1000 requests/día

3. **YouTube Data API**: https://console.cloud.google.com/
   - Plan gratuito: 10,000 units/día

4. **NewsAPI** (opcional): https://newsapi.org/
   - Plan gratuito: 100 requests/día

---

## 📐 DISEÑO DE REFERENCIA

**Figma**: https://www.figma.com/design/4Ty5qowi9OnRNAQs364G60/Design-System

---

## ⚡ COMANDOS ÚTILES

```bash
# Desarrollo
npm run dev

# Build producción
npm run build

# Preview build
npm run preview

# Lint
npm run lint
```

---

## 🎯 PRIMEROS PASOS RECOMENDADOS

1. Verificar que todo compile: `npm run dev`
2. Leer `/PROMPT-CLAUDE-CODE.md` completo
3. Revisar componentes en `/design-system/components/README.md`
4. Empezar con Header (componente simple)
5. Probar integración de 1 API (OpenWeather)
6. Iterar sobre el resto

---

## 💡 TIPS

- **Path aliases disponibles**:
  - `@/` → `src/`
  - `@design-system/` → `design-system/`

- **Colores Tailwind custom**:
  - `bg-boca-blue`, `bg-boca-blue-light`, `bg-boca-blue-dark`
  - `text-boca-gold`, `border-boca-gold`
  - `bg-status-win`, `bg-status-loss`, `bg-status-draw`

- **Fuentes ya cargadas**:
  - `font-serif` → Crimson Pro
  - `font-sans` → Geist

---

**Todo listo para desarrollar con Claude Code 🚀**

**Dale Booo! 💙💛**
