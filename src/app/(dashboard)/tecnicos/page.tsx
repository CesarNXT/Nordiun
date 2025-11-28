"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc, CollectionReference, onSnapshot, query, orderBy, limit as fslimit, startAfter, type QueryDocumentSnapshot } from "firebase/firestore";
import { fetchCEP } from "@/lib/viacep";
import { parsePhoneNumberFromString, getCountries, getCountryCallingCode, type CountryCode } from "libphonenumber-js/max";
import { DateModal } from "@/components/date-modal";

type Tecnico = {
  categories?: ("Rastreador" | "Informatica")[];
  category?: "Rastreador" | "Informatica";
  cpf?: string;
  name: string;
  email: string;
  rg: string;
  birthDate: string;
  country: string;
  phoneNumber: string;
  cep: string;
  rua: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  itRate3h?: number;
  itAdditionalHour?: number;
  itDaily?: number;
  itMileage?: number;
  trackerMileage?: number;
  trackerInstallationRate?: number;
  status?: "Novo" | "Ativo" | "Cancelado" | "Ajudante";
  supervisorId?: string;
  geo?: { lat: number; lng: number };
};

export default function TecnicosPage() {
  const [items, setItems] = useState<(Tecnico & { id: string })[]>([]);
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<(Tecnico & { id: string }) | null>(null);
  const [detailForm, setDetailForm] = useState<(Tecnico & { id: string }) | null>(null);
  const [view] = useState<"table" | "cards">("table");
  const [form, setForm] = useState<Tecnico>({
    categories: ["Rastreador"],
    category: "Rastreador",
    name: "",
    email: "",
    rg: "",
    birthDate: "",
    country: "BR",
    phoneNumber: "",
    cep: "",
    rua: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    status: "Novo",
  });
  const countries = getCountries();
  const [openDdi, setOpenDdi] = useState(false);
  const [country, setCountry] = useState<CountryCode>("BR");
  const [ddi, setDdi] = useState<string>(String(getCountryCallingCode("BR")));
  const [phoneIntl, setPhoneIntl] = useState("");
  const [openDateCreate, setOpenDateCreate] = useState(false);
  const [openDateDetail, setOpenDateDetail] = useState(false);
  function formatDateBr(iso?: string) {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("pt-BR");
  }
  const [ddiTarget, setDdiTarget] = useState<"create" | "detail" | null>(null);
  const [cep, setCep] = useState("");
  const [ddiQuery, setDdiQuery] = useState("");
  const [money, setMoney] = useState<Record<string, string>>({
    itRate3h: "",
    itAdditionalHour: "",
    itDaily: "",
    itMileage: "",
    trackerMileage: "",
    trackerInstallationRate: "",
  });
  const [pageSize] = useState(25);
  const [pageEnd, setPageEnd] = useState<QueryDocumentSnapshot<Tecnico> | null>(null);
  const [pageStack, setPageStack] = useState<QueryDocumentSnapshot<Tecnico>[]>([]);
  const [unsub, setUnsub] = useState<null | (() => void)>(null);

  const [qName, setQName] = useState("");
  const [qPhone, setQPhone] = useState("");
  const [qCpf, setQCpf] = useState("");

  const filtered = items.filter((t) => {
    const nameOk = qName ? (t.name || "").toLowerCase().includes(qName.toLowerCase()) : true;
    const phoneOk = qPhone ? (t.phoneNumber || "").includes(qPhone.replace(/\D/g, "")) : true;
    const cpfOk = qCpf ? (t.cpf || "").replace(/\D/g, "").includes(qCpf.replace(/\D/g, "")) : true;
    return nameOk && phoneOk && cpfOk;
  });

  function handleCurrency(key: keyof Tecnico) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const digits = e.target.value.replace(/\D/g, "");
      const val = digits ? Number(digits) / 100 : 0;
      const display = digits ? val.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "";
      setMoney((prev) => ({ ...prev, [key as string]: display }));
      setForm((prev) => ({ ...prev, [key]: digits ? val : undefined }));
    };
  }

  function normalizeFone(raw: string) {
    const digits = raw.replace(/\D/g, "");
    if (digits.length === 9) return digits.slice(1);
    if (digits.length === 8) return digits;
    return "";
  }

function displayCategory(t: Tecnico & { id: string }): string {
  const cats = (t.categories && t.categories.length) ? t.categories : (t.category ? [t.category] : []);
  if (cats.length === 2) return "Rastreador + Informatica";
  return cats[0] || "";
}

