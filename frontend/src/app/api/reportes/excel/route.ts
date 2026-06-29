import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function POST(request: NextRequest) {
  try {
    const { tipo, data } = await request.json();

    if (!data || !Array.isArray(data)) {
      return NextResponse.json(
        { error: "Se requiere un array de datos" },
        { status: 400 }
      );
    }

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);

    let sheetName = "Reporte SAF";
    switch (tipo) {
      case "vehiculos":
        sheetName = "Vehículos";
        break;
      case "movimientos":
        sheetName = "Movimientos Diarios";
        break;
      case "combustible":
        sheetName = "Control Combustible";
        break;
      case "mantenimiento":
        sheetName = "Control Mantenimiento";
        break;
      case "costos":
        sheetName = "Costos Fijos y Variables";
        break;
    }

    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="reporte_${tipo}_${new Date().toISOString().split("T")[0]}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Error al generar Excel:", error);
    return NextResponse.json(
      { error: "Error al generar el archivo Excel" },
      { status: 500 }
    );
  }
}
