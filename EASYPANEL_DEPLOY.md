# ============================================================
# Guía de Despliegue - EasyPanel
# ============================================================

## Prerrequisitos

1. Cuenta en EasyPanel con acceso a un servidor
2. Dominio configurado: `aimachristian-administraciondeflotas.ajcxjb.easypanel.host`
3. Puerto 80/443 disponible

## Pasos de Despliegue

### 1. Subir el código al servidor

```bash
# En tu máquina local
git add .
git commit -m "feat: add production deployment config"
git push origin main
```

### 2. En EasyPanel - Crear nuevo proyecto

1. Ve a **Projects** → **New Project**
2. Selecciona **Docker Compose**
3. Nombre: `saf-administracion-flotas`
4. Conecta tu repositorio de GitHub

### 3. Configurar variables de entorno en EasyPanel

En la sección **Environment Variables** agrega:

```env
# Seguridad (genera uno seguro)
DB_PASSWORD=tu_password_seguro_aqui
JWT_SECRET=tu_jwt_secret_minimo_32_caracteres_aqui

# Dominio
CORS_ORIGIN=https://aimachristian-administraciondeflotas.ajcxjb.easypanel.host

# Email (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password
SMTP_FROM=SAF Flotas <tu-email@gmail.com>
```

### 4. Configurar el build

En EasyPanel, configura:

- **Build Context**: `.` (raíz del repo)
- **Compose File**: `docker-compose.prod.yml`

### 5. Configurar puertos/servicios

EasyPanel expone automáticamente los puertos. Asegúrate de que:

- Servicio `nginx` expone puerto **80**
- El dominio apunte al servidor

### 6. Variables de entorno del Frontend

El frontend necesita estas variables en el **build time**:

```env
NEXT_PUBLIC_API_URL=/api
```

### 7. Desplegar

1. Haz click en **Deploy**
2. Espera a que termine el build
3. Verifica los logs de cada servicio

## Verificación

### Health Check
```bash
curl https://aimachristian-administraciondeflotas.ajcxjb.easypanel.host/api/health
```

Esperado:
```json
{"status":"ok","timestamp":"2026-07-11T..."}
```

### Root Response
```bash
curl https://aimachristian-administraciondeflotas.ajcxjb.easypanel.host/
```

Esperado:
```json
{
  "name": "SAF - Sistema de Administración de Flotas",
  "version": "1.0.0",
  "docs": "/api/docs",
  "health": "/api/health"
}
```

## Troubleshooting

### Error 402 "upstream prematurely closed connection"
- Verifica que el frontend esté corriendo
- Revisa los logs del contenedor `saf_frontend`

### Error CORS
- Verifica que `CORS_ORIGIN` coincida exactamente con tu dominio
- Incluye `https://` y sin trailing slash

### Base de datos no conecta
- Verifica que `DB_PASSWORD` sea el mismo en todos los servicios
- Espera a que el healthcheck de PostgreSQL pase

### Frontend no encuentra API
- Verifica que `NEXT_PUBLIC_API_URL=/api` esté en el build
- El frontend debe estar detrás de nginx

## Comandos útiles

```bash
# Ver logs
docker compose logs -f nginx
docker compose logs -f backend
docker compose logs -f frontend

# Reiniciar un servicio
docker compose restart backend

# Entrar al contenedor
docker exec -it saf_backend sh
docker exec -it saf_frontend sh
```
