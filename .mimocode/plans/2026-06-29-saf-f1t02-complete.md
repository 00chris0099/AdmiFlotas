# SAF F1T02 Complete Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use compose:subagent (recommended) or compose:execute to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the complete SAF system with 13 roles, 5 modules, and 20+ submodules according to the F1T02 manual.

**Architecture:** Next.js 16 frontend with API routes as backend, Prisma ORM 7.8 with PostgreSQL, JWT auth with RBAC middleware.

**Tech Stack:** Next.js 16, React 19, TypeScript, Prisma 7.8, PostgreSQL, Tailwind CSS 4, bcryptjs, jsonwebtoken

## Global Constraints

- Node.js 18+ (recommended 24+)
- PostgreSQL 16+
- All API routes use `withAuth()` wrapper
- All frontend pages use `fetchWithAuth()` utility
- Forms follow F1T02 official format
- Digital signatures: name + timestamp
- RBAC enforced at middleware + API + component level

---

## Phase 1: Roles and Security Base

### Task 1: Update Prisma Schema with All 13 Roles

**Covers:** [S2]

**Files:**
- Modify: `prisma/schema/conductores.prisma` — Update `RolUsuario` enum

- [ ] **Step 1: Update the RolUsuario enum**

```prisma
enum RolUsuario {
  // General
  JEFE_PROCESO
  
  // Equipo de Operación
  JEFE_OPERACION
  ENCARGADO_GARAJE
  INSPECTOR
  CONTROLADOR_TRANSITO
  ANALISTA
  CONDUCTOR
  
  // Equipo de Mantenimiento
  JEFE_MANTENIMIENTO
  ENCARGADO_TALLER
  MECANICO
  ELECTRICISTA
  REENCAUCHADOR
  LAVADOR
  
  // Apoyo Administrativo
  ADMINISTRATIVO
}
```

- [ ] **Step 2: Run prisma db push**

```bash
npx prisma db push
npx prisma generate
```

- [ ] **Step 3: Update middleware RBAC for new roles**

File: `frontend/src/middleware.ts`

Add routes for new roles:
- `/mantenimiento/almacen` → JEFE_MANTENIMIENTO, ENCARGADO_TALLER, MECANICO, ADMINISTRATIVO
- `/mantenimiento/lavado` → JEFE_MANTENIMIENTO, LAVADOR, ADMINISTRATIVO
- `/operaciones/rutas` → JEFE_OPERACION, CONTROLADOR_TRANSITO, ADMINISTRATIVO
- `/flota/asignacion` → JEFE_PROCESO, JEFE_OPERACION, ADMINISTRATIVO
- `/flota/documentos` → JEFE_PROCESO, ADMINISTRATIVO
- `/seguridad/*` → JEFE_PROCESO only

- [ ] **Step 4: Update Sidebar with new roles**

File: `frontend/src/components/layout/Sidebar.tsx`

Add menu items for new modules and update role arrays.

- [ ] **Step 5: Commit**

```bash
git add prisma/schema/conductores.prisma frontend/src/middleware.ts frontend/src/components/layout/Sidebar.tsx
git commit -m "feat: add all 13 F1T02 roles to Prisma schema and update RBAC"
```

---

### Task 2: Complete User Management CRUD

**Covers:** [S3]

**Files:**
- Modify: `frontend/src/app/api/admin/usuarios/route.ts` — Add GET all roles
- Modify: `frontend/src/app/api/admin/usuarios/[id]/route.ts` — Add PUT with role validation
- Modify: `frontend/src/app/configuracion/gestion-usuarios/page.tsx` — Add all roles to form

- [ ] **Step 1: Update GET endpoint to include all roles**

File: `frontend/src/app/api/admin/usuarios/route.ts`

```typescript
// Add to the select clause
select: {
  id: true,
  nombre: true,
  apellido: true,
  email: true,
  rol: true,
  activo: true,
  telefono: true,
  especialidad: true,
  ultimoAcceso: true,
  creadoEn: true,
}
```

- [ ] **Step 2: Update user creation form with all roles**

File: `frontend/src/app/configuracion/gestion-usuarios/page.tsx`

