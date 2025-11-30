"use client";
import { useEffect, useRef, useState } from "react";
 
import { db, storage } from "@/lib/firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, CollectionReference, onSnapshot, query, orderBy, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import type { Empresa } from "@/types";

export default function EmpresasPage() {
  const [items, setItems] = useState<(Empresa & { id: string })[]>([]);
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<(Empresa & { id: string }) | null>(null);
  const [detailForm, setDetailForm] = useState<(Empresa & { id: string }) | null>(null);
  
  const [form, setForm] = useState<Empresa>({
    name: "",
    cnpj: "",
    responsaveis: [{ nome: "", numero: "" }],
    documentos: [],
    
    trackerEnabled: false,
    itRate3h: undefined,
    itHalfDaily: undefined,
    itDaily: undefined,
    itAdditionalHour: undefined,
    itMileage: undefined,
    trackerInstallationRate: undefined,
    itToleranceMinutes: undefined,
  });
  const [docName, setDocName] = useState("");
  const [docFile, setDocFile] = useState<File | null>(null);
  const [openDocs, setOpenDocs] = useState(false);
  const [openResp, setOpenResp] = useState(false);
  const [openVals, setOpenVals] = useState(false);
  const [modalTarget, setModalTarget] = useState<"new" | "detail" | null>(null);
  const [docsDetailName, setDocsDetailName] = useState("");
  const [docsDetailFile, setDocsDetailFile] = useState<File | null>(null);
  const fileInputNewRef = useRef<HTMLInputElement | null>(null);
  const fileInputDetailRef = useRef<HTMLInputElement | null>(null);
  const [detailDocs, setDetailDocs] = useState<{ id: string; nome: string; url: string; path: string }[]>([]);
  const [newDocs, setNewDocs] = useState<{ nome: string; url: string; path: string }[]>([]);
  const [editingDocIndex, setEditingDocIndex] = useState<number | null>(null);
  const [editingDocName, setEditingDocName] = useState<string>("");
  const [editingDocFile, setEditingDocFile] = useState<File | null>(null);
  const [money, setMoney] = useState<Record<string, string>>({
    itRate1h: "",
    itRate2h: "",
    trackerInstallationRate: "",
    itRate3h: "",
    itRate4h: "",
    itHalfDaily: "",
    itDaily: "",
    itMileage: "",
    itAdditionalHour: "",
  });
  const [visibleHours, setVisibleHours] = useState<number[]>([1,2,3,4,5,6,7,8,9]);

  function getHoursFrom(e: Partial<Empresa>): number[] {
    const hrs: number[] = [];
    for (let h = 1; h <= 12; h++) {
      const key = `itRate${h}h` as keyof Empresa;
      const val = (e as Record<string, unknown>)[key] as unknown;
      if (typeof val === "number") hrs.push(h);
    }
    return hrs.length ? hrs : [1,2,3,4,5,6,7,8,9];
  }

  function formatCurrency(n?: number): string {
    if (typeof n !== "number" || isNaN(n)) return "";
    return n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function handleCurrencyDetail(key: keyof Empresa) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const digits = e.target.value.replace(/\D/g, "");
      const val = digits ? Number(digits) / 100 : undefined;
      setDetailForm((prev) => ({ ...prev!, [key]: val }));
    };
  }

  function sanitizeMoney(e: Empresa): Empresa {
    const r: Empresa = { ...e };
    const fix = (x?: number) => (typeof x === "number" && !isFinite(x)) ? undefined : x;
    r.itRate1h = fix(e.itRate1h);
    r.itRate2h = fix(e.itRate2h);
    r.trackerInstallationRate = fix(e.trackerInstallationRate);
    r.itRate3h = fix(e.itRate3h);
    r.itRate4h = fix(e.itRate4h);
    r.itHalfDaily = fix(e.itHalfDaily);
    r.itDaily = fix(e.itDaily);
    r.itMileage = fix(e.itMileage);
    r.itAdditionalHour = fix(e.itAdditionalHour);
    r.itToleranceMinutes = (typeof e.itToleranceMinutes === "number" && isFinite(e.itToleranceMinutes)) ? e.itToleranceMinutes : undefined;
    return r;
  }

  function buildPayloadEmpresa(e: Empresa & { id?: string }, extra?: Record<string, unknown>): Empresa {
    const base: Partial<Empresa> & Record<string, unknown> = { ...e, ...(extra || {}) };
    const valores = {
      itRate1h: e.itRate1h,
      itRate2h: e.itRate2h,
      trackerInstallationRate: e.trackerInstallationRate,
      itRate3h: e.itRate3h,
      itRate4h: e.itRate4h,
      itRate5h: e.itRate5h,
      itRate6h: e.itRate6h,
      itRate7h: e.itRate7h,
      itRate8h: e.itRate8h,
      itRate9h: e.itRate9h,
      itRate10h: e.itRate10h,
      itRate11h: e.itRate11h,
      itRate12h: e.itRate12h,
      itHalfDaily: e.itHalfDaily,
      itDaily: e.itDaily,
      itMileage: e.itMileage,
      itAdditionalHour: e.itAdditionalHour,
      itToleranceMinutes: e.itToleranceMinutes,
    };
    delete base.itRate1h;
    delete base.itRate2h;
    delete base.trackerInstallationRate;
    delete base.itRate3h;
    delete base.itRate4h;
    delete base.itRate5h;
    delete base.itRate6h;
    delete base.itRate7h;
    delete base.itRate8h;
    delete base.itRate9h;
    delete base.itRate10h;
    delete base.itRate11h;
    delete base.itRate12h;
    delete base.itHalfDaily;
    delete base.itDaily;
    delete base.itMileage;
    delete base.itAdditionalHour;
    delete base.itToleranceMinutes;
    base.valores = valores;
    return cleanObj(base) as Empresa;
  }

  function cleanObj(obj: Record<string, unknown>): Record<string, unknown> {
    const copy: Record<string, unknown> = {};
    Object.keys(obj || {}).forEach((k) => {
      const v = obj[k];
      if (v === undefined) return;
      if (typeof v === "number" && !isFinite(v)) return;
      if (Array.isArray(v)) copy[k] = v;
      else if (v !== null && typeof v === "object") {
        const nested = cleanObj(v as Record<string, unknown>);
        if (Object.keys(nested).length) copy[k] = nested;
      } else copy[k] = v;
    });
    return copy;
  }

  function formatBrPhoneDisplay(nat: string): string {
    const d = (nat || "").replace(/\D/g, "");
    if (d.length === 11) {
      const dd = d.slice(0, 2);
      const a = d.slice(2, 7);
      const b = d.slice(7);
      return `(${dd}) ${a}-${b}`;
    }
    if (d.length === 10) {
      const dd = d.slice(0, 2);
      const a = d.slice(2, 6);
      const b = d.slice(6);
      return `(${dd}) ${a}-${b}`;
    }
    return d;
  }

  

  async function loadDetailDocs(id: string) {
    if (!db) return;
    const sub = collection(db, `empresas/${id}/documentos`);
    const snap = await getDocs(sub);
    const list = snap.docs.map((d) => {
      const data = d.data() as { nome?: string; url?: string; path?: string };
      return { id: d.id, nome: data.nome || "", url: data.url || "", path: data.path || "" };
    });
    setDetailDocs(list);
  }

  const [qName, setQName] = useState("");
  const [qCnpj, setQCnpj] = useState("");
  const [qResp, setQResp] = useState("");

  const filtered = items.filter((e) => {
    const nameOk = qName ? (e.name || "").toLowerCase().includes(qName.toLowerCase()) : true;
    const cnpjOk = qCnpj ? (e.cnpj || "").replace(/\D/g, "").includes(qCnpj.replace(/\D/g, "")) : true;
    const respOk = qResp ? ((e.responsaveis?.[0]?.nome || e.contact || "").toLowerCase().includes(qResp.toLowerCase())) : true;
    return nameOk && cnpjOk && respOk;
  });

  function handleCurrency(key: keyof Empresa) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const digits = e.target.value.replace(/\D/g, "");
      const val = digits ? (Number(digits) / 100) : 0;
      const display = digits ? val.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "";
      setMoney((prev) => ({ ...prev, [key as string]: display }));
      setForm((prev) => ({ ...prev, [key]: digits ? val : undefined }));
    };
  }

  useEffect(() => {
    if (!db) return;
    const col = collection(db, "empresas") as CollectionReference<Empresa>;
    const q = query(col, orderBy("name"));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => {
        const raw = d.data() as Empresa;
        const v = raw.valores;
        if (v) {
          raw.itRate1h = v.itRate1h;
          raw.itRate2h = v.itRate2h;
          raw.trackerInstallationRate = v.trackerInstallationRate;
          raw.itRate3h = v.itRate3h;
          raw.itRate4h = v.itRate4h;
          raw.itRate5h = v.itRate5h;
          raw.itRate6h = v.itRate6h;
          raw.itRate7h = v.itRate7h;
          raw.itRate8h = v.itRate8h;
          raw.itRate9h = v.itRate9h;
          raw.itRate10h = v.itRate10h;
          raw.itRate11h = v.itRate11h;
          raw.itRate12h = v.itRate12h;
          raw.itHalfDaily = v.itHalfDaily;
          raw.itDaily = v.itDaily;
          raw.itMileage = v.itMileage;
          raw.itAdditionalHour = v.itAdditionalHour;
          raw.itToleranceMinutes = v.itToleranceMinutes;
        }
        const data = sanitizeMoney(raw);
        return { id: d.id, ...data };
      });
      setItems(list);
    });
    return () => unsub();
  }, []);

  // visibleHours é inicializado ao abrir o modal de Valores

  async function create() {
    if (!db) return;
    const col = collection(db, "empresas") as CollectionReference<Empresa>;
    const first = (form.responsaveis && form.responsaveis[0]) ? form.responsaveis[0] : undefined;
    const payload = buildPayloadEmpresa(form, { contact: first?.nome, contactNumber: first?.numero });
    const refDoc = await addDoc(col, payload);
    if (newDocs.length) {
      const sub = collection(db, `empresas/${refDoc.id}/documentos`);
      for (const d of newDocs) {
        await addDoc(sub, { nome: d.nome, url: d.url, path: d.path, createdAt: Date.now() });
      }
      setNewDocs([]);
    }
    setOpen(false);
  }

  async function removeCompany(id: string, docs?: { nome: string; url: string }[]) {
    const typed = prompt("Para confirmar a exclusão digite 'sim'");
    if (!typed || typed.trim().toLowerCase() !== "sim") return;
    try {
      if (storage && docs && docs.length) {
        for (const d of docs) {
          try { const r = ref(storage, d.url); await deleteObject(r); } catch {}
        }
      }
      await deleteDoc(doc(db, "empresas", id));
    } catch {}
    setDetail(null);
    setDetailForm(null);
  }

  async function addDocumentoTo(target: "new" | "detail") {
    if (!((target === "detail" ? docsDetailName : docName))) return;
    const file = target === "detail" ? docsDetailFile : docFile;
    const name = target === "detail" ? docsDetailName : docName;
    if (!name || !file) return;
    if (!storage) {
      const fakeUrl = URL.createObjectURL(file);
      if (target === "detail") {
        const next = [...detailDocs, { id: `local-${Date.now()}`, nome: name, url: fakeUrl, path: "" }];
        setDetailDocs(next);
        setDocsDetailName(""); setDocsDetailFile(null);
        if (fileInputDetailRef.current) fileInputDetailRef.current.value = "";
      } else {
        setNewDocs((prev) => ([...prev, { nome: name, url: fakeUrl, path: "" }]));
        setDocName(""); setDocFile(null);
        if (fileInputNewRef.current) fileInputNewRef.current.value = "";
      }
      return;
    }
    const baseName = target === "detail" ? (detailForm?.name || "empresa") : (form.name || "empresa");
    const path = `empresas/${(baseName).replace(/[^a-zA-Z0-9_-]/g, "_")}/${Date.now()}-${name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const r = ref(storage, path);
    await uploadBytes(r, file);
    const url = await getDownloadURL(r);
    if (target === "detail") {
      if (db && detailForm) {
        const sub = collection(db, `empresas/${detailForm.id}/documentos`);
        const dref = await addDoc(sub, { nome: name, url, path, createdAt: Date.now() });
        setDetailDocs((prev) => ([...prev, { id: dref.id, nome: name, url, path }]));
      }
      setDocsDetailName(""); setDocsDetailFile(null);
      if (fileInputDetailRef.current) fileInputDetailRef.current.value = "";
    } else {
      setNewDocs((prev) => ([...prev, { nome: name, url, path }]));
      setDocName(""); setDocFile(null);
      if (fileInputNewRef.current) fileInputNewRef.current.value = "";
    }
  }

  async function saveEditDoc() {
    const target = modalTarget === "detail" ? "detail" : "new";
    if (editingDocIndex == null) return;
    if (target === "detail") {
      const current = detailDocs[editingDocIndex];
      const nextName = (editingDocName || current?.nome || "").trim();
      if (!current || !detailForm || !db) { setEditingDocIndex(null); setEditingDocName(""); setEditingDocFile(null); return; }
      if (!detailForm || !db) { setEditingDocIndex(null); setEditingDocName(""); setEditingDocFile(null); return; }
      let url = current.url;
      let path = current.path;
      if (editingDocFile && storage) {
        try {
          const baseName = (detailForm.name || "empresa").replace(/[^a-zA-Z0-9_-]/g, "_");
          const safeName = (nextName || editingDocFile.name).replace(/[^a-zA-Z0-9._-]/g, "_");
          const newPath = `empresas/${baseName}/${Date.now()}-${safeName}`;
          const r = ref(storage, newPath);
          await uploadBytes(r, editingDocFile);
          const newUrl = await getDownloadURL(r);
          url = newUrl;
          path = newPath;
          if (current.path) { try { const old = ref(storage, current.path); await deleteObject(old); } catch {} }
        } catch {}
      }
      try {
        const dref = doc(db, `empresas/${detailForm.id}/documentos/${current.id}`);
        await updateDoc(dref, { nome: nextName || current.nome, url, path, updatedAt: Date.now() });
        setDetailDocs((prev) => prev.map((d, i) => i === editingDocIndex ? { ...d, nome: nextName || d.nome, url, path } : d));
      } catch {}
    } else {
      const current = newDocs[editingDocIndex];
      const nextName = (editingDocName || current?.nome || "").trim();
      if (!current) { setEditingDocIndex(null); setEditingDocName(""); setEditingDocFile(null); return; }
      let url = current.url;
      let path = current.path;
      if (editingDocFile && storage) {
        try {
          const baseName = (form.name || "empresa").replace(/[^a-zA-Z0-9_-]/g, "_");
          const safeName = (nextName || editingDocFile.name).replace(/[^a-zA-Z0-9._-]/g, "_");
          const newPath = `empresas/${baseName}/${Date.now()}-${safeName}`;
          const r = ref(storage, newPath);
          await uploadBytes(r, editingDocFile);
          const newUrl = await getDownloadURL(r);
          url = newUrl;
          path = newPath;
          if (current.path) { try { const old = ref(storage, current.path); await deleteObject(old); } catch {} }
        } catch {}
      }
      setNewDocs((prev) => prev.map((d, i) => i === editingDocIndex ? { ...d, nome: nextName || d.nome, url, path } : d));
    }
    setEditingDocIndex(null);
    setEditingDocName("");
    setEditingDocFile(null);
    if (fileInputDetailRef.current) fileInputDetailRef.current.value = "";
  }

  // removido: usar addDocumentoTo("new"|"detail")

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-2xl font-bold text-slate-900">Empresas</div>
        <button className="px-3 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700" onClick={() => setOpen(true)}>Nova empresa</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <input className="border border-slate-300 rounded-md px-3 py-2" placeholder="Filtrar por nome" value={qName} onChange={(e) => setQName(e.target.value)} />
        <input className="border border-slate-300 rounded-md px-3 py-2" placeholder="Filtrar por CNPJ" value={qCnpj} onChange={(e) => setQCnpj(e.target.value)} />
        <input className="border border-slate-300 rounded-md px-3 py-2" placeholder="Filtrar por responsável" value={qResp} onChange={(e) => setQResp(e.target.value)} />
      </div>

      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full border border-slate-200 bg-white">
          <thead>
            <tr className="bg-slate-100">
              <th className="p-2 text-left">Nome</th>
              <th className="p-2 text-left">CNPJ</th>
              <th className="p-2 text-left">Responsáveis</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => (
              <tr key={e.id} className="border-t border-slate-200 hover:bg-slate-50 cursor-pointer" onClick={async () => { setDetail(e); setDetailForm({ ...e }); await loadDetailDocs(e.id); }}>
                <td className="p-2 text-slate-800">{e.name}</td>
                <td className="p-2 text-slate-800">{e.cnpj}</td>
                <td className="p-2 text-slate-800">
                  {(() => {
                    const list = (e.responsaveis || []).map((r) => r.nome).filter(Boolean);
                    const count = list.length;
                    const tooltip = list.join(", ");
                    return <span title={tooltip || "Sem responsáveis"}>👥 {count}</span>;
                  })()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-2">
        {filtered.map((e) => (
          <div key={e.id} className="border border-slate-200 rounded-md bg-white p-3" onClick={async () => { setDetail(e); setDetailForm({ ...e }); await loadDetailDocs(e.id); }}>
            <div className="font-semibold text-slate-900">{e.name}</div>
            <div className="text-sm text-slate-700">CNPJ: {e.cnpj}</div>
            <div className="text-sm text-slate-700">Responsáveis: 👥 {(e.responsaveis || []).length}</div>
          </div>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center" onClick={() => setOpen(false)}>
          <div className="w-full max-w-3xl bg-white rounded-lg p-4 sm:p-6 space-y-3 shadow-xl max-h-[85vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="text-lg font-bold text-slate-900">Nova empresa</div>
      <div className="space-y-2">
        <div className="text-sm font-semibold text-slate-900">Dados da empresa</div>
        <input className="w-full border border-slate-300 rounded-md px-3 py-2" placeholder="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="w-full border border-slate-300 rounded-md px-3 py-2" placeholder="CNPJ" value={form.cnpj} onChange={(e) => setForm({ ...form, cnpj: e.target.value })} />
        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={!!form.trackerEnabled} onChange={(e) => setForm({ ...form, trackerEnabled: e.target.checked })} />
          <span>Empresa realiza instalação de rastreador veicular</span>
        </label>
        
      </div>

            <div className="pt-2 space-y-2">
              <div className="text-sm font-semibold text-slate-900">Gerenciamento</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button type="button" className="px-3 py-2 rounded-md border border-slate-300 text-slate-900 hover:bg-slate-100" onClick={() => { setModalTarget("new"); setOpenDocs(true); }}>Documentos</button>
                <button type="button" className="px-3 py-2 rounded-md border border-slate-300 text-slate-900 hover:bg-slate-100" onClick={() => { setModalTarget("new"); setOpenResp(true); }}>Responsáveis</button>
                <button type="button" className="px-3 py-2 rounded-md border border-slate-300 text-slate-900 hover:bg-slate-100" onClick={() => { setModalTarget("new"); setVisibleHours([1,2,3,4,5,6,7,8,9]); setOpenVals(true); }}>Valores</button>
              </div>
            </div>
            

            

            <div className="flex gap-2">
              <button className="flex-1 rounded-md py-2 bg-indigo-600 text-white hover:bg-indigo-700" onClick={create}>Salvar</button>
              <button className="flex-1 rounded-md py-2 bg-slate-200 text-slate-900 hover:bg-slate-300" onClick={() => setOpen(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
      {openDocs && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]" onClick={() => setOpenDocs(false)}>
          <div className="bg-white w-full max-w-xl rounded-lg p-4 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="text-lg font-bold text-slate-900">Documentos da empresa</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input className="border border-slate-300 rounded-md px-3 py-2" placeholder="Nome do documento" value={modalTarget === "detail" ? docsDetailName : docName} onChange={(e) => modalTarget === "detail" ? setDocsDetailName(e.target.value) : setDocName(e.target.value)} />
              <input className="border border-slate-300 rounded-md px-3 py-2 sm:col-span-2" type="file" ref={modalTarget === "detail" ? fileInputDetailRef : fileInputNewRef} onChange={(e) => modalTarget === "detail" ? setDocsDetailFile(e.target.files?.[0] || null) : setDocFile(e.target.files?.[0] || null)} />
            </div>
            <div className="flex justify-end">
              <button className="px-3 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700" onClick={() => addDocumentoTo(modalTarget === "detail" ? "detail" : "new")}>Enviar documento</button>
            </div>
            {!!(((modalTarget === "detail" ? detailDocs : newDocs) || []).length) && (
              <div className="space-y-1 max-h-64 overflow-auto">
                {((modalTarget === "detail" ? detailDocs : newDocs) || []).map((d, i) => (
                  <div key={i} className="border border-slate-200 rounded px-3 py-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-slate-800 truncate mr-2">{d.nome}</div>
                      <div className="flex items-center gap-2">
                        <a href={d.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm hover:underline">Abrir</a>
                        <button className="text-slate-700 text-sm hover:underline" onClick={() => { setEditingDocIndex(i); setEditingDocName(d.nome); setEditingDocFile(null); }}>Editar</button>
                        <button className="text-red-600 text-sm hover:underline" onClick={async () => {
                          try { if (storage) { const r = ref(storage, d.path || d.url); await deleteObject(r); } } catch {}
                          if (modalTarget === "detail" && detailForm && db) {
                            const delId = (detailDocs[i] && detailDocs[i].id) ? detailDocs[i].id : undefined;
                            if (delId) await deleteDoc(doc(db, `empresas/${detailForm.id}/documentos/${delId}`));
                            setDetailDocs((prev) => prev.filter((_, idx) => idx !== i));
                          } else {
                            setNewDocs((prev) => prev.filter((_, idx) => idx !== i));
                          }
                          if (editingDocIndex === i) { setEditingDocIndex(null); setEditingDocName(""); setEditingDocFile(null); }
                        }}>Excluir</button>
                      </div>
                    </div>
                    {editingDocIndex === i && (
                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input className="border border-slate-300 rounded-md px-3 py-2" placeholder="Nome do documento" value={editingDocName} onChange={(e) => setEditingDocName(e.target.value)} />
                        <input className="border border-slate-300 rounded-md px-3 py-2 sm:col-span-2" type="file" onChange={(e) => setEditingDocFile(e.target.files?.[0] || null)} />
                        <div className="sm:col-span-3 flex justify-end gap-2">
                          <button className="px-3 py-2 rounded-md bg-slate-200 text-slate-900 hover:bg-slate-300" onClick={() => { setEditingDocIndex(null); setEditingDocName(""); setEditingDocFile(null); }}>Cancelar</button>
                          <button className="px-3 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700" onClick={saveEditDoc}>Salvar alterações</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end">
              <button className="px-3 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700" onClick={async () => {
                if (modalTarget === "detail" && detailForm && db) {
                  const first = (detailForm.responsaveis && detailForm.responsaveis[0]) ? detailForm.responsaveis[0] : undefined;
                  const payload = buildPayloadEmpresa(detailForm, { contact: first?.nome, contactNumber: first?.numero });
                  await updateDoc(doc(db, "empresas", detailForm.id), payload);
                  setItems((prev) => prev.map((x) => (x.id === detailForm.id ? { ...x, ...payload, id: x.id } : x)));
                }
                setOpenDocs(false);
              }}>Salvar</button>
            </div>
          </div>
        </div>
      )}

      {openResp && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]" onClick={() => setOpenResp(false)}>
          <div className="bg-white w-full max-w-xl rounded-lg p-4 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="text-lg font-bold text-slate-900">Responsáveis</div>
            {(((modalTarget === "detail" ? detailForm?.responsaveis : form.responsaveis) || [])).map((r, idx) => (
              <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input className="w-full border border-slate-300 rounded-md px-3 py-2" placeholder="Responsável" value={r.nome} onChange={(e) => { if (modalTarget === "detail") setDetailForm((prev) => ({ ...prev!, responsaveis: (prev!.responsaveis || []).map((x, i) => i === idx ? { ...x, nome: e.target.value } : x) })); else setForm({ ...form, responsaveis: (form.responsaveis || []).map((x, i) => i === idx ? { ...x, nome: e.target.value } : x) }); }} />
                <input className="w-full border border-slate-300 rounded-md px-3 py-2" placeholder="Número do responsável" inputMode="numeric" value={formatBrPhoneDisplay(r.numero || "")} onChange={(e) => { const v = e.target.value.replace(/\D/g, "").slice(0, 11); if (modalTarget === "detail") setDetailForm((prev) => ({ ...prev!, responsaveis: (prev!.responsaveis || []).map((x, i) => i === idx ? { ...x, numero: v } : x) })); else setForm({ ...form, responsaveis: (form.responsaveis || []).map((x, i) => i === idx ? { ...x, numero: v } : x) }); }} />
                <div className="flex items-center">
                  <button type="button" className="w-full px-3 py-2 rounded-md bg-green-600 text-white hover:bg-green-700" onClick={() => {
                    const num = String(r.numero || "").replace(/\D/g, "");
                    if (!num) return;
                    const url = `https://wa.me/55${num}`;
                    window.open(url, "_blank", "noopener,noreferrer");
                  }}>Chamar no WhatsApp</button>
                </div>
              </div>
            ))}
            <div className="flex justify-between">
              <button className="px-3 py-2 rounded-md bg-slate-200 text-slate-900 hover:bg-slate-300" onClick={() => { if (modalTarget === "detail") setDetailForm((prev) => ({ ...prev!, responsaveis: [...(prev!.responsaveis || []), { nome: "", numero: "" }] })); else setForm({ ...form, responsaveis: [...(form.responsaveis || []), { nome: "", numero: "" }] }); }}>Adicionar responsável</button>
              <button className="px-3 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700" onClick={async () => {
                if (modalTarget === "detail" && detailForm && db) {
                  const first = (detailForm.responsaveis && detailForm.responsaveis[0]) ? detailForm.responsaveis[0] : undefined;
                  const payload = buildPayloadEmpresa(detailForm, { contact: first?.nome, contactNumber: first?.numero });
                  await updateDoc(doc(db, "empresas", detailForm.id), payload);
                  setItems((prev) => prev.map((x) => (x.id === detailForm.id ? { ...x, ...payload, id: x.id } : x)));
                }
                setOpenResp(false);
              }}>Salvar</button>
            </div>
          </div>
        </div>
      )}

      {openVals && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]" onClick={() => setOpenVals(false)}>
          <div className="bg-white w-full max-w-xl rounded-lg p-4 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="text-lg font-bold text-slate-900">Valores</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="space-y-1"><div className="text-xs text-slate-600">Rastreador veicular</div><div className="flex items-center"><span className="px-3 py-2 bg-slate-100 border border-slate-300 rounded-l-md text-slate-700">R$</span><input className="flex-1 border border-l-0 border-slate-300 rounded-r-md px-3 py-2" inputMode="numeric" value={modalTarget === "detail" ? formatCurrency(detailForm?.trackerInstallationRate) : money.trackerInstallationRate} onChange={modalTarget === "detail" ? handleCurrencyDetail("trackerInstallationRate") : handleCurrency("trackerInstallationRate")} /></div></div>
              {visibleHours.map((h) => {
                const key = `itRate${h}h` as keyof Empresa;
                const label = `${h}h`;
                const source: Partial<Empresa> = modalTarget === "detail" ? (detailForm || {}) : form;
                const display = modalTarget === "detail" ? formatCurrency(source[key] as number | undefined) : money[key as string];
                const onChange = modalTarget === "detail" ? handleCurrencyDetail(key) : handleCurrency(key);
                return (
                  <div key={h} className="space-y-1"><div className="text-xs text-slate-600">{label}</div><div className="flex items-center"><span className="px-3 py-2 bg-slate-100 border border-slate-300 rounded-l-md text-slate-700">R$</span><input className="flex-1 border border-l-0 border-slate-300 rounded-r-md px-3 py-2" inputMode="numeric" value={display} onChange={onChange} /></div></div>
                );
              })}
              
              <div className="space-y-1"><div className="text-xs text-slate-600">Deslocamento</div><div className="flex items-center"><span className="px-3 py-2 bg-slate-100 border border-slate-300 rounded-l-md text-slate-700">R$</span><input className="flex-1 border border-l-0 border-slate-300 rounded-r-md px-3 py-2" inputMode="numeric" value={modalTarget === "detail" ? formatCurrency(detailForm?.itMileage) : money.itMileage} onChange={modalTarget === "detail" ? handleCurrencyDetail("itMileage") : handleCurrency("itMileage")} /></div></div>
              <div className="space-y-1"><div className="text-xs text-slate-600">Hora adicional</div><div className="flex items-center"><span className="px-3 py-2 bg-slate-100 border border-slate-300 rounded-l-md text-slate-700">R$</span><input className="flex-1 border border-l-0 border-slate-300 rounded-r-md px-3 py-2" inputMode="numeric" value={modalTarget === "detail" ? formatCurrency(detailForm?.itAdditionalHour) : money.itAdditionalHour} onChange={modalTarget === "detail" ? handleCurrencyDetail("itAdditionalHour") : handleCurrency("itAdditionalHour")} /></div></div>
              <div className="space-y-1 sm:col-span-2"><div className="text-xs text-slate-600">Tolerância (minutos) para adicional</div><input className="border border-slate-300 rounded-md px-3 py-2 w-full" inputMode="numeric" value={(modalTarget === "detail" ? (detailForm?.itToleranceMinutes ?? "") : (form.itToleranceMinutes ?? "")) as unknown as string} onChange={(e) => { const n = Number(e.target.value.replace(/\D/g, "")); if (modalTarget === "detail") setDetailForm((prev) => ({ ...prev!, itToleranceMinutes: isFinite(n) ? n : undefined })); else setForm((prev) => ({ ...prev, itToleranceMinutes: isFinite(n) ? n : undefined })); }} /></div>
            </div>
            <div className="text-xs text-slate-600 mt-1">9h equivale à diária (8h de serviço + 1h de almoço). Acima de 9h utiliza hora adicional.</div>
            
            <div className="flex justify-end"><button className="px-3 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700" onClick={async () => {
              if (modalTarget === "detail") {
                if (!db || !detailForm) return;
                const first = (detailForm.responsaveis && detailForm.responsaveis[0]) ? detailForm.responsaveis[0] : undefined;
                const payload = buildPayloadEmpresa(detailForm, { contact: first?.nome, contactNumber: first?.numero });
                await updateDoc(doc(db, "empresas", detailForm.id), payload);
                setItems((prev) => prev.map((x) => (x.id === detailForm.id ? { ...x, ...payload, id: x.id } : x)));
              }
              setOpenVals(false);
            }}>Salvar</button></div>
          </div>
        </div>
      )}

      {detail && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => { setDetail(null); setDetailForm(null); }}>
          <div className="bg-white w-full max-w-3xl rounded-lg p-6 space-y-4 max-h-[85vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="space-y-2">
          <div className="text-sm font-semibold text-slate-900">Dados da empresa</div>
          <input className="w-full border border-slate-300 rounded-md px-3 py-2" placeholder="Nome" value={detailForm!.name} onChange={(e) => setDetailForm((prev) => ({ ...prev!, name: e.target.value }))} />
          <input className="w-full border border-slate-300 rounded-md px-3 py-2" placeholder="CNPJ" value={detailForm!.cnpj} onChange={(e) => setDetailForm((prev) => ({ ...prev!, cnpj: e.target.value.replace(/\s+/g, "") }))} />
          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={!!detailForm!.trackerEnabled} onChange={(e) => setDetailForm((prev) => ({ ...prev!, trackerEnabled: e.target.checked }))} />
            <span>Empresa realiza instalação de rastreador veicular</span>
          </label>
            
        </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button className="px-3 py-2 rounded-md border border-slate-300 text-slate-900 hover:bg-slate-100" onClick={async () => { setModalTarget("detail"); if (detailForm) await loadDetailDocs(detailForm.id); setOpenDocs(true); }}>Documentos</button>
              <button className="px-3 py-2 rounded-md border border-slate-300 text-slate-900 hover:bg-slate-100" onClick={() => { setModalTarget("detail"); setOpenResp(true); }}>Responsáveis</button>
              <button className="px-3 py-2 rounded-md border border-slate-300 text-slate-900 hover:bg-slate-100" onClick={() => { setModalTarget("detail"); setVisibleHours([1,2,3,4,5,6,7,8,9]); setOpenVals(true); }}>Valores</button>
            </div>
            <div className="flex gap-2 pt-2"><button className="flex-1 rounded-md py-2 bg-indigo-600 text-white hover:bg-indigo-700" onClick={async () => {
              if (!db) return;
              const first = (detailForm?.responsaveis && detailForm.responsaveis[0]) ? detailForm.responsaveis[0] : undefined;
              const payload = buildPayloadEmpresa(detailForm!, { contact: first?.nome, contactNumber: first?.numero });
              await updateDoc(doc(db, "empresas", detailForm!.id), payload);
              setItems((prev) => prev.map((x) => (x.id === detailForm!.id ? { ...x, ...payload, id: x.id } : x)));
              setDetail(null); setDetailForm(null);
            }}>Salvar alterações</button><button className="flex-1 rounded-md py-2 bg-red-600 text-white hover:bg-red-700" onClick={() => removeCompany(detailForm!.id, detailForm!.documentos || [])}>Excluir empresa</button><button className="flex-1 rounded-md py-2 bg-slate-200 text-slate-900 hover:bg-slate-300" onClick={() => { setDetail(null); setDetailForm(null); }}>Fechar</button></div>
          </div>
        </div>
      )}

      
    </div>
  );
}
