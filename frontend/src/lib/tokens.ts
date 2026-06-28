import crypto from "crypto";

export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Mínimo 8 caracteres");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Al menos 1 mayúscula");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Al menos 1 minúscula");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Al menos 1 número");
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Al menos 1 carácter especial (!@#$%^&*)");
  }

  return { valid: errors.length === 0, errors };
}

export function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;

  if (score <= 2) return { score, label: "Débil", color: "rose" };
  if (score <= 4) return { score, label: "Media", color: "amber" };
  return { score, label: "Fuerte", color: "emerald" };
}
