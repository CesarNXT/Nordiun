"use client";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";

type Tecnico = { id: string; name?: string; status?: string; cidade?: string; estado?: string };
type Empresa = { id: string; name?: string };
type Chamado = { id: string } & Record<string, unknown>;

const Ctx = createContext<{ tecnicos: Tecnico[]; empresas: Empresa[]; chamados: Chamado[] }>({ tecnicos: [], empresas: [], chamados: [] });

export function AppDataProvider({ children }: { children?: React.ReactNode }) {
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [chamados, setChamados] = useState<Chamado[]>([]);

  useEffect(() => {
    const stops: (() => void)[] = [];
    try {
      const stopT = onSnapshot(collection(db, "registrations"), (snap) => setTecnicos(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Tecnico) }))));
      const stopE = onSnapshot(collection(db, "empresas"), (snap) => setEmpresas(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Empresa) }))));
      const stopC = onSnapshot(collection(db, "chamados"), (snap) => setChamados(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Chamado) }))));
      stops.push(stopT, stopE, stopC);
    } catch {}
    return () => { for (const s of stops) { try { s(); } catch {} } };
  }, []);

  const value = useMemo(() => ({ tecnicos, empresas, chamados }), [tecnicos, empresas, chamados]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppData() { return useContext(Ctx); }

