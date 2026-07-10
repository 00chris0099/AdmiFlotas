"use client";

import React, { useState } from "react";
import Icon from "@/components/ui/Icon";

function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (password.length < 8) errors.push("Mínimo 8 caracteres");
  if (!/[A-Z]/.test(password)) errors.push("Al menos 1 mayúscula");
  if (!/[a-z]/.test(password)) errors.push("Al menos 1 minúscula");
  if (!/[0-9]/.test(password)) errors.push("Al menos 1 número");
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) errors.push("Al menos 1 carácter especial");
  return { valid: errors.length === 0, errors };
}

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;
  if (password.length >= 12) score++;

  if (score <= 2) return { score, label: "Débil", color: "rose" };
  if (score <= 4) return { score, label: "Media", color: "amber" };
  return { score, label: "Fuerte", color: "emerald" };
}

interface PasswordFormProps {
  token: string;
  onSubmit: (token: string, password: string) => Promise<{ message: string }>;
  title: string;
  subtitle: string;
  icon: string;
  buttonLabel: string;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export default function PasswordForm({
  token,
  onSubmit,
  title,
  subtitle,
  icon,
  buttonLabel,
  onSuccess,
  onError,
}: PasswordFormProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const validation = validatePassword(password);
  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    if (password !== confirmPassword) {
      setErrors(["Las contraseñas no coinciden"]);
      return;
    }

    setSubmitting(true);
    try {
      const data = await onSubmit(token, password);
      onSuccess(data.message);
    } catch (err: any) {
      onError(err.message || "Error de conexión");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-4 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-emerald-500/10 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-blue-500/10 blur-[120px]" />

      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-3xl mb-2">
            <Icon name={icon} size={32} />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">{title}</h2>
          <p className="text-xs text-slate-400">{subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Nueva contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors([]); }}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm focus:outline-none transition pr-10"
                required
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
              >
                {showPassword ? <Icon name="eye-hide" size={14} /> : <Icon name="eye" size={14} />}
              </button>
            </div>
          </div>

          {password && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-400">Fortaleza:</span>
                <span className={`font-bold text-${strength.color}-400`}>{strength.label}</span>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition ${
                      i <= strength.score
                        ? strength.color === "emerald"
                          ? "bg-emerald-500"
                          : strength.color === "amber"
                          ? "bg-amber-500"
                          : "bg-rose-500"
                        : "bg-slate-800"
                    }`}
                  />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-1">
                {[
                  { check: password.length >= 8, label: "8+ caracteres" },
                  { check: /[A-Z]/.test(password), label: "1 mayúscula" },
                  { check: /[a-z]/.test(password), label: "1 minúscula" },
                  { check: /[0-9]/.test(password), label: "1 número" },
                  { check: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password), label: "1 especial" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`text-[9px] flex items-center gap-1 ${item.check ? "text-emerald-400" : "text-slate-500"}`}
                  >
                    <span>{item.check ? "✓" : "○"}</span>
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Confirmar contraseña
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setErrors([]); }}
              placeholder="••••••••"
              className={`w-full bg-slate-950 border rounded-xl px-4 py-3 text-sm focus:outline-none transition ${
                confirmPassword && password !== confirmPassword
                  ? "border-rose-500 focus:border-rose-500"
                  : "border-slate-800 focus:border-emerald-500"
              }`}
              required
            />
            {confirmPassword && password !== confirmPassword && (
              <p className="text-[10px] text-rose-400 mt-1">Las contraseñas no coinciden</p>
            )}
          </div>

          {errors.length > 0 && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 space-y-1">
              {errors.map((err) => (
                <p key={err} className="text-[10px] text-rose-400">• {err}</p>
              ))}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !validation.valid || password !== confirmPassword}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold rounded-xl transition duration-150 shadow-lg text-sm"
          >
            {submitting ? "Procesando..." : buttonLabel}
          </button>
        </form>
      </div>
    </div>
  );
}
