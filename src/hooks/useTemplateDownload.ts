// src/hooks/useTemplateDownload.ts
export function useTemplateDownload() {
  const downloadTemplate = async () => {
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

    // Hoja 1 — datos editables
    const ws1 = wb.addWorksheet('Mis Partidos');
    ws1.addRow(['fecha', 'rival', 'condicion', 'goles_boca', 'goles_rival', 'competencia', 'notas']);
    ws1.addRow(['12/04/2025', 'Racing Club', 'Local', '2', '1', 'Liga Profesional', 'La 12 a full']);
    ws1.addRow(['23/02/2025', 'River Plate', 'Visitante', '1', '1', 'Copa Argentina', '']);
    ws1.addRow(['05/10/2024', 'Independiente', 'Local', '0', '0', 'Liga Profesional', 'Primer superclásico']);

    // Hoja 2 — instrucciones (visual read-only)
    const ws2 = wb.addWorksheet('Instrucciones');
    ws2.addRow(['INSTRUCCIONES DE USO']);
    ws2.addRow([]);
    ws2.addRow(['fecha', 'Obligatorio. Formato DD/MM/YYYY. No puede ser fecha futura.']);
    ws2.addRow(['rival', 'Obligatorio. Nombre del equipo rival (ej: Racing Club, River Plate).']);
    ws2.addRow(['condicion', 'Obligatorio. "Local" o "Visitante".']);
    ws2.addRow(['goles_boca', 'Opcional. Cantidad de goles de Boca.']);
    ws2.addRow(['goles_rival', 'Opcional. Cantidad de goles del rival.']);
    ws2.addRow(['competencia', 'Opcional. Si lo dejás vacío para partidos recientes, el sistema lo intenta completar automáticamente.']);
    ws2.addRow(['notas', 'Opcional. Tu comentario personal del partido. Máximo 200 caracteres.']);
    ws2.addRow([]);
    ws2.addRow(['LÍMITE: máximo 200 partidos por importación.']);
    ws2.addRow(['FORMATOS ACEPTADOS: .xlsx y .csv únicamente.']);

    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'la12digital_template_import.xlsx';
    a.click();
    URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error al generar plantilla:', err);
    }
  };

  return { downloadTemplate };
}
