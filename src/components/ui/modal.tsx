"use client";
import React, { useEffect } from "react";

export function Modal({ open, onClose, children, className }: { open: boolean; onClose: () => void; children?: React.ReactNode; className?: string }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]" onClick={onClose}>
      <div className={`bg-surface rounded-lg shadow-xl border border-border w-full max-w-3xl ${className || ""}`} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

