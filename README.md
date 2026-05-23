<div align="center">

# 🚛 SAF — Sistema de Administración de Flotas

**Digitalización del Manual Técnico F1T02**
**Procedimientos Básicos de Operación, Mantenimiento y Control de Flota**

[![Prisma](https://img.shields.io/badge/Prisma-7.8.0-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Cloud-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Node.js](https://img.shields.io/badge/Node.js-24+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Manual](https://img.shields.io/badge/Manual-F1T02-FF6B35?style=for-the-badge)](.)

</div>

---

> **Declaración de Versión:** Este modelo de datos es la versión digitalizada de los procedimientos básicos
> (Movimiento, Mantenimiento y Costos) del sistema administrativo de flotas. La actualización de los
> procedimientos implementados en este sistema es responsabilidad del **Jefe de Logística**, conforme
> lo establece el manual técnico F1T02.

---

## 📋 Tabla de Contenidos

- [Descripción](#-descripción)
- [Organigrama del Proyecto](#-organigrama-del-proyecto)
- [Arquitectura del Sistema](#-arquitectura-del-sistema)
- [Modelo de Datos (ERD)](#-modelo-de-datos-erd)
- [Diccionario de Datos F1T02](#-diccionario-de-datos-f1t02)
- [Indicadores del Sistema (IUV y CKV)](#-indicadores-del-sistema)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Comandos Disponibles](#-comandos-disponibles)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Datos Iniciales (Seed)](#-datos-iniciales-seed)

---

## 📖 Descripción

El **SAF** es un Sistema de Administración de Flotas que digitaliza íntegramente el **Manual Técnico F1T02**, implementando los tres procedimientos básicos del sistema administrativo:

| Procedimiento | Formulario | Descripción |
|---------------|-----------|-------------|
| 🚗 **Movimiento Diario** | MA 122 01 01 | Registro de uso diario del vehículo con odómetro, horas y checklist pre-operacional |
| ⛽ **Combustible y Lubricantes** | MA 122 01 02 | Órdenes de abastecimiento con trazabilidad del servicentro acreditado |
| 🔧 **Mantenimiento** | MA 122 02 01 | Órdenes preventivas y correctivas con desglose de costos y tipo de taller |

### Funcionalidades Principales

| Módulo | Descripción |
|--------|-------------|
| 📍 **Inventario de Flota** | Ficha técnica patrimonial completa con código de 6 dígitos (Diagrama 3 del manual) |
| 📋 **Operación Diaria** | Registro MA 122 01 01 con checklist de 15 puntos y HUV para cálculo de IUV |
| ⛽ **Combustible** | Registro MA 122 01 02 diferenciando combustible, aceite de motor y aceite de caja |
| 🔧 **Mantenimiento** | Registro MA 122 02 01 con distinción Taller Propio / Taller de Terceros |
| 🛞 **Control de Llantas** | Trazabilidad individual por código EPS y posición en el vehículo (1–7) |
| 💰 **Costos (CKV)** | Estructura para calcular el Costo por Kilómetro de Operación automáticamente |
| 👥 **Personal** | Organigrama F1T02: Jefe de Proceso, Operación, Mantenimiento y Administrativo |

---

## 👥 Organigrama del Proyecto

```
                    ┌─────────────────────────┐
                    │   JEFE DEL PROCESO       │
                    │   Escriba Matto          │
                    │   (ROL: JEFE_PROCESO)    │
                    └────────────┬────────────┘
                                 │
          ┌──────────────────────┼──────────────────────┐
          │                      │                      │
┌─────────▼─────────┐  ┌─────────▼─────────┐  ┌────────▼──────────┐
│  EQUIPO OPERACIÓN │  │ EQUIPO MANTENIMIEN.│  │ APOYO ADMINISTR.  │
│                   │  │                   │  │                   │
│ • Leon Mejia      │  │ • Polanco Jimenez │  │ • Ventura Chipana │
│   (CONDUCTOR)     │  │   (MECANICO)      │  │   (ADMINISTRATIVO)│
│                   │  │                   │  │                   │
│ • Montero Salazar │  │  [Electricistas,  │  │                   │
│   (INSPECTOR)     │  │   Analistas...]   │  │                   │
└───────────────────┘  └───────────────────┘  └───────────────────┘
```

---

## 🏗 Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────┐
│              Aplicación SAF (Node.js / TypeScript)       │
├─────────────────────────────────────────────────────────┤
│           Prisma Client v7 + Adapter PG                 │
│         (Type-safe Database Access Layer)               │
├─────────────────────────────────────────────────────────┤
│  DATABASE_URL (Puerto 6543 - PgBouncer)  ← Runtime      │
│  DIRECT_URL   (Puerto 5432 - Directo)    ← Migraciones  │
├─────────────────────────────────────────────────────────┤
│              Supabase PostgreSQL (Cloud)                 │
│              Esquema Multi-Archivo Prisma               │
│  ┌──────────────┬─────────────┬───────────────────────┐ │
│  │ base.prisma  │seguridad    │ flota.prisma          │ │
│  │ (Config,     │.prisma      │ (Vehiculo,            │ │
│  │  CostoFijo)  │ (Usuario,   │  ControlLlanta)       │ │
│  │              │  Permisos)  │                       │ │
│  └──────────────┴─────────────┴───────────────────────┘ │
│  ┌──────────────────────────────────────────────────────┐│
│  │               operacion.prisma                       ││
│  │ (MovimientoDiario, Checklist, OrdenCombustible,      ││
│  │  OrdenMantenimiento, DetalleRepuesto, ManoObra)      ││
│  └──────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

---

## 🗂 Modelo de Datos (ERD)

```mermaid
erDiagram
    USUARIOS ||--o{ MOVIMIENTOS_DIARIOS : "conduce"
    USUARIOS ||--o{ MOVIMIENTOS_DIARIOS : "inspecciona"
    USUARIOS ||--o{ ORDENES_COMBUSTIBLE : "solicita"
    USUARIOS ||--o{ ORDENES_MANTENIMIENTO : "ejecuta"
    VEHICULOS ||--o{ MOVIMIENTOS_DIARIOS : "registra"
    VEHICULOS ||--o{ ORDENES_COMBUSTIBLE : "abastece"
    VEHICULOS ||--o{ ORDENES_MANTENIMIENTO : "recibe"
    VEHICULOS ||--o{ CONTROL_LLANTAS : "tiene"
    MOVIMIENTOS_DIARIOS ||--|| CHECKLIST_VERIFICACION : "incluye"
    ORDENES_MANTENIMIENTO ||--o{ DETALLE_REPUESTOS : "consume"
    ORDENES_MANTENIMIENTO ||--o{ DETALLE_MANO_OBRA : "registra"
    USUARIOS ||--o{ PERMISOS_USUARIO : "tiene"
    PERMISOS ||--o{ PERMISOS_USUARIO : "asignado"

    VEHICULOS {
        uuid id PK
        varchar codigo_patrimonial UK "01-01-001"
        varchar clase_patrimonial "01=Terrestre"
        enum categoria_patrimonial "PASAJEROS/CARGA/ESPECIAL"
        varchar secuencial "001-999"
        varchar placa UK
        varchar marca
        varchar modelo
        int anio_fabricacion
        int potencia_hp
        varchar numero_motor UK
        varchar numero_chasis UK
        enum tipo_combustible
        decimal capacidad_carga_kg
        int capacidad_pasajeros
        varchar bateria_tipo
        int bateria_celdas
        int bateria_voltios
        int bateria_amperios
        int numero_ejes
        enum estado_pintura
        decimal valor_adquisicion
        int vida_util_anios
        decimal seguro_anual
    }

    MOVIMIENTOS_DIARIOS {
        uuid id PK
        uuid vehiculo_id FK
        uuid conductor_id FK
        uuid inspector_id FK
        date fecha
        int kilometraje_salida
        int kilometraje_llegada
        varchar hora_salida
        varchar hora_llegada
        decimal horas_utilizacion "HUV para IUV"
        varchar destino
        varchar sector_solicitante
    }

    CHECKLIST_VERIFICACION {
        uuid id PK
        uuid movimiento_id FK
        enum documentos
        enum aceite_motor
        enum agua
        enum bateria
        enum frenos
        enum embrague
        enum fajas
        enum faros
        enum lunas
        enum plumillas
        enum llantas
        enum espejos
        enum herramientas
        enum extintor_botiquin
        enum manchas_fugas
        boolean apto_para_operar
    }

    ORDENES_COMBUSTIBLE {
        uuid id PK
        varchar numero_orden UK
        uuid vehiculo_id FK
        uuid conductor_id FK
        enum tipo_combustible
        decimal cantidad_galones
        decimal costo_galon
        boolean incluye_aceite_motor
        decimal cantidad_aceite_motor_lt
        boolean incluye_aceite_caja
        decimal cantidad_aceite_caja_lt
        int kilometraje_actual
        varchar nombre_serviccentro
        boolean sello_serviccentro
    }

    ORDENES_MANTENIMIENTO {
        uuid id PK
        varchar numero_orden UK
        uuid vehiculo_id FK
        uuid tecnico_id FK
        enum tipo_mantenimiento "PREVENTIVO/CORRECTIVO"
        enum tipo_taller "PROPIO/TERCEROS"
        decimal costo_mano_obra_propia
        decimal costo_mano_obra_terceros
        decimal costo_piezas_repuestos
        decimal costo_total
    }

    CONTROL_LLANTAS {
        uuid id PK
        varchar codigo_eps UK
        uuid vehiculo_id FK
        int posicion_vehiculo "1-7"
        varchar dimension
        date fecha_instalacion
        int kilometraje_acumulado
        enum estado
    }
```

---

## 📚 Diccionario de Datos F1T02

> Este diccionario explica la correspondencia exacta entre cada tabla del modelo de datos
> y los formularios MA del manual técnico F1T02.

---

### A. `vehiculos` — Inventario de Flota (Diagrama 3)

| Campo en BD | Campo en Manual F1T02 | Tipo | Descripción |
|-------------|----------------------|------|-------------|
| `codigo_patrimonial` | Código Patrimonial | VARCHAR(20) | Código de 6 dígitos: `CL-CAT-SEQ`. Ej: `01-01-001` |
| `clase_patrimonial` | Clase | VARCHAR(2) | `01`=Terrestre, `02`=Acuático, `03`=Aéreo |
| `categoria_patrimonial` | Categoría | ENUM | `PASAJEROS`, `CARGA`, `ESPECIAL` |
| `secuencial` | Secuencia | VARCHAR(3) | Número correlativo dentro de la categoría (`001`–`999`) |
| `placa` | Placa | VARCHAR(10) | Número de placa de rodaje oficial |
| `marca` | Marca | VARCHAR(80) | Marca del fabricante (Toyota, Hyundai, etc.) |
| `modelo` | Modelo | VARCHAR(80) | Modelo específico del vehículo |
| `anio_fabricacion` | Año de Fabricación | INT | Año en que fue fabricado el vehículo |
| `numero_motor` | N° Motor | VARCHAR(50) | Número de serie del motor |
| `numero_chasis` | N° Chasis | VARCHAR(50) | Número de chasis/VIN del vehículo |
| `potencia_hp` | Potencia (HP) | INT | Caballos de fuerza del motor |
| `tipo_combustible` | Tipo Combustible | ENUM | `GASOLINA`, `DIESEL`, `GLP`, `ELECTRICO`, `HIBRIDO` |
| `capacidad_carga_kg` | Cap. Carga (kg) | DECIMAL | Capacidad máxima de carga en kilogramos |
| `capacidad_pasajeros` | Cap. Pasajeros | INT | Número máximo de pasajeros (incluye conductor) |
| `bateria_tipo` | Tipo Batería | VARCHAR(50) | Tipo de batería (Plomo-Ácido, AGM, Gel) |
| `bateria_celdas` | Celdas | INT | Número de celdas de la batería |
| `bateria_voltios` | Voltios | INT | Voltaje nominal (6V, 12V, 24V) |
| `bateria_amperios` | Amperaje (Ah) | INT | Capacidad en amperios-hora |
| `numero_ejes` | N° Ejes | INT | Número de ejes del vehículo |
| `configuracion_ejes` | Config. Ejes | VARCHAR(30) | Ej: `4×2`, `4×4`, `6×4` |
| `estado_pintura` | Estado Pintura | ENUM | `BUENO`, `REGULAR`, `MALO` (Diagrama 3) |
| `estado_faros` | Estado Faros | ENUM | `BUENO`, `REGULAR`, `MALO` (Diagrama 3) |
| `estado_lunas` | Estado Lunas | ENUM | `BUENO`, `REGULAR`, `MALO` (Diagrama 3) |
| `inventario_herramientas` | Inventario Herramientas | TEXT | Listado de herramientas y accesorios del vehículo |
| `valor_adquisicion` | Valor Adquisición | DECIMAL | Costo de compra (base para cálculo de depreciación CKV) |
| `vida_util_anios` | Vida Útil (años) | INT | Vida útil estimada para calcular depreciación |
| `seguro_anual` | Seguro Anual | DECIMAL | Prima de seguro anual (Costo Fijo del vehículo para CKV) |
| `licenciamiento_anual` | Licenciamiento | DECIMAL | Costo de SOAT y licencias (Costo Fijo para CKV) |
| `periodicidad_mantenimiento_km` | Periodicidad Mant. | INT | Km para disparar alerta de mantenimiento preventivo |

---

### B. `movimientos_diarios` + `checklist_verificacion` — Formulario MA 122 01 01

**`movimientos_diarios`**

| Campo en BD | Campo en MA 122 01 01 | Tipo | Descripción |
|-------------|----------------------|------|-------------|
| `vehiculo_id` | Vehículo / Placa | UUID FK | Referencia al vehículo utilizado |
| `conductor_id` | Conductor | UUID FK | Usuario con rol `CONDUCTOR` |
| `inspector_id` | Inspector | UUID FK | Usuario con rol `INSPECTOR` que valida el checklist |
| `fecha` | Fecha | DATE | Fecha del movimiento |
| `sector_solicitante` | Sector Solicitante | VARCHAR | Unidad orgánica que solicita el servicio |
| `destino` | Destino | VARCHAR | Lugar de destino del viaje |
| `kilometraje_salida` | Km Salida | INT | Lectura del odómetro al salir |
| `kilometraje_llegada` | Km Llegada | INT | Lectura del odómetro al regresar |
| `kilometraje_recorrido` | Km Recorridos | INT | Diferencia: `km_llegada - km_salida` |
| `hora_salida` | Hora Salida | VARCHAR(5) | Hora de salida del vehículo (HH:MM) |
| `hora_llegada` | Hora Llegada | VARCHAR(5) | Hora de llegada del vehículo (HH:MM) |
| `horas_utilizacion` | **HUV** | DECIMAL | **Horas efectivas de uso** (para cálculo de IUV) |

**`checklist_verificacion`** — 15 Puntos de Control Pre-Operacional

| Campo en BD | Punto de Control | Valores |
|-------------|-----------------|---------|
| `documentos` | 1. Documentos del vehículo | `OK`, `OBSERVADO`, `FALLADO` |
| `aceite_motor` | 2. Nivel de aceite de motor | `OK`, `OBSERVADO`, `FALLADO` |
| `agua` | 3. Nivel de agua del radiador | `OK`, `OBSERVADO`, `FALLADO` |
| `bateria` | 4. Batería (electrolito y bornes) | `OK`, `OBSERVADO`, `FALLADO` |
| `frenos` | 5. Sistema de frenos (líquido y funcionamiento) | `OK`, `OBSERVADO`, `FALLADO` |
| `embrague` | 6. Embrague (líquido y funcionamiento) | `OK`, `OBSERVADO`, `FALLADO` |
| `fajas` | 7. Fajas / Correas (alternador, distribución) | `OK`, `OBSERVADO`, `FALLADO` |
| `faros` | 8. Faros (delanteros, traseros, de freno) | `OK`, `OBSERVADO`, `FALLADO` |
| `lunas` | 9. Lunas / Vidrios | `OK`, `OBSERVADO`, `FALLADO` |
| `plumillas` | 10. Plumillas / Limpiaparabrisas | `OK`, `OBSERVADO`, `FALLADO` |
| `llantas` | 11. Presión y estado de llantas | `OK`, `OBSERVADO`, `FALLADO` |
| `espejos` | 12. Espejos retrovisores | `OK`, `OBSERVADO`, `FALLADO` |
| `herramientas` | 13. Herramientas y equipo de emergencia | `OK`, `OBSERVADO`, `FALLADO` |
| `extintor_botiquin` | 14. Extintor y botiquín | `OK`, `OBSERVADO`, `FALLADO` |
| `manchas_fugas` | 15. **Manchas por fugas** en el estacionamiento | `OK`, `OBSERVADO`, `FALLADO` |
| `apto_para_operar` | Resultado General | BOOLEAN | `true` si el vehículo pasa el checklist |

---

### C. `ordenes_combustible` — Formulario MA 122 01 02

| Campo en BD | Campo en MA 122 01 02 | Tipo | Descripción |
|-------------|----------------------|------|-------------|
| `numero_orden` | N° Orden | VARCHAR(20) | Número correlativo de la orden de abastecimiento |
| `fecha` | Fecha | DATE | Fecha del abastecimiento |
| `vehiculo_id` | Vehículo | UUID FK | Vehículo abastecido |
| `conductor_id` | Conductor | UUID FK | Conductor que solicita el abastecimiento |
| `sector_solicitante` | Sector Solicitante | VARCHAR | Unidad que origina el requerimiento |
| `tipo_combustible` | Tipo Combustible | ENUM | `GASOLINA`, `DIESEL`, `GLP` |
| `cantidad_galones` | Cantidad (Gal.) | DECIMAL | Galones de combustible abastecidos |
| `costo_galon` | Precio/Galón | DECIMAL | Precio unitario del combustible |
| `incluye_aceite_motor` | **Aceite Motor** | BOOLEAN | `true` si se registra consumo de aceite de motor |
| `cantidad_aceite_motor_lt` | Aceite Motor (Lt.) | DECIMAL | Litros de aceite de motor (registrado por separado) |
| `viscosidad_aceite_motor` | Viscosidad Aceite | VARCHAR | Ej: `15W-40`, `10W-30` |
| `incluye_aceite_caja` | **Aceite Caja** | BOOLEAN | `true` si se registra aceite de caja/transmisión |
| `cantidad_aceite_caja_lt` | Aceite Caja (Lt.) | DECIMAL | Litros de aceite de transmisión (por separado) |
| `kilometraje_actual` | Kilometraje | INT | Odómetro al momento del abastecimiento |
| `nombre_serviccentro` | **Servicentro** | VARCHAR | Nombre del servicentro acreditado |
| `numero_ticket_serviccentro` | N° Ticket | VARCHAR | Número de ticket/factura del servicentro |
| `responsable_serviccentro` | Responsable | VARCHAR | Nombre del responsable del servicentro |
| `sello_serviccentro` | **Sello/Firma** | BOOLEAN | Indica si se recibió el sello del servicentro |

> **Nota:** Los aceites de motor y de caja se registran por separado porque tienen
> costos y periodicidades de cambio distintas, según lo establece el manual F1T02.

---

### D. `ordenes_mantenimiento` + `detalle_repuestos` + `detalle_mano_obra` — Formulario MA 122 02 01

**`ordenes_mantenimiento`**

| Campo en BD | Campo en MA 122 02 01 | Tipo | Descripción |
|-------------|----------------------|------|-------------|
| `numero_orden` | N° Orden | VARCHAR(20) | Número correlativo de la orden de mantenimiento |
| `fecha_emision` | Fecha Emisión | DATE | Fecha en que se emite la orden |
| `vehiculo_id` | Vehículo | UUID FK | Vehículo que recibe el servicio |
| `tecnico_id` | Técnico | UUID FK | Mecánico/electricista responsable |
| `sector_solicitante` | Sector Solicitante | VARCHAR | Unidad orgánica que origina el requerimiento |
| `tipo_mantenimiento` | Tipo | ENUM | `PREVENTIVO` o `CORRECTIVO` |
| `tipo_taller` | **Origen del Servicio** | ENUM | `PROPIO` (Tarjeta de M.O.) o `TERCEROS` (Autorización Ext.) |
| `nombre_taller_externo` | Taller de Terceros | VARCHAR | Nombre del taller externo (si `tipo_taller = TERCEROS`) |
| `numero_autorizacion_externa` | N° Autorización | VARCHAR | Número de Autorización de Servicio Externo |
| `fecha_entrada_taller` | Fecha Entrada | DATE | Fecha de ingreso al taller |
| `hora_entrada_taller` | Hora Entrada | VARCHAR | Hora de ingreso al taller |
| `fecha_salida_taller` | Fecha Salida | DATE | Fecha de salida del taller |
| `hora_salida_taller` | Hora Salida | VARCHAR | Hora de salida del taller |
| `kilometraje_entrada` | Km Entrada | INT | Odómetro al ingresar al taller |
| `descripcion_servicio` | Descripción Servicio | TEXT | Descripción detallada del servicio realizado |
| `falla_reportada` | Falla Reportada | TEXT | Falla informada por el conductor (correctivo) |
| `costo_mano_obra_propia` | M.O. Taller Propio | DECIMAL | Costo de mano de obra propia (Tarjeta de M.O.) |
| `costo_mano_obra_terceros` | M.O. Taller Externo | DECIMAL | Costo de mano de obra del taller externo |
| `costo_piezas_repuestos` | Piezas/Repuestos | DECIMAL | Total de repuestos del Almacén de Mantenimiento |
| `costo_otros` | Otros Costos | DECIMAL | Traslado, peritaje, diagnóstico, etc. |
| `costo_total` | **Costo Total** | DECIMAL | Suma: M.O. + Piezas + Otros |

**`detalle_repuestos`** — Almacén de Mantenimiento

| Campo en BD | Descripción |
|-------------|-------------|
| `descripcion` | Nombre del repuesto o pieza |
| `numero_parte_catalogo` | Número de parte según catálogo del fabricante |
| `cantidad` | Cantidad utilizada |
| `precio_unitario` | Precio por unidad |
| `subtotal` | `cantidad × precio_unitario` |
| `es_almacen_propio` | `true` = del Almacén de Mantenimiento propio; `false` = proveedor externo |

**`detalle_mano_obra`** — Tarjeta de Mano de Obra

| Campo en BD | Descripción |
|-------------|-------------|
| `descripcion_tarea` | Tarea realizada por el técnico |
| `horas_trabajadas` | Horas invertidas en la tarea |
| `costo_hora` | Costo por hora del técnico |
| `subtotal` | `horas × costo_hora` |
| `nombre_tecnico` | Nombre del técnico ejecutor |

---

### E. `control_llantas` — Control Individualizado de Llantas

| Campo en BD | Campo en Manual F1T02 | Tipo | Descripción |
|-------------|----------------------|------|-------------|
| `codigo_eps` | **Número EPS** | VARCHAR(50) | Código único de la llanta asignado por EPS/fabricante |
| `vehiculo_id` | Vehículo | UUID FK | Vehículo donde está instalada la llanta |
| `fabricante` | Fabricante | VARCHAR | Ej: Bridgestone, Michelin, Goodyear |
| `dimension` | Dimensión | VARCHAR | Ej: `7.50R16`, `235/65R16C` |
| `modelo_llanta` | Modelo | VARCHAR | Ej: R168, XZY3, G658 |
| `posicion_vehiculo` | **Posición (1–7)** | INT | Posición según diagrama del manual (ver tabla abajo) |
| `descripcion_posicion` | Descripción Posición | VARCHAR | Ej: `Delantera Izquierda`, `Repuesto` |
| `fecha_instalacion` | Fecha Instalación | DATE | Fecha en que se instaló la llanta |
| `fecha_retiro` | Fecha Retiro | DATE | Fecha en que se retiró la llanta |
| `kilometraje_instalacion` | Km Instalación | INT | Odómetro al instalar |
| `kilometraje_retiro` | Km Retiro | INT | Odómetro al retirar |
| `kilometraje_acumulado` | **Km Acumulados** | INT | `km_retiro - km_instalacion` |
| `estado` | Estado | ENUM | `EN_USO`, `EN_ALMACEN`, `REENCAUCHADA`, `DADA_DE_BAJA` |

**Diagrama de Posiciones de Llantas (ejemplo vehículo 6+1)**

```
          FRENTE
    ┌─────────────────┐
    │  [1]      [2]   │   1 = Delantera Izquierda
    │                 │   2 = Delantera Derecha
    │  [3][4]  [5][6] │   3 = Trasera Izq. Exterior
    │                 │   4 = Trasera Izq. Interior
    └─────────────────┘   5 = Trasera Der. Interior
                          6 = Trasera Der. Exterior
    [ ] = [7] Repuesto    7 = Repuesto
```

---

### F. `usuarios` — Personal y Roles (Organigrama F1T02)

| Rol en BD | Rol en Organigrama F1T02 | Descripción |
|-----------|--------------------------|-------------|
| `JEFE_PROCESO` | Jefe del Proceso | Máxima autoridad. Responsable de actualizar procedimientos. |
| `CONDUCTOR` | Equipo de Operación — Conductor | Opera los vehículos. Requiere licencia de conducir. |
| `INSPECTOR` | Equipo de Operación — Inspector | Valida el checklist pre-operacional y el estado de los vehículos. |
| `ANALISTA` | Equipo de Operación — Analista | Procesa indicadores (IUV, CKV) y genera reportes. |
| `MECANICO` | Equipo de Mantenimiento — Mecánico | Ejecuta órdenes de mantenimiento. Registra en Tarjeta de M.O. |
| `ELECTRICISTA` | Equipo de Mantenimiento — Electricista | Mantenimiento del sistema eléctrico del vehículo. |
| `ADMINISTRATIVO` | Apoyo Administrativo | Gestión de costos fijos, documentación y archivo. |

**Usuarios Iniciales del Sistema**

| Usuario | Rol | Email | Especialidad |
|---------|-----|-------|-------------|
| **Escriba Matto** | `JEFE_PROCESO` | escriba.matto@flota.gob | Gestión de Flotas y Logística |
| **Leon Mejia** | `CONDUCTOR` | leon.mejia@flota.gob | Lic. AIIB — Venc. Jun 2027 |
| **Montero Salazar** | `INSPECTOR` | montero.salazar@flota.gob | Control e Inspección Vehicular |
| **Polanco Jimenez** | `MECANICO` | polanco.jimenez@flota.gob | Mecánica Automotriz y Diesel |
| **Ventura Chipana** | `ADMINISTRATIVO` | ventura.chipana@flota.gob | Apoyo Administrativo |

---

### G. `costos_fijos_prorrateables` + `vehiculos` — Cálculo CKV

El sistema almacena todos los datos necesarios para calcular el **Costo por Kilómetro de Operación (CKV)**:

```
CKV = (Costos Fijos + Costos Variables) / Km Totales del Período

Costos Fijos del Vehículo:
  • Depreciación = valor_adquisicion / (vida_util_anios × km_anuales_referencia)
  • Seguro       = seguro_anual / km_anuales_referencia
  • Licencias    = licenciamiento_anual / km_anuales_referencia

Costos Fijos Prorrateables (tabla costos_fijos_prorrateables):
  • Personal Administrativo, Oficina, Comunicaciones, etc.
  → Se prorratean dividiendo entre el total de vehículos activos

Costos Variables (calculados del período):
  • Combustible  = SUM(costo_total) de ordenes_combustible
  • Mantenimiento = SUM(costo_total) de ordenes_mantenimiento
  • Llantas      = SUM(costo_adquisicion) de control_llantas / km_acumulado
```

**Indicador de Utilización del Vehículo (IUV)**

```
IUV = (Horas Reales Utilizadas / Horas Estándar del Período) × 100

Horas Reales: SUM(horas_utilizacion) de movimientos_diarios
Horas Estándar: horas_objetivo_dia × días_laborables (configuracion_flota)
```

---

## ✅ Requisitos Previos

- **Node.js** v18 o superior (recomendado v24+)
- **npm** v9 o superior
- Cuenta en **Supabase** con proyecto PostgreSQL activo

---

## 🚀 Instalación

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd saf-flotas

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Supabase

# 4. Sincronizar esquema con la base de datos
npm run db:push

# 5. Generar el cliente Prisma
npm run db:generate

# 6. Cargar datos iniciales (5 integrantes + 3 vehículos + datos de ejemplo)
npm run db:seed
```

---

## ⚙️ Configuración

### Variables de Entorno

```env
# URL con PgBouncer (connection pooling) - para la aplicación
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# URL directa (sin pooling) - para migraciones de Prisma
DIRECT_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-1-us-east-1.pooler.supabase.com:5432/postgres"
```

> ⚠️ **Importante:** Nunca subas el archivo `.env` al repositorio. Ya está incluido en `.gitignore`.

---

## 📜 Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run db:generate` | Genera el cliente Prisma desde el esquema |
| `npm run db:migrate` | Crea y aplica migraciones en desarrollo |
| `npm run db:push` | Sincroniza el esquema directamente (sin migración) |
| `npm run db:seed` | Carga los datos iniciales del SAF |
| `npm run db:studio` | Abre Prisma Studio (GUI para la base de datos) |
| `npm run db:reset` | Resetea la base de datos y re-aplica migraciones |
| `npm run db:format` | Formatea los archivos `.prisma` |
| `npm run db:validate` | Valida la sintaxis del esquema |

---

## 📁 Estructura del Proyecto

```
saf-flotas/
├── .env                         # Variables de entorno (no versionado)
├── .gitignore                   # Archivos ignorados por Git
├── package.json                 # Dependencias y scripts NPM
├── prisma.config.ts             # Configuración de Prisma CLI (multi-schema)
├── README.md                    # Documentación + Diccionario de Datos F1T02
├── ERD.svg                      # Diagrama Entidad-Relación (auto-generado)
│
├── prisma/
│   ├── schema/
│   │   ├── base.prisma          # Generadores + ConfiguracionFlota + CostoFijoProrrateable
│   │   ├── seguridad.prisma     # Usuario (roles F1T02) + Permisos + Auth + Auditoría
│   │   ├── flota.prisma         # Vehiculo (ficha técnica) + ControlLlanta
│   │   └── operacion.prisma     # MovimientoDiario + Checklist + OrdenCombustible
│   │                            # + OrdenMantenimiento + DetalleRepuesto + ManoObra
│   └── seed.ts                  # Datos iniciales: 5 integrantes + flota + operación
│
└── generated/
    └── prisma/                  # Cliente Prisma generado (no versionado)
```

---

## 🌱 Datos Iniciales (Seed)

El script `prisma/seed.ts` carga los siguientes datos para el sistema SAF:

| Bloque | Entidad | Cantidad | Detalle |
|--------|---------|----------|---------| 
| Config | ConfiguracionFlota | 8 | Parámetros de operación e indicadores |
| Personal | Usuario | 5 | Escriba, Leon, Montero, Polanco, Ventura |
| Personal | Permiso | 32 | 8 módulos × 4 acciones |
| Costos | CostoFijoProrrateable | 4 | Personal, Oficina, Comunicaciones, Licencias |
| Flota | Vehiculo | 3 | Pasajeros (Coaster), Carga (HD78), Especial (Sprinter) |
| Llantas | ControlLlanta | 9 | 7 llantas del Coaster + 2 del HD78 |
| Operación | MovimientoDiario | 2 | Con checklist de 15 puntos y HUV |
| Combustible | OrdenCombustible | 2 | Con registro de lubricantes por separado |
| Mantenimiento | OrdenMantenimiento | 2 | 1 Preventivo (Taller Propio) + 1 Correctivo (Terceros) |
| Mantenimiento | DetalleRepuesto | 9 | Piezas del Almacén de Mantenimiento |
| Mantenimiento | DetalleManoObra | 3 | Tarjeta de Mano de Obra (Polanco Jimenez) |

---

## 🔧 Stack Tecnológico

| Tecnología | Versión | Propósito |
|------------|---------|-----------| 
| **Prisma ORM** | 7.8.0 | ORM type-safe multi-schema para Node.js/TypeScript |
| **@prisma/adapter-pg** | latest | Driver adapter para PostgreSQL con PgBouncer |
| **pg** | latest | Cliente PostgreSQL para Node.js |
| **PostgreSQL** | 16+ | Motor de base de datos relacional |
| **Supabase** | Cloud | Hosting de base de datos PostgreSQL |
| **tsx** | latest | Ejecución de TypeScript sin compilación previa |
| **dotenv** | 16.4+ | Carga de variables de entorno |

---

<div align="center">
  <sub>
    Sistema de Administración de Flotas — Digitalización del Manual F1T02<br>
    Desarrollado con Prisma + Supabase + PostgreSQL
  </sub>
</div>
