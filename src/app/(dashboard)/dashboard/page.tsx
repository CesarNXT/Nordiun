"use client";
import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useAppData } from "@/context/app-data";

type Tecnico = { id: string; createdAt?: string; status?: "Novo" | "Ativo" | "Cancelado" | "Ajudante" };
type Empresa = { id: string };
type Chamado = { id: string; status?: "Agendado" | "Em andamento" | "Concluído" | "Cancelado" | "Reagendado" | "Invalido"; appointmentDate?: string };

export default function DashboardPage() {
  const { tecnicos: ctxT, empresas: ctxE, chamados: ctxC } = useAppData();
  const [tecnicos, setTecnicos] = useState<Tecnico[]>(() => {
    try { const r = sessionStorage.getItem("prefetch_registrations"); return r ? JSON.parse(r) : []; } catch { return []; }
  });
  const [empresas, setEmpresas] = useState<Empresa[]>(() => {
    try { const e = sessionStorage.getItem("prefetch_empresas"); return e ? JSON.parse(e) : []; } catch { return []; }
  });
  const [chamados, setChamados] = useState<Chamado[]>(() => {
    try { const c = sessionStorage.getItem("prefetch_chamados"); return c ? JSON.parse(c) : []; } catch { return []; }
  });
  useEffect(() => { try { sessionStorage.removeItem("prefetch_registrations"); sessionStorage.removeItem("prefetch_empresas"); sessionStorage.removeItem("prefetch_chamados"); } catch {} }, []);
  useEffect(() => {}, [ctxT, ctxE, ctxC]);

  useEffect(() => {}, []);

  useEffect(() => {}, []);

  useEffect(() => {}, []);

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
  const [avisosCount, setAvisosCount] = useState(0);
  useEffect(() => {
    const compute = () => {
      const isLate = (c: Chamado) => {
        const d = c.appointmentDate ? new Date(c.appointmentDate) : null;
        const t = (c as unknown as { appointmentTime?: string }).appointmentTime;
        const m = (t || "").match(/^(\d{2}):(\d{2})$/);
        if (!d || !m) return false;
        const hh = Number(m[1]); const mm = Number(m[2]);
        const dt = new Date(d.getTime()); dt.setHours(hh, mm, 0, 0);
        const done = c.status === "Em andamento" || c.status === "Concluído" || c.status === "Cancelado";
        return !done && Date.now() >= dt.getTime();
      };
      setAvisosCount(chamados.filter(isLate).length);
    };
    compute();
  }, [chamados]);
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
        <Card>
          <CardHeader>
            <CardTitle>Técnicos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{tecnicosTotal}</div>
            <div className="text-sm text-foreground mt-1">Ativos: {tecnicosAtivos}</div>
            <div className="text-sm text-foreground">Novos no mês: {tecnicosNovosMes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Empresas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{empresas.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Chamados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{chamadosTotal}</div>
            <div className="text-sm text-foreground mt-1">Agendados: {chamadosAgendados}</div>
            <div className="text-sm text-foreground">Em andamento: {chamadosAndamento}</div>
            <div className="text-sm text-foreground">Reagendados: {chamadosReagendados}</div>
            <div className="text-sm text-foreground">Avisos: {avisosCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Concluídos hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{chamadosConcluidosHoje}</div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Chamados recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
            {recentesChamados.map((c) => (
              <div key={c.id} className="border border-border rounded p-3 bg-background">
                <div className="text-sm text-foreground">{c.status || "—"}</div>
                <div className="text-sm text-foreground">{c.appointmentDate ? new Date(c.appointmentDate).toLocaleDateString("pt-BR") : ""}</div>
              </div>
            ))}
            {!recentesChamados.length && <div className="text-sm text-foreground">Sem chamados</div>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
