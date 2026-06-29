import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const PRIMARY_COLOR: [number, number, number] = [15, 23, 42];
const ACCENT_COLOR: [number, number, number] = [79, 70, 229];
const MUTED_TEXT: [number, number, number] = [100, 116, 139];
const FOOTER_COLOR: [number, number, number] = [148, 163, 184];

function createHeader(doc: jsPDF, formCode: string, formTitle: string) {
  doc.setFillColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
  doc.rect(0, 0, 210, 35, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("SAF ERP", 15, 18);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("SISTEMA DE ADMINISTRACION DE FLOTAS", 15, 25);
  doc.setFont("helvetica", "bold");
  doc.text(`MANUAL TECNICO F1T02 - ${formCode}`, 15, 29);

  const now = new Date().toLocaleString("es-PE");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(`Fecha: ${now}`, 140, 15);
  doc.text("Area: Operaciones y Mantenimiento", 140, 20);
  doc.text("Clasificacion: Confidencial Corporativo", 140, 25);

  doc.setFillColor(ACCENT_COLOR[0], ACCENT_COLOR[1], ACCENT_COLOR[2]);
  doc.rect(0, 35, 210, 2, "F");

  doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(formTitle, 15, 48);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(MUTED_TEXT[0], MUTED_TEXT[1], MUTED_TEXT[2]);
  doc.text(`Formulario ${formCode}`, 15, 54);

  return 62;
}

function addFieldRow(
  doc: jsPDF,
  y: number,
  label: string,
  value: string,
  x: number = 15
) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(MUTED_TEXT[0], MUTED_TEXT[1], MUTED_TEXT[2]);
  doc.text(label, x, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(30, 30, 30);
  doc.text(String(value || "-"), x + 50, y);
  return y + 7;
}

function addSectionTitle(doc: jsPDF, y: number, title: string) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(ACCENT_COLOR[0], ACCENT_COLOR[1], ACCENT_COLOR[2]);
  doc.text(title, 15, y);
  doc.setDrawColor(ACCENT_COLOR[0], ACCENT_COLOR[1], ACCENT_COLOR[2]);
  doc.line(15, y + 1.5, 195, y + 1.5);
  return y + 7;
}

function addSignatures(doc: jsPDF, y: number, signatures: { label: string; name: string; timestamp?: string | null }[]) {
  y = addSectionTitle(doc, y, "FIRMAS DIGITALES");
  signatures.forEach((sig) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(MUTED_TEXT[0], MUTED_TEXT[1], MUTED_TEXT[2]);
    doc.text(sig.label, 15, y);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    if (sig.name) {
      doc.setTextColor(ACCENT_COLOR[0], ACCENT_COLOR[1], ACCENT_COLOR[2]);
      doc.text(`Firmado: ${sig.name}`, 70, y);
    } else {
      doc.setTextColor(200, 50, 50);
      doc.text("Sin firmar", 70, y);
    }
    if (sig.timestamp) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(FOOTER_COLOR[0], FOOTER_COLOR[1], FOOTER_COLOR[2]);
      doc.text(sig.timestamp, 140, y);
    }
    y += 7;
  });
  return y;
}

function addFooter(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages();
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(FOOTER_COLOR[0], FOOTER_COLOR[1], FOOTER_COLOR[2]);
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(`Pagina ${i} de ${pageCount} - SAF ERP Corporativo F1T02`, 15, 287);
    doc.text("Documento oficial generado automaticamente por el sistema.", 105, 287, { align: "right" });
  }
}