Add all 13 roles to the select dropdown:
```typescript
const ROLES = [
  { value: "JEFE_PROCESO", label: "Jefe del Proceso", color: "indigo" },
  { value: "JEFE_OPERACION", label: "Jefe de Operación", color: "blue" },
  { value: "ENCARGADO_GARAJE", label: "Encargado de Garaje", color: "cyan" },
  { value: "INSPECTOR", label: "Inspector de Flota", color: "teal" },
  { value: "CONTROLADOR_TRANSITO", label: "Controlador de Tráfico", color: "sky" },
  { value: "ANALISTA", label: "Analista de Costos", color: "violet" },
  { value: "CONDUCTOR", label: "Conductor", color: "amber" },
  { value: "JEFE_MANTENIMIENTO", label: "Jefe de Mantenimiento", color: "blue" },
  { value: "ENCARGADO_TALLER", label: "Encargado de Taller", color: "indigo" },
  { value: "MECANICO", label: "Mecánico", color: "pink" },
  { value: "ELECTRICISTA", label: "Eléctrico", color: "purple" },
  { value: "REENCAUCHADOR", label: "Reencauchador", color: "orange" },
  { value: "LAVADOR", label: "Lavador", color: "lime" },
  { value: "ADMINISTRATIVO", label: "Administrativo", color: "emerald" },
];
```

- [ ] **Step 3: Add especialidad field to user form**

```tsx
<div>
  <label className="text-[10px] font-semibold text-slate-400 uppercase">Especialidad</label>
  <input type="text" value={especialidad} onChange={(e) => setEspecialidad(e.target.value)} 
    className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm" />
</div>
```

- [ ] **Step 4: Test user creation with each role**

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/api/admin/usuarios/ frontend/src/app/configuracion/gestion-usuarios/page.tsx
git commit -m "feat: complete user management with all 13 F1T02 roles"
```

---

## Phase 2: Module Flota

### Task 3: Vehicle Assignment Submodule

**Covers:** [S3]

**Files:**
- Create: `prisma/schema/flota.prisma` — Add AsignacionVehiculo model
- Create: `frontend/src/app/api/flota/asignacion/route.ts` — GET/POST/DELETE
- Create: `frontend/src/app/flota/asignacion/page.tsx` — Assignment page

- [ ] **Step 1: Create AsignacionVehiculo model**

```prisma
model AsignacionVehiculo {
  id              String    @id @default(uuid())
  vehiculoId      String    @map("vehiculo_id")
  conductorId     String    @map("conductor_id")
  sectorAsignado  String    @map("sector_asignado") @db.VarChar(150)
  fechaAsignacion DateTime  @default(now()) @map("fecha_asignacion")
  fechaFin        DateTime? @map("fecha_fin")
  activa          Boolean   @default(true)
  observaciones   String?
  creadoEn        DateTime  @default(now()) @map("creado_en")
  
  vehiculo  Vehiculo @relation(fields: [vehiculoId], references: [id])
  conductor Usuario  @relation(fields: [conductorId], references: [id])
  
  @@index([vehiculoId])
  @@index([conductorId])
  @@index([activa])
  @@map("asignaciones_vehiculos")
}
```

- [ ] **Step 2: Create API route**

File: `frontend/src/app/api/flota/asignacion/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { withAuth } from "@/lib/withAuth";

export const dynamic = "force-dynamic";

export const GET = withAuth(async (request: NextRequest) => {
  const prisma = getPrisma();
  const asignaciones = await prisma.asignacionVehiculo.findMany({
    where: { activa: true },
    include: { vehiculo: true, conductor: true },
    orderBy: { fechaAsignacion: "desc" },
  });
  return NextResponse.json(asignaciones);
}, { requiredRoles: ["JEFE_PROCESO", "JEFE_OPERACION", "ADMINISTRATIVO"] });

