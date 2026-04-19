# Importar Partidos desde XLSX — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Permitir al usuario importar su historial de partidos desde un archivo `.xlsx` o `.csv`, enriqueciéndolo con datos locales y persistiéndolo en Supabase.

**Architecture:** Cuatro hooks de lógica pura (`useTemplateDownload`, `useFileParser`, `useMatchEnricher`, `useMatchImport`) componen el flujo de importación. El matching con partidos reales se hace de forma local contra el array `MatchResult[]` ya cargado en `useMiHistorial`, sin llamadas externas adicionales. La persistencia reutiliza `useMatchAttendance.upsert()` para mantener consistencia con la tabla `match_attendance` y el caché de la tabla `matches`.

**Tech Stack:** React + TypeScript + SheetJS (`xlsx`) + Supabase + Tailwind CSS + lucide-react

---

## Pre-requisitos antes de codear

### Paso 1: Crear la rama

```bash
git checkout main && git pull
git checkout -b feat/import-matches
```

### Paso 2: Instalar SheetJS

```bash
npm install xlsx
```

Verificar que aparece en `package.json` bajo `dependencies`.

### Paso 3: Verificar TypeScript base

```bash
npx tsc --noEmit
```

Expected: 0 errores. Si hay errores pre-existentes, anotar cuáles son para no confundirlos con los propios.

---

## Task 1: `useTemplateDownload` — Genera el archivo template

**Files:**
- Create: `src/hooks/useTemplateDownload.ts`

### Paso 1: Crear el hook

```ts
// src/hooks/useTemplateDownload.ts
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

    // Hoja 2 — instrucciones (visual read-only)
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

### Paso 2: Verificar TypeScript

```bash
npx tsc --noEmit
```

Expected: 0 errores nuevos.

### Paso 3: Commit

```bash
git add src/hooks/useTemplateDownload.ts
git commit -m "feat(import): add useTemplateDownload hook"
```

---

## Task 2: `useFileParser` — Parsea y valida el archivo subido

**Files:**
- Create: `src/hooks/useFileParser.ts`

### Paso 1: Crear el hook

```ts
// src/hooks/useFileParser.ts
import * as XLSX from 'xlsx';

