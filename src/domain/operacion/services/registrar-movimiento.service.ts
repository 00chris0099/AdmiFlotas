import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { MovimientoDiarioRepository } from '../repositories/movimiento-diario.repository';
// Importamos el cliente generado localmente
import { PrismaClient, MovimientoDiario } from '../../../../generated/prisma';

@Injectable()
export class RegistrarMovimientoService {
  private prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
  });

  constructor(
    private readonly movimientoRepository: MovimientoDiarioRepository,
  ) {}

  /**
   * Registra un nuevo movimiento de vehículo realizando validaciones complejas de negocio.
   */
  async ejecutar(dto: {
    vehiculoId: string;
    conductorId: string;
    inspectorId?: string;
    fecha: Date;
    sectorSolicitante: string;
    destino: string;
    proposito?: string;
    kilometrajeSalida: number;
    horaSalida: string;
  }): Promise<MovimientoDiario> {
    return this.prisma.$transaction(async (tx) => {
      // 1. Validar existencia y estado operativo del vehículo dentro de la transacción
      const vehiculo = await tx.vehiculo.findUnique({
        where: { id: dto.vehiculoId },
      });

      if (!vehiculo) {
        throw new NotFoundException(`Vehículo con ID ${dto.vehiculoId} no encontrado`);
      }

      if (vehiculo.estado !== 'OPERATIVO') {
        throw new BadRequestException(
          `El vehículo con placa ${vehiculo.placa} no está OPERATIVO (Estado actual: ${vehiculo.estado})`,
        );
      }

      // 2. Validar que el conductor exista y esté activo dentro de la transacción
      const conductor = await tx.usuario.findUnique({
        where: { id: dto.conductorId },
      });

      if (!conductor || !conductor.activo) {
        throw new BadRequestException('El conductor asignado no existe o no se encuentra activo');
      }

      // 3. Evitar duplicidad de movimientos activos (EN_RUTA) para el mismo vehículo dentro de la transacción
      const movimientosActivos = await tx.movimientoDiario.findMany({
        where: {
          vehiculoId: dto.vehiculoId,
          estado: 'EN_RUTA',
        },
      });

      if (movimientosActivos.length > 0) {
        throw new BadRequestException('El vehículo ya tiene un movimiento en ruta activo.');
      }

      // 4. Registrar el movimiento y su checklist pre-operacional inicial de manera atómica
      return tx.movimientoDiario.create({
        data: {
          vehiculoId: dto.vehiculoId,
          conductorId: dto.conductorId,
          inspectorId: dto.inspectorId,
          fecha: dto.fecha,
          sectorSolicitante: dto.sectorSolicitante,
          destino: dto.destino,
          proposito: dto.proposito,
          kilometrajeSalida: dto.kilometrajeSalida,
          horaSalida: dto.horaSalida,
          estado: 'EN_RUTA',
          checklist: {
            create: {
              documentos: 'OK',
              aceiteMotor: 'OK',
              agua: 'OK',
              bateria: 'OK',
              frenos: 'OK',
              embrague: 'OK',
              fajas: 'OK',
              faros: 'OK',
              lunas: 'OK',
              plumillas: 'OK',
              llantas: 'OK',
              espejos: 'OK',
              herramientas: 'OK',
              extintorBotiquin: 'OK',
              manchasFugas: 'OK',
              aptoParaOperar: true,
              observacionesGenerales: 'Checklist pre-operacional inicializado automáticamente.',
            },
          },
        },
        include: {
          checklist: true,
        },
      });
    });
  }
}
