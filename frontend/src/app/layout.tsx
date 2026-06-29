import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 dark:bg-slate-950 dark:text-slate-100 bg-white text-slate-900 [&.light]:bg-white [&.light]:text-slate-900">
        <ThemeProvider>
          <AuthProvider>
            <DashboardLayout>{children}</DashboardLayout>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
