"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import Icon from "@/components/ui/Icon";

export default function UnauthorizedPage() {
  const { logout, user } = useAuth();

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

      {/* Contenido centrado */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 16px",
          position: "relative",
          zIndex: 10,
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "24px",
          }}
        >
          <Icon name="warning" size={32} />
        </div>

        <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#ffffff", marginBottom: "8px", margin: "0 0 8px 0" }}>
          Acceso Restringido
        </h1>
        <p style={{ fontSize: "14px", color: "#94a3b8", maxWidth: "384px", marginBottom: "32px", margin: "0 0 32px 0" }}>
          Tu rol (<span style={{ color: "#f87171", fontWeight: 500 }}>{user?.rol || "Sin Rol"}</span>) no tiene permisos para este módulo.
        </p>

        <div style={{ display: "flex", gap: "12px" }}>
          <Link
            href="/"
            style={{
              padding: "10px 20px",
              background: "#0f172a",
              border: "1px solid #1e293b",
              color: "#e2e8f0",
              fontSize: "14px",
              fontWeight: 500,
              borderRadius: "8px",
              textDecoration: "none",
            }}
          >
            Inicio
          </Link>
          <button
            onClick={logout}
            style={{
              padding: "10px 20px",
              background: "#ef4444",
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: 500,
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
            }}
          >
            Cerrar Sesión
          </button>
        </div>
      </main>
    </div>
  );
}
