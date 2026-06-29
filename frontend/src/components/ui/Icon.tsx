"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "../providers/ThemeProvider";

const ICONS: Record<string, string> = {
  truck: "/icons/truck.svg",
  clipboard: "/icons/clipboard.svg",
  fuel: "/icons/fuel.svg",
  driver: "/icons/driver.svg",
  wrench: "/icons/wrench.svg",
  checklist: "/icons/checklist.svg",
  tire: "/icons/tire.svg",
  money: "/icons/money.svg",
  chart: "/icons/chart.svg",
  swap: "/icons/swap.svg",
  settings: "/icons/settings.svg",
  folder: "/icons/folder.svg",
  lock: "/icons/lock.svg",
  "key-lock": "/icons/key-lock.svg",
  warning: "/icons/warning.svg",
  eye: "/icons/eye.svg",
  "eye-hide": "/icons/eye-hide.svg",
  logout: "/icons/logout.svg",
  search: "/icons/search.svg",
  close: "/icons/close.svg",
  download: "/icons/download.svg",
  check: "/icons/check.svg",
  pdf: "/icons/pdf.svg",
  excel: "/icons/excel.svg",
  json: "/icons/json.svg",
  crown: "/icons/crown.svg",
  "avatar-default": "/icons/avatar-default.svg",
  pilot: "/icons/pilot.svg",
};

interface IconProps {
  name: string;
  size?: number;
  className?: string;
  color?: string;
}

export default function Icon({ name, size = 16, className = "", color }: IconProps) {
  const { theme } = useTheme();
  const [svgContent, setSvgContent] = useState<string | null>(null);

  useEffect(() => {
    const src = ICONS[name];
    if (!src) return;

    fetch(src)
      .then((res) => res.text())
      .then((text) => setSvgContent(text))
      .catch(() => {});
  }, [name]);

  if (!svgContent) return null;

  const fillColor = color || (theme === "dark" ? "white" : "#1e293b");
  const strokeColor = color || (theme === "dark" ? "white" : "#1e293b");

  const colored = svgContent
    .replace(/stroke="currentColor"/g, `stroke="${strokeColor}"`)
    .replace(/fill="currentColor"/g, `fill="${fillColor}"`)
    .replace(/fill="none"/g, `fill="none"`)
    .replace(/fill="white"/g, `fill="${fillColor}"`);

  return (
    <span
      className={className}
      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}
      dangerouslySetInnerHTML={{
        __html: colored.replace(
          /<svg/,
          `<svg width="${size}" height="${size}"`
        ),
      }}
    />
  );
}
