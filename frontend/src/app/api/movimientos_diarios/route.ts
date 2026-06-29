import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { withAuth } from "@/lib/withAuth";

export const dynamic = "force-dynamic";

function statusCheck(value: string | undefined | null): "OK" | "OBSERVADO" | "FALLADO" {
  if (value === "OBSERVADO" || value === "FALLADO") return value;
  return "OK";
}

// GET: Listar todos los movimientos con sus relaciones reales de base de datos
export const GET = withAuth(async (request: NextRequest, { user }) => {
  try {
    const prisma = getPrisma();
    const movimientos = await prisma.movimientoDiario.findMany({
      include: {
        checklist: true,
        vehiculo: true,
        conductor: true,
      },
      orderBy: {
        fecha: "desc",
      },
    });

    const plainMovimientos = movimientos.map((mov) => ({
      id: mov.id,
      vehiculo: `${mov.vehiculo.marca} ${mov.vehiculo.modelo}`,
      placa: mov.vehiculo.placa,
      vehiculoId: mov.vehiculoId,
      conductor: `${mov.conductor.nombre} ${mov.conductor.apellido}`,
      fecha: mov.fecha.toISOString().split("T")[0],
      destino: mov.destino,
      kilometrajeSalida: mov.kilometrajeSalida,
      kilometrajeLlegada: mov.kilometrajeLlegada,
      horasUtilizacion: mov.horasUtilizacion ? parseFloat(mov.horasUtilizacion.toString()) : null,
      estado: mov.estado,
    }));

    return NextResponse.json(plainMovimientos);
  } catch (error: any) {
    console.error("Error al obtener movimientos:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

// POST: Registrar movimiento y checklist de 15 puntos de forma atómica (Transacción)
export const POST = withAuth(async (request: NextRequest, { user }) => {
  try {
    const body = await request.json();
    const {
      vehiculoId,
      conductorId,
      inspectorId,
      fecha,
      sectorSolicitante,
      destino,
      kilometrajeSalida,
      horaSalida,
      
      // 15 Puntos Checklist
      documentos,
      aceiteMotor,
      agua,
      bateria,
      frenos,
      embrague,
      fajas,
      faros,
      lunas,
      plumillas,
      llantas,
      espejos,
      herramientas,
      extintorBotiquin,
      manchasFugas,
    } = body;

    const prisma = getPrisma();
    
    // 1. Validar vencimiento de licencia del conductor
    const conductor = await prisma.usuario.findUnique({
      where: { id: conductorId },
    });

    if (!conductor) {
      return NextResponse.json({ error: "El conductor seleccionado no existe." }, { status: 404 });
    }

    if (conductor.vencimientoLicencia && new Date(conductor.vencimientoLicencia) < new Date()) {
      return NextResponse.json({
        error: `Acceso Denegado: La licencia de conducir del conductor (${conductor.nombre} ${conductor.apellido}) se encuentra vencida desde el ${conductor.vencimientoLicencia.toISOString().split("T")[0]}.`
      }, { status: 403 });
    }

    // 2. Evaluar criticidad de los 15 puntos pre-operacionales
    // Si alguno de los puntos de seguridad críticos está en estado FALLADO, el vehículo no está apto
    const criticalFails = [
      frenos, llantas, aceiteMotor, agua, bateria, embrague, fajas, faros, espejos, manchasFugas
    ];
    
    const isCriticalFailed = criticalFails.some(val => val === "FALLADO" || val === "MALO");
    const aptoParaOperar = !isCriticalFailed;

    const nuevoMovimiento = await prisma.$transaction(async (tx) => {
      // 3. Validar duplicados de viajes activos
      const activo = await tx.movimientoDiario.findFirst({
        where: {
          vehiculoId,
          estado: "EN_RUTA",
        },
      });

      if (activo) {
        throw new Error("El vehículo ya tiene un movimiento en ruta activo.");
      }

      // 4. Crear movimiento y checklist de 15 puntos en cascada
      const mov = await tx.movimientoDiario.create({
        data: {
          vehiculoId,
          conductorId,
          inspectorId: inspectorId || null,
          fecha: new Date(fecha),
          sectorSolicitante,
          destino,
          kilometrajeSalida: parseInt(kilometrajeSalida) || 0,
          horaSalida,
          estado: aptoParaOperar ? "EN_RUTA" : "CANCELADO",
          checklist: {
            create: {
              documentos: documentos || "OK",
              aceiteMotor: aceiteMotor || "OK",
              agua: agua || "OK",
              bateria: statusCheck(bateria),
              frenos: statusCheck(frenos),
              embrague: statusCheck(embrague),
              fajas: statusCheck(fajas),
              faros: statusCheck(faros),
              lunas: statusCheck(lunas),
              plumillas: statusCheck(plumillas),
              llantas: statusCheck(llantas),
              espejos: statusCheck(espejos),
              herramientas: statusCheck(herramientas),
              extintorBotiquin: statusCheck(extintorBotiquin),
              manchasFugas: statusCheck(manchasFugas),
              aptoParaOperar,
              observacionesGenerales: aptoParaOperar 
                ? "Checklist pre-operativo de 15 puntos APROBADO." 
                : "Checklist pre-operativo de 15 puntos RECHAZADO por fallas de seguridad.",
            },
          },
        },
        include: {
          checklist: true,
          vehiculo: true,
        },
      });

      // 5. Si no está apto para operar: Bloquear vehículo y emitir orden correctiva
      if (!aptoParaOperar) {
        // Bloquear Vehículo
        await tx.vehiculo.update({
          where: { id: vehiculoId },
          data: { estado: "INOPERATIVO" },
        });

        // Detallar las fallas detectadas
        const fallasDetectadas: string[] = [];
        const items = {
          "Frenos": frenos,
          "Llantas": llantas,
          "Aceite de Motor": aceiteMotor,
          "Agua (Radiador)": agua,
          "Batería": bateria,
          "Embrague": embrague,
          "Fajas/Correas": fajas,
          "Faros": faros,
          "Espejos": espejos,
          "Fugas de Fluidos": manchasFugas
        };

        Object.entries(items).forEach(([key, val]) => {
          if (val === "FALLADO" || val === "MALO") {
            fallasDetectadas.push(key);
          }
        });

        const numOrdenCorr = `CORR-${mov.vehiculo.placa}-${Date.now().toString().slice(-4)}`;
        await tx.ordenMantenimiento.create({
          data: {
            numeroOrden: numOrdenCorr,
            fechaEmision: new Date(),
            vehiculoId,
            tipoMantenimiento: "CORRECTIVO",
            tipoTaller: "PROPIO",
            descripcionServicio: `BLOQUEO AUTOMÁTICO DE SEGURIDAD F1T02: Fallas críticas detectadas en el checklist de 15 puntos por el conductor (Fallas en: ${fallasDetectadas.join(", ")}). Requiere ingreso inmediato a taller.`,
            costoManoObraPropia: 0,
            costoPiezasRepuestos: 0,
            costoOtros: 0,
            costoTotal: 0,
            estado: "PENDIENTE",
            sectorSolicitante: "Prevención y Auditoría SAF",
          },
        });
      }

      return mov;
    });

    return NextResponse.json(nuevoMovimiento, { status: 201 });
  } catch (error: any) {
    console.error("Error al crear movimiento:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
});

export const PATCH = withAuth(async (request: NextRequest, { user }) => {
  try {
    const body = await request.json();
    const { id, kilometrajeLlegada, horaLlegada, horasUtilizacion } = body;

    if (!id || !kilometrajeLlegada || !horaLlegada || !horasUtilizacion) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    const prisma = getPrisma();

    const result = await prisma.$transaction(async (tx) => {
      // 1. Obtener el movimiento
      const mov = await tx.movimientoDiario.findUnique({
        where: { id },
        include: { vehiculo: true },
      });

      if (!mov) {
        throw new Error("Movimiento no encontrado");
      }

      const kmSalida = mov.kilometrajeSalida;
      const kmLlegada = parseInt(kilometrajeLlegada);

      if (kmLlegada < kmSalida) {
        throw new Error(`El kilometraje de llegada (${kmLlegada}) no puede ser menor al de salida (${kmSalida})`);
      }

      const kmRecorrido = kmLlegada - kmSalida;

      // 2. Actualizar movimiento a COMPLETADO
      const movActualizado = await tx.movimientoDiario.update({
        where: { id },
        data: {
          kilometrajeLlegada: kmLlegada,
          kilometrajeRecorrido: kmRecorrido,
          horaLlegada,
          horasUtilizacion: parseFloat(horasUtilizacion),
          estado: "COMPLETADO",
        },
      });

      // 3. TRIGGER PREDICTIVO: Verificar si supera los 5,000 km desde su último mantenimiento preventivo completado
      const ultimoMantenimiento = await tx.ordenMantenimiento.findFirst({
        where: {
          vehiculoId: mov.vehiculoId,
          tipoMantenimiento: "PREVENTIVO",
          estado: "COMPLETADO",
        },
        orderBy: { fechaSalidaTaller: "desc" },
      });

      const kmUltimoMant = ultimoMantenimiento?.kilometrajeSalida || 0;
      const kmRecorridosDesdeMant = kmLlegada - kmUltimoMant;

      const metaMantenimiento = mov.vehiculo.periodicidadMantenimientoKm || 5000;

      if (kmRecorridosDesdeMant >= metaMantenimiento) {
        const totalPendientes = await tx.ordenMantenimiento.count({
          where: {
            vehiculoId: mov.vehiculoId,
            estado: "PENDIENTE",
            tipoMantenimiento: "PREVENTIVO",
          },
        });

        if (totalPendientes === 0) {
          const numOrdenAuto = `PREV-${mov.vehiculo.placa}-${Date.now().toString().slice(-4)}`;
          await tx.ordenMantenimiento.create({
            data: {
              numeroOrden: numOrdenAuto,
              fechaEmision: new Date(),
              vehiculoId: mov.vehiculoId,
              tipoMantenimiento: "PREVENTIVO",
              tipoTaller: "PROPIO",
              descripcionServicio: `ALERTA PREVENTIVA AUTOMÁTICA: Vehículo superó los ${metaMantenimiento} km desde su última revisión. Odo actual: ${kmLlegada} km (Recorrido desde último mantenimiento: ${kmRecorridosDesdeMant} km).`,
              costoManoObraPropia: 0,
              costoPiezasRepuestos: 0,
              costoOtros: 0,
              costoTotal: 0,
              estado: "PENDIENTE",
              sectorSolicitante: "Soporte Predictivo SAF",
            },
          });

          await tx.vehiculo.update({
            where: { id: mov.vehiculoId },
            data: {
              kmAlertaMantenimiento: kmLlegada,
            },
          });
        }
      }

      return movActualizado;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error en PATCH movimientos:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
});
