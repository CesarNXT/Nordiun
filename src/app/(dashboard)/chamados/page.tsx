"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import Image from "next/image";
import { DateModal } from "@/components/date-modal";
import { useAppData } from "@/context/app-data";
import { db, storage } from "@/lib/firebase";
import { collection, addDoc, onSnapshot, query, orderBy, type CollectionReference, doc, updateDoc, deleteDoc, serverTimestamp, Timestamp, FieldValue, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { Play } from "lucide-react";

type EmpresaLite = { id: string; name: string; trackerEnabled?: boolean; valores?: { itRate3h?: number; itHalfDaily?: number; itDaily?: number; itAdditionalHour?: number; itMileage?: number; trackerInstallationRate?: number; itToleranceMinutes?: number }; responsaveis?: { nome: string; numero: string }[] };
type TecnicoLite = { id: string; name: string; cidade?: string; estado?: string; status?: "Novo" | "Ativo" | "Cancelado" | "Ajudante"; supervisorId?: string; category?: "Rastreador" | "Informatica"; categories?: ("Rastreador" | "Informatica")[]; itRate3h?: number; itAdditionalHour?: number; itDaily?: number; itMileage?: number; trackerMileage?: number; trackerInstallationRate?: number };
type Chamado = { empresaId: string; tecnicoId: string; status: "Agendado" | "Em andamento" | "Concluído" | "Cancelado" | "Reagendado" | "Invalido"; createdAt: number | Timestamp | FieldValue; name: string; callNumber?: string; endereco?: string; cep?: string; rua?: string; numero?: string; complemento?: string; bairro?: string; cidade?: string; estado?: string; contact?: string; contactNumber?: string; category?: "Informatica" | "Rastreador"; serviceType?: string; units?: number; appointmentDate?: string; appointmentTime?: string; arrivalAt?: string; paymentDateCompany?: string; paymentDateTechnician?: string; paymentStatusCompany?: "A pagar" | "Pago" | "Pendente" | "Cancelado"; paymentStatusTechnician?: "A pagar" | "Pago" | "Pendente" | "Cancelado"; hasKm?: boolean; valorEmpresa?: number; valorTecnico?: number; kmEmpresa?: number; kmTecnico?: number; kmValorEmpresa?: number; kmValorTecnico?: number; workStart?: string; workEnd?: string; workSessions?: { startIso: string; endIso: string }[]; paymentReceiptsTechnician?: { url: string; path: string }[]; paymentReceiptTechnicianUrl?: string; paymentReceiptTechnicianPath?: string; ratDocName?: string; ratDocUrl?: string; ratDocPath?: string };

function toDateVal(x: number | string | Timestamp | FieldValue | undefined | null): Date {
  if (!x) return new Date(0);
  if (x instanceof Timestamp) return x.toDate();
  if (typeof x === "number") return new Date(x);
  if (typeof x === "string") { const d = new Date(x); return isNaN(d.getTime()) ? new Date(0) : d; }
  return new Date(0);
}

export default function ChamadosPage() {
  const { tecnicos: ctxT, empresas: ctxE, chamados: ctxC } = useAppData();
  const [empresas, setEmpresas] = useState<EmpresaLite[]>([]);
  const [tecnicos, setTecnicos] = useState<TecnicoLite[]>([]);
  const [calls, setCalls] = useState<(Chamado & { id: string })[]>([]);
  const [empresaId, setEmpresaId] = useState("");
  const [tecnicoId, setTecnicoId] = useState("");
  const [status, setStatus] = useState<Chamado["status"]>("Agendado");
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [openFinance, setOpenFinance] = useState(false);
  const [name, setName] = useState("");
  const [callNumber, setCallNumber] = useState("");
  const [endereco, setEndereco] = useState("");
  const [contact, setContact] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [cep, setCep] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [openAddress, setOpenAddress] = useState(false);
  const [addrOpen, setAddrOpen] = useState(false);
  const [addrFocused, setAddrFocused] = useState(false);
  const [addrLocked, setAddrLocked] = useState(false);
  const [addrOptions, setAddrOptions] = useState<{ label: string; lat?: string; lon?: string; placeId?: string; from?: "places" | "osm" }[]>([]);
  const [placeToken] = useState(() => Math.random().toString(36).slice(2));
  const [callCategory, setCallCategory] = useState<"Informatica" | "Rastreador">("Informatica");
  const [serviceType, setServiceType] = useState<string>("3h");
  const [units, setUnits] = useState<string>("1");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [openCategory, setOpenCategory] = useState(false);
  const [categoryChoice, setCategoryChoice] = useState<"Informatica" | "Rastreador">("Informatica");
  const [openEmpresa, setOpenEmpresa] = useState(false);
  const [openTecnico, setOpenTecnico] = useState(false);
  const [openContact, setOpenContact] = useState(false);
  const [openStatus, setOpenStatus] = useState(false);
  const [openDateTime, setOpenDateTime] = useState(false);
  const times = useMemo(() => {
    const arr: string[] = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 5) {
        const hh = String(h).padStart(2, "0");
        const mm = String(m).padStart(2, "0");
        arr.push(`${hh}:${mm}`);
      }
    }
    return arr;
  }, []);
  const [openServiceType, setOpenServiceType] = useState(false);
  const [openWorkTime, setOpenWorkTime] = useState(false);
  const [openTimeLog, setOpenTimeLog] = useState(false);
  const [openAddSession, setOpenAddSession] = useState(false);
  const [workSessions, setWorkSessions] = useState<{ startIso: string; endIso: string }[]>([]);
  const [empresaDocs, setEmpresaDocs] = useState<{ nome: string; url: string; path: string }[]>([]);
  const [ratDocName, setRatDocName] = useState<string>("");
  const [ratDocUrl, setRatDocUrl] = useState<string>("");
  const [ratDocPath, setRatDocPath] = useState<string>("");
  const [sessionDate, setSessionDate] = useState("");
  const [sessionStart, setSessionStart] = useState("");
  const [sessionEnd, setSessionEnd] = useState("");
  const [editingSessionIdx, setEditingSessionIdx] = useState<number | null>(null);
  const [qEmpresa, setQEmpresa] = useState("");
  const [qTecnico, setQTecnico] = useState("");
  const [qContact, setQContact] = useState("");
  const [valorEmpresa, setValorEmpresa] = useState("");
  const [valorTecnico, setValorTecnico] = useState("");
  const [kmEmpresa, setKmEmpresa] = useState("");
  const [kmTecnico, setKmTecnico] = useState("");
  const [kmValorEmpresa, setKmValorEmpresa] = useState("");
  const [kmValorTecnico, setKmValorTecnico] = useState("");
  const [hasKm, setHasKm] = useState(false);
  const [workStart, setWorkStart] = useState("");
  const [workEnd, setWorkEnd] = useState("");
  const [paymentReceipts, setPaymentReceipts] = useState<{ url: string; path: string }[]>([]);
  const [paymentDateCompany, setPaymentDateCompany] = useState("");
  const [paymentDateTechnician, setPaymentDateTechnician] = useState("");
  const [paymentStatusCompany, setPaymentStatusCompany] = useState<Chamado["paymentStatusCompany"]>("A pagar");
  const [paymentStatusTechnician, setPaymentStatusTechnician] = useState<Chamado["paymentStatusTechnician"]>("A pagar");
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewFilter, setViewFilter] = useState<"todos" | "avisos" | "andamento" | "ontem" | "hoje" | "amanha" | "data">("todos");
  const [viewDate, setViewDate] = useState<string>("");
  const [viewTime, setViewTime] = useState<string>("");

  const tecnicoSel = useMemo(() => tecnicos.find((t) => t.id === tecnicoId), [tecnicoId, tecnicos]);

  useEffect(() => {
    async function loadDocs() {
      try {
        setEmpresaDocs([]);
        setRatDocName(""); setRatDocUrl(""); setRatDocPath("");
        if (!db || !empresaId) return;
        const sub = collection(db, `empresas/${empresaId}/documentos`);
        const snap = await getDocs(sub);
        const list = snap.docs.map((d) => ({ nome: String((d.data() as { nome?: string }).nome || ""), url: String((d.data() as { url?: string }).url || ""), path: String((d.data() as { path?: string }).path || "") })).filter((x) => x.nome || x.url);
        const ratFirst = [...list].sort((a, b) => { const ia = /rat/i.test(a.nome) ? 0 : 1; const ib = /rat/i.test(b.nome) ? 0 : 1; return ia - ib; });
        setEmpresaDocs(ratFirst);
        const prefer = ratFirst.find((d) => /rat/i.test(d.nome));
        if (prefer) { setRatDocName(prefer.nome); setRatDocUrl(prefer.url); setRatDocPath(prefer.path); }
      } catch {}
    }
    loadDocs();
  }, [db, empresaId]);

  useEffect(() => { if (Array.isArray(ctxE) && ctxE.length) setEmpresas(ctxE as unknown as EmpresaLite[]); }, [ctxE]);
  useEffect(() => { if (Array.isArray(ctxT) && ctxT.length) setTecnicos((ctxT as unknown as TecnicoLite[]).map((t) => ({ ...t, name: (t.name || "").toUpperCase() }))); }, [ctxT]);
  useEffect(() => { if (Array.isArray(ctxC) && ctxC.length) setCalls(ctxC as unknown as (Chamado & { id: string })[]); }, [ctxC]);

  // Prefill handled when opening modal

  function setNum(setter: (s: string) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const s = e.target.value.replace(/[^0-9.,]/g, "");
      setter(s);
    };
  }

  function setInt(setter: (s: string) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const s = e.target.value.replace(/[^0-9]/g, "");
      setter(s);
    };
  }

  function prefillFinance() {
    const emp = empresas.find((e) => e.id === empresaId);
    const tec = tecnicos.find((t) => t.id === tecnicoId);
    if (!emp || !tec) return;
    const isTracker = callCategory === "Rastreador";
    if (isTracker) {
      const baseEmp = emp.valores?.trackerInstallationRate;
      const baseTec = tec.trackerInstallationRate;
      const qtd = Number(units.replace(/[^0-9]/g, "")) || 1;
      if (!valorEmpresa) setValorEmpresa(baseEmp != null ? String(baseEmp * qtd) : valorEmpresa);
      if (!valorTecnico) setValorTecnico(baseTec != null ? String(baseTec * qtd) : valorTecnico);
      const kmEmp = emp.valores?.itMileage; // utilizar tabela de deslocamento empresa
      const kmTec = tec.trackerMileage;
      if (!kmValorEmpresa) setKmValorEmpresa(kmEmp != null ? String(kmEmp) : kmValorEmpresa);
      if (!kmValorTecnico) setKmValorTecnico(kmTec != null ? String(kmTec) : kmValorTecnico);
    } else {
      const mapHours: Record<string, number> = { "1h": 1, "2h": 2, "3h": 3, "Meia diária": 4, "Diária": 9 };
      const h = mapHours[serviceType || "3h"] || 3;
      const baseEmp = calcHourRate("empresa", h);
      const baseTec = calcHourRate("tecnico", h);
      if (!valorEmpresa) setValorEmpresa(baseEmp ? String(baseEmp) : valorEmpresa);
      if (!valorTecnico) setValorTecnico(baseTec ? String(baseTec) : valorTecnico);
      const kmEmp = emp.valores?.itMileage;
      const kmTec = tec.itMileage;
      if (!kmValorEmpresa) setKmValorEmpresa(kmEmp != null ? String(kmEmp) : kmValorEmpresa);
      if (!kmValorTecnico) setKmValorTecnico(kmTec != null ? String(kmTec) : kmValorTecnico);
    }
  }

  function formatTimeBr(t?: string) { return t || ""; }
  function formatDateBr(d?: string) {
    if (!d) return "";
    const p = d.split("-");
    if (p.length === 3) return `${p[2]}/${p[1]}/${p[0]}`;
    return d;
  }
  function isPdf(u: string) { return /\.pdf(\?|$)/i.test(u); }
  
  function normalizeHHMMInput(raw: string): string {
    const digits = raw.replace(/[^0-9]/g, "").slice(0, 4);
    const hh = digits.slice(0, 2);
    const mm = digits.slice(2, 4);
    const val = hh + (digits.length > 2 ? ":" + mm : "");
    return val;
  }
  function isValidHHMM(s: string): boolean {
    const m = s.match(/^([0-1][0-9]|2[0-3]):([0-5][0-9])$/);
    return !!m;
  }
  function durationHHMM(start: string, end: string): string {
    if (!isValidHHMM(start) || !isValidHHMM(end)) return "";
    const toMin = (t: string) => { const [hh, mm] = t.split(":"); return Number(hh) * 60 + Number(mm); };
    const mins = Math.max(0, toMin(end) - toMin(start));
    const hh = String(Math.floor(mins / 60)).padStart(2, "0");
    const mm = String(mins % 60).padStart(2, "0");
    return `${hh}:${mm}`;
  }

  function totalDurationMs(sessions: { startIso: string; endIso: string }[]): number {
    return sessions.reduce((acc, s) => {
      const st = new Date(s.startIso).getTime();
      const en = new Date(s.endIso).getTime();
      const d = Math.max(0, en - st);
      return acc + d;
    }, 0);
  }

  function formatDuration(ms: number): string {
    const sec = Math.floor(ms / 1000);
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h > 0) return `${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  }

  function isoToDate(iso: string): string {
    const d = new Date(iso);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  function isoToHHMM(iso: string): string {
    const d = new Date(iso);
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  }

  function toCurrency(n: number): string { return n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

  function calcHourRate(kind: "empresa" | "tecnico", h: number): number {
    const emp = empresas.find((e) => e.id === empresaId);
    const tec = tecnicos.find((t) => t.id === tecnicoId);
    if (!emp || !tec || h < 1) return 0;
    if (kind === "empresa") {
      const v = emp.valores || {};
      const direct = (v as Record<string, unknown>)[`itRate${h}h`] as number | undefined;
      if (typeof direct === "number" && isFinite(direct)) return direct;
      const rate3 = typeof v.itRate3h === "number" && isFinite(v.itRate3h) ? v.itRate3h : undefined;
      const add = typeof v.itAdditionalHour === "number" && isFinite(v.itAdditionalHour) ? v.itAdditionalHour : undefined;
      if (rate3 != null) {
        if (h <= 3) {
          const perHour = rate3 / 3;
          return perHour * h;
        }
        if (add != null) return rate3 + (h - 3) * add;
      }
      if (add != null) return add * h;
      return 0;
    } else {
      const direct = (tec as unknown as Record<string, unknown>)[`itRate${h}h`] as number | undefined;
      if (typeof direct === "number" && isFinite(direct)) return direct;
      const rate3 = typeof tec.itRate3h === "number" && isFinite(tec.itRate3h) ? tec.itRate3h : undefined;
      const add = typeof tec.itAdditionalHour === "number" && isFinite(tec.itAdditionalHour) ? tec.itAdditionalHour : undefined;
      if (rate3 != null) {
        if (h <= 3) {
          const perHour = rate3 / 3;
          return perHour * h;
        }
        if (add != null) return rate3 + (h - 3) * add;
      }
      if (add != null) return add * h;
      return 0;
    }
  }

  function addManualSession() {
    if (!sessionDate || !isValidHHMM(sessionStart) || !isValidHHMM(sessionEnd)) return;
    const startIso = new Date(`${sessionDate}T${sessionStart}:00`).toISOString();
    const endIso = new Date(`${sessionDate}T${sessionEnd}:00`).toISOString();
    if (new Date(endIso).getTime() <= new Date(startIso).getTime()) return;
    const payload = { startIso, endIso };
    setWorkSessions((prev) => {
      const next = editingSessionIdx != null ? prev.map((x, i) => (i === editingSessionIdx ? payload : x)) : [...prev, payload];
      try { if (db && editingId) { updateDoc(doc(db, "chamados", editingId), { workSessions: next } as Partial<Chamado>); } } catch {}
      return next;
    });
    setOpenAddSession(false);
    setEditingSessionIdx(null);
    setSessionDate("");
    setSessionStart("");
    setSessionEnd("");
  }

  function removeSession(idx: number) {
    setWorkSessions((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      try { if (db && editingId) { updateDoc(doc(db, "chamados", editingId), { workSessions: next } as Partial<Chamado>); } } catch {}
      return next;
    });
  }

  function openEditSession(idx: number) {
    const s = workSessions[idx];
    setSessionDate(isoToDate(s.startIso));
    setSessionStart(isoToHHMM(s.startIso));
    setSessionEnd(isoToHHMM(s.endIso));
    setEditingSessionIdx(idx);
    setOpenAddSession(true);
  }

  

  // Preenchimento financeiro ocorre ao abrir o modal via botão

  async function createCall() {
    if (!db) return;
    if (!name.trim()) { setError("Informe o nome do chamado"); return; }
    if (!empresaId || !tecnicoId) { setError("Selecione empresa e técnico"); return; }
    if (tecnicoSel?.status === "Ajudante") { setError("Ajudante não pode ser acionado sozinho. Selecione o responsável."); return; }
    const col = collection(db, "chamados") as CollectionReference<Chamado>;
    const payload: Chamado = {
      empresaId,
      tecnicoId,
      status,
      createdAt: serverTimestamp(),
      name: name.trim(),
      callNumber: callNumber.trim() || undefined,
      endereco: endereco.trim() || undefined,
      cep: cep.trim() || undefined,
      rua: rua.trim() || undefined,
      numero: numero.trim() || undefined,
      complemento: complemento.trim() || undefined,
      bairro: bairro.trim() || undefined,
      cidade: cidade.trim() || undefined,
      estado: estado.trim() || undefined,
      contact: contact.trim() || undefined,
      contactNumber: contactNumber.trim() || undefined,
      category: callCategory,
      serviceType,
      units: Number(units.replace(/[^0-9]/g, "")) || undefined,
      appointmentDate: appointmentDate || undefined,
      appointmentTime: appointmentTime || undefined,
      paymentDateCompany: paymentDateCompany || undefined,
      paymentDateTechnician: paymentDateTechnician || undefined,
      paymentStatusCompany,
      paymentStatusTechnician,
      hasKm,
      workStart: workStart || undefined,
      workEnd: workEnd || undefined,
      workSessions: workSessions.length ? workSessions : undefined,
      valorEmpresa: valorEmpresa ? Number(valorEmpresa.replace(/,/g, ".")) : undefined,
      valorTecnico: valorTecnico ? Number(valorTecnico.replace(/,/g, ".")) : undefined,
      kmEmpresa: kmEmpresa ? Number(kmEmpresa.replace(/,/g, ".")) : undefined,
      kmTecnico: kmTecnico ? Number(kmTecnico.replace(/,/g, ".")) : undefined,
      kmValorEmpresa: kmValorEmpresa ? Number(kmValorEmpresa.replace(/,/g, ".")) : undefined,
      kmValorTecnico: kmValorTecnico ? Number(kmValorTecnico.replace(/,/g, ".")) : undefined,
      ratDocName: ratDocName || undefined,
      ratDocUrl: ratDocUrl || undefined,
      ratDocPath: ratDocPath || undefined,
    };
    const clean = Object.fromEntries(Object.entries(payload).filter(([, v]) => v !== undefined));
    if (editingId) {
      await updateDoc(doc(db, "chamados", editingId), clean as Partial<Chamado>);
    } else {
      await addDoc(col, clean as Chamado);
    }
    try {
      if (status === "Concluído" && tecnicoSel?.status === "Novo") {
        await updateDoc(doc(db, "registrations", tecnicoId), { status: "Ativo" });
      }
    } catch {}
    resetForm();
    setOpen(false);
  }


  const mapEmpresa = Object.fromEntries(empresas.map((e) => [e.id, e.name]));
  const mapTecnico = Object.fromEntries(tecnicos.map((t) => [t.id, t.name]));

  useEffect(() => {
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) return;
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
        const data = await res.json();
        if (data && !data.erro) {
          setRua(String(data.logradouro || ""));
          setBairro(String(data.bairro || ""));
          setCidade(String(data.localidade || ""));
          setEstado(String(data.uf || ""));
          const composed = [data.logradouro, numero, data.bairro, `${data.localidade} - ${data.uf}`].filter(Boolean).join(", ");
          setEndereco(composed);
        }
      } catch {}
    }, 200);
    return () => clearTimeout(t);
  }, [cep, numero]);

  useEffect(() => {
    if (addrLocked) { return; }
    const q = (endereco || "").trim();
    const full = [q, cep, "Brasil"].filter(Boolean).join(" ");
    if (q.length < 3 && !cep) {
      const tEmpty = setTimeout(() => { setAddrOptions([]); setAddrOpen(false); }, 0);
      return () => clearTimeout(tEmpty);
    }
    const t = setTimeout(async () => {
      let opts: { label: string; lat?: string; lon?: string }[] = [];
      try {
        const resp = await fetch("/api/places/autocomplete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input: full, languageCode: "pt-BR", regionCode: "BR" }),
        });
        if (resp.ok) {
          const data = await resp.json();
          const sugg = Array.isArray(data?.suggestions) ? data.suggestions as Array<{ placePrediction?: { placeId?: string; text?: { text?: string }, structuredFormat?: { mainText?: { text?: string }, secondaryText?: { text?: string } } } }> : [];
          opts = sugg.map((s) => {
            const sp = s.placePrediction || {};
            const main = sp.structuredFormat?.mainText?.text || "";
            const sec = sp.structuredFormat?.secondaryText?.text || "";
            const text = sp.text?.text || [main, sec].filter(Boolean).join(" - ");
            return { label: String(text || ""), placeId: sp.placeId, from: "places" };
          });
        }
      } catch {}
      if (!opts.length) {
        try {
          const res = await fetch("/api/osm/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ q: full, limit: 6 }),
          });
          if (res.ok) {
            const data = await res.json();
            const arr = Array.isArray(data?.options) ? data.options as Array<{ label: string; lat?: string; lon?: string }> : [];
            opts = arr.map((o) => ({ ...o, from: "osm" }));
          }
        } catch {}
      }
      setAddrOptions(opts);
      setAddrOpen(addrFocused && !addrLocked && opts.length > 0);
    }, 350);
    return () => clearTimeout(t);
  }, [endereco, cep, addrFocused, addrLocked]);

  function statusClasses(s: Chamado["status"]) {
    if (s === "Agendado") return "border-l-4 border-blue-500 dark:border-blue-300 bg-blue-50 dark:bg-blue-900/25";
    if (s === "Em andamento") return "border-l-4 border-amber-500 dark:border-amber-300 bg-amber-50 dark:bg-amber-900/25";
    if (s === "Concluído") return "border-l-4 border-green-600 dark:border-green-400 bg-green-50 dark:bg-green-900/25";
    if (s === "Cancelado") return "border-l-4 border-red-600 dark:border-red-400 bg-red-50 dark:bg-red-900/25";
    if (s === "Reagendado") return "border-l-4 border-purple-500 dark:border-purple-300 bg-purple-50 dark:bg-purple-900/25";
    return "border-l-4 border-slate-400 dark:border-slate-500 bg-slate-50 dark:bg-slate-800/30";
  }

  function statusButtonClasses(s: Chamado["status"]) {
    if (s === "Agendado") return "border-blue-500";
    if (s === "Em andamento") return "border-amber-500";
    if (s === "Concluído") return "border-green-600";
    if (s === "Cancelado") return "border-red-600";
    if (s === "Reagendado") return "border-purple-500";
    return "border-slate-400";
  }

  function statusEmoji(s?: TecnicoLite["status"]) {
    if (s === "Novo") return "🆕";
    if (s === "Ativo") return "🟢";
    if (s === "Ajudante") return "🙋‍♂️";
    if (s === "Cancelado") return "❌";
    return "";
  }

  function apptDate(c: Chamado): Date | null {
    const d = c.appointmentDate ? new Date(c.appointmentDate) : null;
    const t = (c.appointmentTime || "").match(/^(\d{2}):(\d{2})$/);
    if (!d || !t) return null;
    const hh = Number(t[1]); const mm = Number(t[2]);
    const dt = new Date(d.getTime()); dt.setHours(hh, mm, 0, 0);
    return dt;
  }
  const isLate = useCallback((c: Chamado): boolean => {
    const dt = apptDate(c);
    if (!dt) return false;
    const now = new Date();
    const done = c.status === "Em andamento" || c.status === "Concluído" || c.status === "Cancelado";
    return !done && now.getTime() >= dt.getTime();
  }, []);
  const sortedCalls = useMemo(() => {
    const arr = [...calls];
    const weight = (c: Chamado & { id: string }) => {
      if (isLate(c)) return -3;
      if (c.status === "Em andamento") return -2;
      if (c.status === "Agendado") return -1;
      return 0;
    };
    arr.sort((a, b) => {
      const wa = weight(a); const wb = weight(b);
      if (wa !== wb) return wb - wa; // maiores primeiro
      const da = apptDate(a)?.getTime() || 0;
      const db = apptDate(b)?.getTime() || 0;
      return da - db;
    });
    if (viewFilter === "avisos") return arr.filter(isLate);
    if (viewFilter === "andamento") return arr.filter((c) => c.status === "Em andamento");
    if (viewFilter === "hoje" || viewFilter === "ontem" || viewFilter === "amanha") {
      const base = new Date();
      const day = new Date(base.getFullYear(), base.getMonth(), base.getDate());
      const delta = viewFilter === "ontem" ? -1 : (viewFilter === "amanha" ? 1 : 0);
      const targetStart = new Date(day.getFullYear(), day.getMonth(), day.getDate() + delta);
      const targetEnd = new Date(targetStart.getFullYear(), targetStart.getMonth(), targetStart.getDate() + 1);
      return arr.filter((c) => { const d = apptDate(c); return d && d.getTime() >= targetStart.getTime() && d.getTime() < targetEnd.getTime(); });
    }
    if (viewFilter === "data" && viewDate) {
      return arr.filter((c) => {
        const dOk = typeof c.appointmentDate === "string" && (c.appointmentDate || "").startsWith(viewDate);
        const tOk = viewTime ? (c.appointmentTime === viewTime) : true;
        return dOk && tOk;
      });
    }
    return arr;
  }, [calls, viewFilter, isLate, viewDate, viewTime]);

  const groupedByMonth = useMemo(() => {
    const m = new Map<string, (Chamado & { id: string })[]>();
    const label = (c: Chamado) => {
      const d = apptDate(c) || toDateVal(c.createdAt);
      const month = d.toLocaleString("pt-BR", { month: "long" });
      const cap = month.charAt(0).toUpperCase() + month.slice(1);
      return `${cap} ${d.getFullYear()}`;
    };
    for (const c of sortedCalls) {
      const k = label(c);
      const list = m.get(k) || [];
      list.push(c);
      m.set(k, list);
    }
    const entries = Array.from(m.entries());
    entries.sort((a, b) => {
      const pa = a[1][0]; const pb = b[1][0];
      const da = apptDate(pa)?.getTime() || toDateVal(pa.createdAt).getTime();
      const db = apptDate(pb)?.getTime() || toDateVal(pb.createdAt).getTime();
      return db - da;
    });
    return entries;
  }, [sortedCalls]);

  async function registerArrival() {
    if (!db || !editingId) return;
    try {
      await updateDoc(doc(db, "chamados", editingId), { arrivalAt: new Date().toISOString(), status: "Em andamento" });
      setStatus("Em andamento");
    } catch {}
  }
  async function markInProgress() {
    if (!db || !editingId) return;
    try { await updateDoc(doc(db, "chamados", editingId), { status: "Em andamento" }); setStatus("Em andamento"); } catch {}
  }

  function resetForm() {
    setEditingId(null);
    setEmpresaId("");
    setTecnicoId("");
    setStatus("Agendado");
    setName("");
    setCallNumber("");
    setEndereco("");
    setCep("");
    setRua("");
    setNumero("");
    setComplemento("");
    setBairro("");
    setCidade("");
    setEstado("");
    setContact("");
    setContactNumber("");
    setAppointmentDate("");
    setAppointmentTime("");
    setValorEmpresa("");
    setValorTecnico("");
    setKmEmpresa("");
    setKmTecnico("");
    setKmValorEmpresa("");
    setKmValorTecnico("");
    setPaymentDateCompany("");
    setPaymentDateTechnician("");
    setPaymentStatusCompany("A pagar");
    setPaymentStatusTechnician("A pagar");
    setHasKm(false);
    setWorkStart("");
    setWorkEnd("");
    setWorkSessions([]);
    setError("");
    setEmpresaDocs([]);
    setRatDocName(""); setRatDocUrl(""); setRatDocPath("");
  }

  function openEdit(c: Chamado & { id: string }) {
    setEditingId(c.id);
    setEmpresaId(c.empresaId);
    setTecnicoId(c.tecnicoId);
    setStatus(c.status);
    setName(c.name || "");
    setCallNumber(c.callNumber || "");
    setEndereco(c.endereco || "");
    setCep(c.cep || "");
    setRua(c.rua || "");
    setNumero(c.numero || "");
    setComplemento(c.complemento || "");
    setBairro(c.bairro || "");
    setCidade(c.cidade || "");
    setEstado(c.estado || "");
    setContact(c.contact || "");
    setContactNumber(c.contactNumber || "");
    setCallCategory((c.category as Chamado["category"]) || "Informatica");
    setServiceType(c.serviceType || (c.category === "Rastreador" ? "Instalação" : "3h"));
    setUnits(c.units != null ? String(c.units) : "1");
    setAppointmentDate(c.appointmentDate || "");
    setAppointmentTime(c.appointmentTime || "");
    setPaymentDateCompany(c.paymentDateCompany || "");
    setPaymentDateTechnician(c.paymentDateTechnician || "");
    setPaymentStatusCompany(c.paymentStatusCompany || "A pagar");
    setPaymentStatusTechnician(c.paymentStatusTechnician || "A pagar");
    setHasKm(!!c.hasKm);
    setValorEmpresa(c.valorEmpresa != null ? String(c.valorEmpresa) : "");
    setValorTecnico(c.valorTecnico != null ? String(c.valorTecnico) : "");
    setKmEmpresa(c.kmEmpresa != null ? String(c.kmEmpresa) : "");
    setKmTecnico(c.kmTecnico != null ? String(c.kmTecnico) : "");
    setKmValorEmpresa(c.kmValorEmpresa != null ? String(c.kmValorEmpresa) : "");
    setKmValorTecnico(c.kmValorTecnico != null ? String(c.kmValorTecnico) : "");
    setWorkStart(c.workStart || "");
    setWorkEnd(c.workEnd || "");
    setWorkSessions(Array.isArray(c.workSessions) ? c.workSessions : []);
    const arr = Array.isArray(c.paymentReceiptsTechnician) ? c.paymentReceiptsTechnician : ((c.paymentReceiptTechnicianUrl) ? [{ url: c.paymentReceiptTechnicianUrl, path: c.paymentReceiptTechnicianPath || "" }] : []);
    setPaymentReceipts(arr);
    setRatDocName(c.ratDocName || "");
    setRatDocUrl(c.ratDocUrl || "");
    setRatDocPath(c.ratDocPath || "");
    setOpen(true);
  }

  return (
    <div className="space-y-3 min-h-screen bg-background text-foreground">
      <div className="text-2xl font-bold text-foreground">Chamados</div>
      <div className="flex gap-2">
        <button className="px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700" onClick={() => { resetForm(); setError(""); setOpenEmpresa(true); }}>Criar chamado</button>
      </div>
      {openCategory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70]" onClick={() => setOpenCategory(false)}>
          <div className="bg-surface text-foreground w-full max-w-md rounded-lg shadow-xl p-4" onClick={(e) => e.stopPropagation()}>
            <div className="text-lg font-bold">Tipo de atendimento</div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <label className="inline-flex items-center gap-2 border border-slate-300 rounded-md px-3 py-2">
                <input type="radio" name="call-cat" checked={categoryChoice === "Informatica"} onChange={() => setCategoryChoice("Informatica")} />
                <span>TI</span>
              </label>
              {empresas.find((x) => x.id === empresaId)?.trackerEnabled && (
                <label className="inline-flex items-center gap-2 border border-slate-300 rounded-md px-3 py-2">
                  <input type="radio" name="call-cat" checked={categoryChoice === "Rastreador"} onChange={() => setCategoryChoice("Rastreador")} />
                  <span>Rastreador</span>
                </label>
              )}
            </div>
            <div className="flex justify-center gap-2 mt-3">
              <button className="px-3 py-2 rounded-md border border-border text-foreground hover:bg-muted" onClick={() => setOpenCategory(false)}>Voltar</button>
              <button className="px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700" onClick={() => {
                setCallCategory(categoryChoice);
                setServiceType(categoryChoice === "Rastreador" ? "Instalação" : "3h");
                setOpenCategory(false);
                setOpen(true);
              }}>Continuar</button>
            </div>
          </div>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setOpen(false)}>
          <div className="bg-surface w-full max-w-2xl max-h-[85vh] rounded-lg shadow-xl overflow-auto" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="sticky top-0 z-10 bg-surface p-4 border-b border-border"><div className="text-lg font-bold text-foreground">{editingId ? "Editar chamado" : "Novo chamado"}</div></div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="space-y-1">
                <div className="text-xs text-foreground">Nome</div>
                <input className="border border-border rounded-md px-3 py-2 w-full bg-background text-foreground" value={name} onChange={(e) => setName(e.target.value.toUpperCase())} />
              </div>
              <div className="space-y-1">
                <div className="text-xs text-foreground">Nº Chamado</div>
                <input className="border border-border rounded-md px-3 py-2 w-full bg-background text-foreground" value={callNumber} onChange={(e) => setCallNumber(e.target.value)} />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-foreground">Endereço</div>
                  <button type="button" className="text-xs px-2 py-1 rounded border border-border text-foreground hover:bg-muted" onClick={() => setOpenAddress(true)}>Editar</button>
                </div>
                <div className="relative">
                  <input className="border border-border rounded-md px-3 py-2 w-full bg-background text-foreground" value={endereco} onFocus={() => { if (!addrLocked) { setAddrFocused(true); setAddrOpen(addrOptions.length > 0); } }} onBlur={() => setTimeout(() => { setAddrFocused(false); setAddrOpen(false); }, 200)} onChange={(e) => setEndereco(e.target.value)} />
                  {addrOpen && addrOptions.length > 0 && (
                    <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-auto border border-border bg-surface rounded-md shadow z-[65]">
                      {addrOptions.map((o) => (
                        <button key={o.label} className="block w-full text-left px-3 py-2 text-foreground hover:bg-muted" onMouseDown={(e) => e.preventDefault()} onClick={async () => {
                          setEndereco(o.label);
                          setAddrLocked(true);
                          setAddrFocused(false);
                          setAddrOpen(false);
                          if (o.from === "places" && o.placeId) {
                            try {
                              const resp = await fetch("/api/places/details", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ placeId: o.placeId, languageCode: "pt-BR", regionCode: "BR", sessionToken: placeToken }) });
                              if (resp.ok) {
                                const det = await resp.json();
                                const comps: Array<{ longText?: string; shortText?: string; types?: string[]; languageCode?: string }> = Array.isArray(det?.addressComponents) ? det.addressComponents : [];
                                const get = (t: string) => comps.find((c) => Array.isArray(c.types) && c.types.includes(t));
                                const ruaComp = get("route");
                                const numComp = get("street_number");
                                const bairroComp = get("sublocality_level_1") || get("sublocality");
                                const cidadeComp = get("locality") || get("administrative_area_level_2");
                                const ufComp = get("administrative_area_level_1");
                                const cepComp = get("postal_code");
                                setRua(ruaComp?.longText || ruaComp?.shortText || "");
                                setNumero(numComp?.longText || numComp?.shortText || "");
                                setBairro(bairroComp?.longText || bairroComp?.shortText || "");
                                setCidade(cidadeComp?.longText || cidadeComp?.shortText || "");
                                setEstado(ufComp?.shortText || ufComp?.longText || "");
                                setCep(cepComp?.longText || cepComp?.shortText || "");
                              }
                            } catch {}
                          }
                        }}>
                          {o.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-foreground">Responsável</div>
                <input className="border border-border rounded-md px-3 py-2 w-full bg-background text-foreground" value={contact || "Selecione"} readOnly onClick={() => setOpenContact(true)} />
              </div>
              {!!empresaId && (
                <div className="space-y-1">
                  <div className="text-xs text-foreground">RAT da empresa</div>
                  {empresaDocs.length ? (
                    <div className="flex items-center gap-2">
                      <select className="border border-border rounded-md px-3 py-2 flex-1 bg-background text-foreground" value={ratDocPath || ""} onChange={(e) => {
                        const found = empresaDocs.find((d) => d.path === e.target.value);
                        if (found) { setRatDocName(found.nome); setRatDocUrl(found.url); setRatDocPath(found.path); }
                        else { setRatDocName(""); setRatDocUrl(""); setRatDocPath(""); }
                      }}>
                        <option value="">Selecione</option>
                        {empresaDocs.map((d) => (<option key={d.path || d.url || d.nome} value={d.path}>{d.nome || d.path || d.url}</option>))}
                      </select>
                      {ratDocUrl && (
                        <a href={ratDocUrl} target="_blank" rel="noopener noreferrer" className="text-xs px-2 py-1 rounded border border-border text-foreground hover:bg-muted">Abrir</a>
                      )}
                    </div>
                  ) : (
                    <input className="border border-border rounded-md px-3 py-2 w-full bg-background text-foreground" value="Sem documentos" readOnly />
                  )}
                </div>
              )}
              
              <div className="space-y-1">
                <div className="text-xs text-foreground">Técnico</div>
                  <input className={`border rounded-md px-3 py-2 w-full ${!tecnicoId && error ? "border-red-600" : "border-border"} bg-background text-foreground`} value={mapTecnico[tecnicoId] ? `${mapTecnico[tecnicoId]}${tecnicoSel?.status ? ` ${statusEmoji(tecnicoSel.status)}` : ""}` : "Selecione"} readOnly onClick={() => setOpenTecnico(true)} />
                {tecnicoSel?.status === "Ajudante" && (
                  <div className="text-xs text-amber-700">Ajudante vinculado a responsável. {tecnicoSel.supervisorId ? "Selecione o responsável." : "Cadastre o responsável."}</div>
                )}
                {tecnicoSel?.status === "Ajudante" && !!tecnicoSel.supervisorId && (
                  <button type="button" className="text-xs px-2 py-1 rounded border border-border text-foreground hover:bg-muted" onClick={() => setTecnicoId(tecnicoSel.supervisorId!)}>Selecionar responsável</button>
                )}
              </div>
              <div className="space-y-1">
                <div className="text-xs text-foreground">Status</div>
                  <input className="border border-border rounded-md px-3 py-2 w-full bg-background text-foreground" value={status} readOnly onClick={() => setOpenStatus(true)} />
                  
              </div>
              <div className="sm:col-span-2">
                <div className="space-y-1">
                  <div className="text-xs text-foreground">Data e hora do atendimento</div>
                  <input className="border border-border rounded-md px-3 py-2 w-full bg-background text-foreground" value={[formatDateBr(appointmentDate), formatTimeBr(appointmentTime)].filter(Boolean).join(" ") || "Selecione"} readOnly onClick={() => setOpenDateTime(true)} />
                </div>
              </div>
            <div className="space-y-1">
              <div className="text-xs text-foreground">Controle de tempo</div>
              <div className="flex items-center gap-2">
                <button type="button" className="px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 inline-flex items-center gap-2" onClick={() => setOpenTimeLog(true)}>
                  <Play className="w-4 h-4" />
                  <span>Log de tempo</span>
                </button>
                <span className="text-sm text-foreground">{formatDuration(totalDurationMs(workSessions)) || "0m 0s"}</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-xs text-foreground">Tipo de chamado</div>
              <input className="border border-border rounded-md px-3 py-2 w-full bg-background text-foreground" value={serviceType} readOnly onClick={() => setOpenServiceType(true)} />
            </div>
            {callCategory === "Rastreador" && (
              <div className="space-y-1">
                <div className="text-xs text-foreground">Unidades</div>
                <input className="border border-border rounded-md px-3 py-2 w-full bg-background text-foreground" inputMode="numeric" value={units} onChange={setNum(setUnits)} />
              </div>
            )}
            <div className="sm:col-span-2 flex items-center gap-2">
              <button type="button" className="px-3 py-2 rounded-md border border-border text-foreground hover:bg-muted" onClick={() => {
                prefillFinance();
                setOpenFinance(true);
              }}>Financeiro</button>
              <div className="text-xs text-foreground">Abrir detalhes de valores</div>
            </div>
            </div>
            
            {!!error && (
              <div className="text-sm text-red-700 mt-2">{error}</div>
            )}
            <div className="flex justify-center gap-2 p-4 pt-0">
              {editingId && (
                <button className="px-3 py-2 rounded-md bg-red-600 text-white hover:bg-red-700" onClick={async () => { if (db && editingId) { await deleteDoc(doc(db, "chamados", editingId)); resetForm(); setOpen(false); } }}>Excluir</button>
              )}
              {!editingId && (
                <button className="px-3 py-2 rounded-md bg-muted text-foreground" onClick={() => { setOpen(false); setOpenCategory(true); }}>Voltar</button>
              )}
              <button className="px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50" onClick={createCall} disabled={!name.trim() || !empresaId || !tecnicoId}>Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* datas de pagamento são geridas dentro do modal de financeiro */}

      {openFinance && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]" onClick={() => setOpenFinance(false)}>
          <div className="bg-surface w-full max-w-3xl max-h-[80vh] rounded-lg shadow-xl flex flex-col overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-border">
              <div className="text-lg font-bold text-foreground">Financeiro do atendimento</div>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1 px-2 sm:px-4">
              <div className="space-y-1"><div className="text-xs text-foreground">Valor que a empresa paga</div><input className="border border-border rounded-md px-3 py-2 w-full bg-background text-foreground" inputMode="decimal" value={valorEmpresa} onChange={setNum(setValorEmpresa)} /></div>
              <div className="space-y-1"><div className="text-xs text-foreground">Valor pago ao técnico</div><input className="border border-border rounded-md px-3 py-2 w-full bg-background text-foreground" inputMode="decimal" value={valorTecnico} onChange={setNum(setValorTecnico)} /></div>
              <div className="space-y-1 sm:col-span-2">
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" checked={hasKm} onChange={() => setHasKm((v) => !v)} />
                  <span className="text-xs text-foreground">Tem deslocamento (KM)</span>
                </label>
              </div>
              {hasKm && (
                <>
                  <div className="space-y-1"><div className="text-xs text-foreground">KM cobrados da empresa</div><input className="border border-border rounded-md px-3 py-2 w-full bg-background text-foreground" inputMode="numeric" value={kmEmpresa} onChange={setInt(setKmEmpresa)} /></div>
                  <div className="space-y-1"><div className="text-xs text-foreground">KM pagos ao técnico</div><input className="border border-border rounded-md px-3 py-2 w-full bg-background text-foreground" inputMode="numeric" value={kmTecnico} onChange={setInt(setKmTecnico)} /></div>
                  <div className="space-y-1"><div className="text-xs text-foreground">Valor por KM (empresa)</div><input className="border border-border rounded-md px-3 py-2 w-full bg-background text-foreground" inputMode="decimal" value={kmValorEmpresa} onChange={setNum(setKmValorEmpresa)} /></div>
                  <div className="space-y-1"><div className="text-xs text-foreground">Valor por KM (técnico)</div><input className="border border-border rounded-md px-3 py-2 w-full bg-background text-foreground" inputMode="decimal" value={kmValorTecnico} onChange={setNum(setKmValorTecnico)} /></div>
                </>
              )}

              {(() => {
                const num = (s: string) => { const x = s.replace(/[^0-9.,]/g, "").replace(/,/g, "."); const n = Number(x); return isFinite(n) ? n : 0; };
                const ve = num(valorEmpresa);
                const vt = num(valorTecnico);
                const kme = hasKm ? num(kmEmpresa) : 0;
                const kmt = hasKm ? num(kmTecnico) : 0;
                const kvE = hasKm ? num(kmValorEmpresa) : 0;
                const kvT = hasKm ? num(kmValorTecnico) : 0;
                const totalKmEmpresa = kme * kvE;
                const totalKmTecnico = kmt * kvT;
                const toMin = (t: string) => { const [hh, mm] = (t || "").split(":"); const h = Number(hh); const m = Number(mm); if (!isFinite(h) || !isFinite(m)) return 0; return h * 60 + m; };
                const mins = Math.max(0, toMin(workEnd) - toMin(workStart));
                const baseIncluded = (serviceType === "Diária" ? 9 * 60 : (serviceType === "Meia diária" ? 4 * 60 : (serviceType === "2h" ? 120 : (serviceType === "1h" ? 60 : 3 * 60))));
                const emp = empresas.find((e) => e.id === empresaId);
                const tec = tecnicos.find((t) => t.id === tecnicoId);
                const tolMin = Number(emp?.valores?.itToleranceMinutes || 0);
                const extraMin = Math.max(0, mins - baseIncluded);
                const addHrs = extraMin <= tolMin ? 0 : Math.ceil(extraMin / 60);
                const empAdd = emp?.valores?.itAdditionalHour ? Number(String(emp.valores.itAdditionalHour).replace(/,/g, ".")) : 0;
                const tecAdd = tec?.itAdditionalHour ? Number(String(tec.itAdditionalHour).replace(/,/g, ".")) : 0;
                const totalAtendimentoEmpresa = ve + (empAdd * addHrs);
                const totalAtendimentoTecnico = vt + (tecAdd * addHrs);
                const totalEmpresa = totalAtendimentoEmpresa + totalKmEmpresa;
                const totalTecnico = totalAtendimentoTecnico + totalKmTecnico;
                const margem = totalEmpresa - totalTecnico;
                return (
                  <>
                    <div className="space-y-1"><div className="text-xs text-foreground">Total KM (empresa)</div><input className="border border-border rounded-md px-3 py-2 w-full bg-background text-foreground" readOnly value={totalKmEmpresa.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} /></div>
                    <div className="space-y-1"><div className="text-xs text-foreground">Total KM (técnico)</div><input className="border border-border rounded-md px-3 py-2 w-full bg-background text-foreground" readOnly value={totalKmTecnico.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} /></div>
                    <div className="space-y-1"><div className="text-xs text-foreground">Total atendimento (empresa)</div><input className="border border-border rounded-md px-3 py-2 w-full bg-background text-foreground" readOnly value={totalAtendimentoEmpresa.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} /></div>
                    <div className="space-y-1"><div className="text-xs text-foreground">Total atendimento (técnico)</div><input className="border border-border rounded-md px-3 py-2 w-full bg-background text-foreground" readOnly value={totalAtendimentoTecnico.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} /></div>
                    <div className="space-y-1 sm:col-span-2"><div className="text-xs text-foreground">Margem</div><input className="border border-border rounded-md px-3 py-2 w-full bg-background text-foreground" readOnly value={margem.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} /></div>
              
                  </>
                );
              })()}

            </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 px-2 sm:px-4">
                <div className="space-y-1"><div className="text-xs text-foreground">Data de pagamento (empresa)</div><input className="border border-border rounded-md px-3 py-2 w-full bg-background text-foreground" type="date" value={paymentDateCompany ? paymentDateCompany.substring(0,10) : ""} onChange={(e) => setPaymentDateCompany(e.target.value ? new Date(e.target.value).toISOString() : "")} /></div>
                <div className="space-y-1"><div className="text-xs text-foreground">Data de pagamento (técnico)</div><input className="border border-border rounded-md px-3 py-2 w-full bg-background text-foreground" type="date" value={paymentDateTechnician ? paymentDateTechnician.substring(0,10) : ""} onChange={(e) => setPaymentDateTechnician(e.target.value ? new Date(e.target.value).toISOString() : "")} /></div>
                <div className="space-y-1"><div className="text-xs text-foreground">Status pagamento (empresa)</div><select className="border border-border rounded-md px-3 py-2 w-full bg-background text-foreground" value={paymentStatusCompany} onChange={(e) => setPaymentStatusCompany(e.target.value as Chamado["paymentStatusCompany"]) }><option>A pagar</option><option>Pago</option><option>Pendente</option><option>Cancelado</option></select></div>
                <div className="space-y-1"><div className="text-xs text-foreground">Status pagamento (técnico)</div><select className="border border-border rounded-md px-3 py-2 w-full bg-background text-foreground" value={paymentStatusTechnician} onChange={(e) => setPaymentStatusTechnician(e.target.value as Chamado["paymentStatusTechnician"]) }><option>A pagar</option><option>Pago</option><option>Pendente</option><option>Cancelado</option></select></div>
                <div className="sm:col-span-2 space-y-1">
                  <div className="text-xs text-foreground">Comprovante de pagamento (técnico)</div>
                  <div className="flex items-center gap-2">
                    <input className="border border-border rounded-md px-3 py-2 w-full bg-background text-foreground" type="file" multiple onChange={async (e) => {
                      const files = Array.from(e.target.files || []);
                      if (!files.length || !editingId || !storage) return;
                      setUploadingReceipt(true);
                      try {
                        const next: { url: string; path: string }[] = [...paymentReceipts];
                        for (const f of files) {
                          const path = `chamados/${editingId}/comprovantes/tecnico-${Date.now()}-${f.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
                          const r = ref(storage, path);
                          await uploadBytes(r, f);
                          const url = await getDownloadURL(r);
                          next.push({ url, path });
                        }
                        setPaymentReceipts(next);
                        if (db) await updateDoc(doc(db, "chamados", editingId), { paymentReceiptsTechnician: next, paymentReceiptTechnicianUrl: undefined, paymentReceiptTechnicianPath: undefined } as Partial<Chamado>);
                      } catch {}
                      finally {
                        setUploadingReceipt(false);
                        if (e.currentTarget) e.currentTarget.value = "";
                      }
                    }} />
                  </div>
                  {!!paymentReceipts.length && (
                    <div className="mt-3 space-y-2">
                      {paymentReceipts.map((rec, idx) => (
                        <div key={idx} className="border border-border rounded-md overflow-hidden p-2">
                          {isPdf(rec.url) ? (
                            <div className="w-full max-w-xs h-40 mx-auto bg-muted">
                              <iframe src={rec.url} className="w-full h-full" />
                            </div>
                          ) : (
                            <div className="relative w-full max-w-xs h-40 mx-auto bg-muted">
                              <Image src={rec.url} alt="Comprovante" fill className="object-contain" sizes="256px" />
                            </div>
                          )}
                          <div className="flex items-center justify-between p-2">
                            <a href={rec.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm hover:underline">Abrir em nova guia</a>
                            <button className="text-red-600 text-sm hover:underline" onClick={async () => {
                              try { if (storage && rec.path) { const rr = ref(storage, rec.path); await deleteObject(rr); } } catch {}
                              const next = paymentReceipts.filter((_, i) => i !== idx);
                              setPaymentReceipts(next);
                              if (db && editingId) await updateDoc(doc(db, "chamados", editingId), { paymentReceiptsTechnician: next } as Partial<Chamado>);
                            }}>Remover</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {!editingId && (
                    <div className="text-xs text-foreground">Disponível após salvar o chamado</div>
                  )}
                </div>
              </div>
            <div className="p-4 border-t border-border flex justify-end gap-2">
              <button className="px-3 py-2 rounded-md bg-muted text-foreground" onClick={() => setOpenFinance(false)}>Fechar</button>
            </div>
          </div>
        </div>
      )}
      {openWorkTime && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]" onClick={() => setOpenWorkTime(false)}>
          <div className="bg-white dark:bg-slate-800 dark:text-slate-100 w-full max-w-md rounded-lg shadow-xl p-4" onClick={(e) => e.stopPropagation()}>
            <div className="text-lg font-bold text-foreground">Tempo de atendimento</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              <div className="space-y-1">
                <div className="text-xs text-slate-700 dark:text-slate-300">Início</div>
                <input className="border border-slate-300 rounded-md px-3 py-2 w-full" inputMode="numeric" placeholder="HH:MM" value={workStart} onChange={(e) => setWorkStart(normalizeHHMMInput(e.target.value))} onBlur={(e) => { const v = normalizeHHMMInput(e.target.value); setWorkStart(isValidHHMM(v) ? v : ""); }} />
              </div>
              <div className="space-y-1">
                <div className="text-xs text-slate-700 dark:text-slate-300">Fim</div>
                <input className="border border-slate-300 rounded-md px-3 py-2 w-full" inputMode="numeric" placeholder="HH:MM" value={workEnd} onChange={(e) => setWorkEnd(normalizeHHMMInput(e.target.value))} onBlur={(e) => { const v = normalizeHHMMInput(e.target.value); setWorkEnd(isValidHHMM(v) ? v : ""); }} />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-3">
              <button className="px-3 py-2 rounded-md bg-slate-200 text-slate-900" onClick={() => setOpenWorkTime(false)}>Fechar</button>
            </div>
          </div>
        </div>
      )}
      {openAddress && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]" onClick={() => setOpenAddress(false)}>
          <div className="bg-white dark:bg-slate-800 dark:text-slate-100 w-full max-w-xl rounded-lg shadow-xl p-4" onClick={(e) => e.stopPropagation()}>
            <div className="text-lg font-bold text-foreground">Endereço do atendimento</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              <div className="space-y-1"><div className="text-xs text-slate-700 dark:text-slate-300">CEP</div><input className="border border-slate-300 rounded-md px-3 py-2 w-full" placeholder="00000-000" inputMode="numeric" value={cep} onChange={(e) => setCep(e.target.value)} /></div>
              <div className="space-y-1"><div className="text-xs text-slate-700 dark:text-slate-300">Estado</div><input className="border border-slate-300 rounded-md px-3 py-2 w-full" value={estado} onChange={(e) => setEstado(e.target.value)} /></div>
              <div className="space-y-1 sm:col-span-2"><div className="text-xs text-slate-700 dark:text-slate-300">Cidade</div><input className="border border-slate-300 rounded-md px-3 py-2 w-full" value={cidade} onChange={(e) => setCidade(e.target.value)} /></div>
              <div className="space-y-1 sm:col-span-2"><div className="text-xs text-slate-700 dark:text-slate-300">Rua</div><input className="border border-slate-300 rounded-md px-3 py-2 w-full" value={rua} onChange={(e) => setRua(e.target.value)} /></div>
              <div className="space-y-1"><div className="text-xs text-slate-700 dark:text-slate-300">Número</div><input className="border border-slate-300 rounded-md px-3 py-2 w-full" value={numero} onChange={(e) => setNumero(e.target.value)} /></div>
              <div className="space-y-1"><div className="text-xs text-slate-700 dark:text-slate-300">Complemento</div><input className="border border-slate-300 rounded-md px-3 py-2 w-full" value={complemento} onChange={(e) => setComplemento(e.target.value)} /></div>
              <div className="space-y-1 sm:col-span-2"><div className="text-xs text-slate-700 dark:text-slate-300">Bairro</div><input className="border border-slate-300 rounded-md px-3 py-2 w-full" value={bairro} onChange={(e) => setBairro(e.target.value)} /></div>
            </div>
            <div className="flex justify-end gap-2 mt-3">
              <button className="px-3 py-2 rounded-md bg-slate-200 text-slate-900" onClick={() => setOpenAddress(false)}>Cancelar</button>
              <button className="px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700" onClick={() => { const comp = [rua, numero, bairro, `${cidade} - ${estado}`].filter(Boolean).join(", "); setEndereco(comp); setOpenAddress(false); }}>Salvar</button>
            </div>
          </div>
        </div>
      )}
      {openEmpresa && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]" onClick={() => setOpenEmpresa(false)}>
          <div className="bg-surface text-foreground w-full max-w-xl rounded-lg shadow-xl p-4" onClick={(e) => e.stopPropagation()}>
            <div className="text-lg font-bold text-foreground">Selecionar empresa</div>
            <div className="mt-2 max-h-64 overflow-auto grid grid-cols-1 sm:grid-cols-2 gap-2">
              {empresas.slice(0, 20).map((e) => (
                <button key={e.id} className="text-left border border-border rounded-md p-3 bg-background text-foreground hover:bg-muted" onClick={() => {
                  setEmpresaId(e.id);
                  setOpenEmpresa(false);
                  if (e.trackerEnabled) { setCategoryChoice("Informatica"); setOpenCategory(true); }
                  else { setCallCategory("Informatica"); setServiceType("3h"); setOpen(true); }
                }}>
                  <div className="font-semibold text-foreground">{e.name}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {openTecnico && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]" onClick={() => setOpenTecnico(false)}>
          <div className="bg-surface text-foreground w-full max-w-md rounded-lg shadow-xl p-4 max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="text-lg font-bold text-foreground">Selecionar técnico</div>
            <input className="border border-border rounded-md px-3 py-2 w-full mt-2 bg-background text-foreground" placeholder="Buscar por nome" value={qTecnico} onChange={(e) => setQTecnico(e.target.value)} />
            <div className="mt-2 max-h-64 overflow-auto space-y-1">
              {tecnicos.filter((t) => String(t.name || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(String(qTecnico).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))).map((t) => (
                <button key={t.id} className="w-full text-left px-3 py-2 border border-border rounded bg-background text-foreground hover:bg-muted" onClick={() => { setTecnicoId(t.id); setOpenTecnico(false); }}>{displayTecnico(t)}{t.status ? ` ${statusEmoji(t.status)}` : ""}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {openContact && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]" onClick={() => setOpenContact(false)}>
          <div className="bg-surface text-foreground w-full max-w-xl rounded-lg shadow-xl p-4" onClick={(e) => e.stopPropagation()}>
            <div className="text-lg font-bold text-foreground">Selecionar responsável</div>
            <input className="border border-border rounded-md px-3 py-2 w-full mt-2 bg-background text-foreground" placeholder="Buscar por nome" value={qContact} onChange={(e) => setQContact(e.target.value)} />
            <div className="mt-2 max-h-64 overflow-auto space-y-1">
              {(empresas.find((e) => e.id === empresaId)?.responsaveis || []).filter((r) => String(r.nome || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(String(qContact).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))).map((r, idx) => (
                <button key={`${r.nome}-${idx}`} className="w-full text-left px-3 py-2 border border-border rounded bg-background text-foreground hover:bg-muted" onClick={() => { setContact(r.nome); setContactNumber(r.numero); setOpenContact(false); }}>{r.nome}{r.numero ? ` • ${r.numero}` : ""}</button>
              ))}
              {!(empresas.find((e) => e.id === empresaId)?.responsaveis || []).length && (
                <div className="text-sm text-foreground">Selecione uma empresa com responsáveis cadastrados.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {openStatus && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]" onClick={() => setOpenStatus(false)}>
          <div className="bg-surface text-foreground w-full max-w-md rounded-lg shadow-xl p-4" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="text-lg font-bold text-foreground">Selecionar status</div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {["Agendado","Em andamento","Concluído","Cancelado","Reagendado","Invalido"].map((s) => (
                <button key={s} className={`px-3 py-2 border border-border rounded hover:bg-muted ${statusButtonClasses(s as Chamado["status"])}`} onClick={async () => { 
                  setStatus(s as Chamado["status"]);
                  if (db && editingId) {
                    try {
                      if (s === "Em andamento") await updateDoc(doc(db, "chamados", editingId), { status: s, arrivalAt: new Date().toISOString() });
                      else await updateDoc(doc(db, "chamados", editingId), { status: s });
                    } catch {}
                  }
                  setOpenStatus(false);
                }}>{s}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {openDateTime && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]" onClick={() => setOpenDateTime(false)}>
          <div className="bg-surface text-foreground w-full max-w-sm rounded-lg shadow-xl p-4" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="text-lg font-bold text-foreground">Selecionar data e hora</div>
            <div className="mt-2 grid grid-cols-1 gap-2">
              <input type="date" className="border border-border rounded-md px-3 py-2 w-full bg-background text-foreground" value={appointmentDate || ""} onChange={(e) => setAppointmentDate(e.target.value)} />
              <input type="time" className="border border-border rounded-md px-3 py-2 w-full bg-background text-foreground" value={appointmentTime || ""} onChange={(e) => setAppointmentTime(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2 mt-3">
              <button className="px-3 py-2 rounded-md bg-muted text-foreground" onClick={() => setOpenDateTime(false)}>Fechar</button>
              <button className="px-3 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90" onClick={() => setOpenDateTime(false)}>Salvar</button>
            </div>
          </div>
        </div>
      )}

      {openServiceType && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]" onClick={() => setOpenServiceType(false)}>
          <div className="bg-white w-full max-w-md rounded-lg shadow-xl p-4" onClick={(e) => e.stopPropagation()}>
            <div className="text-lg font-bold text-foreground">Tipo de chamado</div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(callCategory === "Informatica" ? ["1h","2h","3h","Meia diária","Diária"] : ["Instalação"]).map((opt) => (
                <button key={opt} className="px-3 py-2 border border-slate-300 rounded hover:bg-slate-100" onClick={() => { setServiceType(opt); setOpenServiceType(false); }}>{opt}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {openTimeLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]" onClick={() => setOpenTimeLog(false)}>
          <div className="bg-white dark:bg-slate-800 dark:text-slate-100 w-full max-w-md rounded-lg shadow-xl p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold text-foreground">Log de controle de tempo</div>
              <button className="text-xs text-slate-700 dark:text-slate-300">Exportar para Excel</button>
            </div>
            <div className="mt-4">
              <button className="px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700" onClick={() => setOpenAddSession(true)}>+ Adicionar sessão manualmente</button>
            </div>
            {workSessions.length > 0 && (
              <div className="mt-3 space-y-2">
                {workSessions.map((s, idx) => {
                  const d = new Date(s.startIso);
                  const e = new Date(s.endIso);
                  const ms = Math.max(0, e.getTime() - d.getTime());
                  return (
                    <div key={`${s.startIso}-${idx}`} className="flex items-center justify-between border border-border rounded-md px-3 py-2">
                      <div className="text-sm text-foreground">{d.toLocaleDateString("pt-BR")} {d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", hourCycle: "h23" })} – {e.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", hourCycle: "h23" })}</div>
                      <div className="flex items-center gap-3">
                        <div className="text-sm text-foreground">{formatDuration(ms)}</div>
                        <button className="text-xs text-blue-600 hover:underline" onClick={() => openEditSession(idx)}>Editar</button>
                        <button className="text-xs text-red-600 hover:underline" onClick={() => removeSession(idx)}>Remover</button>
                      </div>
                    </div>
                  );
                  })}
              </div>
            )}
            <div className="flex justify-end gap-2 mt-3">
              <button className="px-3 py-2 rounded-md bg-muted text-foreground" onClick={() => setOpenTimeLog(false)}>Fechar</button>
            </div>
          </div>
        </div>
      )}

      {openAddSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70]" onClick={() => setOpenAddSession(false)}>
          <div className="bg-white dark:bg-slate-800 dark:text-slate-100 w-full max-w-md rounded-lg shadow-xl p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold text-foreground">Adicionar sessão</div>
              <button className="text-xs text-slate-700" onClick={() => setOpenAddSession(false)}>Voltar</button>
            </div>
            <div className="mt-3 space-y-3">
              <div className="space-y-1">
                <div className="text-xs text-slate-700 dark:text-slate-300">Data</div>
                <input className="border border-slate-300 rounded-md px-3 py-2 w-full" type="date" value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <div className="text-xs text-slate-700 dark:text-slate-300">Começar em</div>
                  <select className="border border-slate-300 rounded-md px-3 py-2 w-full" value={sessionStart} onChange={(e) => setSessionStart(e.target.value)}>
                    <option value="">Selecione</option>
                    {times.map((t: string) => (<option key={`start-${t}`} value={t}>{t}</option>))}
                  </select>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-slate-700 dark:text-slate-300">Terminar em</div>
                  <select className="border border-slate-300 rounded-md px-3 py-2 w-full" value={sessionEnd} onChange={(e) => setSessionEnd(e.target.value)}>
                    <option value="">Selecione</option>
                    {times.map((t: string) => (<option key={`end-${t}`} value={t}>{t}</option>))}
                  </select>
                </div>
              </div>
              <div className="text-sm text-slate-700">
                {isValidHHMM(sessionStart) && isValidHHMM(sessionEnd) ? (() => {
                  const toMin = (x: string) => { const [hh, mm] = x.split(":"); return Number(hh) * 60 + Number(mm); };
                  const mins = Math.max(0, toMin(sessionEnd) - toMin(sessionStart));
                  const h = Math.floor(mins / 60);
                  const m = mins % 60;
                  return `${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m 00s`;
                })() : ""}
              </div>
              <div className="flex justify-end gap-2">
                <button className="px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50" onClick={addManualSession} disabled={!sessionDate || !isValidHHMM(sessionStart) || !isValidHHMM(sessionEnd)}>Adicionar sessão</button>
              </div>
            </div>
          </div>
        </div>
      )}
      

      <div className="mt-4">
        <div className="flex items-center gap-2 mb-2">
          <button className={`px-2 py-1 rounded-md border border-border ${viewFilter === "todos" ? "bg-muted" : ""}`} onClick={() => setViewFilter("todos")}>Todos</button>
          <button className={`px-2 py-1 rounded-md border border-border ${viewFilter === "avisos" ? "bg-muted" : ""}`} onClick={() => setViewFilter("avisos")}>Avisos</button>
          <button className={`px-2 py-1 rounded-md border border-border ${viewFilter === "andamento" ? "bg-muted" : ""}`} onClick={() => setViewFilter("andamento")}>Em andamento</button>
          <button className={`px-2 py-1 rounded-md border border-border ${viewFilter === "ontem" ? "bg-muted" : ""}`} onClick={() => setViewFilter("ontem")}>Ontem</button>
          <button className={`px-2 py-1 rounded-md border border-border ${viewFilter === "hoje" ? "bg-muted" : ""}`} onClick={() => setViewFilter("hoje")}>Hoje</button>
          <button className={`px-2 py-1 rounded-md border border-border ${viewFilter === "amanha" ? "bg-muted" : ""}`} onClick={() => setViewFilter("amanha")}>Amanhã</button>
          <button className={`px-2 py-1 rounded-md border border-border ${viewFilter === "data" ? "bg-muted" : ""}`} onClick={() => setViewFilter("data")}>Data específica</button>
          {viewFilter === "data" && (
            <div className="flex items-center gap-2 ml-2">
              <input type="date" className="border border-border rounded-md px-2 py-1 bg-background text-foreground" value={viewDate} onChange={(e) => setViewDate(e.target.value)} />
              <input type="text" placeholder="HH:MM" className="border border-border rounded-md px-2 py-1 bg-background text-foreground w-24" value={viewTime} onChange={(e) => setViewTime(e.target.value)} />
              <select className="border border-border rounded-md px-2 py-1 bg-background text-foreground w-28" value={viewTime} onChange={(e) => setViewTime(e.target.value)}>
                <option value="">Hora</option>
                {times.map((t: string) => (<option key={t} value={t}>{t}</option>))}
              </select>
            </div>
          )}
        </div>
        {groupedByMonth.map(([label, list]) => (
          <div key={label} className="mb-4">
            <div className="text-sm font-semibold text-foreground mb-2">{label}</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {list.map((c) => {
              const empresaNome = mapEmpresa[c.empresaId] || c.empresaId;
              const empresaPrimeira = (empresaNome || "").split(/\s+/)[0] || empresaNome;
              const dataHora = [formatDateBr(c.appointmentDate), formatTimeBr(c.appointmentTime)].filter(Boolean).join(" ") || "—";
              const tecnicoNome = displayTecnico({ id: c.tecnicoId, name: mapTecnico[c.tecnicoId] || c.tecnicoId, cidade: c.cidade, estado: c.estado, status: undefined } as unknown as TecnicoLite).split(" - ")[0];
              return (
                <div key={c.id} className={`border border-border rounded-md bg-surface p-3 cursor-pointer ${statusClasses(c.status)}`} onClick={() => openEdit(c)}>
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-foreground">{c.name}</div>
                    {c.status === "Em andamento" ? <span className="ml-2 inline-flex items-center rounded px-2 py-0.5 text-xs bg-green-600 text-white">Em andamento</span> : null}
                  </div>
                  <div className="text-sm text-foreground mt-1">Data Hora: {dataHora}</div>
                  <div className="text-sm text-foreground">Técnico: {tecnicoNome}</div>
                  <div className="text-sm text-foreground">Cidade: {c.cidade || "—"}</div>
                  <div className="text-sm text-foreground">Estado: {c.estado || "—"}</div>
                  <div className="text-sm text-foreground">Status: {c.status}</div>
                </div>
              );
            })}
            </div>
          </div>
        ))}
      </div>
      
    </div>
  );
}
  function displayTecnico(t: TecnicoLite): string {
    const parts = (t.name || "").trim().split(/\s+/);
    const base = parts.length >= 2 ? `${parts[0]} ${parts[parts.length - 1]}` : (t.name || "");
    const loc = [t.cidade, t.estado].filter(Boolean).join(" - ");
    return [base, loc].filter(Boolean).join(" - ");
  }
