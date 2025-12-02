import React from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean };

export function Input({ className, invalid, ...props }: Props) {
  const base = "border rounded-md px-3 py-2 w-full bg-background text-foreground";
  const border = invalid ? "border-red-600" : "border-border";
  return <input {...props} className={`${base} ${border} ${className || ""}`} />;
}

