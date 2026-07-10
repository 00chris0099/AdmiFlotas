// ============================================================
// SAF - Tipos compartidos: Tablas de Lookup
// ============================================================

export interface SectorOrganizacional {
  id: string;
  nombre: string;
  activo: boolean;
}

export interface CentroServicio {
  id: string;
  nombre: string;
  direccion: string | null;
  telefono: string | null;
  activo: boolean;
}

export interface FabricanteLlanta {
  id: string;
  nombre: string;
  pais: string | null;
  activo: boolean;
}

export interface DimensionLlanta {
  id: string;
  dimension: string;
  descripcion: string | null;
  activo: boolean;
}

export interface CategoriaRepuesto {
  id: string;
  nombre: string;
  activo: boolean;
}

export interface TipoLavado {
  id: string;
  nombre: string;
  codigo: string;
  activo: boolean;
}

export interface TipoMovimientoAlmacen {
  id: string;
  nombre: string;
  codigo: string;
  activo: boolean;
}

export interface Localidad {
  id: string;
  nombre: string;
  activo: boolean;
}

export interface ConfiguracionFlota {
  id: string;
  clave: string;
  valor: string;
  descripcion: string | null;
  grupo: string;
}
