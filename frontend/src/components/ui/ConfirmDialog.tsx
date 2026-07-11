"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{
    options: ConfirmOptions;
    resolve: (value: boolean) => void;
  } | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({ options, resolve });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    state?.resolve(true);
    setState(null);
  }, [state]);

  const handleCancel = useCallback(() => {
    state?.resolve(false);
    setState(null);
  }, [state]);

  const variantStyles = {
    danger: { bg: "bg-rose-600", hover: "hover:bg-rose-500", border: "border-rose-500", icon: "✕" },
    warning: { bg: "bg-amber-600", hover: "hover:bg-amber-500", border: "border-amber-500", icon: "⚠" },
    info: { bg: "bg-blue-600", hover: "hover:bg-blue-500", border: "border-blue-500", icon: "ℹ" },
  };

  const v = variantStyles[state?.options.variant ?? "danger"];

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {state && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-100">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg ${v.bg}`}>
                {v.icon}
              </div>
              <h3 className="text-lg font-bold text-white">
                {state.options.title ?? "Confirmar"}
              </h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {state.options.message}
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white transition font-semibold"
              >
                {state.options.cancelText ?? "Cancelar"}
              </button>
              <button
                onClick={handleConfirm}
                className={`px-5 py-2 text-sm font-bold text-white rounded-xl transition ${v.bg} ${v.hover}`}
              >
                {state.options.confirmText ?? "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    return {
      confirm: async () => {
        console.warn("[ConfirmDialog] Provider not found, returning true");
        return true;
      },
    };
  }
  return context;
}
