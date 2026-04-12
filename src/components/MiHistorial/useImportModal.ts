// src/components/MiHistorial/useImportModal.ts
import { useState, useEffect } from 'react';
import type { MatchResult } from '@/services/apifootball';
import type { UpsertAttendancePayload } from '@/types/attendance';
import { useFileParser } from '@/hooks/useFileParser';
import type { RowError } from '@/hooks/useFileParser';
import { useMatchEnricher } from '@/hooks/useMatchEnricher';
import type { EnrichedRow } from '@/hooks/useMatchEnricher';
import { useMatchImport } from '@/hooks/useMatchImport';
import { useTemplateDownload } from '@/hooks/useTemplateDownload';

export type ImportStep = 'idle' | 'processing' | 'preview' | 'success';

export interface UseImportModalReturn {
  // Estado
  step: ImportStep;
  errors: RowError[];
  enriched: EnrichedRow[];
  progress: number;
  total: number;
  importedCount: number;
  importError: string | null;
  // Conteos derivados
  foundCount: number;
  duplicateCount: number;
  notFoundCount: number;
  // Handlers
  downloadTemplate: () => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleImport: () => Promise<void>;
}

export function useImportModal(
  matches: MatchResult[],
  existingFixtureIds: number[],
  upsert: (payload: UpsertAttendancePayload) => Promise<void>,
  onClose: () => void,
): UseImportModalReturn {
  const [step, setStep] = useState<ImportStep>('idle');
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

  // Cerrar con Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrors([]);
    setEnriched([]);
    setImportError(null);

    const result = await parseFile(file);

    if (result.errors.length > 0 || result.valid.length === 0) {
      setErrors(
        result.errors.length > 0
          ? result.errors
          : [{ rowIndex: 0, field: 'file', message: 'El archivo no contiene filas válidas.' }],
      );
      return;
    }

    setStep('processing');
    setTotal(result.valid.length);
    setProgress(0);

    // El matching local es síncrono — onProgress actualiza el estado fila a fila
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

  return {
    step,
    errors,
    enriched,
    progress,
    total,
    importedCount,
    importError,
    foundCount,
    duplicateCount,
    notFoundCount,
    downloadTemplate,
    handleFileChange,
    handleImport,
  };
}