export const POST = withAuth(async (request: NextRequest) => {
  const body = await request.json();
  const prisma = getPrisma();
  
  // Desactivar asignación anterior del vehículo
  await prisma.asignacionVehiculo.updateMany({
    where: { vehiculoId: body.vehiculoId, activa: true },
    data: { activa: false, fechaFin: new Date() },
  });
  
  const asignacion = await prisma.asignacionVehiculo.create({ data: body });
  return NextResponse.json(asignacion, { status: 201 });
}, { requiredRoles: ["JEFE_PROCESO", "JEFE_OPERACION"] });
```

- [ ] **Step 3: Create assignment page**

File: `frontend/src/app/flota/asignacion/page.tsx`

Full CRUD page with:
- Table of active assignments
- Form to create new assignment
- Vehicle selector with code + plate
- Conductor selector
- Sector and locality fields

- [ ] **Step 4: Run prisma db push**

```bash
npx prisma db push
npx prisma generate
```

- [ ] **Step 5: Test assignment creation**

- [ ] **Step 6: Commit**

```bash
git add prisma/schema/flota.prisma frontend/src/app/api/flota/ frontend/src/app/flota/
git commit -m "feat: add vehicle assignment submodule"
```

---

### Task 4: Vehicle Documents Submodule

**Covers:** [S3]

**Files:**
- Create: `prisma/schema/flota.prisma` — Add DocumentoVehiculo model
- Create: `frontend/src/app/api/flota/documentos/route.ts`
- Create: `frontend/src/app/flota/documentos/page.tsx`

- [ ] **Step 1: Create DocumentoVehiculo model**

```prisma
model DocumentoVehiculo {
  id              String      @id @default(uuid())
  vehiculoId      String      @map("vehiculo_id")
  tipoDocumento   TipoDocumento @map("tipo_documento")
  numeroDocumento String      @map("numero_documento") @db.VarChar(50)
  fechaEmision    DateTime    @map("fecha_emision")
  fechaVencimiento DateTime?  @map("fecha_vencimiento")
  entidadEmisora  String?     @map("entidad_emisora") @db.VarChar(150)
  observaciones   String?
  creadoEn        DateTime    @default(now()) @map("creado_en")
  
  vehiculo Vehiculo @relation(fields: [vehiculoId], references: [id])
  
  @@index([vehiculoId])
  @@index([tipoDocumento])
  @@index([fechaVencimiento])
  @@map("documentos_vehiculo")
}

enum TipoDocumento {
  LICENCIA
  SOAT
  REVISION_TECNICA
  SEGURO
  TARJETA_PROPIEDAD
  OTRO
}
```

- [ ] **Step 2: Create API route with document management**

- [ ] **Step 3: Create documents page with expiration alerts**

- [ ] **Step 4: Run prisma db push**

- [ ] **Step 5: Commit**

---

## Phase 3: Module Operations

### Task 5: Complete MA 122 01 01 with Digital Signatures

**Covers:** [S3]

**Files:**
- Modify: `prisma/schema/movimientos_diarios.prisma` — Add signature fields
- Modify: `frontend/src/app/api/movimientos_diarios/route.ts` — Add signature handling
- Modify: `frontend/src/app/movimientos_diarios/page.tsx` — Add signature form

- [ ] **Step 1: Add signature fields to MovimientoDiario**

```prisma
// Add to MovimientoDiario model
firmaConductor     String?  @map("firma_conductor") @db.VarChar(100)
firmaInspector     String?  @map("firma_inspector") @db.VarChar(100)
firmaEncargadoGaraje String? @map("firma_encargado_garaje") @db.VarChar(100)
firmaJefeOperacion String?  @map("firma_jefe_operacion") @db.VarChar(100)
fechaFirmaConductor DateTime? @map("fecha_firma_conductor")
fechaFirmaInspector DateTime? @map("fecha_firma_inspector")
```

- [ ] **Step 2: Update API to handle signatures**

- [ ] **Step 3: Update form with signature fields**

- [ ] **Step 4: Commit**

---

### Task 6: Route Programming Submodule

**Covers:** [S3]

**Files:**
- Create: `prisma/schema/operacion.prisma` — Add Ruta model
- Create: `frontend/src/app/api/operaciones/rutas/route.ts`
- Create: `frontend/src/app/operaciones/rutas/page.tsx`

- [ ] **Step 1: Create Ruta model**

```prisma
model Ruta {
  id              String   @id @default(uuid())
  nombre          String   @db.VarChar(150)
  origen          String   @db.VarChar(200)
  destino         String   @db.VarChar(200)
  distanciaKm     Decimal? @map("distancia_km") @db.Decimal(8, 2)
  tiempoEstimado  String?  @map("tiempo_estimado") @db.VarChar(20)
  activa          Boolean  @default(true)
  creadoEn        DateTime @default(now()) @map("creado_en")
  
  movimientos     MovimientoDiario[]
  
  @@map("rutas")
}

