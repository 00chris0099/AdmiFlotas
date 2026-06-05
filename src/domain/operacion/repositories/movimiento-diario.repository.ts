import { Injectable } from '@nestjs/common';
// Importamos el cliente generado localmente
import { PrismaClient, MovimientoDiario, Prisma } from '../../../../generated/prisma';

@Injectable()
export class MovimientoDiarioRepository {
  private prisma = new PrismaClient();

  /**
   * Crea un nuevo registro de movimiento diario utilizando transacciones
   */
  async create(data: Prisma.MovimientoDiarioUncheckedCreateInput): Promise<MovimientoDiario> {
    return this.prisma.movimientoDiario.create({
      data,
      include: {
        checklist: true,
      },
    });
  }

  /**
   * Busca movimientos de un vehículo en un rango de fechas.
   * Aprovecha el índice compuesto implícito o individual en `vehiculo_id` y `fecha`.
   */
  async findByVehiculoAndFechaRange(
    vehiculoId: string,
    fechaInicio: Date,
    fechaFin: Date,
  ): Promise<MovimientoDiario[]> {
    return this.prisma.movimientoDiario.findMany({
      where: {
        vehiculoId,
        fecha: {
          gte: fechaInicio,
          lte: fechaFin,
        },
      },
      orderBy: {
        fecha: 'desc',
      },
    });
  }

  /**
   * Busca movimientos de un conductor en una fecha específica.
   * Optimizado con @@index([conductorId]) y @@index([fecha]).
   */
  async findByConductorAndFecha(conductorId: string, fecha: Date): Promise<MovimientoDiario[]> {
    return this.prisma.movimientoDiario.findMany({
      where: {
        conductorId,
        fecha,
      },
      include: {
        vehiculo: true,
      },
    });
  }

  /**
   * Obtiene movimientos activos por estado.
   * Optimizado con @@index([estado]).
   */
  async findByEstado(estado: 'PROGRAMADO' | 'EN_RUTA' | 'COMPLETADO' | 'CANCELADO'): Promise<MovimientoDiario[]> {
    return this.prisma.movimientoDiario.findMany({
      where: {
        estado,
      },
    });
  }
}
