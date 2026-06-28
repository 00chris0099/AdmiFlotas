# Auditoría Frontend + Plan: Login 100% Funcional

## [S1] Problema

El proyecto SAF (Sistema de Administración de Flotas) tiene un frontend Next.js 16 con 13 páginas y 13 API routes. El login funciona a nivel funcional pero tiene problemas críticos que impiden el build de producción y dejan la seguridad comprometida.

## [S2] Hallazgos de la Auditoría

### CRÍTICO: Build de Producción FALLA
- **Causa**: Turbopack panic con caracteres Unicode en la ruta del proyecto (`Administración de flotas`)
- **Error**: `start byte index 33 is not a char boundary; it is inside 'ó'`
- **Impacto**: No se puede hacer `next build` ni desplegar a producción
- **Solución**: Mover el proyecto a una ruta sin caracteres especiales, o renombrar la carpeta

### SEGURIDAD: Login con Bypass
- `route.ts:32-33`: Contraseña maestra `saf123` aceptada para CUALQUIER usuario
- `route.ts:32`: `usuario.password.includes(password)` — comparación insegura
- `route.ts:40`: JWT secret hardcoded como fallback
- **Impacto**: Cualquiera puede entrar con `saf123` sin importar la contraseña real

### MIDDLEWORK: Deprecado en Next.js 16
- El `middleware.ts` usa la convención deprecated
- Next.js 16 recomienda usar `proxy` en su lugar
- Funciona pero generará warnings

### ESLINT: 25+ errores `no-explicit-any`
- Todos los API routes y varios componentes usan `any` explícito
- No bloquean el build pero son technical debt

### FUNCIONAL: Todo conectado
- Todas las páginas tienen sus API routes correspondientes
- Login → JWT → Cookie → Middleware RBAC funciona end-to-end
- AuthProvider maneja estado correctamente
- Sidebar filtra menú por rol

### GAPS identificados (no urgentes)
- Sin CRUD de vehículos (solo lectura)
- Sin PATCH para cambiar estado de órdenes de mantenimiento
- Sin PATCH para conductores (editar/desactivar)
- Sin DELETE en ninguna entidad
- Sin tests unitarios ni de integración

## [S3] Plan de Implementación — Login 100% Funcional

### Fase 1: Resolver Build (CRÍTICO)
1. **Renombrar carpeta del proyecto** a `saf-flotas` (sin caracteres especiales)
   - Actualizar todas las referencias internas si las hay
   - Verificar que `next build` funciona después del rename
   - Verificar que el `.next` cache se limpia correctamente

### Fase 2: Login Seguro
2. **Mejorar endpoint de login** (`api/auth/login/route.ts`):
   - Eliminar el bypass `saf123` hardcoded
   - Implementar hash de contraseñas con `bcrypt` (agregar dependencia)
   - Validar contraseña hasheada contra la base de datos
   - JWT secret desde variable de entorno sin fallback
   - Agregar rate limiting básico (intentos fallidos)
   - Mejorar mensajes de error (no revelar si el usuario existe)

3. **Seed con contraseñas hasheadas** (`prisma/seed.ts`):
   - Generar hashes bcrypt para todas las contraseñas del seed
   - Actualizar el seed para guardar contraseñas hasheadas

### Fase 3: Login UX Completo
4. **Mejorar la experiencia de login**:
   - Mostrar errores inline en vez de `alert()`
   - Agregar estado de carga visual en el botón
   - Redirigir a la página anterior después del login (no siempre a `/`)
   - Recordar URL solicitada antes del redirect al login

5. **Cerrar sesión robusto**:
   - Invalidar token en el servidor (endpoint `/api/auth/logout`)
   - Limpiar cookies HttpOnly (no solo document.cookie)
   - Redirigir al login después del logout

### Fase 4: Protección de API Routes
6. **Validar JWT en todas las API routes**:
   - Crear middleware/helper `withAuth` que verifique el token
   - Aplicar a todas las rutas protegidas
   - Verificar permisos por rol en el servidor (no solo en el middleware del navegador)

### Fase 5: Verificación
7. **Testing manual del flujo completo**:
   - Login con credenciales correctas → redirect a dashboard
   - Login con credenciales incorrectes → error inline
   - Login con `saf123` → DEBE fallar (ya no hay bypass)
   - Logout → cookie eliminada → redirect a login
   - Acceso a ruta protegida sin token → redirect a login
   - Acceso a ruta no autorizada → redirect a unauthorized
   - RBAC: conductor no puede acceder a configuración
   - RBAC: mecánico no puede acceder a reportes KPI

8. **Build de producción**:
   - `next build` debe completar sin errores
   - `next start` debe funcionar correctamente

## [S4] Dependencias a Agregar
- `bcryptjs` (o `bcrypt`) — hash de contraseñas
- `@types/bcryptjs` — tipos TypeScript

## [S5] Archivos a Modificar
- `frontend/src/app/api/auth/login/route.ts` — login seguro
- `frontend/src/components/providers/AuthProvider.tsx` — logout robusto
- `frontend/src/app/login/page.tsx` — UX de errores
- `frontend/src/middleware.ts` — evaluar migración a proxy
- `frontend/src/app/api/auth/logout/route.ts` — NUEVO endpoint
- `frontend/src/lib/auth.ts` — NUEVO helper withAuth
- `frontend/package.json` — agregar bcryptjs
- `prisma/seed.ts` — contraseñas hasheadas

## [S6] Criterios de Aceptación
- [ ] `next build` completa sin errores
- [ ] Login acepta solo credenciales válidas (no bypass `saf123`)
- [ ] Errores de login se muestran inline, no en alert()
- [ ] JWT tiene expiración y se valida en el servidor
- [ ] Logout invalida la sesión y limpia cookies
- [ ] RBAC funciona: roles restringidos no acceden a módulos no autorizados
- [ ] Flujo completo: login → dashboard → módulo → logout funciona end-to-end
