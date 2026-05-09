# SPEC — Videos Bosteros v2: Categorización por Tabs

**Proyecto:** La 12 Digital  
**URL:** la12digital.dev  
**Feature:** Mejora de la sección "Videos Bosteros" con tabs por categoría  
**Stack:** React + Vite + TypeScript + Tailwind CSS  
**Estado:** Borrador  
**Fecha:** Mayo 2026  

---

## 1. Objetivo

Mejorar la sección "Videos Bosteros" para que los usuarios puedan explorar contenido de YouTube organizado por **tipo de contenido** (no solo por creador). La mejora agrega categorías navegables mediante tabs, incorpora nuevos canales y presenta un resumen de lo más destacado como punto de entrada.

---

## 2. Contexto actual

La sección actualmente muestra videos de YouTube sin categorización. Los videos se obtienen mediante YouTube API (RSS o Data API). Se desconoce si existe un componente `<VideoCard>` o `<VideoGrid>` previo — **verificar antes de implementar** y reutilizar si existe.

---

## 3. Supuestos y decisiones de diseño

### 3.1 Supuesto crítico: creadores multi-categoría

Con 5 creadores y 5 categorías, cumplir "al menos 3 creadores por categoría" **requiere que los creadores aparezcan en más de una categoría**. Esto es intencional: un mismo canal puede producir distintos tipos de contenido.

> **Decisión:** Cada creador tiene una lista de categorías. La lógica de filtrado muestra su contenido en todos los tabs que correspondan.

### 3.2 Asignación de creadores a categorías

| Creador | Canal | Categorías |
|---|---|---|
| Davoo Xeneize | YouTube | Análisis, Opinión |
| Bostero Sacado | YouTube | Reacción, Opinión |
| Laboratorio de Fútbol | YouTube | Análisis, Táctica |
| Luli Izcati | YouTube | Opinión, Reacción |
| Mundo Boca | YouTube | Análisis, Oficial |

> ⚠️ **Gap detectado:** El tab "Oficial" quedaría con **un solo creador** (Mundo Boca). Se recomienda una de estas soluciones:
> - **Opción A (recomendada):** Agregar el canal oficial de Boca Juniors en YouTube a la configuración de creadores.
> - **Opción B:** Renombrar "Oficial" a "Noticias" e incluir canales de medios deportivos (TyC Sports Boca, etc.).
> - **Opción C:** Eliminar el tab "Oficial" del MVP y dejarlo para una v2 cuando haya más canales.
>
> **Pendiente de decisión por parte del equipo antes de implementar.**

### 3.3 Tab "Destacados" como punto de entrada

El primer tab es "Destacados" y funciona como una curaduría transversal. No filtra por categoría sino que muestra los videos más relevantes de todos los canales juntos. Los criterios de selección se detallan en la sección 6.

---

## 4. Estructura de tabs

El orden de los tabs es fijo:

| # | Tab | Descripción |
|---|---|---|
| 1 | ⭐ Destacados | Resumen curado de los mejores videos de todos los canales |
| 2 | Análisis | Videos de análisis de partidos y situaciones de juego |
| 3 | Táctica | Contenido con foco en sistemas y estrategia |
| 4 | Opinión | Videos de debate, comentario y punto de vista |
| 5 | Reacción | Reacciones a partidos, noticias y momentos virales |
| 6 | Oficial | Contenido de canales de comunicación oficial o periodismo institucional |

---

## 5. Estructura de datos

### 5.1 Tipo `Creator`

```typescript
type CreatorCategory = 'análisis' | 'táctica' | 'opinión' | 'reacción' | 'oficial';

interface Creator {
  id: string;
  name: string;
  channelId: string;       // YouTube Channel ID para la API
  handle: string;          // Ej: "@DavooXeneize"
  categories: CreatorCategory[];
  avatarUrl?: string;      // Opcional: thumbnail del canal
}
```

### 5.2 Configuración de creadores (hardcodeada)

