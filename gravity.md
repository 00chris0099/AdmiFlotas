# 🚀 Gravity — Arquitectura Backend del SAF

Bienvenido a la documentación técnica del backend del **Sistema de Administración de Flotas (SAF)**. Este documento explica en profundidad cómo está diseñado el modelo de datos, la estructura modular de Prisma, y cómo las diferentes entidades interactúan para dar vida a los procesos descritos en el manual F1T02.

---

## 1. Arquitectura General y Multi-Schema

El proyecto utiliza **Prisma ORM** sobre una base de datos **PostgreSQL** alojada en Supabase. En lugar de un único archivo gigante `schema.prisma`, el backend está estructurado utilizando la funcionalidad *Multi-Schema* de Prisma (Prisma 7+), dividiendo el dominio del negocio en módulos cohesivos.

### Distribución de Archivos

```text
prisma/schema/
├── base.prisma        → Configuración base, conexión a BD, y parámetros globales (CKV).
├── seguridad.prisma   → Control de acceso, roles (Organigrama F1T02) y auditoría.
├── flota.prisma       → Ficha técnica patrimonial de los vehículos y control de llantas.
└── operacion.prisma   → Formularios MA (Movimientos, Checklist, Combustible, Mantenimiento).
```

---

## 2. Modelado Orientado al Manual F1T02

Cada módulo del backend está diseñado para reflejar una parte específica del manual de procedimientos.

### A. Módulo de Seguridad y Personal (`seguridad.prisma`)
En lugar de tener simples administradores y usuarios, el modelo implementa un **Organigrama Jerárquico**:
- **`Usuario`**: Cada usuario pertenece a un `RolUsuario` estricto (Jefe de Proceso, Conductor, Inspector, Mecánico, etc.). Contiene campos específicos para la operación de flotas, como:
  - `licenciaConducir` y `vencimientoLicencia` (Obligatorio para conductores).
  - `especialidad` (Para mecánicos y electricistas).
- **Control de Acceso (`PermisoUsuario`)**: Los permisos son granulares. Un conductor solo puede crear movimientos diarios, pero un mecánico tiene permisos de escritura sobre las órdenes de mantenimiento.

### B. Módulo de Flota (`flota.prisma`)
Es el corazón estático del sistema, el **Inventario de Flota**.
- **`Vehiculo`**: 
  - Utiliza un identificador complejo exigido por la normativa: el **Código Patrimonial** de 6 dígitos (`clase-categoria-secuencial`).
  - Almacena especificaciones técnicas profundas: número de chasis, potencia (HP), capacidad de carga, y especificaciones de la **batería** (tipo, celdas, amperaje).
  - **CKV (Costo por Kilómetro)**: Incluye campos financieros como `valor_adquisicion` y `vida_util_anios` para que el backend calcule la depreciación automáticamente.
- **`ControlLlanta`**: 
  - Rastrea cada llanta de forma individual mediante su código `EPS`.
  - Registra en qué posición (1 al 7) del vehículo está instalada, para poder rotarlas en el sistema y calcular el desgaste.

### C. Módulo de Operaciones (`operacion.prisma`)
Este es el motor transaccional del backend. Traduce los formularios físicos "MA" a relaciones de base de datos.

#### Movimiento Diario (Formulario MA 122 01 01)
- **`MovimientoDiario`**: Registra un viaje. Cruza 3 entidades clave: **Vehículo + Conductor + Inspector**.
  - **HUV (Horas de Utilización del Vehículo)**: Calcula la diferencia entre `horaSalida` y `horaLlegada`. Esto permite calcular el Índice de Utilización (IUV).
- **`ChecklistVerificacion`**: Está relacionado 1 a 1 con el Movimiento. Es el control de los 15 puntos críticos (aceite, frenos, plumillas, llantas). Si `aptoParaOperar` es falso, el backend puede bloquear el movimiento.

#### Abastecimiento (Formulario MA 122 01 02)
- **`OrdenCombustible`**: No solo registra gasolina/diésel. El backend separa intencionalmente los lubricantes (`incluyeAceiteMotor`, `incluyeAceiteCaja`) porque tienen costos y periodicidades de mantenimiento diferentes.

#### Mantenimiento y Costos (Formulario MA 122 02 01)
- **`OrdenMantenimiento`**: El cerebro de los costos de reparación.
  - **Origen del servicio**: Un enum `TipoTaller` divide lógicamente el flujo en `PROPIO` o `TERCEROS`.
  - **Sub-costos**: El costo total no se digita, se *calcula* sumando: `costoManoObra` + `costoPiezas` + `costoOtros`.
- **`DetalleRepuesto`**: Relaciona el mantenimiento con el Almacén de Mantenimiento, sabiendo exactamente qué filtro o bujía se usó.
- **`DetalleManoObra`**: Traduce las horas del técnico (`Mecánico`) en dinero según su tarifa (`costoHora`).

---

## 3. Lógica de Cálculo de Indicadores (CKV e IUV)

El backend prepara los datos para que las consultas (queries) puedan calcular los indicadores de rentabilidad de la flota de manera casi instantánea.

### Costo por Kilómetro de Operación (CKV)
El CKV determina cuánto cuesta mover un vehículo 1 km. 
- **Costos Variables**: Se obtienen sumando los campos `costo_total` de `OrdenCombustible` y `OrdenMantenimiento` en un rango de fechas.
- **Costos Fijos**: 
  1. Depreciación: Se extrae de `Vehiculo` (Valor / Vida Útil).
  2. Costos Prorrateables: La tabla `CostoFijoProrrateable` (en `base.prisma`) guarda sueldos administrativos y alquileres de la central, los cuales se dividen entre los vehículos activos mediante consultas SQL de agregación.

### Índice de Utilización del Vehículo (IUV)
Mide la eficiencia del activo.
- Extrae la suma de `horasUtilizacion` de todos los `MovimientoDiario` de un vehículo y lo compara con el parámetro global `horas_objetivo_dia` almacenado dinámicamente en la tabla `ConfiguracionFlota`.

---

## 4. Gestión de Estado y Ciclo de Vida

El backend asegura la integridad referencial y temporal mediante *Enums* que dictan el ciclo de vida:

- **Vehículos**: `OPERATIVO` → `EN_MANTENIMIENTO` → `INOPERATIVO` → `DADO_DE_BAJA`
- **Llantas**: `EN_USO` → `EN_ALMACEN` → `EN_REENCAUCHE` → `DADA_DE_BAJA`
- **Mantenimiento**: `PENDIENTE` → `EN_PROCESO` → `COMPLETADO`

Si un `MovimientoDiario` se registra, un "trigger" lógico en la capa de servicios (Application Layer) debería actualizar el `kilometrajeActual` del `Vehiculo`. Cuando este kilometraje cruza el umbral de `periodicidadMantenimientoKm`, el sistema dispara una alerta preventiva.

---

## 5. Integración y Seed

El sistema utiliza `seed.ts` no solo para datos de prueba, sino para *instanciar* el proyecto. 
- Alimenta la tabla `ConfiguracionFlota` con constantes clave.
- Crea el primer "Super Admin" (`Jefe de Proceso`).
- Construye el esqueleto de permisos que garantiza que un Conductor no pueda aprobar su propia orden de Mantenimiento, respetando la segregación de funciones (SoD - Segregation of Duties) vital en auditorías gubernamentales o corporativas.
