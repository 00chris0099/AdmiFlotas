# Matriz de Pruebas de Integración (Coherence Matrix) — SAF

Esta matriz define el plan de pruebas para asegurar la coherencia entre los endpoints REST expuestos por el backend de NestJS y los requerimientos operativos del manual F1T02 de la EPS.

| Endpoint (HTTP + Path) | Regla de Negocio (Manual F1T02) | Payload Requerido (Campos Clave) | Status Esperado (Éxito) | Status Esperado (Fallo / Criterio) |
| :--- | :--- | :--- | :--- | :--- |
| **POST** `/api/operaciones/movimientos` | **MA 122 01 01**: Registrar salida diaria. El vehículo debe estar `OPERATIVO` y no tener un movimiento activo con estado `EN_RUTA`. | `vehiculoId` (UUID), `conductorId` (UUID), `kilometrajeSalida` (Int), `horaSalida` (String) | **201 Created** | **400 Bad Request**:<br>- Vehículo no OPERATIVO.<br>- Conductor inactivo.<br>- Viaje duplicado `EN_RUTA`. |
| **POST** `/api/operaciones/combustible` | **MA 122 01 02**: Registrar abastecimiento. Costos variables del combustible y lubricantes se guardan de forma separada para trazabilidad del CKV. | `numeroOrden` (String), `vehiculoId` (UUID), `cantidadGalones` (Decimal), `costoGalon` (Decimal), `kilometrajeActual` (Int), `nombreServiccentro` (String) | **201 Created** | **400 Bad Request**:<br>- Kilometraje actual menor al último registrado.<br>- Galones o costo <= 0. |
| **POST** `/api/mantenimiento/ordenes` | **MA 122 02 01**: Registrar orden preventiva/correctiva. Distingue si es Taller Propio o Terceros. | `numeroOrden` (String), `vehiculoId` (UUID), `tipoMantenimiento` (PREVENTIVO/CORRECTIVO), `tipoTaller` (PROPIO/TERCEROS), `costoTotal` (Decimal) | **201 Created** | **400 Bad Request**:<br>- Taller externo requiere `nombreTallerExterno`.<br>- Taller propio requiere Tarjeta de Mano de Obra. |
| **GET** `/api/analitica/reportes-costos` | **Cálculo CKV**: Consolida reportes mensuales agregando costos fijos y variables. Requiere que la relación de vehículos esté tipada. | Parámetros de query: `periodo` (YYYY-MM), `limit` (Int), `offset` (Int) | **200 OK** | **400 Bad Request**:<br>- Formato de período inválido.<br>- Limit o Offset negativo. |
| **POST** `/api/seguridad/auditoria` | **Trazabilidad**: Las acciones críticas deben dejar huella de auditoría. Se mantiene log al borrar usuarios (`onDelete: SetNull`). | `modulo` (String), `accion` (TipoAccion), `entidad` (String), `descripcion` (String) | **201 Created** | **401 Unauthorized**:<br>- Token Bearer inválido o expirado. |
| **POST** `/api/auth/login` | **Organigrama F1T02**: Permite el ingreso autenticado de mecánicos, conductores, inspectores y el Jefe de Proceso. | `email` (String), `password` (String) | **200 OK** (Retorna JWT) | **401 Unauthorized**:<br>- Credenciales incorrectas.<br>- Usuario inactivo. |

---

## 🧪 Estrategia de Validación de Integración

1. **Pruebas de Contrato (Contract Testing)**:
   * Validar que los DTOs de NestJS coincidan exactamente con las propiedades de los formularios del frontend Next.js mediante el archivo auto-generado `frontend/src/types/api.d.ts`.
2. **Pruebas de Transaccionalidad**:
   * Simular un fallo de red al crear el `ChecklistVerificacion` de un movimiento para verificar que la transacción se revierte (`rollback`) y no se crea un `MovimientoDiario` huérfano.
3. **Pruebas de Integridad Referencial**:
   * Intentar eliminar un `Vehiculo` con órdenes de combustible asociadas y validar que la base de datos retorne un error de restricción (`foreign key violation` / `onDelete: Restrict`) con un status HTTP **409 Conflict**.
