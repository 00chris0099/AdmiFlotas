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

export function buildConfirmarUsuarioEmail(nombre: string, token: string): { subject: string; html: string } {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const link = `${baseUrl}/confirmar-usuario?token=${token}`;

  return {
    subject: "SAF Flotas - Confirma tu cuenta y crea tu contraseña",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #e2e8f0; margin: 0; padding: 40px 20px; }
          .container { max-width: 500px; margin: 0 auto; background: #1e293b; border-radius: 16px; padding: 40px; border: 1px solid #334155; }
          .logo { text-align: center; font-size: 48px; margin-bottom: 16px; }
          h1 { text-align: center; font-size: 22px; color: #f8fafc; margin: 0 0 8px; }
          p { text-align: center; color: #94a3b8; font-size: 14px; line-height: 1.6; }
          .btn { display: block; width: 100%; padding: 14px; background: #10b981; color: #022c22; text-align: center; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px; margin: 24px 0; }
          .note { background: #0f172a; border-radius: 8px; padding: 16px; margin-top: 20px; }
          .note p { text-align: left; font-size: 12px; color: #64748b; margin: 0; }
          .footer { text-align: center; margin-top: 24px; font-size: 11px; color: #475569; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">🚛</div>
          <h1>SAF - Sistema de Administración de Flotas</h1>
          <p>Hola <strong style="color:#e2e8f0">${nombre}</strong>, tu cuenta ha sido creada por el administrador del sistema.</p>
          <p>Haz clic en el siguiente botón para confirmar tu cuenta y crear tu contraseña:</p>
          <a href="${link}" class="btn">Confirmar cuenta y crear contraseña</a>
          <div class="note">
            <p>Este enlace expira en 24 horas. Si no solicitaste esta cuenta, puedes ignorar este correo.</p>
          </div>
          <div class="footer">SAF Flotas &copy; ${new Date().getFullYear()} - Manual F1T02</div>
        </div>
      </body>
      </html>
    `,
  };
}

export function buildCambioPasswordEmail(nombre: string, token: string): { subject: string; html: string } {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const link = `${baseUrl}/cambiar-password?token=${token}`;

  return {
    subject: "SAF Flotas - Cambia tu contraseña",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #e2e8f0; margin: 0; padding: 40px 20px; }
          .container { max-width: 500px; margin: 0 auto; background: #1e293b; border-radius: 16px; padding: 40px; border: 1px solid #334155; }
          .logo { text-align: center; font-size: 48px; margin-bottom: 16px; }
          h1 { text-align: center; font-size: 22px; color: #f8fafc; margin: 0 0 8px; }
          p { text-align: center; color: #94a3b8; font-size: 14px; line-height: 1.6; }
          .btn { display: block; width: 100%; padding: 14px; background: #6366f1; color: #ffffff; text-align: center; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px; margin: 24px 0; }
          .note { background: #0f172a; border-radius: 8px; padding: 16px; margin-top: 20px; }
          .note p { text-align: left; font-size: 12px; color: #64748b; margin: 0; }
          .footer { text-align: center; margin-top: 24px; font-size: 11px; color: #475569; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">🔒</div>
          <h1>SAF - Cambio de Contraseña</h1>
          <p>Hola <strong style="color:#e2e8f0">${nombre}</strong>, solicitaste cambiar tu contraseña.</p>
          <p>Haz clic en el siguiente botón para establecer una nueva contraseña:</p>
          <a href="${link}" class="btn">Cambiar mi contraseña</a>
          <div class="note">
            <p>Este enlace expira en 1 hora. Si no solicitaste este cambio, contacta al administrador.</p>
          </div>
          <div class="footer">SAF Flotas &copy; ${new Date().getFullYear()} - Manual F1T02</div>
        </div>
      </body>
      </html>
    `,
  };
}
