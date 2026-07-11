# ============================================================
# Variables de Entorno para EasyPanel
# Copiar estos valores al panel de EasyPanel → Environment Variables
# ============================================================

# ─── Seguridad (OBLIGATORIO - generar valores únicos) ───
DB_PASSWORD=aqui_tu_password_seguro
JWT_SECRET=aqui_tu_jwt_secret_minimo_32_caracteres

# ─── Dominio (ya configurado) ───
CORS_ORIGIN=https://aimachristian-administraciondeflotas.ajcxjb.easypanel.host

# ─── Email (opcional) ───
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password
SMTP_FROM=SAF Flotas <tu-email@gmail.com>

# ─── Frontend Build Args ───
NEXT_PUBLIC_API_URL=/api