export interface ParsedRow {
  rowIndex: number;
  fecha: string;     // DD/MM/YYYY (original del usuario)
  fechaISO: string;  // YYYY-MM-DD (para comparar con MatchResult.date)
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
    // 1. Validar extensión
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['xlsx', 'csv'].includes(ext ?? '')) {
      return {
        valid: [],
        errors: [{ rowIndex: 0, field: 'file', message: 'Formato no soportado. Solo se aceptan archivos .xlsx y .csv' }],
      };
    }

    // 2. Validar tamaño (2 MB)
    if (file.size > 2 * 1024 * 1024) {
      return {
        valid: [],
        errors: [{ rowIndex: 0, field: 'file', message: 'El archivo supera el límite de 2MB' }],
      };
    }

    // 3. Parsear con SheetJS
    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer, { type: 'array', cellDates: false });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1, defval: '' });

    // 4. Detectar fila de header
    const startRow = rows[0]?.[0]?.toString().toLowerCase().trim() === 'fecha' ? 1 : 0;
    const dataRows = rows.slice(startRow, startRow + 200);

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
      if (!/^\d{2}\/\d{2}\/\d{4}$/.test(fecha)) {
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

      // Truncar notas a 200 chars
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

### Paso 2: Verificar TypeScript

```bash
npx tsc --noEmit
```

Expected: 0 errores nuevos.

### Paso 3: Commit

```bash
git add src/hooks/useFileParser.ts
git commit -m "feat(import): add useFileParser hook with xlsx/csv validation"
```

---

## Task 3: `useMatchEnricher` — Match local contra datos ya cargados

> **Adaptación crítica vs spec:** La spec propone llamar a API-Football directamente. Este proyecto usa LiveScore API via Cloudflare Worker proxy — no hay endpoint por fecha disponible sin agregar lógica al worker. En cambio, el enriquecimiento se hace contra el array `MatchResult[]` que ya está en memoria (los últimos ~50 partidos de Liga + Libertadores).

**Files:**
- Create: `src/hooks/useMatchEnricher.ts`

**Dependencias:**
- `src/services/apifootball.ts` → tipo `MatchResult`
- `src/utils/stringMatch.ts` → `normalize()`
- `src/hooks/useFileParser.ts` → tipo `ParsedRow`

### Paso 1: Crear el hook

```ts
// src/hooks/useMatchEnricher.ts
import type { MatchResult } from '@/services/apifootball';
import { normalize } from '@/utils/stringMatch';
import type { ParsedRow } from './useFileParser';

export type EnrichStatus = 'found' | 'not_found' | 'duplicate';

export interface EnrichedRow extends ParsedRow {
  status: EnrichStatus;
  fixtureId?: number;
  homeTeam?: string;
  homeTeamId?: number;
  homeTeamLogo?: string;
  awayTeam?: string;
  awayTeamId?: number;
  awayTeamLogo?: string;
  homeGoals?: number | null;
  awayGoals?: number | null;
  league?: string;
}

/**
 * Enriquece filas del Excel con datos de partidos reales.
 * El matching es local — no hace llamadas adicionales a APIs.
 *
 * @param matches     Array de MatchResult ya cargado en useMiHistorial
 * @param existingIds fixtureIds que el usuario ya tiene en su historial
 */
export function useMatchEnricher(matches: MatchResult[], existingIds: number[]) {
  const enrich = (
    rows: ParsedRow[],
    onProgress: (current: number, total: number) => void,
  ): EnrichedRow[] => {
    return rows.map((row, i) => {
      onProgress(i + 1, rows.length);

      // Buscar por fecha exacta primero
      const byDate = matches.filter(m => m.date.slice(0, 10) === row.fechaISO);

      let matched: MatchResult | undefined;

      if (byDate.length === 1) {
        matched = byDate[0];
      } else if (byDate.length > 1) {
        // Fuzzy match por nombre del rival
        const normalRival = normalize(row.rival);
        matched = byDate.find(m => {
          const home = normalize(m.homeTeam.name);
          const away = normalize(m.awayTeam.name);
          return home.includes(normalRival) || away.includes(normalRival) ||
                 normalRival.includes(home) || normalRival.includes(away);
        });
      }

      if (!matched) {
        return { ...row, status: 'not_found' };
      }

      const isDuplicate = existingIds.includes(matched.fixtureId);
      return {
        ...row,
        status: isDuplicate ? 'duplicate' : 'found',
        fixtureId: matched.fixtureId,
        homeTeam: matched.homeTeam.name,
        homeTeamId: matched.homeTeam.id,
        homeTeamLogo: matched.homeTeam.logo,
        awayTeam: matched.awayTeam.name,
        awayTeamId: matched.awayTeam.id,
        awayTeamLogo: matched.awayTeam.logo,
        homeGoals: matched.goalsHome,
        awayGoals: matched.goalsAway,
        league: matched.competition,
      };
    });
  };

  return { enrich };
}
```

### Paso 2: Verificar TypeScript

```bash
npx tsc --noEmit
```

Expected: 0 errores nuevos.

### Paso 3: Commit

```bash
git add src/hooks/useMatchEnricher.ts
git commit -m "feat(import): add useMatchEnricher with local fuzzy matching"
```

---

## Task 4: `useMatchImport` — Persiste en Supabase vía upsert existente

> **Adaptación crítica vs spec:** La spec inserta en tabla `user_matches`. La tabla real es `match_attendance`. Reutilizar `useMatchAttendance.upsert()` garantiza consistencia (también cachea en la tabla `matches`) y evita duplicar lógica de Supabase.

**Files:**
- Create: `src/hooks/useMatchImport.ts`

**Dependencias:**
- `src/hooks/useMatchAttendance.ts` → tipo `UpsertAttendancePayload`
- `src/hooks/useMatchEnricher.ts` → tipo `EnrichedRow`

### Paso 1: Crear el hook

```ts
// src/hooks/useMatchImport.ts
import type { UpsertAttendancePayload } from '@/types/attendance';
import type { EnrichedRow } from './useMatchEnricher';

interface ImportResult {
  success: boolean;
  count: number;
  error?: string;
}

/**
 * Persiste en Supabase los partidos con status 'found'.
 * Recibe upsert de useMatchAttendance para reutilizar la lógica existente
 * (que también cachea en la tabla matches).
 */
export function useMatchImport(
  upsert: (payload: UpsertAttendancePayload) => Promise<void>,
) {
  const importMatches = async (rows: EnrichedRow[]): Promise<ImportResult> => {
    const toImport = rows.filter(r => r.status === 'found');

    try {
      for (const row of toImport) {
        await upsert({
          matchId: row.fixtureId!.toString(),
          attended: true,
          note: row.notas ?? null,
          matchData: {
            date: row.fechaISO,
            homeTeamId: row.homeTeamId!,
            homeTeamName: row.homeTeam!,
            homeTeamLogo: row.homeTeamLogo,
            awayTeamId: row.awayTeamId!,
            awayTeamName: row.awayTeam!,
            awayTeamLogo: row.awayTeamLogo,
            goalsHome: row.homeGoals ?? null,
            goalsAway: row.awayGoals ?? null,
            competition: row.league ?? row.competencia,
          },
        });
      }
      return { success: true, count: toImport.length };
    } catch (err) {
      return {
        success: false,
        count: 0,
        error: err instanceof Error ? err.message : 'Error desconocido al importar',
      };
    }
  };

  return { importMatches };
}
```

### Paso 2: Verificar TypeScript

```bash
npx tsc --noEmit
```

Expected: 0 errores nuevos.

### Paso 3: Commit

```bash
git add src/hooks/useMatchImport.ts
git commit -m "feat(import): add useMatchImport using existing upsert hook"
```

---

## Task 5: `ImportModal` — UI del flujo de importación

**Files:**
- Create: `src/components/MiHistorial/ImportModal.tsx`

**Pattern de modal del proyecto** (tomado de `ConfirmDeleteModal.tsx` y `NoteModal.tsx`):
- Overlay: `fixed inset-0 z-[200] flex items-center justify-center px-4`
- Background: `style={{ background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(4px)' }}`
- Card: `w-full max-w-2xl bg-boca-blue-light border border-boca-border rounded-sm p-6 shadow-2xl animate-fade-in`
- Escape key + click-outside cierran el modal

**Props:**
```ts
interface ImportModalProps {
  matches: MatchResult[];            // ya cargados en useMiHistorial
  existingFixtureIds: number[];      // para detectar duplicados
  upsert: (p: UpsertAttendancePayload) => Promise<void>; // de useMatchAttendance
  onClose: () => void;
}
```

### Paso 1: Crear el componente

```tsx
// src/components/MiHistorial/ImportModal.tsx
import { useState, useEffect, useRef } from 'react';
import { Upload, Download, X } from 'lucide-react';
import { Button } from '../ui/Button';
import type { MatchResult } from '@/services/apifootball';
import type { UpsertAttendancePayload } from '@/types/attendance';
import { useTemplateDownload } from '@/hooks/useTemplateDownload';
import { useFileParser } from '@/hooks/useFileParser';
import type { RowError } from '@/hooks/useFileParser';
import { useMatchEnricher } from '@/hooks/useMatchEnricher';
import type { EnrichedRow } from '@/hooks/useMatchEnricher';
import { useMatchImport } from '@/hooks/useMatchImport';

type Step = 'idle' | 'processing' | 'preview' | 'success';

interface ImportModalProps {
  matches: MatchResult[];
  existingFixtureIds: number[];
  upsert: (payload: UpsertAttendancePayload) => Promise<void>;
  onClose: () => void;
}

// ── Sub-componente: fila de preview ──────────────────────────────────────────

const StatusDot = ({ status }: { status: EnrichedRow['status'] }) => {
  const colors: Record<EnrichedRow['status'], string> = {
    found: 'bg-[#4ade80]',
    duplicate: 'bg-boca-gold',
    not_found: 'bg-[#fca5a5]',
  };
  return <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${colors[status]}`} />;
};

