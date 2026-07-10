// ============================================================
// SAF - Tipos compartidos: Control de Combustible
// ============================================================

export interface OrdenCombustible {
  id: string;
  numeroOrden: string;
  fecha: Date;
  vehiculoId: string;
  conductorId: string;
  sectorSolicitanteId: string | null;
  tipoCombustible: TipoCombustibleOrden;
  subtipoCombustible: string | null;
  cantidadGalones: number | null;
  costoGalon: number | null;
  costoCombustible: number | null;
  incluyeAceiteMotor: boolean;
  cantidadAceiteMotorLt: number | null;
  marcaAceiteMotor: string | null;
  viscosidadAceiteMotor: string | null;
  costoAceiteMotor: number | null;
  incluyeAceiteCaja: boolean;
  cantidadAceiteCajaLt: number | null;
  marcaAceiteCaja: string | null;
  viscosidadAceiteCaja: string | null;
  costoAceiteCaja: number | null;
  costoTotal: number;
  kilometrajeActual: number;
  centroServicioId: string | null;
  numeroTicketServiccentro: string | null;
  responsableServiccentro: string | null;
  selloServiccentro: boolean;
  localidadSolicitante: string | null;
  firmaEncargadoGaraje: string | null;
  firmaConductor: string | null;
  firmaServiccentro: string | null;
  observaciones: string | null;
  creadoEn: Date;
  actualizadoEn: Date;
  // Relaciones
  vehiculo?: import("./vehiculo").Vehiculo;
  conductor?: import("./usuario").Usuario;
  sectorSolicitante?: import("./lookup").SectorOrganizacional;
  centroServicio?: import("./lookup").CentroServicio;
}

export type TipoCombustibleOrden = "GASOLINA" | "DIESEL" | "GLP" | "ACEITE_MOTOR" | "ACEITE_CAJA" | "MIXTO";
