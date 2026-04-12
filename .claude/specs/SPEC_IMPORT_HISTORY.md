# La 12 Digital — Feature: Importar Partidos

## Contexto del proyecto

Estás trabajando en **La 12 Digital**, plataforma de historial de un hincha de Boca Juniors.

- **Stack:** React + Vite + TypeScript + Tailwind CSS + Supabase
- **Deploy:** Cloudflare Workers
- **API-Football:** Team ID Boca Juniors = `451`, Liga Profesional = `128`
- **Design tokens:**
  - Background: `bg-[#031d46]`
  - Borders: `border-[#00396e]`
  - Text muted: `text-[#8BA3C7]`
  - Text accent: `text-[#FFD700]`

---

## Objetivo

Implementar la feature **"Importar Partidos"** dentro del módulo Mi Historial de Partidos. Permite al usuario subir un `.xlsx` con su historial externo (ej. un Excel personal), el sistema valida, enriquece con la API y persiste en Supabase.

Crear la rama `feat/import-matches`. Implementar en este orden: lógica pura (FEAT-02 → 03 → 04 → 06) primero, UI del modal después (FEAT-05 → 01).

---

## FEAT-01 — Botón en vista Historial

**Archivo afectado:** el componente principal de Mi Historial (buscar con `grep -r "historial\|MatchHistory" src/`).

Agregar un botón "Importar partidos" junto al botón existente de agregar partido:

```tsx
import { Upload } from 'lucide-react';

<button
  onClick={() => setImportModalOpen(true)}
  className="h-10 flex items-center gap-2 px-4 rounded-lg border border-[#00396e] text-[#8BA3C7] hover:bg-[#00396e]/20 transition-colors"
>
  <Upload className="w-4 h-4" />
  Importar partidos
</button>
```

El estado `importModalOpen` controla la visibilidad del `<ImportModal />`.

---

## FEAT-02 — Hook: descarga del template `.xlsx`

**Crear:** `src/hooks/useTemplateDownload.ts`

Usar SheetJS (`xlsx`, ya en el stack o instalar: `npm install xlsx`).

```ts
import * as XLSX from 'xlsx';

export function useTemplateDownload() {
  const downloadTemplate = () => {
    const wb = XLSX.utils.book_new();

    // Hoja 1 — datos editables
    const headers = ['fecha', 'rival', 'competencia', 'notas'];
    const examples = [
      ['12/04/2025', 'Racing Club', 'Liga Profesional', 'La 12 a full'],
      ['23/02/2025', 'River Plate', 'Copa Argentina', ''],
      ['05/10/2024', 'Independiente', 'Liga Profesional', 'Primer superclásico'],
    ];
    const ws1 = XLSX.utils.aoa_to_sheet([headers, ...examples]);
    XLSX.utils.book_append_sheet(wb, ws1, 'Mis Partidos');

    // Hoja 2 — instrucciones (read-only visual)
    const instrucciones = [
      ['INSTRUCCIONES DE USO'],
      [''],
      ['fecha', 'Obligatorio. Formato DD/MM/YYYY. No puede ser fecha futura.'],
      ['rival', 'Obligatorio. Nombre del equipo rival (ej: Racing Club, River Plate).'],
      ['competencia', 'Opcional. Si lo dejás vacío, el sistema lo completa automáticamente.'],
      ['notas', 'Opcional. Tu comentario personal del partido. Máximo 200 caracteres.'],
      [''],
      ['LÍMITE: máximo 200 partidos por importación.'],
      ['FORMATOS ACEPTADOS: .xlsx y .csv únicamente.'],
    ];
    const ws2 = XLSX.utils.aoa_to_sheet(instrucciones);
    XLSX.utils.book_append_sheet(wb, ws2, 'Instrucciones');

    XLSX.writeFile(wb, 'la12digital_template_import.xlsx');
  };

  return { downloadTemplate };
}
```

---

## FEAT-03 — Hook: parsing y validación del archivo

**Crear:** `src/hooks/useFileParser.ts`