const PreviewRow = ({ row }: { row: EnrichedRow }) => {
  const rival = row.homeTeam && row.awayTeam
    ? `${row.homeTeam} vs ${row.awayTeam}`
    : row.rival;
  const score = row.homeGoals !== undefined && row.awayGoals !== undefined
    ? ` ${row.homeGoals}-${row.awayGoals}`
    : '';
  return (
    <div className="flex items-center gap-2 py-1">
      <StatusDot status={row.status} />
      <span className="type-caption text-text-nav flex-1 min-w-0 truncate">
        {row.fecha} · {rival}{score}
      </span>
      {row.league && (
        <span className="type-caption text-text-muted shrink-0">{row.league}</span>
      )}
    </div>
  );
};

// ── Componente principal ──────────────────────────────────────────────────────

export const ImportModal = ({ matches, existingFixtureIds, upsert, onClose }: ImportModalProps) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<Step>('idle');
  const [errors, setErrors] = useState<RowError[]>([]);
  const [enriched, setEnriched] = useState<EnrichedRow[]>([]);
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);
  const [importedCount, setImportedCount] = useState(0);
  const [importError, setImportError] = useState<string | null>(null);

  const { downloadTemplate } = useTemplateDownload();
  const { parseFile } = useFileParser();
  const { enrich } = useMatchEnricher(matches, existingFixtureIds);
  const { importMatches } = useMatchImport(upsert);

  // Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset state
    setErrors([]);
    setEnriched([]);
    setImportError(null);

    const result = await parseFile(file);

    if (result.errors.length > 0 || result.valid.length === 0) {
      setErrors(result.errors.length > 0 ? result.errors : [
        { rowIndex: 0, field: 'file', message: 'El archivo no contiene filas válidas.' }
      ]);
      return;
    }

    // Enriquecer (sincrónico, matching local)
    setStep('processing');
    setTotal(result.valid.length);
    setProgress(0);

    const enrichedRows = enrich(result.valid, (current, tot) => {
      setProgress(current);
      setTotal(tot);
    });

    setEnriched(enrichedRows);
    setStep('preview');
  };

  const handleImport = async () => {
    setImportError(null);
    const result = await importMatches(enriched);
    if (!result.success) {
      setImportError(result.error ?? 'Error al importar');
      return;
    }
    setImportedCount(result.count);
    setStep('success');
  };

  const foundCount     = enriched.filter(r => r.status === 'found').length;
  const duplicateCount = enriched.filter(r => r.status === 'duplicate').length;
  const notFoundCount  = enriched.filter(r => r.status === 'not_found').length;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[200] flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="w-full max-w-2xl bg-boca-blue-light border border-boca-border rounded-sm shadow-2xl animate-fade-in">

        {/* Header compartido */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-boca-border/60">
          <h2 className="type-card-title text-boca-gold">Importar partidos</h2>
          <button onClick={onClose} className="text-text-muted hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">

          {/* ── idle ── */}
          {step === 'idle' && (
            <>
              <p className="type-body text-text-muted mb-5">
                Descargá el template, completalo con tus partidos y subilo acá.
                El sistema va a buscar automáticamente el resultado y la competencia.
              </p>

              <button
                onClick={downloadTemplate}
                className="h-9 flex items-center gap-2 px-4 rounded-sm border border-boca-border text-text-muted hover:bg-boca-border/20 transition-colors type-caption mb-6"
              >
                <Download className="w-4 h-4" />
                Descargar template
              </button>

              <label className="block border-2 border-dashed border-boca-border rounded-sm p-8 text-center cursor-pointer hover:border-boca-gold/40 transition-colors">
                <Upload className="w-8 h-8 text-text-muted mx-auto mb-2" />
                <span className="type-body text-text-muted">
                  Arrastrá tu archivo acá o{' '}
                  <span className="text-boca-gold">hacé clic para seleccionar</span>
                </span>
                <span className="block type-caption text-text-muted/60 mt-1">
                  .xlsx o .csv · máx. 2MB · hasta 200 partidos
                </span>
                <input
                  type="file"
                  accept=".xlsx,.csv"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>

              {errors.length > 0 && (
                <div className="mt-4 p-3 rounded-sm bg-[#7f1d1d]/20 border border-[#991b1b]/40">
                  <p className="type-caption text-[#fca5a5] font-bold mb-2">
                    Se encontraron errores en el archivo:
                  </p>
                  {errors.map(e => (
                    <p key={`${e.field}-${e.rowIndex}`} className="type-caption text-[#fca5a5]/80">
                      • {e.message}
                    </p>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── processing ── */}
          {step === 'processing' && (
            <div className="py-8 text-center">
              <p className="type-body text-text-muted mb-4">
                Analizando {progress} de {total} partidos...
              </p>
              <div className="w-full bg-boca-border/30 rounded-full h-2">
                <div
                  className="bg-boca-gold h-2 rounded-full transition-all"
                  style={{ width: `${total > 0 ? (progress / total) * 100 : 0}%` }}
                />
              </div>
            </div>
          )}

          {/* ── preview ── */}
          {step === 'preview' && (
            <>
              <div className="space-y-4 max-h-80 overflow-y-auto pr-1 mb-5">
                {foundCount > 0 && (
                  <div>
                    <p className="type-caption text-[#4ade80] font-bold mb-2">
                      Listos para importar ({foundCount})
                    </p>
                    {enriched.filter(r => r.status === 'found').map(r => (
                      <PreviewRow key={r.rowIndex} row={r} />
                    ))}
                  </div>
                )}

                {duplicateCount > 0 && (
                  <div>
                    <p className="type-caption text-boca-gold font-bold mb-2">
                      Ya en tu historial — se omiten ({duplicateCount})
                    </p>
                    {enriched.filter(r => r.status === 'duplicate').map(r => (
                      <PreviewRow key={r.rowIndex} row={r} />
                    ))}
                  </div>
                )}

                {notFoundCount > 0 && (
                  <div>
                    <p className="type-caption text-[#fca5a5] font-bold mb-2">
                      No encontrados en el sistema ({notFoundCount})
                    </p>
                    {enriched.filter(r => r.status === 'not_found').map(r => (
                      <PreviewRow key={r.rowIndex} row={r} />
                    ))}
                    <p className="type-caption text-text-muted/60 mt-1">
                      Solo se importan partidos jugados en los últimos meses disponibles en el sistema.
                    </p>
                  </div>
                )}
              </div>

              {importError && (
                <div className="mb-4 p-3 rounded-sm bg-[#7f1d1d]/20 border border-[#991b1b]/40">
                  <p className="type-caption text-[#fca5a5]">• {importError}</p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="primary"
                  onClick={handleImport}
                  disabled={foundCount === 0}
                  className={foundCount === 0 ? 'opacity-40 cursor-not-allowed' : ''}
                >
                  Importar {foundCount} {foundCount === 1 ? 'partido' : 'partidos'}
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
              </div>
            </>
          )}

          {/* ── success ── */}
          {step === 'success' && (
            <div className="py-8 text-center">
              <p className="text-4xl mb-4">🎉</p>
              <h3 className="type-card-title text-boca-gold mb-2">
                ¡{importedCount} {importedCount === 1 ? 'partido importado' : 'partidos importados'}!
              </h3>
              <p className="type-body text-text-muted mb-6">Tu historial ya está actualizado.</p>
              <Button variant="primary" onClick={onClose}>
                Ver mi historial
              </Button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
```

### Paso 2: Verificar TypeScript

```bash
npx tsc --noEmit
```

Expected: 0 errores nuevos.

### Paso 3: Commit

```bash
git add src/components/MiHistorial/ImportModal.tsx
git commit -m "feat(import): add ImportModal with 4-step flow (idle/processing/preview/success)"
```

---

## Task 6: `MiHistorial.tsx` — Botón + wire del modal (FEAT-01)

**Files:**
- Modify: `src/components/MiHistorial/MiHistorial.tsx`

El componente ya importa `useMatchAttendance` a través de `useMiHistorial`. Hay que:
1. Añadir `importModalOpen` state
2. Añadir el botón "Importar partidos" junto al botón "Marcar presencia"
3. Calcular `existingFixtureIds` a partir de `attendedEntries`
4. Renderizar `<ImportModal />`
5. Exponer `upsert` desde `useMiHistorial` (o acceder directamente)

### Paso 1: Exponer `upsert` en `useMiHistorial`

Modificar `src/components/MiHistorial/useMiHistorial.ts` — agregar `upsert` al return:

```ts
// En el return del hook useMiHistorial (línea ~159):
return {
  // ... todo lo existente ...
  upsert,  // ← agregar esta línea
};
```

El `upsert` viene de `const { attendanceMap, upsert, remove } = useMatchAttendance(user.id);` (línea 57).

### Paso 2: Modificar `MiHistorial.tsx`

**Imports a agregar** (al inicio del archivo):
```tsx
import { Upload } from 'lucide-react';
import { ImportModal } from './ImportModal';
```

**Estado a agregar** dentro de `MiHistorialContent`, junto a `deleteModal` y `noteModal`:
```tsx
const [importModalOpen, setImportModalOpen] = useState(false);
```

**Desestructurar `upsert` y `matches` de `useMiHistorial`:**
```tsx
const {
  matches, matchEstado,
  // ... resto sin cambios ...
  upsert,           // ← agregar
} = useMiHistorial(user);
```

**`existingFixtureIds`** — calcularlo a partir de `attendedEntries`:
```tsx
const existingFixtureIds = attendedEntries
  .map(e => parseInt(e.matchId, 10))
  .filter(id => !isNaN(id));
```

**Botón a agregar** — justo antes del `<Button>` "Marcar presencia" existente (dentro del `flex gap-2`):

```tsx
{/* Botón importar — mismo nivel que el combobox + marcar presencia */}
<button
  type="button"
  onClick={() => setImportModalOpen(true)}
  className="h-10 flex items-center gap-2 px-4 rounded-sm border border-boca-border text-text-muted hover:bg-boca-border/20 transition-colors type-caption whitespace-nowrap"
>
  <Upload className="w-4 h-4" />
  Importar
</button>
```

> Ubicación exacta: dentro del `<div className="flex flex-col sm:flex-row gap-2">` (línea ~73), después del `<MatchCombobox />` y del `<Button>` de marcar presencia.

**Modal a agregar** — junto a los otros modals al final del return (antes del cierre `</div>`):
```tsx
{importModalOpen && (
  <ImportModal
    matches={matches}
    existingFixtureIds={existingFixtureIds}
    upsert={upsert}
    onClose={() => setImportModalOpen(false)}
  />
)}
```

### Paso 3: Verificar TypeScript

```bash
npx tsc --noEmit
```

Expected: 0 errores.

### Paso 4: Smoke test en el browser

```bash
npm run dev
```

1. Abrir `http://localhost:5173` → navegar a Mi Historial
2. Verificar que aparece el botón "Importar" junto al combo de partidos
3. Click en "Importar" → se abre el modal
4. Click en "Descargar template" → descarga `la12digital_template_import.xlsx`
5. Abrir el .xlsx: debe tener hoja "Mis Partidos" con header + 3 filas ejemplo, y hoja "Instrucciones"
6. Subir un `.xls` → debe mostrar error "Formato no soportado"
7. Subir el template descargado → debe mostrar preview con los 3 partidos ejemplo (probablemente `not_found` porque son fechas ficticias)
8. Escape / click outside → cierra el modal

### Paso 5: Commit

```bash
git add src/components/MiHistorial/MiHistorial.tsx src/components/MiHistorial/useMiHistorial.ts
git commit -m "feat(import): wire ImportModal into MiHistorial with Upload button"
```

---

## Task 7: Checklist final antes del merge

Verificar manualmente cada ítem del checklist de la spec:

| # | Test | Resultado esperado |
|---|------|--------------------|
| 1 | Template descargado | Tiene hoja "Mis Partidos" + hoja "Instrucciones" |
| 2 | Subir `.xls` | Error "Formato no soportado" |
| 3 | Fecha futura en Excel | Error de validación en esa fila |
| 4 | Fila con rival vacío | Error de validación |
| 5 | Filas vacías | Se ignoran sin error |
| 6 | Progreso | Barra avanza (matching local es instantáneo, se verá rápido) |
| 7 | Partido found | Muestra equipos, resultado y competencia en preview |
| 8 | Partido duplicate | Aparece en sección amarilla, no se importa |
| 9 | Partido not_found | Aparece en sección roja |
| 10 | Contador "Importar N" | Solo cuenta los `found` |
| 11 | Tras confirmar | Historial se actualiza sin recargar la página |
| 12 | Mobile (375px) | Modal scrolleable, sin desborde horizontal |

### Build final

```bash
npm run build
```

Expected: sin errores TypeScript ni warnings de Vite.

### Commit de cierre

```bash
git commit --allow-empty -m "chore: import-matches feature complete, ready for review"
```

---

## Notas para el revisor

- **`not_found` es esperable para partidos viejos:** `fetchMatchesForHistorial()` trae solo los últimos ~50 partidos. Si el usuario importa partidos de temporadas anteriores, aparecerán como `not_found`. Esto es un límite conocido del diseño actual — se puede mejorar extendiendo el servicio en una iteración futura.
- **Sin migration de Supabase:** La tabla `match_attendance` ya soporta todos los campos necesarios. `imported_at` no está en el schema pero tampoco es requerido.
- **El matching local es síncrono:** La barra de progreso avanzará instantáneamente. Es correcto — no hay I/O en este paso.
