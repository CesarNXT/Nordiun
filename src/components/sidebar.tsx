"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/chamados", label: "Chamados" },
  { href: "/tecnicos", label: "Técnicos" },
  { href: "/mapa-tecnicos", label: "Mapa Técnicos" },
  { href: "/empresas", label: "Empresas" },
];

export function Sidebar({ open, onClose }: { open?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
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
    <>
      {/* Desktop */}
      <aside className="hidden sm:block w-64 border-r border-border bg-surface text-foreground">
        <div className="p-4 font-bold flex items-center justify-between">
          <span>Nordiun</span>
          <button className="px-2 py-1 rounded-md border border-border hover:bg-muted text-sm" onClick={toggleTheme} aria-label="Alternar tema">{isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}</button>
        </div>
        <nav className="flex flex-col">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={clsx(
                "px-4 py-2 hover:bg-muted",
                pathname?.startsWith(l.href) ? "bg-muted font-semibold" : ""
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </aside>
      {/* Mobile drawer */}
      {open && (
        <div className="sm:hidden fixed inset-0 z-50 flex" onClick={onClose}>
          <div className="w-64 bg-surface text-foreground border-r border-border h-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 font-bold flex items-center justify-between">
              <span>Nordiun</span>
              <button className="px-2 py-1 rounded-md border border-border hover:bg-muted text-sm" onClick={toggleTheme} aria-label="Alternar tema">{isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}</button>
            </div>
            <nav className="flex flex-col">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={clsx(
                    "px-4 py-2 hover:bg-muted",
                    pathname?.startsWith(l.href) ? "bg-muted font-semibold" : ""
                  )}
                  onClick={onClose}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex-1 bg-black/40" />
        </div>
      )}
    </>
  );
}
