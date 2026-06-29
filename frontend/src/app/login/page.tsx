"use client";

import React, { useState, FormEvent } from "react";
import { useAuth } from "@/components/providers/AuthProvider";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [hover, setHover] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Ingrese su correo electrónico.");
      return;
    }
    if (!password.trim()) {
      setError("Ingrese su contraseña.");
      return;
    }

    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (!success) {
        setError("Credenciales inválidas.");
      }
    } catch {
      setError("Error de conexión con el servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#020617",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          margin: "0 20px",
        }}
      >
        <div
          style={{
            background: "#0f172a",
            border: "1px solid #1e293b",
            borderRadius: "16px",
            padding: "40px 32px",
          }}
        >
          {/* Título */}
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <h2
              style={{
                fontSize: "22px",
                fontWeight: 700,
                color: "#ffffff",
                margin: 0,
                letterSpacing: "-0.025em",
              }}
            >
              Iniciar Sesión
            </h2>
            <p
              style={{
                fontSize: "13px",
                color: "#64748b",
                marginTop: "8px",
                margin: "8px 0 0 0",
              }}
            >
              Sistema de Administración de Flotas
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit}>
            {/* Error */}
            {error && (
              <div
                style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  borderRadius: "8px",
                  padding: "12px 16px",
                  marginBottom: "20px",
                  fontSize: "13px",
                  color: "#f87171",
                  fontWeight: 500,
                }}
              >
                {error}
              </div>
            )}

            {/* Correo */}
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#94a3b8",
                  marginBottom: "6px",
                }}
              >
                Correo
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@empresa.com"
                style={{
                  width: "100%",
                  background: "#020617",
                  border: "1px solid #1e293b",
                  borderRadius: "8px",
                  padding: "12px 14px",
                  fontSize: "14px",
                  color: "#e2e8f0",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                autoComplete="email"
              />
            </div>

            {/* Contraseña */}
            <div style={{ marginBottom: "24px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#94a3b8",
                  marginBottom: "6px",
                }}
              >
                Contraseña
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: "100%",
                    background: "#020617",
                    border: "1px solid #1e293b",
                    borderRadius: "8px",
                    padding: "12px 44px 12px 14px",
                    fontSize: "14px",
                    color: "#e2e8f0",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#475569",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Botón */}
            <button
              type="submit"
              disabled={isLoading}
              onMouseEnter={() => setHover(true)}
              onMouseLeave={() => setHover(false)}
              style={{
                width: "100%",
                padding: "13px",
                background: isLoading ? "#1e293b" : hover ? "#059669" : "#10b981",
                color: isLoading ? "#475569" : "#ffffff",
                border: "none",
                borderRadius: "10px",
                fontWeight: 600,
                fontSize: "15px",
                cursor: isLoading ? "not-allowed" : "pointer",
                transition: "background 0.2s, color 0.2s",
                letterSpacing: "0.01em",
              }}
            >
              {isLoading ? "Ingresando..." : "Iniciar Sesión"}
            </button>
          </form>
        </div>

        {/* Pie de página */}
        <p
          style={{
            textAlign: "center",
            fontSize: "11px",
            color: "#334155",
            marginTop: "24px",
          }}
        >
          © 2026 SAF ERP — Manual F1T02
        </p>
      </div>
    </div>
  );
}