model ProgramacionRuta {
  id              String   @id @default(uuid())
  rutaId          String   @map("ruta_id")
  vehiculoId      String   @map("vehiculo_id")
  conductorId     String   @map("conductor_id")
  fecha           DateTime @db.Date
  horaSalida      String   @map("hora_salida") @db.VarChar(5)
  horaLlegada     String?  @map("hora_llegada") @db.VarChar(5)
  estado          String   @default("PROGRAMADO")
  observaciones   String?
  creadoEn        DateTime @default(now()) @map("creado_en")
  
  ruta     Ruta     @relation(fields: [rutaId], references: [id])
  vehiculo Vehiculo @relation(fields: [vehiculoId], references: [id])
  conductor Usuario @relation(fields: [conductorId], references: [id])
  
  @@index([fecha])
  @@index([vehiculoId])
  @@index([conductorId])
  @@map("programacion_rutas")
}
```

- [ ] **Step 2: Create API routes**

- [ ] **Step 3: Create route programming page**

- [ ] **Step 4: Commit**

---

## Phase 4: Module Maintenance

### Task 7: Complete MA 122 02 01 with Signatures

**Covers:** [S3]

**Files:**
- Modify: `prisma/schema/control_mantenimiento.prisma` — Add signature fields
- Modify: `frontend/src/app/api/control_mantenimiento/route.ts`
- Modify: `frontend/src/app/control_mantenimiento/page.tsx`

- [ ] **Step 1: Add signature fields to OrdenMantenimiento**

```prisma
// Add to OrdenMantenimiento model
firmaEncargadoTaller String?  @map("firma_encargado_taller") @db.VarChar(100)
firmaTecnico         String?  @map("firma_tecnico") @db.VarChar(100)
firmaJefeMantenimiento String? @map("firma_jefe_mantenimiento") @db.VarChar(100)
fechaFirmaTecnico    DateTime? @map("fecha_firma_tecnico")
```

- [ ] **Step 2: Update API and form**

- [ ] **Step 3: Commit**

---

### Task 8: Maintenance Warehouse Submodule

**Covers:** [S3]

**Files:**
- Create: `prisma/schema/mantenimiento.prisma` — Add Repuesto models
- Create: `frontend/src/app/api/mantenimiento/almacen/route.ts`
- Create: `frontend/src/app/mantenimiento/almacen/page.tsx`

- [ ] **Step 1: Create warehouse models**

```prisma
model Repuesto {
  id              String   @id @default(uuid())
  codigo          String   @unique @db.VarChar(50)
  descripcion     String   @db.VarChar(255)
  categoria       String   @db.VarChar(50)
  unidadMedida    String   @default("unidad") @map("unidad_medida") @db.VarChar(30)
  stockActual     Int      @default(0) @map("stock_actual")
  stockMinimo     Int      @default(0) @map("stock_minimo")
  precioUnitario  Decimal? @map("precio_unitario") @db.Decimal(10, 2)
  creadoEn        DateTime @default(now()) @map("creado_en")
  
  @@map("repuestos")
}

