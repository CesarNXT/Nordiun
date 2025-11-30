"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

const links = [
  { href: "/chamados", label: "Chamados" },
  { href: "/tecnicos", label: "Técnicos" },
  { href: "/mapa-tecnicos", label: "Mapa Técnicos" },
  { href: "/empresas", label: "Empresas" },
];

export function Sidebar({ open, onClose }: { open?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  return (
    <>
      {/* Desktop */}
      <aside className="hidden sm:block w-64 border-r border-slate-800 bg-slate-900 text-slate-200">
        <div className="p-4 font-bold text-white">Nordiun</div>
        <nav className="flex flex-col">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={clsx(
                "px-4 py-2 hover:bg-slate-800",
                pathname?.startsWith(l.href) ? "bg-slate-800 text-white font-semibold" : ""
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
          <div className="w-64 bg-slate-900 text-slate-200 border-r border-slate-800 h-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 font-bold text-white">Nordiun</div>
            <nav className="flex flex-col">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={clsx(
                    "px-4 py-2 hover:bg-slate-800",
                    pathname?.startsWith(l.href) ? "bg-slate-800 text-white font-semibold" : ""
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
