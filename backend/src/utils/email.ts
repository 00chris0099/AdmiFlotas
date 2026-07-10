// ============================================================
// SAF Backend - Email Service (Nodemailer)
// ============================================================

import nodemailer from "nodemailer";
import { env } from "../config/env.js";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: false,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<void> {
  try {
    await transporter.sendMail({
      from: env.SMTP_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    console.log(`Email sent to ${options.to}`);
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}

export function generatePasswordResetEmail(token: string, userName: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1e40af; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .button { 
          display: inline-block; 
          background: #1e40af; 
          color: white; 
          padding: 12px 24px; 
          text-decoration: none; 
          border-radius: 6px;
          margin: 20px 0;
        }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>SAF - Sistema de Administración de Flotas</h1>
        </div>
        <div class="content">
          <h2>Hola ${userName},</h2>
          <p>Recibimos una solicitud para restablecer tu contraseña.</p>
          <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/confirmar-usuario?token=${token}&tipo=CAMBIO_PASSWORD" class="button">
            Restablecer Contraseña
          </a>
          <p>Este enlace expirará en 1 hora.</p>
          <p>Si no solicitaste este cambio, puedes ignorar este mensaje.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} SAF Flotas - Sistema de Administración de Flotas</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function generateUserConfirmationEmail(token: string, userName: string, email: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #059669; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .button { 
          display: inline-block; 
          background: #059669; 
          color: white; 
          padding: 12px 24px; 
          text-decoration: none; 
          border-radius: 6px;
          margin: 20px 0;
        }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>SAF - Bienvenido al Sistema</h1>
        </div>
        <div class="content">
          <h2>Hola ${userName},</h2>
          <p>Tu cuenta ha sido creada exitosamente.</p>
          <p>Haz clic en el siguiente botón para confirmar tu cuenta y establecer tu contraseña:</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/confirmar-usuario?token=${token}&tipo=CONFIRMACION_USUARIO&email=${encodeURIComponent(email)}" class="button">
            Confirmar Cuenta
          </a>
          <p>Este enlace expirará en 24 horas.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} SAF Flotas - Sistema de Administración de Flotas</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
