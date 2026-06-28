"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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

  // Inicializar estado desde localStorage/cookies al cargar
  useEffect(() => {
    const storedToken = localStorage.getItem("saf_token");
    const storedUser = localStorage.getItem("saf_user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, passwordPlaintxt: string): Promise<boolean> => {
    try {
      // Intentamos llamar a la API del backend o un handler interno
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: passwordPlaintxt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al iniciar sesión");
      }

      const data = await response.json();
      
      // Guardar token en localStorage
      localStorage.setItem("saf_token", data.token);
      localStorage.setItem("saf_user", JSON.stringify(data.usuario));
      
      // Guardar en cookie para que el middleware de Next.js pueda leerlo
      document.cookie = `saf_token=${data.token}; path=/; max-age=28800; SameSite=Lax`;
      document.cookie = `saf_role=${data.usuario.rol}; path=/; max-age=28800; SameSite=Lax`;

      setToken(data.token);
      setUser(data.usuario);
      
      // Redirigir al home o dashboard principal
      router.push("/");
      router.refresh();
      return true;
    } catch (error: any) {
      console.error("Login failed:", error);
      // Error handled by UI
      return false;
    }
  };

  const logout = async () => {
    try {
      const storedToken = localStorage.getItem("saf_token");
      if (storedToken) {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: { Authorization: `Bearer ${storedToken}` },
        });
      }
    } catch {
      // Ignore errors on logout
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
