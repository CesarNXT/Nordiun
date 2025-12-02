import React from "react";

export function Spinner({ className }: { className?: string }) {
  return <div className={`inline-block w-5 h-5 border-2 border-border border-t-transparent rounded-full animate-spin ${className || ""}`} />;
}

