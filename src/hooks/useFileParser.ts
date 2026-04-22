// src/hooks/useFileParser.ts
//import * as XLSX from 'xlsx';

export interface ParsedRow {
  rowIndex: number;
  fecha: string; // DD/MM/YYYY (original del usuario)
  fechaISO: string; // YYYY-MM-DD (para comparar con MatchResult.date)
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
        errors: [
          {
            rowIndex: 0,
            field: 'file',
            message: 'Formato no soportado. Solo se aceptan archivos .xlsx y .csv',
          },
        ],
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
        errors.push({
          rowIndex: realIdx,
          field: 'fecha',
          message: `Fila ${realIdx}: formato de fecha inválido (usar DD/MM/YYYY)`,
        });
        return;
      }
      const [dd, mm, yyyy] = fecha.split('/');
      const dateObj = new Date(`${yyyy}-${mm}-${dd}`);
      if (isNaN(dateObj.getTime())) {
        errors.push({
          rowIndex: realIdx,
          field: 'fecha',
          message: `Fila ${realIdx}: fecha inválida`,
        });
        return;
      }
      if (dateObj > new Date()) {
        errors.push({
          rowIndex: realIdx,
          field: 'fecha',
          message: `Fila ${realIdx}: la fecha no puede ser futura`,
        });
        return;
      }

      // Validar rival
      if (!rival) {
        errors.push({
          rowIndex: realIdx,
          field: 'rival',
          message: `Fila ${realIdx}: el rival es obligatorio`,
        });
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
