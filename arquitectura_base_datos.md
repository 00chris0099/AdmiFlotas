# Arquitectura de Base de Datos — SAF (Sistema de Administración de Flotas)

Este documento detalla el diseño relacional y la arquitectura de datos del proyecto **SAF (Manual F1T02)** implementado en PostgreSQL utilizando Prisma ORM.

---

## 1. Módulos y Modelos del Esquema (`prisma/schema/`)

La base de datos está segmentada de manera modular en cinco archivos de esquema para mantener alta cohesión y bajo acoplamiento:

```mermaid
graph TD
    subgraph Seguridad
        Usuario[Usuario] --> SesionAuth[SesionAuth]
        Usuario --> Auditoria[Auditoria]
        Usuario --> PermisoUsuario[PermisoUsuario]
        Permiso[Permiso] --> PermisoUsuario
    end

    subgraph Flota
        Vehiculo[Vehiculo] --> ControlLlanta[ControlLlanta]
    end

    subgraph Operacion
        MovimientoDiario[MovimientoDiario] --> ChecklistVerificacion[ChecklistVerificacion]
        Vehiculo --> MovimientoDiario
        Vehiculo --> OrdenCombustible[OrdenCombustible]
        Vehiculo --> OrdenMantenimiento[OrdenMantenimiento]
        OrdenMantenimiento --> DetalleRepuesto[DetalleRepuesto]
        OrdenMantenimiento --> DetalleManoObra[DetalleManoObra]
    end

    subgraph Base
        ConfiguracionFlota[ConfiguracionFlota]
        CostoFijoProrrateable[CostoFijoProrrateable]
    end

    subgraph Analitica (Vistas)
        ReporteMensualCostos((v_reporte_mensual_costos))
        Vehiculo --> ReporteMensualCostos
    end

    Usuario --> MovimientoDiario
    Usuario --> OrdenCombustible
    Usuario --> OrdenMantenimiento
```

---

## 2. Descripción Detallada de Módulos

### 2.1 Módulo Base (`base.prisma`)
Contiene parámetros generales del sistema SAF y los costos compartidos que alimentan el cálculo de Costo por Kilómetro (CKV):
*   **`ConfiguracionFlota`:** Guarda parámetros dinámicos clave del negocio (metas de kilometraje, variables operativas globales).
*   **`CostoFijoProrrateable`:** Almacena costos mensuales indirectos (personal administrativo, licencias, oficina, comunicaciones) para distribuirlos equitativamente entre los vehículos operativos en un periodo.

### 2.2 Inventario de Flota y Control de Llantas (`flota.prisma`)
Maneja el control físico, técnico e inventariado de los activos rodantes:
*   **`Vehiculo` (Ficha Técnica Central):** Implementa el *Formulario de Inventario de Flota (F1T02 Diagrama 3)*.
    *   *Código Patrimonial (6 dígitos):* Estructurado como `Clase (2 dígitos) - Categoría (CategoríaVehiculo) - Secuencial (3 dígitos)`.
    *   *Especificaciones Físicas:* Registra el estado visual del chasis, pintura, faros y lunas (BUENO/REGULAR/MALO).
    *   *Costos de Referencia:* Valores de adquisición, vida útil y seguros para calcular la depreciación mensual del vehículo.
*   **`ControlLlanta` (Control de Componentes Críticos):** Controla las llantas asignadas por vehículo. Asigna posiciones de montaje (1 al 7) según la guía de distribución del manual para medir desgaste, reencauches y kilómetros recorridos.

### 2.3 Operación y Control Diario (`operacion.prisma`)
Digitaliza los movimientos en campo y el ciclo de mantenimiento, reemplazando formularios físicos:
*   **`MovimientoDiario` (Formulario MA 122 01 01):** Registra el conductor responsable, odómetro (salida/llegada) y el cálculo de Horas de Utilización del Vehículo (HUV) para el cálculo de productividad (IUV).
*   **`ChecklistVerificacion`:** Inspección pre-operacional de 15 puntos críticos (frenos, aceite de motor, agua de radiador, fajas, extintor) requerida para autorizar la salida del vehículo.
*   **`OrdenCombustible` (Formulario MA 122 01 02):** Registra el abastecimiento de combustible (galonaje, costo) y lubricantes (aceites de motor/caja) de forma diferenciada en servicentros acreditados.
*   **`OrdenMantenimiento` (Formulario MA 122 02 01):** Diferencia si el mantenimiento es ejecutado en un taller propio o externo (terceros). Consolida costos de:
    *   **`DetalleRepuesto`:** Repuestos despachados desde el almacén de mantenimiento propio o comprados.
    *   **`DetalleManoObra`:** Registro de horas trabajadas según las tarjetas de mano de obra de los mecánicos.

### 2.4 Personal, Roles y Seguridad (`seguridad.prisma`)
Administra los accesos y la auditoría interna del sistema:
*   **`Usuario`:** Integrantes categorizados según el organigrama del manual F1T02 (Jefe de Proceso, Conductor, Inspector, Analista, Mecánico, Electricista, Administrativo).
*   **`Permiso` y `PermisoUsuario`:** Modelo RBAC (Role-Based Access Control) para control fino de lectura/escritura por módulo.
*   **`SesionAuth`:** Gestión de tokens JWT válidos y control de caducidad.
*   **`Auditoria`:** Bitácora inmutable que registra las operaciones críticas del sistema (`CREAR`, `ACTUALIZAR`, `ELIMINAR`, etc.).

### 2.5 Motor Económico y Analítica (`analitica.prisma`)
Agrega la inteligencia operacional para la toma de decisiones:
*   **`ReporteMensualCostos` (`v_reporte_mensual_costos`):** Vista de base de datos que agrupa y suma mensualmente los costos de combustible, mantenimiento (repuestos + mano de obra) y la distribución del costo fijo prorrateable por vehículo.

---

## 3. Estrategia de Rendimiento e Índices

Para optimizar las búsquedas y reportes de la flota, se implementaron índices (`@@index`) en los atributos con mayor frecuencia de consultas `WHERE` o `ORDER BY`:
1.  **Vehículos:** `placa` (búsqueda rápida de unidades), `codigoPatrimonial` (identificador patrimonial), `estado` (filtrado operacional).
2.  **Movimiento Diario:** `fecha` (búsqueda diaria/mensual), `vehiculoId` (historial de rutas por unidad), `conductorId` (auditoría de conductores).
3.  **Mantenimiento:** `fechaEmision`, `estado` y `tipoMantenimiento` (indicadores de taller).
4.  **Combustible:** `fecha` y `numeroOrden` (auditoría financiera).