function statusEmoji(s?: Tecnico["status"]) {
  if (s === "Novo") return "🆕";
  if (s === "Ativo") return "🟢";
  if (s === "Ajudante") return "🙋‍♂️";
  if (s === "Cancelado") return "❌";
  return "";
}

  function formatCurrencyTech(n?: number): string {
    if (typeof n !== "number" || !isFinite(n)) return "";
    return n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function handleCurrencyDetailTech(key: keyof Tecnico) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const digits = e.target.value.replace(/\D/g, "");
      const val = digits ? Number(digits) / 100 : undefined;
      setDetailForm((prev) => ({ ...prev!, [key]: val }));
    };
  }

  useEffect(() => {
    void country;
    void ddi;
    void phoneIntl;
    void ddiTarget;
  }, [country, ddi, phoneIntl]);

  useEffect(() => {
    async function fill() {
      const data = await fetchCEP(cep || "");
      if (data) {
        const digits = (cep || "").replace(/\D/g, "");
        setForm((prev) => ({ ...prev, cep: digits, rua: data.logradouro || "", bairro: data.bairro || "", cidade: data.localidade || "", estado: data.uf || "" }));
      }
    }
    if (cep && cep.replace(/\D/g, "").length === 8) fill();
  }, [cep]);

  useEffect(() => {
    function listen(start?: QueryDocumentSnapshot<Tecnico> | null) {
      if (!db) return;
      if (unsub) unsub();
      const col = collection(db, "registrations") as CollectionReference<Tecnico>;
      const base = start ? query(col, orderBy("name"), startAfter(start), fslimit(pageSize)) : query(col, orderBy("name"), fslimit(pageSize));
      const stop = onSnapshot(base, (snap) => {
        const list = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((x) => !(x as { meta?: boolean }).meta);
        setItems(list);
        setPageEnd(snap.docs[snap.docs.length - 1] || null);
      }, () => {});
      setUnsub(() => stop);
    }
    listen(null);
    return () => { if (unsub) unsub(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function nextPage() {
    if (!pageEnd) return;
    setPageStack((prev) => [...prev, pageEnd]);
    const col = collection(db, "registrations") as CollectionReference<Tecnico>;
    const base = query(col, orderBy("name"), startAfter(pageEnd), fslimit(pageSize));
    if (unsub) unsub();
    const stop = onSnapshot(base, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((x) => !(x as { meta?: boolean }).meta);
      setItems(list);
      setPageEnd(snap.docs[snap.docs.length - 1] || null);
    });
    setUnsub(() => stop);
  }

  function prevPage() {
    const prevStack = [...pageStack];
    const lastStart = prevStack.pop();
    setPageStack(prevStack);
    const start = prevStack.length ? prevStack[prevStack.length - 1] : null;
    const col = collection(db, "registrations") as CollectionReference<Tecnico>;
    const base = start ? query(col, orderBy("name"), startAfter(start), fslimit(pageSize)) : query(col, orderBy("name"), fslimit(pageSize));
    if (unsub) unsub();
    const stop = onSnapshot(base, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((x) => !(x as { meta?: boolean }).meta);
      setItems(list);
      setPageEnd(snap.docs[snap.docs.length - 1] || null);
    });
    setUnsub(() => stop);
  }

  async function create() {
    try {
      const cepDigits = (cep || "").replace(/\D/g, "");
      if (cepDigits.length !== 8) { alert("Informe um CEP válido (8 dígitos)"); return; }
      if (form.status === "Ajudante" && !form.supervisorId) {
        alert("Selecione o técnico responsável para um ajudante.");
        return;
      }
      const col = collection(db, "registrations") as CollectionReference<Tecnico>;
      const cats = (form.categories && form.categories.length) ? form.categories : (form.category ? [form.category] : []);
      if (!cats.length) { alert("Selecione pelo menos uma categoria"); return; }
      const payload: Tecnico = { ...form, cep: cepDigits, categories: cats, category: cats[0] };
      const docRef = await addDoc(col, payload);
      if (payload.cep && payload.cidade && payload.estado) {
        fetch("/api/geocode", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: docRef.id, cep: payload.cep, cidade: payload.cidade, estado: payload.estado, rua: payload.rua, numero: payload.numero, bairro: payload.bairro }) });
      }
    } catch {
    }
    setOpen(false);
  }

  async function updateStatus(id: string, status: NonNullable<Tecnico["status"]>) {
    try {
      await updateDoc(doc(db, "registrations", id), { status });
      setItems((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    } catch {
    }
    setDetail(null);
  }

  async function remove(id: string) {
    const ok = confirm("Excluir técnico? Esta ação não pode ser desfeita.");
    if (!ok) return;
    try {
      await deleteDoc(doc(db, "registrations", id));
      setItems((prev) => prev.filter((t) => t.id !== id));
    } catch {
    }
    setDetail(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-2xl font-bold text-slate-900">Técnicos</div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700" onClick={() => setOpen(true)}>Novo técnico</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <input className="border border-slate-300 rounded-md px-3 py-2" placeholder="Filtrar por nome" value={qName} onChange={(e) => setQName(e.target.value)} />
        <input className="border border-slate-300 rounded-md px-3 py-2" placeholder="Filtrar por telefone" value={qPhone} onChange={(e) => setQPhone(e.target.value)} />
        <input className="border border-slate-300 rounded-md px-3 py-2" placeholder="Filtrar por CPF" value={qCpf} onChange={(e) => setQCpf(e.target.value)} />
      </div>

      {view === "table" && (
        <div className="hidden sm:block overflow-x-auto">
          <table className="min-w-full border border-slate-200 bg-white">
            <thead>
              <tr className="bg-slate-100">
                <th className="p-2 text-left">Nome</th>
                <th className="p-2 text-left">Categoria</th>
                <th className="p-2 text-left">Telefone</th>
                <th className="p-2 text-left">Cidade/UF</th>
                <th className="p-2 text-left">Status</th>
                
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id} className="border-t border-slate-200 hover:bg-slate-50 cursor-pointer" onClick={() => { setDetail(e); setDetailForm({ ...e }); }}>
                  <td className="p-2 text-slate-800">{e.name.toUpperCase()}</td>
                  <td className="p-2 text-slate-800">{displayCategory(e)}</td>
                  <td className="p-2 text-slate-800">{e.country === "BR" ? e.phoneNumber.slice(2) : `+${e.phoneNumber}`}</td>
                  <td className="p-2 text-slate-800">{e.cidade}/{e.estado}</td>
                  <td className="p-2 text-slate-800">{`${statusEmoji(e.status)} ${e.status || "Novo"}`.trim()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-between items-center mt-2">
            <button className="px-3 py-2 rounded-md bg-slate-200 text-slate-900 hover:bg-slate-300" onClick={prevPage} disabled={!pageStack.length}>Anterior</button>
            <div className="text-sm text-slate-700">{items.length} técnicos</div>
            <button className="px-3 py-2 rounded-md bg-slate-200 text-slate-900 hover:bg-slate-300" onClick={nextPage} disabled={!pageEnd}>Próxima</button>
          </div>
        </div>
      )}

      {/* Mobile cards */}
      <div className="sm:hidden space-y-2">
        {filtered.map((e) => (
          <div key={e.id} className="border border-slate-200 rounded-md bg-white p-3" onClick={() => { setDetail(e); setDetailForm({ ...e }); }}>
            <div className="font-semibold text-slate-900">{e.name.toUpperCase()}</div>
            <div className="text-sm text-slate-700">{displayCategory(e)}</div>
            <div className="text-sm text-slate-700">{e.country === "BR" ? e.phoneNumber.slice(2) : `+${e.phoneNumber}`}</div>
            <div className="text-sm text-slate-700">{e.cidade}/{e.estado}</div>
            <div className="text-sm text-slate-700">Status: {`${statusEmoji(e.status)} ${e.status || "Novo"}`.trim()}</div>
          </div>
        ))}
      </div>
      <div className="sm:hidden flex justify-between items-center">
        <button className="px-3 py-2 rounded-md bg-slate-200 text-slate-900" onClick={prevPage} disabled={!pageStack.length}>Anterior</button>
        <div className="text-sm text-slate-700">{items.length} técnicos</div>
        <button className="px-3 py-2 rounded-md bg-slate-200 text-slate-900" onClick={nextPage} disabled={!pageEnd}>Próxima</button>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center" onClick={() => setOpen(false)}>
          <div className="w-full max-w-3xl bg-white rounded-lg p-4 sm:p-6 space-y-3 shadow-xl max-h-[85vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="text-lg font-bold text-slate-900">Novo técnico</div>
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="text-sm font-semibold text-slate-900">Categoria</div>
                <div className="grid grid-cols-2 gap-2">
                  <label className="inline-flex items-center gap-2 border border-slate-300 rounded-md px-3 py-2">
                    <input type="checkbox" name="categoria-create-r" checked={(form.categories || []).includes("Rastreador")} onChange={() => {
                      const has = (form.categories || []).includes("Rastreador");
                      const next: ("Rastreador" | "Informatica")[] = has ? (form.categories || []).filter((c) => c !== "Rastreador") as ("Rastreador" | "Informatica")[] : [ ...(form.categories || []), "Rastreador" ] as ("Rastreador" | "Informatica")[];
                      setForm({ ...form, categories: next, category: next[0] || undefined });
                    }} />
                    <span>Rastreador</span>
                  </label>
                  <label className="inline-flex items-center gap-2 border border-slate-300 rounded-md px-3 py-2">
                    <input type="checkbox" name="categoria-create-i" checked={(form.categories || []).includes("Informatica")} onChange={() => {
                      const has = (form.categories || []).includes("Informatica");
                      const next: ("Rastreador" | "Informatica")[] = has ? (form.categories || []).filter((c) => c !== "Informatica") as ("Rastreador" | "Informatica")[] : [ ...(form.categories || []), "Informatica" ] as ("Rastreador" | "Informatica")[];
                      setForm({ ...form, categories: next, category: next[0] || undefined });
                    }} />
                    <span>Informatica</span>
                  </label>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-semibold text-slate-900">Status</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select className="border border-slate-300 rounded-md px-3 py-2" value={form.status || "Novo"} onChange={(e) => setForm({ ...form, status: e.target.value as NonNullable<Tecnico["status"]> })}>
                    <option value="Novo">🆕 Novo</option>
                    <option value="Ativo">🟢 Ativo</option>
                    <option value="Cancelado">❌ Cancelado</option>
                    <option value="Ajudante">🙋‍♂️ Ajudante</option>
                  </select>
                  {form.status === "Ajudante" && (
                    <select className="border border-slate-300 rounded-md px-3 py-2" value={form.supervisorId || ""} onChange={(e) => setForm({ ...form, supervisorId: e.target.value })}>
                      <option value="">Selecione o técnico responsável</option>
                      {items.map((t) => (
                        <option key={t.id} value={t.id}>{t.name.toUpperCase()}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-semibold text-slate-900">Dados pessoais</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input className="border border-slate-300 rounded-md px-3 py-2" placeholder="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value.toUpperCase() })} />
                  <input className="border border-slate-300 rounded-md px-3 py-2" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  <input className="border border-slate-300 rounded-md px-3 py-2" placeholder="RG" value={form.rg} onChange={(e) => setForm({ ...form, rg: e.target.value })} />
                  <input className="border border-slate-300 rounded-md px-3 py-2" placeholder="Data de Nascimento" value={formatDateBr(form.birthDate)} onClick={() => setOpenDateCreate(true)} readOnly />
                  <div className="flex flex-col sm:flex-row items-center gap-2 col-span-2">
                    <button type="button" className="border border-slate-300 rounded-md px-3 py-2 text-slate-900 w-full sm:w-28 text-left" onClick={() => { setDdiTarget("create"); setOpenDdi(true); }} style={{ fontFamily: '"Segoe UI Emoji","Noto Color Emoji","Apple Color Emoji",system-ui,sans-serif' }}>
                      <span className="inline-flex items-center gap-2"><span style={{ backgroundImage: `url(${flagUrl(country)})` }} className="inline-block w-5 h-4 bg-center bg-no-repeat bg-contain" aria-hidden="true" />+{getCountryCallingCode(country)}</span>
                    </button>
                    <input className="w-full sm:flex-1 border border-slate-300 rounded-md px-3 py-2" placeholder="DDD + número de WhatsApp" inputMode="numeric" value={phoneIntl} onChange={(e) => { const rawAll = e.target.value; const raw = rawAll.replace(/\D/g, ""); const limit = (ddi === "55" || country === "BR") ? 11 : Math.max(6, 15 - String(ddi).length); const nat = raw.slice(0, limit); setPhoneIntl(nat); if (ddi === "55" || country === "BR") { if (nat.length === 10 || nat.length === 11) { const dddDigits = nat.slice(0, 2); const f8 = normalizeFone(nat.slice(2)); if (f8) setForm((prev) => ({ ...prev, phoneNumber: `${ddi}${dddDigits}${f8}`, country })); } } else { if (nat) { const full = `+${ddi}${nat}`; const parsed = parsePhoneNumberFromString(full, country); if (parsed && parsed.isValid()) setForm((prev) => ({ ...prev, phoneNumber: `${ddi}${nat}`, country })); } } }} />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-semibold text-slate-900">Endereço</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input className="border border-slate-300 rounded-md px-3 py-2" placeholder="CEP" value={cep} onChange={(e) => setCep(e.target.value)} />
                  <input className="border border-slate-300 rounded-md px-3 py-2 col-span-2" placeholder="Rua" value={form.rua} onChange={(e) => setForm({ ...form, rua: e.target.value })} />
                  <input className="border border-slate-300 rounded-md px-3 py-2" placeholder="Número" value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} />
                  <input className="border border-slate-300 rounded-md px-3 py-2" placeholder="Complemento" value={form.complemento || ""} onChange={(e) => setForm({ ...form, complemento: e.target.value })} />
                  <input className="border border-slate-300 rounded-md px-3 py-2" placeholder="Bairro" value={form.bairro} onChange={(e) => setForm({ ...form, bairro: e.target.value })} />
                  <input className="border border-slate-300 rounded-md px-3 py-2" placeholder="Cidade" value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} />
                  <input className="border border-slate-300 rounded-md px-3 py-2" placeholder="Estado" value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-semibold text-slate-900">Valores</div>
                {(form.categories || []).includes("Rastreador") && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <div className="text-xs text-slate-600">Deslocamento (Rastreador)</div>
                      <div className="flex items-center"><span className="px-3 py-2 bg-slate-100 border border-slate-300 rounded-l-md text-slate-700">R$</span><input className="flex-1 border border-l-0 border-slate-300 rounded-r-md px-3 py-2" value={money.trackerMileage} onChange={handleCurrency("trackerMileage")} inputMode="numeric" /></div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-slate-600">Instalação por rastreador</div>
                      <div className="flex items-center"><span className="px-3 py-2 bg-slate-100 border border-slate-300 rounded-l-md text-slate-700">R$</span><input className="flex-1 border border-l-0 border-slate-300 rounded-r-md px-3 py-2" value={money.trackerInstallationRate} onChange={handleCurrency("trackerInstallationRate")} inputMode="numeric" /></div>
                    </div>
                  </div>
                )}
                {(form.categories || []).includes("Informatica") && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <div className="text-xs text-slate-600">Atendimento de 3h</div>
                      <div className="flex items-center"><span className="px-3 py-2 bg-slate-100 border border-slate-300 rounded-l-md text-slate-700">R$</span><input className="flex-1 border border-l-0 border-slate-300 rounded-r-md px-3 py-2" value={money.itRate3h} onChange={handleCurrency("itRate3h")} inputMode="numeric" /></div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-slate-600">Hora adicional</div>
                      <div className="flex items-center"><span className="px-3 py-2 bg-slate-100 border border-slate-300 rounded-l-md text-slate-700">R$</span><input className="flex-1 border border-l-0 border-slate-300 rounded-r-md px-3 py-2" value={money.itAdditionalHour} onChange={handleCurrency("itAdditionalHour")} inputMode="numeric" /></div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-slate-600">Diária</div>
                      <div className="flex items-center"><span className="px-3 py-2 bg-slate-100 border border-slate-300 rounded-l-md text-slate-700">R$</span><input className="flex-1 border border-l-0 border-slate-300 rounded-r-md px-3 py-2" value={money.itDaily} onChange={handleCurrency("itDaily")} inputMode="numeric" /></div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-slate-600">Deslocamento (IT)</div>
                      <div className="flex items-center"><span className="px-3 py-2 bg-slate-100 border border-slate-300 rounded-l-md text-slate-700">R$</span><input className="flex-1 border border-l-0 border-slate-300 rounded-r-md px-3 py-2" value={money.itMileage} onChange={handleCurrency("itMileage")} inputMode="numeric" /></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 rounded-md py-2 bg-blue-600 text-white hover:bg-blue-700" onClick={create}>Salvar</button>
              <button className="flex-1 rounded-md py-2 bg-slate-200 text-slate-900 hover:bg-slate-300" onClick={() => setOpen(false)}>Cancelar</button>
            </div>
            {openDateCreate && (
              <DateModal value={form.birthDate} onSave={(iso) => setForm((prev) => ({ ...prev, birthDate: iso }))} onClose={() => setOpenDateCreate(false)} />
            )}
          </div>
        </div>
      )}

      {openDdi && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setOpenDdi(false)}>
          <div className="bg-white w-full max-w-md rounded-lg shadow-xl p-4" onClick={(e) => e.stopPropagation()}>
            <div className="text-lg font-bold text-slate-900">Selecionar DDI</div>
            <div className="mt-2"><input className="w-full border border-slate-300 rounded-md px-3 py-2" placeholder="Pesquisar país ou DDI" value={ddiQuery} onChange={(e) => setDdiQuery(e.target.value)} /></div>
            <div className="max-h-64 overflow-auto">
              {countries
                .map((iso) => ({ iso, name: new Intl.DisplayNames(["pt-BR"], { type: "region" }).of(iso) || iso, code: String(getCountryCallingCode(iso as CountryCode)) }))
                .filter((c) => {
                  if (!ddiQuery) return true;
                  const q = ddiQuery.toLowerCase().trim();
                  return c.name.toLowerCase().includes(q) || c.code.includes(q.replace(/\D/g, ""));
                })
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((c) => (
                  <button key={c.iso} type="button" className="w-full flex items-center justify-between px-3 py-2 rounded hover:bg-slate-100" onClick={() => { setCountry(c.iso as CountryCode); setDdi(c.code); if (ddiTarget === "detail") { setDetailForm((prev) => ({ ...prev!, country: c.iso as string })); } else { setForm((prev) => ({ ...prev, country: c.iso as string })); } setOpenDdi(false); }} style={{ fontFamily: '"Segoe UI Emoji","Noto Color Emoji","Apple Color Emoji",system-ui,sans-serif' }}>
                    <span className="flex items-center gap-2"><span style={{ backgroundImage: `url(${flagUrl(c.iso)})` }} className="inline-block w-5 h-4 bg-center bg-no-repeat bg-contain" aria-hidden="true" /><span className="text-slate-900">{c.name}</span></span>
                    <span className="text-slate-700">+{c.code}</span>
                  </button>
                ))}
            </div>
            <div className="flex justify-end mt-3">
              <button className="px-3 py-2 rounded bg-slate-200 text-slate-900" onClick={() => setOpenDdi(false)}>Fechar</button>
            </div>
          </div>
        </div>
      )}

  {detail && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center" onClick={() => { setDetail(null); setDetailForm(null); }}>
          <div className="w-full max-w-3xl bg-white rounded-lg p-6 space-y-4 shadow-xl max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="text-lg font-bold text-slate-900">{detail.name.toUpperCase()}</div>
            <div className="text-sm font-semibold text-slate-900">Dados Pessoais</div>
            <hr className="border-slate-200" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
            <div className="text-xs text-slate-600">Categoria</div>
            <div className="grid grid-cols-2 gap-2">
              <label className="inline-flex items-center gap-2 border border-slate-300 rounded-md px-3 py-2">
                <input type="checkbox" name="categoria-detail-r" checked={((detailForm?.categories || (detailForm?.category ? [detailForm.category] : [])) || []).includes("Rastreador")} onChange={() => {
                  const curr: ("Rastreador" | "Informatica")[] = (detailForm?.categories && detailForm.categories.length) ? detailForm.categories as ("Rastreador" | "Informatica")[] : (detailForm?.category ? [detailForm.category] as ("Rastreador" | "Informatica")[] : []);
                  const has = curr.includes("Rastreador");
                  const next: ("Rastreador" | "Informatica")[] = has ? curr.filter((c) => c !== "Rastreador") : [...curr, "Rastreador"];
                  setDetailForm({ ...detailForm!, categories: next, category: next[0] || undefined });
                }} />
                <span>Rastreador</span>
              </label>
              <label className="inline-flex items-center gap-2 border border-slate-300 rounded-md px-3 py-2">
                <input type="checkbox" name="categoria-detail-i" checked={((detailForm?.categories || (detailForm?.category ? [detailForm.category] : [])) || []).includes("Informatica")} onChange={() => {
                  const curr: ("Rastreador" | "Informatica")[] = (detailForm?.categories && detailForm.categories.length) ? detailForm.categories as ("Rastreador" | "Informatica")[] : (detailForm?.category ? [detailForm.category] as ("Rastreador" | "Informatica")[] : []);
                  const has = curr.includes("Informatica");
                  const next: ("Rastreador" | "Informatica")[] = has ? curr.filter((c) => c !== "Informatica") : [...curr, "Informatica"];
                  setDetailForm({ ...detailForm!, categories: next, category: next[0] || undefined });
                }} />
                <span>Informatica</span>
              </label>
            </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-slate-600">Status</div>
                <select className="border border-slate-300 rounded-md px-3 py-2 w-full" value={detailForm!.status || "Novo"} onChange={(e) => setDetailForm({ ...detailForm!, status: e.target.value as NonNullable<Tecnico["status"]> })}>
                  <option value="Novo">🆕 Novo</option>
                  <option value="Ativo">🟢 Ativo</option>
                  <option value="Cancelado">❌ Cancelado</option>
                  <option value="Ajudante">🙋‍♂️ Ajudante</option>
                </select>
                {detailForm?.status === "Ajudante" && (
                  <div className="mt-2">
                    <div className="text-xs text-slate-600">Técnico responsável</div>
                    <select className="border border-slate-300 rounded-md px-3 py-2 w-full" value={detailForm!.supervisorId || ""} onChange={(e) => setDetailForm({ ...detailForm!, supervisorId: e.target.value })}>
                      <option value="">Selecione</option>
                      {items.filter((t) => t.id !== detailForm!.id).map((t) => (
                        <option key={t.id} value={t.id}>{t.name.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <div className="text-xs text-slate-600">Email</div>
                <input className="border border-slate-300 rounded-md px-3 py-2 w-full" value={detailForm!.email || ""} onChange={(e) => setDetailForm({ ...detailForm!, email: e.target.value })} />
              </div>
              <div className="space-y-1">
                <div className="text-xs text-slate-600">RG</div>
                <input className="border border-slate-300 rounded-md px-3 py-2 w-full" value={detailForm!.rg || ""} onChange={(e) => setDetailForm({ ...detailForm!, rg: e.target.value })} />
              </div>
              <div className="space-y-1">
                <div className="text-xs text-slate-600">Data de Nascimento</div>
                <input className="border border-slate-300 rounded-md px-3 py-2 w-full" value={formatDateBr(detailForm!.birthDate)} onClick={() => setOpenDateDetail(true)} readOnly />
              </div>
              <div className="space-y-1">
                <div className="text-xs text-slate-600">Telefone</div>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <button type="button" className="border border-slate-300 rounded-md px-3 py-2 text-slate-900 w-full sm:w-28 text-left" onClick={() => { setDdiTarget("detail"); setOpenDdi(true); }} style={{ fontFamily: '"Segoe UI Emoji","Noto Color Emoji","Apple Color Emoji",system-ui,sans-serif' }}>
                    <span className="inline-flex items-center gap-2"><span style={{ backgroundImage: `url(${flagUrl(detailForm!.country)})` }} className="inline-block w-5 h-4 bg-center bg-no-repeat bg-contain" aria-hidden="true" />+{getCountryCallingCode(detailForm!.country as CountryCode)}</span>
                  </button>
                  <input className="w-full sm:flex-1 border border-slate-300 rounded-md px-3 py-2" value={detailForm!.country === "BR" ? (detailForm!.phoneNumber || "").slice(2) : (detailForm!.phoneNumber || "")} onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "");
                    if (detailForm!.country === "BR") {
                      const dddDigits = raw.slice(0, 2);
                      const f8 = normalizeFone(raw.slice(2));
                      const next = f8 ? `55${dddDigits}${f8}` : `55${raw}`;
                      setDetailForm({ ...detailForm!, phoneNumber: next });
                    } else {
                      setDetailForm({ ...detailForm!, phoneNumber: raw });
                    }
                  }} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-slate-600">CEP</div>
                <input className="border border-slate-300 rounded-md px-3 py-2 w-full" value={detailForm!.cep} onChange={(e) => setDetailForm({ ...detailForm!, cep: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <div className="text-sm font-semibold text-slate-900">Endereço</div>
                <hr className="border-slate-200" />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <div className="text-xs text-slate-600">Rua</div>
                <input className="border border-slate-300 rounded-md px-3 py-2 w-full" value={detailForm!.rua} onChange={(e) => setDetailForm({ ...detailForm!, rua: e.target.value })} />
              </div>
              <div className="space-y-1">
                <div className="text-xs text-slate-600">Número</div>
                <input className="border border-slate-300 rounded-md px-3 py-2 w-full" value={detailForm!.numero} onChange={(e) => setDetailForm({ ...detailForm!, numero: e.target.value })} />
              </div>
              <div className="space-y-1">
                <div className="text-xs text-slate-600">Complemento</div>
                <input className="border border-slate-300 rounded-md px-3 py-2 w-full" value={detailForm!.complemento || ""} onChange={(e) => setDetailForm({ ...detailForm!, complemento: e.target.value })} />
              </div>
              <div className="space-y-1">
                <div className="text-xs text-slate-600">Bairro</div>
                <input className="border border-slate-300 rounded-md px-3 py-2 w-full" value={detailForm!.bairro} onChange={(e) => setDetailForm({ ...detailForm!, bairro: e.target.value })} />
              </div>
              <div className="space-y-1">
                <div className="text-xs text-slate-600">Cidade/UF</div>
                <div className="grid grid-cols-2 gap-2">
                  <input className="border border-slate-300 rounded-md px-3 py-2 w-full" value={detailForm!.cidade} onChange={(e) => setDetailForm({ ...detailForm!, cidade: e.target.value })} />
                  <input className="border border-slate-300 rounded-md px-3 py-2 w-full" value={detailForm!.estado} onChange={(e) => setDetailForm({ ...detailForm!, estado: e.target.value })} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-semibold text-slate-900">Valores</div>
              {(detailForm?.categories || (detailForm?.category ? [detailForm.category] : [])).includes("Informatica") && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <div className="text-xs text-slate-600">Atendimento de 3h</div>
                    <div className="flex items-center"><span className="px-3 py-2 bg-slate-100 border border-slate-300 rounded-l-md text-slate-700">R$</span><input className="flex-1 border border-l-0 border-slate-300 rounded-r-md px-3 py-2 w-full" value={formatCurrencyTech(detailForm?.itRate3h)} onChange={handleCurrencyDetailTech("itRate3h")} inputMode="numeric" /></div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-slate-600">Hora adicional</div>
                    <div className="flex items-center"><span className="px-3 py-2 bg-slate-100 border border-slate-300 rounded-l-md text-slate-700">R$</span><input className="flex-1 border border-l-0 border-slate-300 rounded-r-md px-3 py-2 w-full" value={formatCurrencyTech(detailForm?.itAdditionalHour)} onChange={handleCurrencyDetailTech("itAdditionalHour")} inputMode="numeric" /></div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-slate-600">Diária</div>
                    <div className="flex items-center"><span className="px-3 py-2 bg-slate-100 border border-slate-300 rounded-l-md text-slate-700">R$</span><input className="flex-1 border border-l-0 border-slate-300 rounded-r-md px-3 py-2 w-full" value={formatCurrencyTech(detailForm?.itDaily)} onChange={handleCurrencyDetailTech("itDaily")} inputMode="numeric" /></div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-slate-600">Deslocamento (IT)</div>
                    <div className="flex items-center"><span className="px-3 py-2 bg-slate-100 border border-slate-300 rounded-l-md text-slate-700">R$</span><input className="flex-1 border border-l-0 border-slate-300 rounded-r-md px-3 py-2 w-full" value={formatCurrencyTech(detailForm?.itMileage)} onChange={handleCurrencyDetailTech("itMileage")} inputMode="numeric" /></div>
                  </div>
                </div>
              )}
              {(detailForm?.categories || (detailForm?.category ? [detailForm.category] : [])).includes("Rastreador") && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <div className="text-xs text-slate-600">Deslocamento (Rastreador)</div>
                    <div className="flex items-center"><span className="px-3 py-2 bg-slate-100 border border-slate-300 rounded-l-md text-slate-700">R$</span><input className="flex-1 border border-l-0 border-slate-300 rounded-r-md px-3 py-2 w-full" value={formatCurrencyTech(detailForm?.trackerMileage)} onChange={handleCurrencyDetailTech("trackerMileage")} inputMode="numeric" /></div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-slate-600">Instalação por rastreador</div>
                    <div className="flex items-center"><span className="px-3 py-2 bg-slate-100 border border-slate-300 rounded-l-md text-slate-700">R$</span><input className="flex-1 border border-l-0 border-slate-300 rounded-r-md px-3 py-2 w-full" value={formatCurrencyTech(detailForm?.trackerInstallationRate)} onChange={handleCurrencyDetailTech("trackerInstallationRate")} inputMode="numeric" /></div>
                  </div>
                </div>
              )}
            </div>

            {detail.geo && (
              <div className="space-y-1">
                <div className="text-sm font-semibold text-slate-900">Localização</div>
                <div className="text-sm text-slate-700">Lat: {detail.geo.lat} / Lng: {detail.geo.lng}</div>
                <a className="inline-block text-blue-600 hover:underline" href={`https://www.google.com/maps?q=${detail.geo.lat},${detail.geo.lng}`} target="_blank" rel="noopener noreferrer">Abrir no Maps</a>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button className="flex-1 rounded-md py-2 bg-blue-600 text-white hover:bg-blue-700" onClick={async () => {
                const d = detailForm!;
                const okCep = (d.cep || "").replace(/\D/g, "").length === 8;
                if (!okCep) { alert("Informe um CEP válido (8 dígitos)"); return; }
                if (d.status === "Ajudante" && !d.supervisorId) {
                  alert("Selecione o técnico responsável para um ajudante.");
                  return;
                }
                try {
                  const cats = (d.categories && d.categories.length) ? d.categories : (d.category ? [d.category] : []);
                  if (!cats.length) { alert("Selecione pelo menos uma categoria"); return; }
                  const payload = { ...d, categories: cats, category: cats[0] };
                  await updateDoc(doc(db, "registrations", d.id), payload);
                  setItems((prev) => prev.map((t) => (t.id === d.id ? { ...t, ...d } : t)));
                  if (d.cep && d.cidade && d.estado) {
                    fetch("/api/geocode", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: d.id, cep: d.cep, cidade: d.cidade, estado: d.estado, rua: d.rua, numero: d.numero, bairro: d.bairro }) });
                  }
                  setDetail(null);
                  setDetailForm(null);
                } catch {
                  setDetail(null);
                  setDetailForm(null);
                }
              }}>Salvar alterações</button>
              <button className="flex-1 rounded-md py-2 bg-red-600 text-white hover:bg-red-700" onClick={() => remove(detailForm!.id)}>Excluir técnico</button>
              <button className="flex-1 rounded-md py-2 bg-slate-200 text-slate-900 hover:bg-slate-300" onClick={() => { setDetail(null); setDetailForm(null); }}>Fechar</button>
            </div>
            {openDateDetail && (
              <DateModal value={detailForm!.birthDate} onSave={(iso) => setDetailForm((prev) => ({ ...prev!, birthDate: iso }))} onClose={() => setOpenDateDetail(false)} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function flagUrl(iso: string) {
  return `https://flagcdn.com/w20/${iso.toLowerCase()}.png`;
}
