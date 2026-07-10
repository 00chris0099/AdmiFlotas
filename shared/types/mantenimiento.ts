// ============================================================
// SAF - Tipos compartidos: Mantenimiento
// ============================================================

export interface OrdenMantenimiento {
  id: string;
  numeroOrden: string;
  fechaEmision: Date;
  vehiculoId: string;
  tecnicoId: string | null;
  sectorSolicitanteId: string | null;
  tipoMantenimiento: TipoMantenimiento;
  tipoTaller: TipoTaller;
  nombreTallerExterno: string | null;
  numeroAutorizacionExterna: string | null;
  fechaEntradaTaller: Date | null;
  horaEntradaTaller: string | null;
  fechaSalidaTaller: Date | null;
  horaSalidaTaller: string | null;
  kilometrajeEntrada: number | null;
  kilometrajeSalida: number | null;
  descripcionServicio: string;
  fallaReportada: string | null;
  diagnosticoTecnico: string | null;
  costoManoObraPropia: number | null;
  costoManoObraTerceros: number | null;
  costoPiezasRepuestos: number | null;
  costoOtros: number | null;
  costoTotal: number | null;
  firmaEncargadoTaller: string | null;
  firmaTecnico: string | null;
  firmaJefeMantenimiento: string | null;
  fechaFirmaTecnico: Date | null;
  estado: EstadoMantenimiento;
  observaciones: string | null;
  creadoEn: Date;
  actualizadoEn: Date;
  // Relaciones
  vehiculo?: import("./vehiculo").Vehiculo;
  tecnico?: import("./usuario").Usuario;
  sectorSolicitante?: import("./lookup").SectorOrganizacional;
  repuestos?: DetalleRepuesto[];
  manoDeObra?: DetalleManoObra[];
}

export interface DetalleRepuesto {
  id: string;
  ordenMantenimientoId: string;
  descripcion: string;
  numeroParteCatalogo: string | null;
  unidadMedida: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  esAlmacenPropio: boolean;
  proveedor: string | null;
  creadoEn: Date;
  // Relaciones
  ordenMantenimiento?: OrdenMantenimiento;
}

export interface DetalleManoObra {
  id: string;
  ordenMantenimientoId: string;
  descripcionTarea: string;
  horasTrabajadas: number;
  costoHora: number;
  subtotal: number;
  nombreTecnico: string | null;
  creadoEn: Date;
  // Relaciones
  ordenMantenimiento?: OrdenMantenimiento;
}

export type TipoMantenimiento = "PREVENTIVO" | "CORRECTIVO";
export type TipoTaller = "PROPIO" | "TERCEROS";
export type EstadoMantenimiento = "PENDIENTE" | "EN_PROCESO" | "COMPLETADO" | "CANCELADO";

export type OrdenMantenimientoCreateInput = Omit<OrdenMantenimiento, "id" | "creadoEn" | "actualizadoEn" | "vehiculo" | "tecnico" | "sectorSolicitante" | "repuestos" | "manoDeObra">;
export type OrdenMantenimientoUpdateInput = Partial<Omit<OrdenMantenimiento, "id" | "creadoEn" | "actualizadoEn">>;

export type DetalleRepuestoCreateInput = Omit<DetalleRepuesto, "id" | "creadoEn" | "ordenMantenimiento">;
export type DetalleManoObraCreateInput = Omit<DetalleManoObra, "id" | "creadoEn" | "ordenMantenimiento">;
