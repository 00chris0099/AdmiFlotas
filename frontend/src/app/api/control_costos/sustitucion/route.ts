import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { withAuth } from "@/lib/withAuth";

export const dynamic = "force-dynamic";

export const GET = withAuth(async (request: NextRequest, { user }) => {
  try {
    const prisma = getPrisma();
    
    // 1. Obtener vehículos de la base de datos
    const vehiculos = await prisma.vehiculo.findMany();
    
    // 2. Obtener historial de mantenimientos completados para calcular costos de conservación reales
    const mantenimientos = await prisma.ordenMantenimiento.findMany({
      where: { estado: "COMPLETADO" },
    });
    
    // 3. Generar la simulación de sustitución por vehículo
    const simulaciones = vehiculos.map((veh) => {
      const vId = veh.id;
      
      // Costo de adquisición original
      const V = Number(veh.valorAdquisicion || 15000);
      const vidaUtil = veh.vidaUtilAnios || 10;
      
      // Costos reales acumulados actuales
      const mantsVeh = mantenimientos.filter((m) => m.vehiculoId === vId);
      const costoMantRealAnual = mantsVeh.reduce((sum, m) => sum + Number(m.costoTotal || 0), 0);
      
      // Proyección año a año (de 1 a 10 años)
      const curva = [];
      let costoConservacionAcumulado = 0;
      
      for (let n = 1; n <= 10; n++) {
        // A. Depreciación acumulada estimada
        // La reventa cae un 15% - 20% anual de forma geométrica
        const valorReventa = V * Math.pow(0.82, n);
        const depreciacionAcumulada = V - valorReventa;
        
        // B. Costos de Mantenimiento proyectados (crecimiento acelerado por desgaste)
        // El mantenimiento anual crece un 15% cada año por envejecimiento del motor
        const costoMantAnioN = (costoMantRealAnual || 1200) * Math.pow(1.18, n - 1);
        costoConservacionAcumulado += costoMantAnioN;
        
        // C. Costo Promedio Anual (Cpa_n) según Ecuación 11 de F1T02
        const Cpa = (V + costoConservacionAcumulado - valorReventa) / n;
        
        curva.push({
          anio: n,
          depreciacion: Math.round(depreciacionAcumulada),
          mantenimiento: Math.round(costoConservacionAcumulado),
          costoTotal: Math.round(depreciacionAcumulada + costoConservacionAcumulado),
          cpa: Math.round(Cpa),
        });
      }
      
      // Encontrar el año óptimo (donde el CPA es mínimo)
      let anioOptimo = 4;
      let minCpa = Infinity;
      curva.forEach((pt) => {
        if (pt.cpa < minCpa) {
          minCpa = pt.cpa;
          anioOptimo = pt.anio;
        }
      });
      
      // Calcular años de uso basados en año de fabricación
      const anioActual = new Date().getFullYear();
      const aniosUso = Math.max(1, anioActual - veh.anioFabricacion);
      const requiereCambio = aniosUso >= anioOptimo;
      
      return {
        id: vId,
        vehiculoId: vId,
        vehiculoLabel: `${veh.placa} - ${veh.marca} ${veh.modelo}`,
        placa: veh.placa,
        valorAdquisicion: V,
        vidaUtilAnios: vidaUtil,
        aniosUso,
        anioOptimo,
        requiereCambio,
        curva,
      };
    });
    
    return NextResponse.json(simulaciones);
  } catch (error: any) {
    console.error("Error en sustitucion:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});
