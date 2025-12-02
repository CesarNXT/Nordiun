"use client";
import React, { createContext, useContext, useState } from "react";

type Toast = { id: number; title?: string; message?: string };

const ToastCtx = createContext<{ show: (t: Omit<Toast, "id">) => void } | null>(null);

export function ToastProvider({ children }: { children?: React.ReactNode }) {
  const [list, setList] = useState<Toast[]>([]);
  function show(t: Omit<Toast, "id">) {
    const id = Date.now();
    setList((prev) => [...prev, { id, ...t }]);
    setTimeout(() => setList((prev) => prev.filter((x) => x.id !== id)), 3000);
  }
  return (
    <ToastCtx.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-4 right-4 space-y-2 z-[200]">
        {list.map((t) => (
          <div key={t.id} className="bg-surface border border-border rounded-md px-3 py-2 shadow text-foreground">
            {t.title && <div className="font-semibold text-sm">{t.title}</div>}
            {t.message && <div className="text-sm">{t.message}</div>}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("ToastProvider ausente");
  return ctx;
}

