/**
 * RFC 4180-compliant CSV parser.
 * Handles commas inside double-quoted fields and escaped double-quotes ("").
 * Skips empty lines.
 */
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        // Peek ahead: "" is an escaped quote inside a quoted field.
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
        } else {
          // Closing quote
          inQuotes = false;
          i++;
        }
      } else {
        field += ch;
        i++;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
        i++;
      } else if (ch === ',') {
        row.push(field.trim());
        field = '';
        i++;
      } else if (ch === '\r' && text[i + 1] === '\n') {
        row.push(field.trim());
        field = '';
        if (row.some((v) => v !== '')) rows.push(row);
        row = [];
        i += 2;
      } else if (ch === '\n') {
        row.push(field.trim());
        field = '';
        if (row.some((v) => v !== '')) rows.push(row);
        row = [];
        i++;
      } else {
        field += ch;
        i++;
      }
    }
  }

  // Flush the last field/row
  row.push(field.trim());
  if (row.some((v) => v !== '')) rows.push(row);

  return rows;
}

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
      // RFC 4180-compliant CSV parser.
      // Handles commas inside double-quoted fields and escaped double-quotes ("").
      const text = new TextDecoder().decode(buffer);
      rows = parseCSV(text);
    } else {
      // Parse XLSX with ExcelJS via CDN to bypass Vite's Node.js dependency issues
      try {
        const cdnUrl = 'https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js';
        
        if (!(window as any).ExcelJS) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = cdnUrl;
            script.onload = resolve;
            script.onerror = () => reject(new Error('No se pudo cargar la librería ExcelJS desde el CDN'));
            document.head.appendChild(script);
          });
        }
        
        const ExcelJS = (window as any).ExcelJS;
        const wb = new ExcelJS.Workbook();
        await wb.xlsx.load(buffer);
        const ws = wb.worksheets[0];
        
        if (!ws) {
          throw new Error('El archivo Excel no tiene hojas de trabajo');
        }

        rows = [];
        ws.eachRow({ includeEmpty: true }, (row: { values: unknown[] }) => {
          // row.values is 1-indexed; index 0 is always null — drop it.
          const values = (row.values ?? []).slice(1);
          rows.push(values.map((v) => (v == null ? '' : String(v))));
        });
      } catch (err) {
        console.error('Error al procesar XLSX:', err);
        return {
          valid: [],
          errors: [
            {
              rowIndex: 0,
              field: 'file',
              message: `No se pudo procesar el archivo .xlsx: ${err instanceof Error ? err.message : 'Error desconocido'}`,
            },
          ],
        };
      }
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
