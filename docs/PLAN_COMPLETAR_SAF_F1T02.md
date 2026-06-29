# Plan: Completar Sistema SAF F1T02 al 100%

## Fase 1: Datos Predefinidos Completos

### 1.1 Códigos de Servicio (F1T02)
```typescript
// frontend/src/lib/constants.ts - Agregar
export const CODIGOS_SERVICIO = {
  TRABAJO: [
    { value: "CT", label: "CT - Cambio Total" },
    { value: "CP", label: "CP - Cambio Parcial" },
    { value: "RG", label: "RG - Regulación" },
    { value: "RP", label: "RP - Reparación" },
    { value: "RV", label: "RV - Revisión" },
    { value: "VR", label: "VR - Verificación" },
  ],
  ORGANO: [
    { value: "01", label: "01 - Motor" },
    { value: "02", label: "02 - Frenos" },
    { value: "03", label: "03 - Dirección" },
    { value: "04", label: "04 - Embrague" },
    { value: "05", label: "05 - Suspensión" },
    { value: "06", label: "06 - Transmisión" },
    { value: "07", label: "07 - Diferencial" },
    { value: "08", label: "08 - Eléctrica" },
    { value: "09", label: "09 - Planchado" },
    { value: "10", label: "10 - Pintura" },
    { value: "11", label: "11 - Vidrios" },
    { value: "12", label: "12 - Tapicería" },
    { value: "13", label: "13 - Carrocería" },
    { value: "14", label: "14 - Capota" },
    { value: "15", label: "15 - Ruedas/Llantas" },
  ],
};
```

### 1.2 Conjuntos Substituidos
```typescript
export const CONJUNTOS_SUBSTITUIDOS = [
  "Motor", "Caja de Velocidades", "Diferencial", "Dirección",
  "Embrague", "Suspensión Delantera", "Suspensión Trasera",
  "Frenos Delanteros", "Frenos Traseros", "Amortiguadores",
  "Balatas", "Discos", "Bomba de Agua", "Bomba de Aceite",
  "Alternador", "Marcha", "Batería", "Radiador",
];
```

### 1.3 Marcas y Modelos Completos
```typescript
export const MARCAS_MODELOS: Record<string, string[]> = {
  "TOYOTA": ["HILUX", "COROLLA", "CAMRY", "4RUNNER", "PRADO", "COASTER", "HIACE"],
  "HYUNDAI": ["TUCSON", "SANTA FE", "ACCENT", "i10", "HD78", "PORTER"],
  "KIA": ["SPORTAGE", "SONATA", "PICANTO", "CERATO", "SORENTO"],
  "NISSAN": ["FRONTIER", "SENTRA", "MARCH", "X-TRAIL", "NP300"],
  "CHEVROLET": ["SAIL", "ONIX", "CAPTIVA", "NPR", "TORNADO"],
  "FORD": ["RANGER", "ESCAPE", "ECOSPORT", "TRANSIT"],
  "ISUZU": ["D-MAX", "MU-X", "NPR", "NQR"],
  "MERCEDES-BENZ": ["SPRINTER", "ACTROS", "ATEGO"],
  // ... más marcas
};
```

### 1.4 Subtipos de Combustible (ya implementado)
- ✅ Diésel UBA, 2000, 5000, Máximo Rendimiento
- ✅ Gasolina 84, 90, 95, 98

---

## Fase 2: Números Automáticos de Orden

### 2.1 Generador de Números de Orden
```typescript
// frontend/src/lib/orderGenerator.ts
export function generateNumeroOrden(tipo: "OC" | "OM"): string {
  const year = new Date().getFullYear();
  const counter = getNextCounter(tipo);
  return `${tipo}-${year}-${String(counter).padStart(4, "0")}`;
}

function getNextCounter(tipo: string): number {
  const key = `saf_counter_${tipo}_${new Date().getFullYear()}`;
  const current = parseInt(localStorage.getItem(key) || "0");
  const next = current + 1;
  localStorage.setItem(key, next.toString());
  return next;
}
```

### 2.2 Auto-generar en Formularios
- En `control_combustible/page.tsx`: Auto-generar OC-YYYY-XXXX
- En `control_mantenimiento/page.tsx`: Auto-generar OM-YYYY-XXXX
- En `movimientos_diarios/page.tsx`: Auto-generar MD-YYYY-XXXX

---

