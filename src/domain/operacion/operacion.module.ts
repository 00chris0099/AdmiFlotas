import { Module } from '@nestjs/common';
import { MovimientoDiarioRepository } from './repositories/movimiento-diario.repository';
import { RegistrarMovimientoService } from './services/registrar-movimiento.service';

@Module({
  providers: [
    MovimientoDiarioRepository,
    RegistrarMovimientoService,
  ],
  exports: [
    MovimientoDiarioRepository,
    RegistrarMovimientoService,
  ],
})
export class OperacionModule {}