model MovimientoAlmacen {
  id              String   @id @default(uuid())
  repuestoId      String   @map("repuesto_id")
  tipoMovimiento  String   @map("tipo_movimiento") // ENTRADA, SALIDA
  cantidad        Int
  ordenMantenimientoId String? @map("orden_mantenimiento_id")
  responsable     String   @db.VarChar(100)
  fecha           DateTime @default(now())
  observaciones   String?
  
  repuesto Repuesto @relation(fields: [repuestoId], references: [id])
  
  @@index([repuestoId])
  @@index([fecha])
  @@map("movimientos_almacen")
}
```

- [ ] **Step 2: Create API routes**

- [ ] **Step 3: Create warehouse page**

- [ ] **Step 4: Commit**

---

### Task 9: Wash Control Submodule

**Covers:** [S3]

**Files:**
- Create: `prisma/schema/mantenimiento.prisma` — Add Lavado model
- Create: `frontend/src/app/api/mantenimiento/lavado/route.ts`
- Create: `frontend/src/app/mantenimiento/lavado/page.tsx`

- [ ] **Step 1: Create wash model**

```prisma
model Lavado {
  id              String   @id @default(uuid())
  vehiculoId      String   @map("vehiculo_id")
  fecha           DateTime @db.Date
  tipoLavado      String   @map("tipo_lavado") // EXTERIOR, INTERIOR, COMPLETO
  costo           Decimal? @db.Decimal(8, 2)
  proveedor       String?  @db.VarChar(150)
  responsable     String?  @db.VarChar(100)
  observaciones   String?
  creadoEn        DateTime @default(now()) @map("creado_en")
  
  vehiculo Vehiculo @relation(fields: [vehiculoId], references: [id])
  
  @@index([vehiculoId])
  @@index([fecha])
  @@map("lavados")
}
```

- [ ] **Step 2: Create API routes**

- [ ] **Step 3: Create wash control page**

- [ ] **Step 4: Commit**

---

## Phase 5: Module Administrative

### Task 10: Complete Cost Control

**Covers:** [S3]

**Files:**
- Verify: `frontend/src/app/api/control_costos/costos-fijo-variable/route.ts`
- Verify: `frontend/src/app/control_costos/costos-fijo-variable/page.tsx`

- [ ] **Step 1: Verify cost CRUD works**

- [ ] **Step 2: Add delete functionality**

- [ ] **Step 3: Test cost creation and deletion**

- [ ] **Step 4: Commit**

---

### Task 11: KPI Indicators

**Covers:** [S3]

**Files:**
- Verify: `frontend/src/app/api/control_costos/reportes-kpi/route.ts`
- Verify: `frontend/src/app/control_costos/reportes-kpi/page.tsx`

- [ ] **Step 1: Verify CKV calculation**

Formula: `CKV = (Costos Fijos + Costos Variables) / Km Totales`

- [ ] **Step 2: Verify IUV calculation**

Formula: `IUV = (Horas Reales / Horas Estándar) × 100`

- [ ] **Step 3: Test with sample data**

- [ ] **Step 4: Commit**

---

## Phase 6: Reports and Security

### Task 12: PDF Generation

**Covers:** [S3]

**Files:**
- Create: `frontend/src/app/api/reportes/pdf/route.ts`
- Install: `jspdf` and `jspdf-autotable` (already in package.json)

- [ ] **Step 1: Create PDF generation endpoint**

```typescript
// Generate PDF for MA 122 01 01
export const POST = withAuth(async (request: NextRequest) => {
  const { movimientoId } = await request.json();
  const prisma = getPrisma();
  
  const movimiento = await prisma.movimientoDiario.findUnique({
    where: { id: movimientoId },
    include: { vehiculo: true, conductor: true, checklist: true },
  });
  
  // Generate PDF with jspdf
  const doc = new jsPDF();
  // Add header, form fields, signatures
  
  return new NextResponse(doc.output("arraybuffer"), {
    headers: { "Content-Type": "application/pdf" },
  });
});
```

- [ ] **Step 2: Create PDF templates for each form**

- [ ] **Step 3: Test PDF generation**

- [ ] **Step 4: Commit**

---

### Task 13: Excel Export

**Covers:** [S3]

**Files:**
- Create: `frontend/src/app/api/reportes/excel/route.ts`
- Already has: `frontend/src/utils/exportUtils.ts`

- [ ] **Step 1: Create Excel export endpoint**

```typescript
import * as XLSX from "xlsx";

