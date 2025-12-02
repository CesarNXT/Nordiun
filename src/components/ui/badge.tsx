import React from "react";

type Props = { children?: React.ReactNode; variant?: "default" | "success" | "warning" | "danger" };

export function Badge({ children, variant = "default" }: Props) {
  const base = "inline-flex items-center rounded px-2 py-0.5 text-xs";
  const v = {
    default: "bg-muted text-foreground",
    success: "bg-green-600 text-white",
    warning: "bg-amber-600 text-white",
    danger: "bg-red-600 text-white",
  }[variant];
  return <span className={`${base} ${v}`}>{children}</span>;
}

