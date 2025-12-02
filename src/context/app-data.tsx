"use client";
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

type Tecnico = { id: string; name?: string; status?: string; cidade?: string; estado?: string };
type Empresa = { id: string; name?: string };
type Chamado = { id: string } & Record<string, unknown>;

const Ctx = createContext<{ tecnicos: Tecnico[]; empresas: Empresa[]; chamados: Chamado[] }>({ tecnicos: [], empresas: [], chamados: [] });

export function AppDataProvider({ children }: { children?: React.ReactNode }) {
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const timerRef = useRef<number | null>(null);

  async function refreshAll() {
    try {
      const [regsSnap, empSnap, chaSnap] = await Promise.all([
        getDocs(collection(db, "registrations")),
        getDocs(collection(db, "empresas")),
        getDocs(collection(db, "chamados")),
      ]);
      setTecnicos(regsSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Tecnico) })));
      setEmpresas(empSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Empresa) })));
      setChamados(chaSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Chamado) })));
    } catch {}
  }

  useEffect(() => {
    const id = window.setTimeout(refreshAll, 0);
    timerRef.current = window.setInterval(refreshAll, 30000);
    return () => { clearTimeout(id); if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };
  }, []);

  const value = useMemo(() => ({ tecnicos, empresas, chamados }), [tecnicos, empresas, chamados]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppData() { return useContext(Ctx); }