export const POST = withAuth(async (request: NextRequest) => {
  const { tipo, filtros } = await request.json();
  const prisma = getPrisma();
  
  let data;
  switch (tipo) {
    case "vehiculos":
      data = await prisma.vehiculo.findMany();
      break;
    case "movimientos":
      data = await prisma.movimientoDiario.findMany({ include: { vehiculo: true } });
      break;
    // ... more cases
  }
  
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Reporte");
  
  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  return new NextResponse(buffer, {
    headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
  });
});
```

- [ ] **Step 2: Add export buttons to all data tables**

- [ ] **Step 3: Test Excel export**

- [ ] **Step 4: Commit**

---

### Task 14: System Audit

**Covers:** [S3]

**Files:**
- Create: `frontend/src/app/api/admin/audit/route.ts`
- Create: `frontend/src/app/seguridad/audit/page.tsx`

- [ ] **Step 1: Create audit query endpoint**

```typescript
export const GET = withAuth(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const modulo = searchParams.get("modulo");
  const fechaInicio = searchParams.get("fechaInicio");
  const fechaFin = searchParams.get("fechaFin");
  
  const prisma = getPrisma();
  const whereClause: any = {};
  if (modulo) whereClause.modulo = modulo;
  if (fechaInicio) whereClause.creadoEn = { gte: new Date(fechaInicio) };
  if (fechaFin) whereClause.creadoEn = { ...whereClause.creadoEn, lte: new Date(fechaFin) };
  
  const auditorias = await prisma.auditoria.findMany({
    where: whereClause,
    include: { usuario: true },
    orderBy: { creadoEn: "desc" },
    take: 100,
  });
  
  return NextResponse.json(auditorias);
}, { requiredRoles: ["JEFE_PROCESO"] });
```

- [ ] **Step 2: Create audit page with filters**

- [ ] **Step 3: Test audit logging**

- [ ] **Step 4: Commit**

---

### Task 15: Session Control

**Covers:** [S3]

**Files:**
- Create: `frontend/src/app/api/admin/sesiones/route.ts`
- Create: `frontend/src/app/seguridad/sesiones/page.tsx`

- [ ] **Step 1: Create session query endpoint**

```typescript
export const GET = withAuth(async (request: NextRequest) => {
  const prisma = getPrisma();
  const sesiones = await prisma.sesionAuth.findMany({
    include: { usuario: true },
    orderBy: { iniciadaEn: "desc" },
    take: 50,
  });
  return NextResponse.json(sesiones);
}, { requiredRoles: ["JEFE_PROCESO"] });

export const DELETE = withAuth(async (request: NextRequest) => {
  const { id } = await request.json();
  const prisma = getPrisma();
  await prisma.sesionAuth.update({
    where: { id },
    data: { estado: "CERRADA", cerradaEn: new Date() },
  });
  return NextResponse.json({ message: "Sesión cerrada" });
}, { requiredRoles: ["JEFE_PROCESO"] });
```

- [ ] **Step 2: Create session management page**

- [ ] **Step 3: Commit**

---

### Task 16: Permissions Management

**Covers:** [S3]

**Files:**
- Create: `frontend/src/app/api/admin/permisos/route.ts`
- Create: `frontend/src/app/seguridad/permisos/page.tsx`

- [ ] **Step 1: Create permissions CRUD endpoint**

- [ ] **Step 2: Create permissions management page**

- [ ] **Step 3: Test permission assignment**

- [ ] **Step 4: Commit**

---

## Phase 7: Dashboard and Final Integration

### Task 17: Visual Dashboard

**Covers:** [S3]

**Files:**
- Modify: `frontend/src/app/page.tsx` — Add dashboard widgets

- [ ] **Step 1: Add KPI cards to main page**

- [ ] **Step 2: Add recent activity feed**

- [ ] **Step 3: Add alerts for maintenance and documents**

- [ ] **Step 4: Commit**

---

### Task 18: Final Testing and Deployment

**Covers:** [S3]

- [ ] **Step 1: Run full TypeScript check**

```bash
npx tsc --noEmit
```

- [ ] **Step 2: Run build**

```bash
npm run build
```

- [ ] **Step 3: Test all API endpoints**

- [ ] **Step 4: Test RBAC for each role**

- [ ] **Step 5: Test all forms with signatures**

- [ ] **Step 6: Commit and push**

```bash
git add .
git commit -m "feat: complete SAF F1T02 system with all roles and modules"
git push origin main
```