```ts
import * as XLSX from 'xlsx';

export interface ParsedRow {
  rowIndex: number;
  fecha: string;      // DD/MM/YYYY original
  fechaISO: string;   // YYYY-MM-DD para la API
  rival: string;
  competencia?: string;
  notas?: string;
}

export interface RowError {
  rowIndex: number;
  field: 'fecha' | 'rival' | 'file';
  message: string;
}

export interface ParseResult {
  valid: ParsedRow[];
  errors: RowError[];
}

export function useFileParser() {
  const parseFile = async (file: File): Promise<ParseResult> => {
    // 1. Validar tipo de archivo
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['xlsx', 'csv'].includes(ext ?? '')) {
      return {
        valid: [],
        errors: [{ rowIndex: 0, field: 'file', message: 'Formato no soportado. Solo se aceptan archivos .xlsx y .csv' }]
      };
    }

    // 2. Validar tamaño
    if (file.size > 2 * 1024 * 1024) {
      return {
        valid: [],
        errors: [{ rowIndex: 0, field: 'file', message: 'El archivo supera el límite de 2MB' }]
      };
    }

    // 3. Parsear con SheetJS
    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer, { type: 'array', cellDates: false });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows: string[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' }) as string[][];

    // 4. Detectar header por texto 'fecha' en primera columna
    const startRow = rows[0]?.[0]?.toString().toLowerCase().trim() === 'fecha' ? 1 : 0;
    const dataRows = rows.slice(startRow, startRow + 200); // límite 200 filas

    const valid: ParsedRow[] = [];
    const errors: RowError[] = [];

    dataRows.forEach((row, idx) => {
      const realIdx = idx + startRow + 1;

      // Ignorar filas vacías
      if (!row[0] && !row[1]) return;

      const fecha = row[0]?.toString().trim() ?? '';
      const rival = row[1]?.toString().trim() ?? '';
      const competencia = row[2]?.toString().trim() || undefined;
      let notas = row[3]?.toString().trim() || undefined;

      // Validar fecha
      const fechaRegex = /^\d{2}\/\d{2}\/\d{4}$/;
      if (!fechaRegex.test(fecha)) {
        errors.push({ rowIndex: realIdx, field: 'fecha', message: `Fila ${realIdx}: formato de fecha inválido (usar DD/MM/YYYY)` });
        return;
      }

      const [dd, mm, yyyy] = fecha.split('/');
      const dateObj = new Date(`${yyyy}-${mm}-${dd}`);
      if (isNaN(dateObj.getTime())) {
        errors.push({ rowIndex: realIdx, field: 'fecha', message: `Fila ${realIdx}: fecha inválida` });
        return;
      }
      if (dateObj > new Date()) {
        errors.push({ rowIndex: realIdx, field: 'fecha', message: `Fila ${realIdx}: la fecha no puede ser futura` });
        return;
      }

      // Validar rival
      if (!rival) {
        errors.push({ rowIndex: realIdx, field: 'rival', message: `Fila ${realIdx}: el rival es obligatorio` });
        return;
      }

      // Truncar notas
      if (notas && notas.length > 200) notas = notas.slice(0, 200);

      valid.push({
        rowIndex: realIdx,
        fecha,
        fechaISO: `${yyyy}-${mm}-${dd}`,
        rival,
        competencia,
        notas,
      });
    });

    return { valid, errors };
  };

  return { parseFile };
}
```

---

## FEAT-04 — Hook: enriquecimiento vía API-Football

**Crear:** `src/hooks/useMatchEnricher.ts`

