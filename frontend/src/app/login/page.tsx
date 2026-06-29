"use client";

import React, { useState, FormEvent } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import Icon from "@/components/ui/Icon";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (!success) {
        setError("Credenciales inválidas.");
      }
    } catch {
      setError("Error de conexión.");
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
        color: "#e2e8f0",
        display: "flex",
        flexDirection: "column",
        zIndex: 9999,
      }}
    >
      {/* Header */}
      <header style={{ padding: "16px 24px", position: "relative", zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              background: "rgba(16, 185, 129, 0.1)",
              border: "1px solid rgba(16, 185, 129, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="truck" size={24} />
          </div>
          <div>
            <h1 style={{ fontWeight: 700, fontSize: "14px", color: "#10b981", letterSpacing: "-0.025em", margin: 0 }}>
              SAF ERP
            </h1>
            <p style={{ fontSize: "9px", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>
              Manual F1T02
            </p>
          </div>
        </div>
      </header>

      {/* Formulario centrado */}
      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 16px",
          position: "relative",
          zIndex: 10,
        }}
      >
        <div style={{ width: "100%", maxWidth: "384px" }}>
          <div
            style={{
              background: "#0f172a",
              border: "1px solid #1e293b",
              borderRadius: "16px",
              padding: "32px",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#ffffff", margin: 0 }}>
                Iniciar Sesión
              </h2>
              <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px", margin: "4px 0 0 0" }}>
               Ingrese sus credenciales institucionales
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {error && (
                <div
                  style={{
                    background: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid rgba(239, 68, 68, 0.2)",
                    borderRadius: "8px",
                    padding: "10px 16px",
                    fontSize: "12px",
                    color: "#f87171",
                    fontWeight: 500,
                  }}
                >
                  {error}
                </div>
              )}

              <div>
                <label style={{ fontSize: "12px", fontWeight: 500, color: "#cbd5e1", display: "block", marginBottom: "6px" }}>
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
                    padding: "10px 12px",
                    fontSize: "14px",
                    color: "#e2e8f0",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  required
                  autoComplete="email"
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 500, color: "#cbd5e1", display: "block", marginBottom: "6px" }}>
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
                      padding: "10px 40px 10px 12px",
                      fontSize: "14px",
                      color: "#e2e8f0",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#64748b",
                      padding: 0,
                    }}
                    tabIndex={-1}
                  >
                    <Icon name={showPassword ? "eye-hide" : "eye"} size={16} />
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: "100%",
                  padding: "10px",
                  background: isLoading ? "#1e293b" : "#10b981",
                  color: isLoading ? "#64748b" : "#020617",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: 700,
                  fontSize: "14px",
                  cursor: isLoading ? "not-allowed" : "pointer",
                }}
              >
                {isLoading ? "Ingresando..." : "Iniciar Sesión"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
