// src/hooks/useTemplateDownload.ts
import * as XLSX from 'xlsx';

export function useTemplateDownload() {
  const downloadTemplate = () => {
    const wb = XLSX.utils.book_new();

    // Hoja 1 — datos editables
    const headers = [
      'fecha',
      'rival',
      'condicion',
      'goles_boca',
      'goles_rival',
      'competencia',
      'notas',
    ];
    const examples = [
      ['12/04/2025', 'Racing Club', 'Local', '2', '1', 'Liga Profesional', 'La 12 a full'],
      ['23/02/2025', 'River Plate', 'Visitante', '1', '1', 'Copa Argentina', ''],
      ['05/10/2024', 'Independiente', 'Local', '0', '0', 'Liga Profesional', 'Primer superclásico'],
    ];
    const ws1 = XLSX.utils.aoa_to_sheet([headers, ...examples]);
    XLSX.utils.book_append_sheet(wb, ws1, 'Mis Partidos');

    // Hoja 2 — instrucciones (visual read-only)
    const instrucciones = [
      ['INSTRUCCIONES DE USO'],
      [''],
      ['fecha', 'Obligatorio. Formato DD/MM/YYYY. No puede ser fecha futura.'],
      ['rival', 'Obligatorio. Nombre del equipo rival (ej: Racing Club, River Plate).'],
      ['condicion', 'Obligatorio. "Local" o "Visitante".'],
      ['goles_boca', 'Opcional. Cantidad de goles de Boca.'],
      ['goles_rival', 'Opcional. Cantidad de goles del rival.'],
      ['competencia', 'Opcional. Si lo dejás vacío para partidos recientes, el sistema lo intenta completar automáticamente.'],
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