```typescript
// src/data/videoCreators.ts
export const VIDEO_CREATORS: Creator[] = [
  {
    id: 'davoo-xeneize',
    name: 'Davoo Xeneize',
    channelId: 'CHANNEL_ID_AQUI',
    handle: '@DavooXeneize',
    categories: ['análisis', 'opinión'],
  },
  {
    id: 'laboratorio-futbol',
    name: 'Laboratorio de Fútbol',
    channelId: 'CHANNEL_ID_AQUI',
    handle: '@LaboratorioDeFutbol',
    categories: ['análisis', 'táctica'],
  },
  {
    id: 'luli-izcati',
    name: 'Luli Izcati',
    channelId: 'CHANNEL_ID_AQUI',
    handle: '@LuliIzcati',
    categories: ['opinión', 'reacción'],
  },
  {
    id: 'mundo-boca',
    name: 'Mundo Boca',
    channelId: 'CHANNEL_ID_AQUI',
    handle: '@MundoBoca',
    categories: ['análisis', 'oficial'],
  },
];
```

> Los `channelId` deben completarse con los IDs reales de YouTube antes de implementar.

### 5.3 Tipo `VideoItem`

```typescript
interface VideoItem {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  publishedAt: string;     // ISO 8601
  channelId: string;
  channelName: string;
  viewCount?: number;      // Disponible via YouTube Data API v3
  duration?: string;       // ISO 8601 duration
}
```

---

## 6. Lógica de "Destacados"

El tab Destacados debe mostrar una selección representativa de todos los canales. Criterios de prioridad (en orden):

1. **Videos recientes con alto engagement:** Si se usa YouTube Data API v3, ordenar por `viewCount` dentro de los últimos 30 días.
2. **Representación equitativa:** Al menos 1 video por creador en la vista de Destacados.
3. **Fallback:** Si no hay datos de viewCount disponibles (ej: se usa solo RSS), tomar el video más reciente de cada canal.

La cantidad total de videos en Destacados: **entre 6 y 9 cards** (2 columnas en mobile, 3 en desktop).

---

## 7. Componentes

### 7.1 Componentes a reutilizar

Verificar la existencia de los siguientes antes de crear nuevos:

- `<VideoCard />` — Card individual de video con thumbnail, título y canal
- `<Tabs />` o `<TabGroup />` — Componente de navegación por tabs
- Cualquier componente de grid o layout de cards existente

### 7.2 Componente nuevo: `<VideosByCategory />`

Componente contenedor principal de la sección. Orquesta el estado del tab activo y la carga de videos.

**Props:**
```typescript
interface VideosByCategoryProps {
  // Sin props requeridas, usa la configuración de videoCreators.ts
}
```

**Estado interno:**
```typescript
type TabId = 'destacados' | CreatorCategory;
const [activeTab, setActiveTab] = useState<TabId>('destacados');
```

**Estructura JSX de referencia:**
```tsx
<section>
  <SectionHeader title="Videos Bosteros" />
  
  <Tabs value={activeTab} onValueChange={setActiveTab}>
    <TabsList>
      <TabsTrigger value="destacados">⭐ Destacados</TabsTrigger>
      <TabsTrigger value="análisis">Análisis</TabsTrigger>
      <TabsTrigger value="táctica">Táctica</TabsTrigger>
      <TabsTrigger value="opinión">Opinión</TabsTrigger>
      <TabsTrigger value="reacción">Reacción</TabsTrigger>
      <TabsTrigger value="oficial">Oficial</TabsTrigger>
    </TabsList>

    <TabsContent value="destacados">
      <VideoGrid videos={featuredVideos} />
    </TabsContent>

    {CATEGORY_TABS.map(cat => (
      <TabsContent key={cat} value={cat}>
        <VideoGrid videos={videosForCategory(cat)} />
      </TabsContent>
    ))}
  </Tabs>
</section>
```

### 7.3 Componente nuevo: `<CreatorStrip />`

Muestra una fila horizontal de los creadores que pertenecen al tab activo. Sirve como contexto visual antes del grid de videos.

**Props:**
```typescript
interface CreatorStripProps {
  creators: Creator[];
}
```

**Render:** Avatar circular + nombre del canal, con un chip de categoría. En mobile: scroll horizontal.

### 7.4 Componente `<VideoGrid />`

Grid responsive de `<VideoCard />`. Si ya existe, adaptar. Si no, crear con:

