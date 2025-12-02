import React from "react";

type Props = React.SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className, children, ...props }: Props) {
  const base = "border border-border rounded-md px-3 py-2 w-full bg-background text-foreground";
  return (
    <select {...props} className={`${base} ${className || ""}`}>
      {children}
    </select>
  );
}

