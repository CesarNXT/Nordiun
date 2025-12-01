"use client";
import { useEffect, useMemo, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";

type Tecnico = { id: string; createdAt?: string; status?: "Novo" | "Ativo" | "Cancelado" | "Ajudante" };
type Empresa = { id: string };
type Chamado = { id: string; status?: "Agendado" | "Em andamento" | "Concluído" | "Cancelado" | "Reagendado" | "Invalido"; appointmentDate?: string };

export default function DashboardPage() {
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [chamados, setChamados] = useState<Chamado[]>([]);

  useEffect(() => {
    const col = collection(db, "registrations");
    const unsub = onSnapshot(col, (snap) => {
      setTecnicos(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Tecnico, "id">) })));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const col = collection(db, "empresas");
    const unsub = onSnapshot(col, (snap) => {
      setEmpresas(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Empresa, "id">) })));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const col = collection(db, "chamados");
    const unsub = onSnapshot(col, (snap) => {
      setChamados(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Chamado, "id">) })));
    });
    return () => unsub();
  }, []);

  const tecnicosTotal = tecnicos.length;
  const tecnicosAtivos = tecnicos.filter((t) => t.status === "Ativo").length;
  const tecnicosNovosMes = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const start = new Date(y, m, 1).getTime();
    const end = new Date(y, m + 1, 1).getTime();
    return tecnicos.filter((t) => {
      const dt = t.createdAt ? new Date(t.createdAt).getTime() : NaN;
      return isFinite(dt) && dt >= start && dt < end;
    }).length;
  }, [tecnicos]);

  const chamadosTotal = chamados.length;
  const chamadosAgendados = chamados.filter((c) => c.status === "Agendado").length;
  const chamadosAndamento = chamados.filter((c) => c.status === "Em andamento").length;
  const chamadosReagendados = chamados.filter((c) => c.status === "Reagendado").length;
  const chamadosConcluidosHoje = useMemo(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const prefix = `${yyyy}-${mm}-${dd}`;
    return chamados.filter((c) => c.status === "Concluído" && typeof c.appointmentDate === "string" && c.appointmentDate.startsWith(prefix)).length;
  }, [chamados]);

  const recentesChamados = useMemo(() => {
    return [...chamados]
      .sort((a, b) => {
        const da = a.appointmentDate ? new Date(a.appointmentDate).getTime() : 0;
        const dbb = b.appointmentDate ? new Date(b.appointmentDate).getTime() : 0;
        return dbb - da;
      })
      .slice(0, 5);
  }, [chamados]);

  return (
    <div className="space-y-4">
      <div className="text-2xl font-bold">Dashboard</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-md p-4">
          <div className="text-sm text-slate-600">Técnicos</div>
          <div className="text-3xl font-bold">{tecnicosTotal}</div>
          <div className="text-sm text-slate-700 mt-1">Ativos: {tecnicosAtivos}</div>
          <div className="text-sm text-slate-700">Novos no mês: {tecnicosNovosMes}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-md p-4">
          <div className="text-sm text-slate-600">Empresas</div>
          <div className="text-3xl font-bold">{empresas.length}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-md p-4">
          <div className="text-sm text-slate-600">Chamados</div>
          <div className="text-3xl font-bold">{chamadosTotal}</div>
          <div className="text-sm text-slate-700 mt-1">Agendados: {chamadosAgendados}</div>
          <div className="text-sm text-slate-700">Em andamento: {chamadosAndamento}</div>
          <div className="text-sm text-slate-700">Reagendados: {chamadosReagendados}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-md p-4">
          <div className="text-sm text-slate-600">Concluídos hoje</div>
          <div className="text-3xl font-bold">{chamadosConcluidosHoje}</div>
        </div>
      </div>
      <div className="bg-white border border-slate-200 rounded-md p-4">
        <div className="text-lg font-semibold">Chamados recentes</div>
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          {recentesChamados.map((c) => (
            <div key={c.id} className="border border-slate-200 rounded p-3">
              <div className="text-sm text-slate-700">{c.status || "—"}</div>
              <div className="text-sm text-slate-900">{c.appointmentDate ? new Date(c.appointmentDate).toLocaleDateString("pt-BR") : ""}</div>
            </div>
          ))}
          {!recentesChamados.length && <div className="text-sm text-slate-700">Sem chamados</div>}
        </div>
      </div>
    </div>
  );
}

