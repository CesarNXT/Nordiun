"use client";
import { clsx } from "clsx";
import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "muted" | "danger";
  size?: "sm" | "md";
};

export function Button({ variant = "primary", size = "md", className, ...props }: Props) {
  const base = "inline-flex items-center justify-center rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const sizes = size === "sm" ? "px-2 py-1 text-xs" : "px-3 py-2 text-sm";
  const variants = {
    primary: "bg-primary text-primary-foreground hover:opacity-90",
    outline: "border border-border text-foreground hover:bg-muted",
    muted: "bg-muted text-foreground hover:opacity-90",
    danger: "bg-red-600 text-white hover:bg-red-700",
  }[variant];
  return <button {...props} className={clsx(base, sizes, variants, className)} />;
}

