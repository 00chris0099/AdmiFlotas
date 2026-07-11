"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export interface User {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: "JEFE_PROCESO" | "CONDUCTOR" | "INSPECTOR" | "ANALISTA" | "MECANICO" | "ELECTRICISTA" | "ADMINISTRATIVO";
  licenciaConducir?: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem("saf_token");
    const storedUser = localStorage.getItem("saf_user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(normalizeUser(JSON.parse(storedUser)));
    }
    setIsLoading(false);
  }, []);

  const normalizeUser = (raw: any): User => ({
    ...raw,
    rol: typeof raw.rol === "object" && raw.rol !== null ? raw.rol.codigo : raw.rol,
  });

  const login = async (email: string, passwordPlaintxt: string): Promise<boolean> => {
    try {
      const data = await api.login(email, passwordPlaintxt);
      const normalized = normalizeUser(data.usuario);

      localStorage.setItem("saf_user", JSON.stringify(normalized));

      document.cookie = `saf_token=${data.token}; path=/; max-age=28800; SameSite=Lax`;
      document.cookie = `saf_role=${normalized.rol}; path=/; max-age=28800; SameSite=Lax`;

      setToken(data.token);
      setUser(normalized);

      router.push("/");
      router.refresh();
      return true;
    } catch (error: any) {
      console.error("Login failed:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
    }

    localStorage.removeItem("saf_token");
    localStorage.removeItem("saf_user");

    document.cookie = "saf_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "saf_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    setToken(null);
    setUser(null);
    router.push("/login");
    router.refresh();
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};
