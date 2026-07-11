import type { Metadata } from "next";
import "./globals.css";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { ConfirmProvider } from "@/components/ui/ConfirmDialog";

export const metadata: Metadata = {
  title: "SAF ERP - Gestión de Flotas",
  description: "Sistema de Administración de Flotas (Manual F1T02)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <ConfirmProvider>
                <DashboardLayout>{children}</DashboardLayout>
              </ConfirmProvider>
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
