"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { DashboardLayout } from "./DashboardLayout";

const PUBLIC_PATHS = ["/login", "/unauthorized"];

export function LayoutRouter({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (PUBLIC_PATHS.includes(pathname)) {
    return <>{children}</>;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