export function generateMovimientoDiarioPDF(data: any) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  let y = createHeader(doc, "MA 122 01 01", "MOVIMIENTO DIARIO");
  y = addSectionTitle(doc, y, "1. DATOS DEL VEHICULO Y CONDUCTOR");
  y = addFieldRow(doc, y, "Fecha:", data.fecha);
  y = addFieldRow(doc, y, "Vehiculo:", `${data.placa} - ${data.vehiculo}`);
  y = addFieldRow(doc, y, "Conductor:", data.conductor);
  y = addFieldRow(doc, y, "Destino:", data.destino);
  y = addFieldRow(doc, y, "Km Salida:", `${data.kilometrajeSalida} km`);
  y = addFieldRow(doc, y, "Km Llegada:", data.kilometrajeLlegada ? `${data.kilometrajeLlegada} km` : "En ruta");
  y = addFieldRow(doc, y, "HUV:", data.horasUtilizacion ? `${data.horasUtilizacion} hrs` : "-");
  y = addFieldRow(doc, y, "Estado:", data.estado);

  y += 4;
  y = addSectionTitle(doc, y, "2. CHECKLIST PRE-OPERATIVO (15 PUNTOS)");
  const checklistItems = [
    { label: "1. Documentacion", value: data.documentos },
    { label: "2. Aceite de Motor", value: data.aceiteMotor },
    { label: "3. Agua (Radiador)", value: data.agua },
    { label: "4. Bateria", value: data.bateria },
    { label: "5. Frenos", value: data.frenos },
    { label: "6. Embrague", value: data.embrague },
    { label: "7. Fajas", value: data.fajas },
    { label: "8. Faros", value: data.faros },
    { label: "9. Lunas", value: data.lunas },
    { label: "10. Plumillas", value: data.plumillas },
    { label: "11. Llantas", value: data.llantas },
    { label: "12. Espejos", value: data.espejos },
    { label: "13. Herramientas", value: data.herramientas },
    { label: "14. Extintor y Botiquin", value: data.extintorBotiquin },
    { label: "15. Fugas/Manchas", value: data.manchasFugas },
  ];
  autoTable(doc, {
    startY: y,
    head: [["#", "Punto de Inspeccion", "Estado"]],
    body: checklistItems.map((item, idx) => [
      String(idx + 1),
      item.label,
      item.value || "OK",
    ]),
    theme: "striped",
    headStyles: { fillColor: ACCENT_COLOR, textColor: [255, 255, 255], fontStyle: "bold" },
    styles: { fontSize: 8, cellPadding: 2 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 15, right: 15 },
    columnStyles: { 0: { cellWidth: 10 }, 2: { cellWidth: 25, halign: "center" as const } },
  });

  y = (doc as any).lastAutoTable.finalY + 10;
  if (y > 240) {
    doc.addPage();
    y = 20;
  }

  y = addSignatures(doc, y, [
    { label: "Conductor:", name: data.firmaConductor, timestamp: data.fechaFirmaConductor },
    { label: "Inspector:", name: data.firmaInspector, timestamp: data.fechaFirmaInspector },
    { label: "Encargado Garaje:", name: data.firmaEncargadoGaraje },
  ]);

  addFooter(doc);
  doc.save(`SAF_MA122_01_01_${data.placa || "sin_placa"}_${data.fecha || "sin_fecha"}.pdf`);
}

export function generateOrdenAbastecimientoPDF(data: any) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  let y = createHeader(doc, "MA 122 01 02", "ORDEN DE ABASTECIMIENTO");
  y = addSectionTitle(doc, y, "1. DATOS DE LA ORDEN");
  y = addFieldRow(doc, y, "N° Orden:", data.numeroOrden);
  y = addFieldRow(doc, y, "Fecha:", data.fecha);

  y += 2;
  y = addSectionTitle(doc, y, "2. DATOS DEL VEHICULO");
  y = addFieldRow(doc, y, "Codigo Patrimonial:", data.codigoPatrimonial);
  y = addFieldRow(doc, y, "Placa:", data.placa);
  y = addFieldRow(doc, y, "Vehiculo:", data.vehiculoLabel);
  y = addFieldRow(doc, y, "Conductor:", data.conductor);

  y += 2;
  y = addSectionTitle(doc, y, "3. SOLICITANTE");
  y = addFieldRow(doc, y, "Sector:", data.sectorSolicitante);
  y = addFieldRow(doc, y, "Localidad:", data.localidadSolicitante || "-");

  y += 2;
  y = addSectionTitle(doc, y, "4. ABASTECIMIENTO");
  y = addFieldRow(doc, y, "Tipo Combustible:", data.tipoCombustible);
  y = addFieldRow(doc, y, "Cantidad:", `${data.cantidadGalones} gal`);
  y = addFieldRow(doc, y, "Costo/Galon:", `S/. ${Number(data.costoGalon).toFixed(2)}`);
  y = addFieldRow(doc, y, "Costo Total:", `S/. ${Number(data.costoTotal).toFixed(2)}`);
  y = addFieldRow(doc, y, "Kilometraje:", `${data.kilometrajeActual} km`);

  y += 2;
  y = addSectionTitle(doc, y, "5. SERVICENTRO");
  y = addFieldRow(doc, y, "Nombre:", data.nombreServiccentro || "-");
  y = addFieldRow(doc, y, "N° Ticket:", data.numeroTicketServiccentro || "-");
  y = addFieldRow(doc, y, "Responsable:", data.responsableServiccentro || "-");
  y = addFieldRow(doc, y, "Sello Recibido:", data.selloServiccentro ? "SI" : "NO");

  if (data.incluyeAceiteMotor) {
    y += 2;
    y = addSectionTitle(doc, y, "6. LUBRICANTE");
    y = addFieldRow(doc, y, "Aceite de Motor:", `${data.cantidadAceiteMotorLt} Lt`);
  }

  y += 4;
  y = addSignatures(doc, y, [
    { label: "Encargado Garaje:", name: data.firmaEncargadoGaraje },
    { label: "Conductor:", name: data.firmaConductor },
    { label: "Servicentro:", name: data.firmaServicentro },
  ]);

  addFooter(doc);
  doc.save(`SAF_MA122_01_02_${data.numeroOrden || "sin_orden"}.pdf`);
}

