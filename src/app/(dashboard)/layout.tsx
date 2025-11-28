"use client";
import { ReactNode, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { AuthGuard } from "@/components/auth-guard";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <AuthGuard>
      <div className="min-h-screen flex bg-slate-50">
        <Sidebar open={open} onClose={() => setOpen(false)} />
        <main className="flex-1 p-4 sm:p-6 text-slate-900">
          <div className="sm:hidden flex items-center justify-between mb-4">
            <button className="px-3 py-2 rounded-md bg-slate-200 text-slate-900" onClick={() => setOpen(true)} aria-label="Abrir menu">☰</button>
            <div className="font-bold">Nordiun</div>
          </div>
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
