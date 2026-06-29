"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";

export default function UnauthorizedPage() {
  const { logout, user } = useAuth();

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
          maxWidth: "420px",
          margin: "0 20px",
          textAlign: "center",
        }}
      >
        {/* Icono warning */}
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
            margin: "0 auto 24px auto",
          }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>

        <h1
          style={{
            fontSize: "24px",
            fontWeight: 700,
            color: "#ffffff",
            margin: "0 0 12px 0",
          }}
        >
          Acceso Restringido
        </h1>
        <p
          style={{
            fontSize: "14px",
            color: "#64748b",
            margin: "0 0 32px 0",
            lineHeight: 1.5,
          }}
        >
          Tu rol (<span style={{ color: "#f87171", fontWeight: 500 }}>{user?.rol || "Sin Rol"}</span>) no tiene permisos para este módulo.
        </p>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <Link
            href="/"
            style={{
              padding: "11px 24px",
              background: "#0f172a",
              border: "1px solid #1e293b",
              color: "#94a3b8",
              fontSize: "14px",
              fontWeight: 500,
              borderRadius: "10px",
              textDecoration: "none",
              transition: "background 0.2s, color 0.2s",
            }}
          >
            Inicio
          </Link>
          <button
            onClick={logout}
            style={{
              padding: "11px 24px",
              background: "#ef4444",
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: 500,
              borderRadius: "10px",
              border: "none",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
}
