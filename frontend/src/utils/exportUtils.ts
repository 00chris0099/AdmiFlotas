import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

// Interfaz para definir columnas en la exportación de PDFs
export interface PDFColumn {
  header: string;
  dataKey: string;
}

/**
 * Exporta un conjunto de datos a PDF con membrete corporativo.
 */
export function exportToPDF(
  title: string,
  subtitle: string,
  columns: PDFColumn[],
  rows: any[],
  fileName: string
) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Colores corporativos (Manual F1T02)
  const primaryColor = [15, 23, 42]; // Slate 900
  const accentColor = [79, 70, 229]; // Indigo 600

  // 1. Membrete Corporativo
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 35, "F");

  // Logo de fantasía / Icono
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("🚛 SAF ERP", 15, 18);

  // Título del Membrete
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("SISTEMA DE ADMINISTRACIÓN DE FLOTAS", 15, 25);
  doc.setFont("helvetica", "bold");
  doc.text("MANUAL TÉCNICO F1T02", 15, 29);

  // Información del Reporte (Derecha)
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  const now = new Date().toLocaleString();
  doc.text(`Fecha: ${now}`, 145, 15);
  doc.text("Área: Operaciones y Mantenimiento", 145, 20);
  doc.text("Clasificación: Confidencial Corporativo", 145, 25);

  // Línea divisoria decorativa
  doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.rect(0, 35, 210, 2, "F");

  // 2. Título de la sección
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(title, 15, 48);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // Slate 500
  doc.text(subtitle, 15, 54);

  // 3. Generación de Tabla
  const tableHeaders = columns.map((col) => col.header);
  const tableData = rows.map((row) =>
    columns.map((col) => {
      const val = row[col.dataKey];
      if (typeof val === "boolean") {
        return val ? "SÍ" : "NO";
      }
      return val !== undefined && val !== null ? String(val) : "";
    })
  );

  autoTable(doc, {
    startY: 62,
    head: [tableHeaders],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [79, 70, 229], // Indigo 600
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // Slate 50
    },
    margin: { left: 15, right: 15 },
  });

  // 4. Pie de página
  const pageCount = doc.getNumberOfPages();
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); // Slate 400

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(
      `Página ${i} de ${pageCount} • SAF ERP Corporativo F1T02`,
      15,
      287
    );
    doc.text(
      "Reporte oficial generado automáticamente por el sistema de auditoría financiera.",
      100,
      287,
      { align: "right" }
    );
  }

  // Guardar documento
  doc.save(fileName);
}

/**
 * Exporta datos a una hoja de cálculo Excel (XLSX).
 */
export function exportToExcel(data: any[], fileName: string) {
  // Convertir los datos a una hoja de cálculo
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  
  XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte SAF");
  
  // Escribir el archivo y forzar descarga
  XLSX.writeFile(workbook, fileName);
}