## Fase 3: Restricciones de Formularios

### 3.1 Validación de Odómetro
```typescript
// Validar que el odómetro actual sea >= último odómetro registrado
if (kilometrajeActual < ultimoOdometro) {
  errors.push(`El odómetro actual (${kilometrajeActual}) no puede ser menor al último registrado (${ultimoOdometro})`);
}
```

### 3.2 Validación de Fechas de Taller
```typescript
// En control_mantenimiento: fecha entrada < fecha salida
if (fechaEntrada > fechaSalida) {
  errors.push("La fecha de entrada no puede ser posterior a la fecha de salida");
}
```

### 3.3 Validación de Costos
```typescript
// Todos los costos deben ser positivos
if (costoTotal < 0) {
  errors.push("El costo total no puede ser negativo");
}
```

### 3.4 Campos Obligatorios según F1T02
- MA 122 01 01: Vehículo, Conductor, Fecha, Destino
- MA 122 01 02: Vehículo, Conductor, Tipo Combustible, Galones, Km
- MA 122 02 01: Vehículo, Tipo Mantenimiento, Descripción

---

## Fase 4: Lógica de Eventos Automáticos

### 4.1 Al Crear Movimiento Diario
```typescript
// Al crear movimiento → crear checklist automáticamente
if (movimientoCreado) {
  await prisma.checklistVerificacion.create({
    data: {
      movimientoId: movimientoCreado.id,
      documentos: "OK",
      aceiteMotor: "OK",
      // ... todos los 15 puntos en OK por defecto
    }
  });
}
```

### 4.2 Al Completar Movimiento
```typescript
// Al completar movimiento → actualizar odómetro del vehículo
if (movimiento.estado === "COMPLETADO") {
  await prisma.vehiculo.update({
    where: { id: movimiento.vehiculoId },
    data: { kilometrajeActual: movimiento.kilometrajeLlegada }
  });
}
```

### 4.3 Al Completar Mantenimiento
```typescript
// Al completar mantenimiento → actualizar kilometraje
if (orden.estado === "COMPLETADO") {
  await prisma.vehiculo.update({
    where: { id: orden.vehiculoId },
    data: { kilometrajeActual: orden.kilometrajeSalida }
  });
}
```

### 4.4 Al Registrar Combustible
```typescript
// Al registrar combustible → actualizar odómetro
await prisma.vehiculo.update({
  where: { id: orden.vehiculoId },
  data: { kilometrajeActual: orden.kilometrajeActual }
});
```

---

## Fase 5: Completar Módulos al 100%

### 5.1 Módulo Flota (90% → 100%)
- [ ] Agregar campo "periodicidadMantenimientoKm" al formulario de vehículos
- [ ] Agregar campo "vidaUtilAnios" al formulario
- [ ] Agregar campo "seguroAnual" al formulario
- [ ] Agregar campo "licenciamientoAnual" al formulario

### 5.2 Módulo Operaciones (85% → 100%)
- [ ] Auto-generar número de orden
- [ ] Agregar validación de odómetro
- [ ] Agregar firma del Encargado del Garaje en MA 122 01 01
- [ ] Completar formulario MA 122 01 02 con todos los campos F1T02

### 5.3 Módulo Mantenimiento (80% → 100%)
- [ ] Auto-generar número de orden
- [ ] Agregar código de servicio predefinido
- [ ] Agregar conjuntos substituidos predefinidos
- [ ] Completar formulario MA 122 02 01 con todos los campos F1T02
- [ ] Agregar validación de fechas de taller

### 5.4 Módulo Administrativo (85% → 100%)
- [ ] Agregar cálculo automático de costos variables
- [ ] Agregar exportación de reportes mensuales
- [ ] Completar dashboard con gráficos

### 5.5 Módulo Seguridad (75% → 100%)
- [ ] Agregar control de intentos de login
- [ ] Agregar bloqueo de cuenta después de 5 intentos
- [ ] Agregar expiración de sesión automática

---

## Orden de Ejecución

1. **Fase 1**: Datos predefinidos (1-2 horas)
2. **Fase 2**: Números automáticos (1 hora)
3. **Fase 3**: Restricciones de formularios (2 horas)
4. **Fase 4**: Lógica de eventos automáticos (3 horas)
5. **Fase 5**: Completar módulos (4 horas)

**Tiempo total estimado**: 11-12 horas de desarrollo