- Mobile: 1 columna
- Tablet (md): 2 columnas
- Desktop (lg): 3 columnas

---

## 8. Integración con YouTube API

### 8.1 Hook: `useChannelVideos`

```typescript
// src/hooks/useChannelVideos.ts
function useChannelVideos(channelIds: string[], maxResults = 6): {
  videos: VideoItem[];
  loading: boolean;
  error: string | null;
}
```

- Recibe un array de `channelId` y fetcha los últimos `maxResults` videos de cada uno.
- Usa `Promise.all` para fetchear en paralelo.
- Cachea por `channelId` para no repetir llamadas al cambiar de tab.

### 8.2 Endpoint de YouTube a usar

```
GET https://www.googleapis.com/youtube/v3/search
  ?part=snippet
  &channelId={channelId}
  &maxResults=6
  &order=date
  &type=video
  &key={API_KEY}
```

> La API key debe estar en las variables de entorno: `VITE_YOUTUBE_API_KEY`.

### 8.3 Alternativa RSS (si no hay quota disponible)

```
GET https://www.youtube.com/feeds/videos.xml?channel_id={channelId}
```

Parsear con un parser de Atom/RSS. No requiere API key. Solo devuelve los últimos 15 videos sin viewCount.

---

## 9. Design tokens a respetar

Usar los tokens ya establecidos en el proyecto:

| Token | Valor |
|---|---|
| Background principal | `bg-[#031d46]` |
| Border | `border-[#00396e]` |
| Texto secundario | `text-[#8BA3C7]` |
| Acento / highlight | `text-[#FFD700]` |
| Tipografía | Consistente con el resto del proyecto |
| Spacing base | 8px |

El tab activo debe usar el acento dorado (`#FFD700`) como indicador de selección (underline o border-bottom), manteniendo la coherencia con el resto de la UI.

---

## 10. Comportamiento y UX

| Situación | Comportamiento |
|---|---|
| Carga inicial | Skeleton loaders en lugar de cards vacías |
| Tab sin videos | Mensaje vacío: _"No hay videos disponibles en esta categoría por ahora."_ |
| Error de API | Mensaje de error con opción de reintentar |
| Tab "Destacados" | Se carga al montar la sección; los demás tabs se cargan al hacer click (lazy) |
| Video card click | Abrir el video en YouTube en una nueva pestaña |
| Mobile | Tabs con scroll horizontal si no entran en pantalla |

---

## 11. Criterios de aceptación

- [ ] El tab "Destacados" muestra al menos 1 video de cada creador configurado.
- [ ] Cada tab de categoría muestra solo los creadores y videos correspondientes.
- [ ] Los creadores con múltiples categorías aparecen en todos sus tabs correspondientes.
- [ ] El `<CreatorStrip />` muestra correctamente los creadores del tab activo.
- [ ] Los videos se cargan desde YouTube API (o RSS como fallback).
- [ ] Los tabs funcionan en mobile con scroll horizontal si es necesario.
- [ ] Se reutilizan componentes existentes del proyecto (`<VideoCard />`, `<Tabs />`, etc.).
- [ ] Se respetan todos los design tokens del sistema.
- [ ] Los estados de loading y error están manejados.
- [ ] No hay llamadas duplicadas a la API al volver a un tab ya visitado.

---

## 12. Pendientes / Decisiones abiertas

| # | Pendiente | Responsable |
|---|---|---|
| 1 | Confirmar los Channel IDs de YouTube de cada creador | Matías |
| 2 | Decidir qué hacer con el tab "Oficial" (ver sección 3.2) | Matías |
| 3 | Verificar si `<VideoCard />` y `<Tabs />` ya existen en el proyecto | Dev |
| 4 | Confirmar si se usa YouTube Data API v3 o RSS | Dev |
| 5 | Confirmar si `VITE_YOUTUBE_API_KEY` ya está configurada en el entorno | Dev |

---

## 13. Out of scope (v2)

- Guardado de videos favoritos por usuario.
- Filtros adicionales dentro de un tab (por fecha, duración, etc.).
- Notificaciones de nuevos videos de un canal.
- Reproducción in-app (embed en modal).

---

_Fin del documento_
