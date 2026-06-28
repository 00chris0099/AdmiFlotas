"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PasswordForm from "@/components/PasswordForm";

function ConfirmarUsuarioInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState("");

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-4">
        <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 text-center space-y-4">
          <div className="text-4xl">⚠️</div>
          <h2 className="text-xl font-black text-white">Token no válido</h2>
          <p className="text-xs text-slate-400">
            Este enlace no es válido o está incompleto. Solicita un nuevo enlace al administrador.
          </p>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-4">
        <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 text-center space-y-4">
          <div className="text-4xl">✅</div>
          <h2 className="text-xl font-black text-white">Cuenta activada</h2>
          <p className="text-xs text-slate-400">{message}</p>
          <a
            href="/login"
            className="inline-block px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-sm transition"
          >
            Ir al Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <PasswordForm
      token={token}
      apiEndpoint="/api/auth/confirmar-usuario"
      title="Crea tu contraseña"
      subtitle="Establece una contraseña segura para tu cuenta"
      icon="🔐"
      buttonLabel="Activar cuenta"
      onSuccess={(msg) => { setMessage(msg); setDone(true); }}
      onError={() => {}}
    />
  );
}

export default function ConfirmarUsuarioPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">Cargando...</div>}>
      <ConfirmarUsuarioInner />
    </Suspense>
  );
}
