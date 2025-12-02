import React from "react";

export function Card({ className, children }: { className?: string; children?: React.ReactNode }) {
  return <div className={`bg-surface border border-border rounded-md ${className || ""}`}>{children}</div>;
}

export function CardHeader({ className, children }: { className?: string; children?: React.ReactNode }) {
  return <div className={`p-4 border-b border-border ${className || ""}`}>{children}</div>;
}

export function CardTitle({ className, children }: { className?: string; children?: React.ReactNode }) {
  return <div className={`text-lg font-semibold text-foreground ${className || ""}`}>{children}</div>;
}

export function CardContent({ className, children }: { className?: string; children?: React.ReactNode }) {
  return <div className={`p-4 ${className || ""}`}>{children}</div>;
}

export function CardFooter({ className, children }: { className?: string; children?: React.ReactNode }) {
  return <div className={`p-4 border-t border-border ${className || ""}`}>{children}</div>;
}

