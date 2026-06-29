import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error("Error enviando correo:", error);
    return false;
  }
}

function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "https://aimachristian-administraciondeflotas.ajcxjb.easypanel.host";
}

export function buildConfirmarUsuarioEmail(nombre: string, token: string): { subject: string; html: string } {
  const link = `${getAppUrl()}/confirmar-usuario?token=${token}`;

  return {
    subject: "SAF Flotas - Confirma tu cuenta y crea tu contraseña",
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#0f172a;color:#e2e8f0;margin:0;padding:40px 20px;">
        <div style="max-width:500px;margin:0 auto;background:#1e293b;border-radius:16px;padding:40px;border:1px solid #334155;">
          <div style="text-align:center;font-size:48px;margin-bottom:16px;">🚛</div>
          <h1 style="text-align:center;font-size:22px;color:#f8fafc;margin:0 0 8px;">SAF - Sistema de Administración de Flotas</h1>
          <p style="text-align:center;color:#94a3b8;font-size:14px;line-height:1.6;">Hola <strong style="color:#e2e8f0">${nombre}</strong>, tu cuenta ha sido creada por el administrador.</p>
          <p style="text-align:center;color:#94a3b8;font-size:14px;">Haz clic en el botón para confirmar tu cuenta y crear tu contraseña:</p>
          <a href="${link}" style="display:block;width:100%;padding:14px;background:#10b981;color:#022c22;text-align:center;text-decoration:none;border-radius:10px;font-weight:700;font-size:14px;margin:24px 0;">Confirmar cuenta y crear contraseña</a>
          <div style="background:#0f172a;border-radius:8px;padding:16px;margin-top:20px;"><p style="text-align:left;font-size:12px;color:#64748b;margin:0;">Este enlace expira en 24 horas. Si no solicitaste esta cuenta, puedes ignorar este correo.</p></div>
          <div style="text-align:center;margin-top:24px;font-size:11px;color:#475569;">SAF Flotas &copy; ${new Date().getFullYear()}</div>
        </div>
      </body>
      </html>
    `,
  };
}

export function buildCambioPasswordEmail(nombre: string, token: string): { subject: string; html: string } {
  const link = `${getAppUrl()}/cambiar-password?token=${token}`;

  return {
    subject: "SAF Flotas - Cambia tu contraseña",
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#0f172a;color:#e2e8f0;margin:0;padding:40px 20px;">
        <div style="max-width:500px;margin:0 auto;background:#1e293b;border-radius:16px;padding:40px;border:1px solid #334155;">
          <div style="text-align:center;font-size:48px;margin-bottom:16px;">🔒</div>
          <h1 style="text-align:center;font-size:22px;color:#f8fafc;margin:0 0 8px;">SAF - Cambio de Contraseña</h1>
          <p style="text-align:center;color:#94a3b8;font-size:14px;">Hola <strong style="color:#e2e8f0">${nombre}</strong>, solicitaste cambiar tu contraseña.</p>
          <p style="text-align:center;color:#94a3b8;font-size:14px;">Haz clic en el botón para establecer una nueva contraseña:</p>
          <a href="${link}" style="display:block;width:100%;padding:14px;background:#6366f1;color:#ffffff;text-align:center;text-decoration:none;border-radius:10px;font-weight:700;font-size:14px;margin:24px 0;">Cambiar mi contraseña</a>
          <div style="background:#0f172a;border-radius:8px;padding:16px;margin-top:20px;"><p style="text-align:left;font-size:12px;color:#64748b;margin:0;">Este enlace expira en 1 hora. Si no solicitaste este cambio, contacta al administrador.</p></div>
          <div style="text-align:center;margin-top:24px;font-size:11px;color:#475569;">SAF Flotas &copy; ${new Date().getFullYear()}</div>
        </div>
      </body>
      </html>
    `,
  };
}

export function buildRecuperarPasswordEmail(nombre: string, token: string): { subject: string; html: string } {
  const link = `${getAppUrl()}/cambiar-password?token=${token}`;

  return {
    subject: "SAF Flotas - Recupera tu contraseña",
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#0f172a;color:#e2e8f0;margin:0;padding:40px 20px;">
        <div style="max-width:500px;margin:0 auto;background:#1e293b;border-radius:16px;padding:40px;border:1px solid #334155;">
          <div style="text-align:center;font-size:48px;margin-bottom:16px;">🔑</div>
          <h1 style="text-align:center;font-size:22px;color:#f8fafc;margin:0 0 8px;">SAF - Recuperación de Contraseña</h1>
          <p style="text-align:center;color:#94a3b8;font-size:14px;">Hola <strong style="color:#e2e8f0">${nombre}</strong>, solicitaste recuperar tu contraseña.</p>
          <p style="text-align:center;color:#94a3b8;font-size:14px;">Haz clic en el botón para crear una nueva contraseña:</p>
          <a href="${link}" style="display:block;width:100%;padding:14px;background:#f59e0b;color:#000000;text-align:center;text-decoration:none;border-radius:10px;font-weight:700;font-size:14px;margin:24px 0;">Restablecer mi contraseña</a>
          <div style="background:#0f172a;border-radius:8px;padding:16px;margin-top:20px;"><p style="text-align:left;font-size:12px;color:#64748b;margin:0;">Este enlace expira en 1 hora. Si no solicitaste esta recuperación, contacta al administrador.</p></div>
          <div style="text-align:center;margin-top:24px;font-size:11px;color:#475569;">SAF Flotas &copy; ${new Date().getFullYear()}</div>
        </div>
      </body>
      </html>
    `,
  };
}
