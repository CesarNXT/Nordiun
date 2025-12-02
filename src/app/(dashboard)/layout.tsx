"use client";
import { ReactNode, useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Sun, Moon } from "lucide-react";
import { AuthGuard } from "@/components/auth-guard";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    try {
      const pref = localStorage.getItem("theme");
      return pref ? pref === "dark" : (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
    } catch {
      return false;
    }
  });
  useEffect(() => {
    try { document.documentElement.classList.toggle("dark", isDark); } catch {}
  }, [isDark]);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    try { localStorage.setItem("theme", next ? "dark" : "light"); } catch {}
    try { document.documentElement.classList.toggle("dark", next); } catch {}
  }
  return (
    <AuthGuard>
      <script dangerouslySetInnerHTML={{ __html: `
        (function(){
          try {
            var pref = localStorage.getItem('theme');
            var isDark = pref ? pref === 'dark' : (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
            document.documentElement.classList.toggle('dark', !!isDark);
          } catch {}
        })();
      ` }} />
      <div className="min-h-screen flex bg-background text-foreground">
        <Sidebar open={open} onClose={() => setOpen(false)} />
        <main className="flex-1 p-4 sm:p-6">
          <div className="sm:hidden flex items-center justify-between mb-4">
            <button className="px-3 py-2 rounded-md border border-border text-foreground hover:bg-muted" onClick={() => setOpen(true)} aria-label="Abrir menu">☰</button>
            <div className="flex items-center gap-2">
              <div className="font-bold">Nordiun</div>
              <button className="px-3 py-2 rounded-md border border-border text-foreground hover:bg-muted" onClick={toggleTheme} aria-label="Alternar tema">{isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}</button>
            </div>
          </div>
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