```ts
import { ParsedRow } from './useFileParser';

export type EnrichStatus = 'found' | 'not_found' | 'duplicate';

export interface EnrichedRow extends ParsedRow {
  status: EnrichStatus;
  fixtureId?: number;
  homeTeam?: string;
  awayTeam?: string;
  homeGoals?: number | null;
  awayGoals?: number | null;
  league?: string;
}

const BOCA_TEAM_ID = 451;
const DELAY_MS = 300; // respetar rate limit plan gratuito API-Football

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Recibe la función de fetch de fixtures que ya exista en el proyecto
// (buscar con: grep -r "fixtures\|api-football\|apiFootball" src/)
// Si no existe un cliente centralizado, crear la llamada inline con el
// mismo API key que usa el resto del proyecto.

export function useMatchEnricher(existingFixtureIds: number[]) {
  const enrich = async (
    rows: ParsedRow[],
    onProgress: (current: number, total: number) => void
  ): Promise<EnrichedRow[]> => {
    const results: EnrichedRow[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      onProgress(i + 1, rows.length);

      try {
        // Llamada a API-Football
        const response = await fetch(
          `https://v3.football.api-sports.io/fixtures?team=${BOCA_TEAM_ID}&date=${row.fechaISO}`,
          {
            headers: {
              'x-rapidapi-key': import.meta.env.VITE_API_FOOTBALL_KEY,
              'x-rapidapi-host': 'v3.football.api-sports.io',
            }
          }
        );
        const data = await response.json();
        const fixtures = data?.response ?? [];

        let matched = null;

        if (fixtures.length === 1) {
          matched = fixtures[0];
        } else if (fixtures.length > 1) {
          // Fuzzy match por nombre de rival
          matched = fixtures.find((f: any) => {
            const home = f.teams.home.name.toLowerCase();
            const away = f.teams.away.name.toLowerCase();
            const rival = row.rival.toLowerCase();
            return home.includes(rival) || away.includes(rival) ||
                   rival.includes(home) || rival.includes(away);
          }) ?? null;
        }

        if (!matched) {
          results.push({ ...row, status: 'not_found' });
        } else {
          const fixtureId = matched.fixture.id;
          const isDuplicate = existingFixtureIds.includes(fixtureId);
          results.push({
            ...row,
            status: isDuplicate ? 'duplicate' : 'found',
            fixtureId,
            homeTeam: matched.teams.home.name,
            awayTeam: matched.teams.away.name,
            homeGoals: matched.goals.home,
            awayGoals: matched.goals.away,
            league: matched.league.name,
          });
        }
      } catch {
        results.push({ ...row, status: 'not_found' });
      }

      if (i < rows.length - 1) await delay(DELAY_MS);
    }

    return results;
  };

  return { enrich };
}
```

---

## FEAT-06 — Hook: persistencia en Supabase

**Crear:** `src/hooks/useMatchImport.ts`

```ts
import { supabase } from '../lib/supabase'; // ajustar path al cliente existente
import { EnrichedRow } from './useMatchEnricher';

