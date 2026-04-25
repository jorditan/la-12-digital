import ExcelJS from 'exceljs';

export interface ParsedRow {
  rowIndex: number;
  fecha: string; // DD/MM/YYYY (original del usuario)
  fechaISO: string; // YYYY-MM-DD (para comparar con MatchResult.date)
  rival: string;
  condicion: 'Local' | 'Visitante';
  golesBoca?: number;
  golesRival?: number;
  competencia?: string;
  notas?: string;
}

export interface RowError {
  rowIndex: number;
  field: 'fecha' | 'rival' | 'condicion' | 'file';
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

    // 3. Parsear archivo
    const buffer = await file.arrayBuffer();
    let rows: string[][];

    if (ext === 'csv') {
      // Parse CSV natively — split on newlines, then split each line on commas,
      // stripping optional surrounding double-quotes from each cell value.
      const text = new TextDecoder().decode(buffer);
      rows = text
        .split(/\r?\n/)
        .filter((line) => line.trim() !== '')
        .map((line) =>
          line.split(',').map((cell) => cell.replace(/^"(.*)"$/, '$1').trim()),
        );
    } else {
      // Parse XLSX with ExcelJS (no prototype-pollution or ReDoS risks)
      const wb = new ExcelJS.Workbook();
      await wb.xlsx.load(buffer);
      const ws = wb.worksheets[0];
      rows = [];
      ws.eachRow({ includeEmpty: true }, (row) => {
        // row.values is 1-indexed; index 0 is always null — drop it.
        const values = (row.values as (ExcelJS.CellValue | null)[]).slice(1);
        rows.push(values.map((v) => (v == null ? '' : String(v))));
      });
    }

    // 4. Detectar fila de header
    const startRow = rows[0]?.[0]?.toString().toLowerCase().trim() === 'fecha' ? 1 : 0;
    const dataRows = rows.slice(startRow, startRow + 200);

    const valid: ParsedRow[] = [];
    const errors: RowError[] = [];

    dataRows.forEach((row, idx) => {
      const realIdx = idx + startRow + 1;

      // Ignorar filas vacías
      if (!row[0] && !row[1]) return;

      let fechaRaw = row[0]?.toString().trim() ?? '';
      const rival = row[1]?.toString().trim() ?? '';
      const condicionRaw = row[2]?.toString().trim() ?? '';
      const golesBocaRaw = row[3]?.toString().trim();
      const golesRivalRaw = row[4]?.toString().trim();
      const competencia = row[5]?.toString().trim() || undefined;
      let notas = row[6]?.toString().trim() || undefined;

      let dd = '';
      let mm = '';
      let yyyy = '';

      // 1. Intentar detectar formato numérico de Excel (ej. 45570)
      const serialDate = parseFloat(fechaRaw);
      if (!isNaN(serialDate) && serialDate > 30000 && serialDate < 60000) {
        // Convertir serial de Excel a objeto Date
        // Excel usa 1900-01-01 como base. Restamos 2 para corregir el bug de 1900 y desfase de base.
        const dateObj = new Date(Math.round((serialDate - 25569) * 86400 * 1000));
        yyyy = dateObj.getUTCFullYear().toString();
        mm = (dateObj.getUTCMonth() + 1).toString().padStart(2, '0');
        dd = dateObj.getUTCDate().toString().padStart(2, '0');
        fechaRaw = `${dd}/${mm}/${yyyy}`;
      } else {
        // 2. Intentar parsear como texto (permite D/M/YY, DD/MM/YYYY, con / o -)
        const dateMatch = fechaRaw.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2}|\d{4})$/);
        
        if (!dateMatch) {
          errors.push({
            rowIndex: realIdx,
            field: 'fecha',
            message: `Fila ${realIdx}: formato de fecha inválido. Se leyó "${fechaRaw}", pero se espera algo como DD/MM/YYYY`,
          });
          return;
        }

        const dRaw = dateMatch[1];
        const mRaw = dateMatch[2];
        let yRaw = dateMatch[3];

        if (yRaw.length === 2) {
          const currentYear = new Date().getFullYear();
          const century = Math.floor(currentYear / 100) * 100;
          yRaw = (century + parseInt(yRaw)).toString();
        }

        dd = dRaw.padStart(2, '0');
        mm = mRaw.padStart(2, '0');
        yyyy = yRaw;
      }
      
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

      // Validar condición
      const condicion = /visitante/i.test(condicionRaw) ? 'Visitante' : 'Local';
      if (!condicionRaw) {
        errors.push({
          rowIndex: realIdx,
          field: 'condicion',
          message: `Fila ${realIdx}: la condición (Local/Visitante) es obligatoria`,
        });
        return;
      }

      // Parsear goles (opcionales)
      const golesBoca = golesBocaRaw !== '' ? parseInt(golesBocaRaw ?? '', 10) : undefined;
      const golesRival = golesRivalRaw !== '' ? parseInt(golesRivalRaw ?? '', 10) : undefined;

      // Truncar notas a 200 chars
      if (notas && notas.length > 200) notas = notas.slice(0, 200);

      valid.push({
        rowIndex: realIdx,
        fecha: fechaRaw,
        fechaISO: `${yyyy}-${mm}-${dd}`,
        rival,
        condicion,
        golesBoca: !isNaN(golesBoca as number) ? golesBoca : undefined,
        golesRival: !isNaN(golesRival as number) ? golesRival : undefined,
        competencia,
        notas,
      });
    });

    return { valid, errors };
  };

  return { parseFile };
}
