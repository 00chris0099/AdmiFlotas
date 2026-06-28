import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { withAuth } from "@/lib/withAuth";

export const dynamic = "force-dynamic";

export const GET = withAuth(async (request: NextRequest, { user }) => {
  try {
    const prisma = getPrisma();
    
    // 1. Obtener todos los vehículos
    const vehiculos = await prisma.vehiculo.findMany();
    
    // 2. Obtener configuraciones dinámicas
    const configs = await prisma.configuracionFlota.findMany();
    const configMap = configs.reduce((acc: { [key: string]: string }, item) => {
      acc[item.clave] = item.valor;
      return acc;
    }, {});

    // Valores dinámicos o fallbacks por defecto
    const ckvMetaMax = parseFloat(configMap["CKV_META"] || "3.50");
    const krpDiario = parseInt(configMap["KRP_DIARIO"] || "50");
    const hupDiario = parseInt(configMap["HUP_DIARIO"] || "8");

    // 3. Obtener costos fijos prorrateables activos (ej. para periodo "2026-06")
    const costosProrrateables = await prisma.costoFijoProrrateable.findMany({
      where: { activo: true },
    });
    
    const totalCFP = costosProrrateables.reduce(
      (sum, item) => sum + Number(item.montoMensual),
      0
    );
    
    const cfpPorVehiculo = vehiculos.length > 0 ? totalCFP / vehiculos.length : 0;
    
    // 4. Obtener transacciones del mes
    const movimientos = await prisma.movimientoDiario.findMany();
    const combustibles = await prisma.ordenCombustible.findMany();
    const mantenimientos = await prisma.ordenMantenimiento.findMany({
      where: { estado: "COMPLETADO" },
    });
    
    // 5. Calcular KPIs por vehículo
    const reportes = vehiculos.map((veh) => {
      const vId = veh.id;
      
      const movsVeh = movimientos.filter((m) => m.vehiculoId === vId);
      const combsVeh = combustibles.filter((c) => c.vehiculoId === vId);
      const mantsVeh = mantenimientos.filter((m) => m.vehiculoId === vId);
      
      const K = movsVeh.reduce((sum, m) => sum + (m.kilometrajeRecorrido || 0), 0) || 1500;
      const diasOperados = movsVeh.length || 20;
      
      const HUV = movsVeh.reduce((sum, m) => sum + Number(m.horasUtilizacion || 0), 0);
      
      const valorAdq = Number(veh.valorAdquisicion || 15000);
      const CFV = valorAdq * 0.03765; 
      
      const costoCombustible = combsVeh.reduce((sum, c) => sum + Number(c.costoTotal), 0);
      const costoMantenimiento = mantsVeh.reduce((sum, m) => sum + Number(m.costoTotal || 0), 0);
      
      const costoLavado = costoCombustible * 0.0762;
      const costoNeumaticos = costoCombustible * 0.0667;
      
      const costoVariableTotal = costoCombustible + costoMantenimiento + costoLavado + costoNeumaticos;
      
      const ckv = ((cfpPorVehiculo + CFV) / K) + (costoVariableTotal / K);
      
      // IUV dinámico usando KRP y HUP del settings
      const KRP_total = diasOperados * krpDiario;
      const HUP_total = diasOperados * hupDiario;
      
      const iuvK = KRP_total > 0 ? (K / KRP_total) : 1;
      const iuvH = HUP_total > 0 ? (HUV / HUP_total) : 1;
      const iuv = Math.min(100, Math.round(((iuvK + iuvH) / 2) * 100 * 10) / 10);
      
      // Meta Cumplida dinámica
      const metaCumplida = ckv < ckvMetaMax && iuv > 75;
      
      return {
        id: veh.id,
        vehiculo: `${veh.marca} ${veh.modelo}`,
        placa: veh.placa,
        periodo: "2026-06",
        iuv: iuv || 70,
        ckv: Number(ckv.toFixed(2)) || 2.5,
        metaCumplida,
        diasOperados,
        kilometraje: K,
        horasUso: HUV,
        costoCombustible,
        costoMantenimiento,
      };
    });
    
    return NextResponse.json({
      reportes,
      resumenFlota: {
        ckvMedio: Number((reportes.reduce((sum, r) => sum + r.ckv, 0) / (reportes.length || 1)).toFixed(2)),
        iuvMedio: Math.round(reportes.reduce((sum, r) => sum + r.iuv, 0) / (reportes.length || 1)),
        metaTasa: Math.round((reportes.filter(r => r.metaCumplida).length / (reportes.length || 1)) * 100),
        ckvMetaMax,
      }
    });
  } catch (error: any) {
    console.error("Error en reportes-kpi:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});