export function useMatchImport(userId: string) {
  const importMatches = async (rows: EnrichedRow[]): Promise<{ success: boolean; count: number; error?: string }> => {
    const toImport = rows.filter(r => r.status === 'found');

    const records = toImport.map(r => ({
      user_id: userId,
      fixture_id: r.fixtureId,
      fecha: r.fechaISO,
      rival: r.rival,
      home_team: r.homeTeam,
      away_team: r.awayTeam,
      home_goals: r.homeGoals,
      away_goals: r.awayGoals,
      competencia: r.league ?? r.competencia,
      notas: r.notas ?? null,
      imported_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from('user_matches') // ← ajustar al nombre real de la tabla
      .insert(records);

    if (error) {
      return { success: false, count: 0, error: error.message };
    }

    return { success: true, count: records.length };
  };

  return { importMatches };
}
```

> **Importante:** verificar el nombre real de la tabla en Supabase con `grep -r "user_matches\|attended\|historial" src/`.

---

## FEAT-05 — Modal de importación (UI)

**Crear:** `src/components/ImportModal.tsx`

El modal tiene 4 estados internos. Usar `useState<'idle' | 'processing' | 'preview' | 'success'>`.

```tsx
// Estructura general del modal
<dialog // o usar el componente de modal que ya exista en el proyecto
  className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
>
  <div className="w-full max-w-2xl mx-4 rounded-xl border border-[#00396e] bg-[#031d46] p-6">

    {/* Estado: idle */}
    {step === 'idle' && (
      <>
        <h2 className="text-[#FFD700] font-bold text-xl mb-4">Importar partidos</h2>

        {/* Instrucciones */}
        <p className="text-[#8BA3C7] text-sm mb-4">
          Descargá el template, completalo con tus partidos y subilo acá.
          El sistema va a buscar automáticamente el resultado y la competencia.
        </p>

        {/* Botón descargar template */}
        <button onClick={downloadTemplate} className="h-10 flex items-center gap-2 px-4 rounded-lg border border-[#00396e] text-[#8BA3C7] hover:bg-[#00396e]/20 transition-colors mb-6">
          <Download className="w-4 h-4" />
          Descargar template
        </button>

        {/* Zona de upload */}
        <label className="block border-2 border-dashed border-[#00396e] rounded-xl p-8 text-center cursor-pointer hover:border-[#FFD700]/40 transition-colors">
          <Upload className="w-8 h-8 text-[#8BA3C7] mx-auto mb-2" />
          <span className="text-[#8BA3C7] text-sm">
            Arrastrá tu archivo acá o <span className="text-[#FFD700]">hacé clic para seleccionar</span>
          </span>
          <span className="block text-[#8BA3C7]/60 text-xs mt-1">.xlsx o .csv · máx. 2MB · hasta 200 partidos</span>
          <input type="file" accept=".xlsx,.csv" className="hidden" onChange={handleFileChange} />
        </label>

        {/* Errores de validación */}
        {errors.length > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-red-900/20 border border-red-700/40">
            <p className="text-red-400 text-sm font-bold mb-2">Se encontraron errores en el archivo:</p>
            {errors.map(e => (
              <p key={e.rowIndex} className="text-red-300 text-xs">• {e.message}</p>
            ))}
          </div>
        )}
      </>
    )}

    {/* Estado: processing */}
    {step === 'processing' && (
      <div className="text-center py-8">
        <p className="text-[#8BA3C7] mb-4">Analizando {progress} de {total} partidos...</p>
        <div className="w-full bg-[#00396e]/30 rounded-full h-2">
          <div
            className="bg-[#FFD700] h-2 rounded-full transition-all"
            style={{ width: `${(progress / total) * 100}%` }}
          />
        </div>
      </div>
    )}

    {/* Estado: preview */}
    {step === 'preview' && (
      <>
        {/* Sección ✅ Listos */}
        {enriched.filter(r => r.status === 'found').length > 0 && (
          <PreviewSection
            title={`✅ Listos para importar (${enriched.filter(r => r.status === 'found').length})`}
            rows={enriched.filter(r => r.status === 'found')}
            color="green"
          />
        )}

        {/* Sección ⚠️ Duplicados */}
        {enriched.filter(r => r.status === 'duplicate').length > 0 && (
          <PreviewSection
            title={`⚠️ Ya en tu historial (${enriched.filter(r => r.status === 'duplicate').length})`}
            rows={enriched.filter(r => r.status === 'duplicate')}
            color="yellow"
          />
        )}

        {/* Sección ❌ No encontrados */}
        {enriched.filter(r => r.status === 'not_found').length > 0 && (
          <PreviewSection
            title={`❌ No encontrados (${enriched.filter(r => r.status === 'not_found').length})`}
            rows={enriched.filter(r => r.status === 'not_found')}
            color="red"
          />
        )}

        {/* CTAs */}
        <div className="flex gap-3 mt-6">
          <button onClick={handleImport} className="h-10 flex items-center px-6 rounded-lg bg-[#FFD700] text-[#031d46] font-bold hover:bg-[#FFD700]/90 transition-colors">
            Importar {enriched.filter(r => r.status === 'found').length} partidos
          </button>
          <button onClick={onClose} className="h-10 flex items-center px-4 rounded-lg border border-[#00396e] text-[#8BA3C7] hover:bg-[#00396e]/20 transition-colors">
            Cancelar
          </button>
        </div>
      </>
    )}

    {/* Estado: success */}
    {step === 'success' && (
      <div className="text-center py-8">
        <p className="text-4xl mb-4">🎉</p>
        <h3 className="text-[#FFD700] font-bold text-xl mb-2">
          ¡{importedCount} partidos importados!
        </h3>
        <p className="text-[#8BA3C7] text-sm mb-6">Tu historial ya está actualizado.</p>
        <button onClick={onClose} className="h-10 flex items-center px-6 rounded-lg bg-[#FFD700] text-[#031d46] font-bold">
          Ver mi historial
        </button>
      </div>
    )}

  </div>
</dialog>
```

---

## Checklist antes del merge

- [ ] Template descargado tiene hoja "Mis Partidos" + hoja "Instrucciones"
- [ ] Subir `.xls` muestra error "Formato no soportado"
- [ ] Fecha futura en Excel muestra error de validación en esa fila
- [ ] Fila con rival vacío muestra error de validación
- [ ] Filas vacías se ignoran sin error
- [ ] Progress bar avanza durante el enriquecimiento
- [ ] Partido encontrado muestra resultado y competencia en preview
- [ ] Partido duplicado aparece en sección ⚠️ y NO se importa
- [ ] Partido no encontrado aparece en sección ❌
- [ ] El contador "Importar N partidos" refleja solo los `found`
- [ ] Tras confirmar, el historial se actualiza sin recargar la página
- [ ] Import de 50 partidos no genera rate-limit error
- [ ] Modal funciona en mobile (375px)

---

## Notas finales

- No modificar la lógica de marcado manual de partidos.
- Si la tabla en Supabase no tiene la columna `imported_at`, agregarla con una migration.
- Si SheetJS no está instalado: `npm install xlsx`.
- Nombre de rama: `feat/import-matches`.