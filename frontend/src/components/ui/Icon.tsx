import React from "react";

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
}

export default function Icon({ name, size = 16, className = "" }: IconProps) {
  const src = ICONS[name];
  if (!src) return null;
  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      className={className}
      style={{ display: "inline-block", verticalAlign: "middle" }}
    />
  );
}