export function generateOrdenMantenimientoPDF(data: any) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  let y = createHeader(doc, "MA 122 02 01", "ORDEN DE SERVICIO / MANTENIMIENTO");
  y = addSectionTitle(doc, y, "1. DATOS DE LA ORDEN");
  y = addFieldRow(doc, y, "N° Orden:", data.numeroOrden);
  y = addFieldRow(doc, y, "Fecha Emision:", data.fecha || "-");
  y = addFieldRow(doc, y, "Estado:", data.estado);

  y += 2;
  y = addSectionTitle(doc, y, "2. DATOS DEL VEHICULO");
  y = addFieldRow(doc, y, "Vehiculo:", data.placa || data.vehiculoLabel);

  y += 2;
  y = addSectionTitle(doc, y, "3. TIPO DE SERVICIO");
  y = addFieldRow(doc, y, "Tipo Mantenimiento:", data.tipoMantenimiento);
  y = addFieldRow(doc, y, "Tipo Taller:", data.tipoTaller);
  y = addFieldRow(doc, y, "Sector Solicitante:", data.sectorSolicitante || "-");
  y = addFieldRow(doc, y, "Descripcion:", data.descripcionServicio || "-");

  y += 2;
  y = addSectionTitle(doc, y, "4. COSTOS");
  autoTable(doc, {
    startY: y,
    head: [["Concepto", "Monto (S/.)"]],
    body: [
      ["Mano de Obra", `S/. ${Number(data.costoManoObraPropia || 0).toFixed(2)}`],
      ["Piezas / Repuestos", `S/. ${Number(data.costoPiezasRepuestos || 0).toFixed(2)}`],
      ["Otros Costos", `S/. ${Number(data.costoOtros || 0).toFixed(2)}`],
      ["TOTAL", `S/. ${Number(data.costoTotal || 0).toFixed(2)}`],
    ],
    theme: "striped",
    headStyles: { fillColor: ACCENT_COLOR, textColor: [255, 255, 255], fontStyle: "bold" },
    styles: { fontSize: 9, cellPadding: 3 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 15, right: 15 },
    columnStyles: { 1: { halign: "right" as const } },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  if (data.manoDeObra && data.manoDeObra.length > 0) {
    if (y > 230) { doc.addPage(); y = 20; }
    y = addSectionTitle(doc, y, "5. MANO DE OBRA DETALLADA (MA 122 02 04)");
    autoTable(doc, {
      startY: y,
      head: [["Tarea", "Tecnico", "Horas", "Tarifa/H", "Subtotal"]],
      body: data.manoDeObra.map((mo: any) => [
        mo.descripcionTarea || "-",
        mo.nombreTecnico || "-",
        `${mo.horasTrabajadas}`,
        `S/. ${Number(mo.costoHora).toFixed(2)}`,
        `S/. ${Number(mo.subtotal).toFixed(2)}`,
      ]),
      theme: "striped",
      headStyles: { fillColor: ACCENT_COLOR, textColor: [255, 255, 255], fontStyle: "bold" },
      styles: { fontSize: 8, cellPadding: 2 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 15, right: 15 },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  if (y > 240) { doc.addPage(); y = 20; }
  y = addSignatures(doc, y, [
    { label: "Encargado Taller:", name: data.firmaEncargadoTaller },
    { label: "Tecnico:", name: data.firmaTecnico, timestamp: data.fechaFirmaTecnico },
    { label: "Jefe Mantenimiento:", name: data.firmaJefeMantenimiento },
  ]);

  addFooter(doc);
  doc.save(`SAF_MA122_02_01_${data.numeroOrden || "sin_orden"}.pdf`);
}
