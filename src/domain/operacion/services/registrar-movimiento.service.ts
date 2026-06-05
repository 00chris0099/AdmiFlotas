import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { MovimientoDiarioRepository } from '../repositories/movimiento-diario.repository';
// Importamos el cliente generado localmente
import { PrismaClient, MovimientoDiario } from '../../../../generated/prisma';

@Injectable()
export class RegistrarMovimientoService {
  private prisma = new PrismaClient();

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
    // 1. Validar existencia y estado operativo del vehículo
    const vehiculo = await this.prisma.vehiculo.findUnique({
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

    // 2. Validar que el conductor exista y esté activo
    const conductor = await this.prisma.usuario.findUnique({
      where: { id: dto.conductorId },
    });

    if (!conductor || !conductor.activo) {
      throw new BadRequestException('El conductor asignado no existe o no se encuentra activo');
    }

    // 3. Evitar duplicidad de movimientos activos (EN_RUTA) para el mismo vehículo
    const movimientosActivos = await this.prisma.movimientoDiario.findMany({
      where: {
        vehiculoId: dto.vehiculoId,
        estado: 'EN_RUTA',
      },
    });

    if (movimientosActivos.length > 0) {
      throw new BadRequestException('El vehículo ya tiene un movimiento en ruta activo.');
    }

    // 4. Registrar el movimiento delegando al repositorio indexado
    return this.movimientoRepository.create({
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
    });
  }
}
