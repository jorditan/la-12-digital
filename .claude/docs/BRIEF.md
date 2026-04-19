# La 12 Digital - UX Research & Strategy

## 📋 Project Brief

**Contexto:** Como hincha de Boca Juniors, identifico que seguir al equipo requiere navegar múltiples plataformas (web del club, redes sociales, apps de noticias, estadísticas dispersas). No existe una experiencia centralizada que combine datos en tiempo real con análisis inteligente y accionable.

**Objetivo del proyecto:** Diseñar y desarrollar un dashboard inteligente que centralice información clave de Boca y provea insights generados por IA para facilitar la toma de decisiones y el seguimiento del equipo.

**Target:** Hinchas de Boca entre 25-40 años, digitalmente activos, que consumen contenido del club regularmente y buscan información más allá de resultados básicos.

---

## 👤 User Persona

**Martín, 32 años - "El Hincha Analítico"**

- Trabaja en tecnología, va a la cancha cuando puede
- Sigue a Boca diariamente pero tiene poco tiempo
- Le gusta entender el "por qué" detrás de los resultados
- Consume estadísticas y análisis, no solo noticias
- Usa múltiples apps pero ninguna le da el panorama completo

**Frustraciones:**

- "Tengo que abrir 5 apps diferentes para tener toda la info"
- "Las noticias son sensacionalistas, quiero datos objetivos"
- "No tengo tiempo de analizar estadísticas, necesito resúmenes claros"

**Necesidades:**

- Información centralizada y actualizada
- Insights rápidos sin perder profundidad
- Entender el momento del equipo de un vistazo

---

## 📖 User Story

> _"Como hincha de Boca con poco tiempo, necesito una forma rápida de entender cómo viene el equipo y qué esperar del próximo partido, para poder tomar decisiones informadas (ir a la cancha, hablar con amigos, apostar) sin tener que investigar en múltiples fuentes."_

---

## 🎯 Jobs to be Done

**Functional Jobs:**

- Verificar próximos partidos y resultados recientes
- Conocer el estado actual del plantel (lesionados, suspendidos)
- Entender la posición en la tabla y contexto competitivo
- Obtener análisis del momento del equipo

**Emotional Jobs:**

- Sentirse informado y "en tema" con otros hinchas
- Reducir la ansiedad pre-partido con información clara
- Disfrutar del seguimiento sin overwhelm de información

**Social Jobs:**

- Tener argumentos basados en datos para discusiones
- Compartir insights interesantes con amigos

---

## 💡 Solución Propuesta: AI-First Dashboard

### Principios de diseño:

1. **AI as Copilot, not Feature** - La IA no es un "add-on", es el centro de la experiencia
2. **Data + Context = Insight** - Priorizar interpretación sobre datos crudos
3. **Scannable First, Deep Second** - Información jerarquizada para consumo rápido o profundo

### Arquitectura de experiencia:

```
┌─────────────────────────────────────────┐
│  [AI Chat Panel]  │  [Dashboard Widgets] │
│                   │                      │
│  Conversational   │  • Próximos partidos │
│  insights sobre   │  • Tabla posiciones  │
│  el equipo        │  • Estado plantel    │
│                   │  • Últimos resultados│
│  Análisis en      │                      │
│  lenguaje natural │  Visualización de    │
│                   │  datos en tiempo real│
└─────────────────────────────────────────┘
```

### Key Features del MVP:

**Panel AI (Izquierda - 40% viewport):**

- Chat interface con Claude/GPT
- Preguntas sugeridas contextual: "¿Cómo viene Boca?", "¿Qué esperar del próximo partido?"
- Análisis automático del momento del equipo
- Respuestas con datos de la API + interpretación IA

**Dashboard (Derecha - 60% viewport):**

- Widget: Próximo partido (fecha, rival, competencia)
- Widget: Últimos 5 resultados
- Widget: Tabla de posiciones
- Widget: Estado del plantel (lesionados/suspendidos)

---

## 🔄 User Flow Principal

1. **Entrada:** Usuario abre el dashboard
2. **First Impression:** Ve próximo partido destacado + mensaje IA de bienvenida
3. **Exploración:** Escanea widgets o hace pregunta directa a la IA
4. **Interacción:** IA analiza datos y responde en contexto
5. **Profundización:** Usuario hace follow-up questions o explora widgets
6. **Salida:** Sale informado y con claridad sobre el equipo

---

## ✅ Success Metrics

- **Tiempo para obtener info clave:** < 30 segundos
- **Satisfacción:** Usuario siente que "entiende" el momento del equipo
- **Engagement con IA:** Al menos 2 preguntas por sesión
- **Retención:** Usuario vuelve antes de cada partido

---

## 🛠 Stack Técnico

**Diseño:**

- Figma / PenPot (herramienta con IA)
- ShadCN para componentes UI

**Frontend:**

- React + TypeScript
- ShadCN UI

**Backend:**

- Go
- PostgreSQL / Supabase

**AI Integration:**

- Claude API / OpenAI API
- API-Football para datos del equipo

---

## 📅 Timeline Estimado

**Fase 1 - UX & Diseño (2 semanas):**

- Research y wireframes
- Diseño UI en Figma
- Sistema de diseño básico

**Fase 2 - Frontend MVP (3 semanas):**

- Setup React + TypeScript
- Implementación de widgets
- Integración con API-Football

**Fase 3 - AI Integration (2 semanas):**

- Backend Go
- Integración IA
- Chat interface

**Fase 4 - Polish (1 semana):**

- Testing
- Refinamiento UX
- Documentación

---

_Proyecto creado: Enero 2026_
