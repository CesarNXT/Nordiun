"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, updateDoc, doc, deleteDoc, CollectionReference, onSnapshot, query, orderBy, limit as fslimit, startAfter, startAt, endAt, type QueryDocumentSnapshot, type QuerySnapshot, where, getCountFromServer, getDocs, documentId } from "firebase/firestore";
import { fetchCEP } from "@/lib/viacep";
import { parsePhoneNumberFromString, getCountries, getCountryCallingCode, type CountryCode } from "libphonenumber-js/max";
import { DateModal } from "@/components/date-modal";
import * as XLSX from "xlsx";

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
  pix?: string;
  obs?: string;
  numeroBlocoApartamento?: string;
  createdAt?: string;
};

export default function TecnicosPage() {
  const [items, setItems] = useState<(Tecnico & { id: string })[]>([]);
  const [itemsAll, setItemsAll] = useState<(Tecnico & { id: string })[]>([]);
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
    pix: "",
    obs: "",
    numeroBlocoApartamento: "",
  });
  const countries = getCountries();
  const [openDdi, setOpenDdi] = useState(false);
  const [country, setCountry] = useState<CountryCode>("BR");
  const [ddi, setDdi] = useState<string>(String(getCountryCallingCode("BR")));
  const [phoneIntl, setPhoneIntl] = useState("");
  const [openDateCreate, setOpenDateCreate] = useState(false);
  const [openDateDetail, setOpenDateDetail] = useState(false);
  const [openSupervisor, setOpenSupervisor] = useState(false);
  const [supervisorTarget, setSupervisorTarget] = useState<"create" | "detail" | null>(null);
  const [qSupervisor, setQSupervisor] = useState("");
  const [supervisorItems, setSupervisorItems] = useState<(Tecnico & { id: string })[]>([]);
  const [supervisorLast, setSupervisorLast] = useState<QueryDocumentSnapshot<Tecnico> | null>(null);
  const [supervisorLoading, setSupervisorLoading] = useState(false);
  const [supervisorHasMore, setSupervisorHasMore] = useState(true);
  const [supervisorLastName, setSupervisorLastName] = useState<QueryDocumentSnapshot<Tecnico> | null>(null);
  const [supervisorLastPhone, setSupervisorLastPhone] = useState<QueryDocumentSnapshot<Tecnico> | null>(null);

  function norm(s: string) {
    return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  async function loadMoreSupervisors(reset?: boolean) {
    if (!db || supervisorLoading || !supervisorHasMore) return;
    setSupervisorLoading(true);
    try {
      const col = collection(db, "registrations") as CollectionReference<Tecnico>;
      const q = qSupervisor.trim();
      if (!q) {
        const startDoc = reset ? null : supervisorLast;
        const base = startDoc
          ? query(col, orderBy("name"), startAfter(startDoc), fslimit(50))
          : query(col, orderBy("name"), fslimit(50));
        const snap = await getDocs(base);
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((x) => !(x as { meta?: boolean }).meta);
        setSupervisorItems((prev) => [...prev, ...list]);
        const last = snap.docs[snap.docs.length - 1] || null;
        setSupervisorLast(last);
        if (!last || list.length === 0) setSupervisorHasMore(false);
      } else {
        const qName = q.toUpperCase();
        const qDigits = q.replace(/\D/g, "");
        const queries: Promise<QuerySnapshot<Tecnico>>[] = [];
        const rangeEndName = qName + "\uf8ff";
        const rangeEndPhone = qDigits + "\uf8ff";
        const lastNameDoc = reset ? null : supervisorLastName;
        const lastPhoneDoc = reset ? null : supervisorLastPhone;
        const baseName = lastNameDoc
          ? query(col, orderBy("name"), startAfter(lastNameDoc), endAt(rangeEndName), fslimit(50))
          : query(col, orderBy("name"), startAt(qName), endAt(rangeEndName), fslimit(50));
        queries.push(getDocs(baseName));
        if (qDigits.length >= 3) {
          const basePhone = lastPhoneDoc
            ? query(col, orderBy("phoneNumber"), startAfter(lastPhoneDoc), endAt(rangeEndPhone), fslimit(50))
            : query(col, orderBy("phoneNumber"), startAt(qDigits), endAt(rangeEndPhone), fslimit(50));
          queries.push(getDocs(basePhone));
        }
        const snaps = await Promise.all(queries);
        const docs = snaps.flatMap((s) => s.docs as QueryDocumentSnapshot<Tecnico>[]);
        const listRaw = docs.map((d) => ({ id: d.id, ...d.data() })).filter((x) => !(x as { meta?: boolean }).meta);
        const seen = new Set<string>();
        const list = listRaw.filter((x) => {
          if (seen.has(x.id)) return false;
          seen.add(x.id);
          const notSelf = supervisorTarget === "detail" ? x.id !== (detailForm?.id || "") : true;
          const qn = norm(qName);
          const nn = norm(String(x.name || ""));
          const pn = String(x.phoneNumber || "").replace(/\D/g, "");
          return notSelf && (nn.includes(qn) || (qDigits && pn.includes(qDigits)));
        });
        setSupervisorItems((prev) => [...prev, ...list]);
        const lastNameDocNext = snaps[0]?.docs?.[snaps[0].docs.length - 1] || null;
        const lastPhoneDocNext = snaps[1]?.docs?.[snaps[1]?.docs.length - 1] || null;
        setSupervisorLastName(lastNameDocNext);
        setSupervisorLastPhone(lastPhoneDocNext);
        if (!lastNameDocNext && !lastPhoneDocNext) setSupervisorHasMore(false);
      }
    } catch {
      setSupervisorHasMore(false);
    } finally {
      setSupervisorLoading(false);
    }
  }

  useEffect(() => {
    if (!openSupervisor) return;
    setSupervisorItems([]);
    setSupervisorLast(null);
    setSupervisorLastName(null);
    setSupervisorLastPhone(null);
    setSupervisorHasMore(true);
    setSupervisorLoading(false);
    loadMoreSupervisors(true);
  }, [openSupervisor]);

  useEffect(() => {
    if (!openSupervisor) return;
    setSupervisorItems([]);
    setSupervisorLast(null);
    setSupervisorLastName(null);
    setSupervisorLastPhone(null);
    setSupervisorHasMore(true);
    setSupervisorLoading(false);
    loadMoreSupervisors(true);
  }, [qSupervisor]);
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
  const [pageSize, setPageSize] = useState<number>(25);
  const [pageEnd, setPageEnd] = useState<QueryDocumentSnapshot<Tecnico> | null>(null);
  const [pageStack, setPageStack] = useState<QueryDocumentSnapshot<Tecnico>[]>([]);
  const [unsub, setUnsub] = useState<null | (() => void)>(null);

  const [qQuery, setQQuery] = useState("");
  const [qCity, setQCity] = useState("");
  const [qState, setQState] = useState("");
  const [openStates, setOpenStates] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [newMonthCount, setNewMonthCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [stateCounts, setStateCounts] = useState<Record<string, number>>({});

  const source = (qQuery || qCity || qState) ? itemsAll : items;
  function normalizeText(s: string): string {
    return String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }
  const filtered = source.filter((t) => {
    const q = qQuery.trim();
    const qNorm = normalizeText(q);
    const digits = q.replace(/\D/g, "");
    function matchesPhone(): boolean {
      if (!digits) return false;
      const target = String(t.phoneNumber || "").replace(/\D/g, "");
      if (target.includes(digits)) return true;
      const no55 = digits.startsWith("55") ? digits.slice(2) : digits;
      if (target.includes(no55)) return true;
      let ddd = "";
      let nat = no55;
      if (no55.length >= 10) { ddd = no55.slice(0, 2); nat = no55.slice(2); }
      const natNorm = normalizeFone(nat);
      const candidates = [natNorm, ddd && natNorm ? `${ddd}${natNorm}` : "", ddd && natNorm ? `55${ddd}${natNorm}` : "", no55.slice(-8)];
      for (const c of candidates) { if (c && target.includes(c)) return true; }
      return false;
    }
    const cpfMatch = digits ? (t.cpf || "").replace(/\D/g, "").includes(digits) : false;
    const searchOk = q
      ? (normalizeText(t.name || "").includes(qNorm) || cpfMatch || matchesPhone())
      : true;
    const cityOk = qCity ? normalizeText(t.cidade || "").includes(normalizeText(qCity)) : true;
    const stateOk = qState ? normalizeText(t.estado || "").includes(normalizeText(qState)) : true;
    return searchOk && cityOk && stateOk;
  });

  const UF: { uf: string; name: string }[] = [
    { uf: "AC", name: "Acre" }, { uf: "AL", name: "Alagoas" }, { uf: "AP", name: "Amapá" }, { uf: "AM", name: "Amazonas" },
    { uf: "BA", name: "Bahia" }, { uf: "CE", name: "Ceará" }, { uf: "DF", name: "Distrito Federal" }, { uf: "ES", name: "Espírito Santo" },
    { uf: "GO", name: "Goiás" }, { uf: "MA", name: "Maranhão" }, { uf: "MT", name: "Mato Grosso" }, { uf: "MS", name: "Mato Grosso do Sul" },
    { uf: "MG", name: "Minas Gerais" }, { uf: "PA", name: "Pará" }, { uf: "PB", name: "Paraíba" }, { uf: "PR", name: "Paraná" },
    { uf: "PE", name: "Pernambuco" }, { uf: "PI", name: "Piauí" }, { uf: "RJ", name: "Rio de Janeiro" }, { uf: "RN", name: "Rio Grande do Norte" },
    { uf: "RS", name: "Rio Grande do Sul" }, { uf: "RO", name: "Rondônia" }, { uf: "RR", name: "Roraima" }, { uf: "SC", name: "Santa Catarina" },
    { uf: "SP", name: "São Paulo" }, { uf: "SE", name: "Sergipe" }, { uf: "TO", name: "Tocantins" }
  ];


  function handleCurrency(key: keyof Tecnico) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value || "";
      const norm = raw.replace(/\./g, "").replace(/,/g, ".").trim();
      const hasDecimal = /[.,]/.test(raw);
      let valNum: number | undefined;
      if (!norm) {
        valNum = undefined;
      } else if (hasDecimal) {
        const n = parseFloat(norm);
        valNum = isNaN(n) ? undefined : n;
      } else {
        const d = raw.replace(/\D/g, "");
        valNum = d ? Number(d) : undefined;
      }
      const display = valNum != null ? valNum.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "";
      setMoney((prev) => ({ ...prev, [key as string]: display }));
      setForm((prev) => ({ ...prev, [key]: valNum }));
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
    async function fillDetail() {
      const d = detailForm;
      if (!d) return;
      const raw = String(d.cep || "");
      const digits = raw.replace(/\D/g, "");
      const data = await fetchCEP(digits || "");
      if (data) {
        setDetailForm((prev) => ({
          ...prev!,
          cep: digits,
          rua: data.logradouro || "",
          bairro: data.bairro || "",
          cidade: data.localidade || prev!.cidade || "",
          estado: data.uf || prev!.estado || "",
        }));
      }
    }
    const digits = String(detailForm?.cep || "").replace(/\D/g, "");
    if (digits.length === 8) fillDetail();
  }, [detailForm?.cep]);

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
  }, [pageSize]);

  useEffect(() => {
    if (!db) return;
    let stop: (() => void) | null = null;
    if (qQuery || qCity || qState) {
      const col = collection(db, "registrations") as CollectionReference<Tecnico>;
      const base = query(col, orderBy("name"), fslimit(2000));
      stop = onSnapshot(base, (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((x) => !(x as { meta?: boolean }).meta);
        setItemsAll(list);
      }, () => {});
    }
    return () => { if (stop) stop(); };
  }, [qQuery, qCity, qState]);

  useEffect(() => {
    async function loadStats() {
      if (!db) return;
      const col = collection(db, "registrations") as CollectionReference<Tecnico>;
      const total = await getCountFromServer(col);
      setTotalCount(total.data().count || 0);
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();
      const qNew = query(col, where("createdAt", ">=", start), where("createdAt", "<", end));
      const m = await getCountFromServer(qNew);
      setNewMonthCount(m.data().count || 0);
      const qActive = query(col, where("status", "==", "Ativo"));
      const a = await getCountFromServer(qActive);
      setActiveCount(a.data().count || 0);
      const UFS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];
      const results = await Promise.all(UFS.map(async (uf) => {
        const qUf = query(col, where("estado", "==", uf));
        const c = await getCountFromServer(qUf);
        return { uf, n: c.data().count || 0 };
      }));
      const map: Record<string, number> = {};
      for (const r of results) map[r.uf] = r.n;
      setStateCounts(map);
    }
    loadStats();
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

  async function onExcelFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as string[][];
    await processRows(data);
    e.target.value = "";
  }

  async function processRows(rows: string[][]) {
    if (!rows || !rows.length) return;
    const normalize = (s: unknown) => String(s ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
    const headerRaw = rows[0] || [];
    const header = headerRaw.map((h) => normalize(h));
    const find = (...names: string[]) => {
      for (const n of names) {
        const i = header.indexOf(normalize(n));
        if (i >= 0) return i;
      }
      return -1;
    };
    const iNome = find("nome", "name", "tecnico", "t ecnico", "nome completo", "nome do tecnico", "nome do t ecnico");
    const iStatus = find("status");
    const iRg = find("rg");
    const iCpf = find("cpf");
    const iNascimento = find("data de nascimento", "nascimento", "data nasc", "dt nascimento", "data de nasc");
    const iTelefone = find("telefone", "celular", "whatsapp", "whats", "phone");
    const iEmail = find("e-mail", "email");
    const iEstado = find("estado", "uf");
    const iCidade = find("cidade", "municipio", "munic  pio");
    const iBairro = find("bairro");
    const iEndereco = find("endereco", "endere  o", "rua", "logradouro");
    const iCep = find("cep");
    const iNumBlocoAp = find("numero bloco apartamento", "numero/bloco/apartamento", "numero bloco", "complemento");
    const iAt3h = find("atendimento ate 3h", "atendimento at  3h", "atendimento 3h", "3h");
    const iHoraAdicional = find("hora adicional", "hora adicio", "hora adicio.", "hora extra");
    const iDiaria = find("diaria", "di ria");
    const iDeslocamento = find("deslocamento", "deslocamento it", "desloc.");
    const iObs = find("obs", "observacoes", "observa  es", "obs:");
    const iPix = find("pix", "chave pix", "chave");
    const col = collection(db, "registrations") as CollectionReference<Tecnico>;
    let imported = 0;
    function extractCityStateFromAddress(addr: string): { cidade?: string; estado?: string } {
      const s = String(addr || "");
      const parts = s.split(",");
      const tail = parts[parts.length - 1] || "";
      const m = tail.match(/\s-\s([A-Za-z]{2})\b/);
      const estado = m ? m[1].toUpperCase() : undefined;
      let cidade: string | undefined;
      if (parts.length >= 2) {
        const p = parts[parts.length - 2].trim();
        cidade = p.replace(/\s-\s[A-Za-z]{2}.*/, "").trim();
      }
      return { cidade, estado };
    }

    for (let r = 1; r < rows.length; r++) {
      const row = rows[r] || [];
      const get = (i: number) => {
        if (i < 0) return "";
        const v = (row as unknown[])[i];
        if (v == null) return "";
        if (typeof v === "number") return String(v);
        return String(v).trim();
      };
      const getRaw = (i: number) => {
        if (i < 0) return undefined as unknown;
        return (row as unknown[])[i];
      };
      let nome = get(iNome);
      if (!nome) {
        const em = get(iEmail);
        const local = em.split("@")[0] || "";
        nome = local.replace(/[._-]+/g, " ").trim();
      }
      if (!nome) continue;
      let estado = get(iEstado);
      const ufMatch = estado.match(/^([A-Za-z]{2})\s*-/);
      if (ufMatch) estado = ufMatch[1].toUpperCase();
      let cidade = get(iCidade);
      if (!cidade || !estado) {
        const fromAddr = extractCityStateFromAddress(get(iEndereco));
        cidade = cidade || fromAddr.cidade || "";
        estado = estado || fromAddr.estado || estado;
      }
      const cepRaw = get(iCep);
      const cepDigits = cepRaw.replace(/\D/g, "");
      const payload: Tecnico = {
        categories: ["Informatica"],
        category: "Informatica",
        name: nome.toUpperCase(),
        email: get(iEmail),
        rg: get(iRg),
        cpf: get(iCpf),
        birthDate: parseBrDate(get(iNascimento)),
        country: "BR",
        phoneNumber: formatImportedPhone(get(iTelefone)),
        cep: cepDigits,
        rua: get(iEndereco),
        numero: "",
        complemento: "",
        bairro: get(iBairro),
        cidade,
        estado,
        itRate3h: parseCurrency(getRaw(iAt3h)),
        itAdditionalHour: parseCurrency(getRaw(iHoraAdicional)),
        itDaily: parseCurrency(getRaw(iDiaria)),
        itMileage: parseCurrency(getRaw(iDeslocamento)),
        status: parseStatus(get(iStatus)),
        supervisorId: undefined,
        pix: get(iPix),
        obs: get(iObs),
        numeroBlocoApartamento: get(iNumBlocoAp),
        createdAt: new Date().toISOString(),
      };
      try {
        const clean = Object.fromEntries(Object.entries(payload).filter(([_, v]) => v !== undefined)) as Tecnico;
        const docRef = await addDoc(col, clean);
        imported++;
        if (payload.cep && payload.cidade && payload.estado) {
          fetch("/api/geocode", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: docRef.id, cep: payload.cep, cidade: payload.cidade, estado: payload.estado, rua: payload.rua, numero: payload.numero, bairro: payload.bairro }) });
        }
      } catch {}
    }
    alert(`${imported} técnicos importados`);
  }

  

  function val(row: string[], idx: number): string {
    return idx >= 0 ? String(row[idx] || "").trim() : "";
  }

  function parseCurrency(s: unknown): number | undefined {
    if (s == null) return undefined;
    if (typeof s === "number") {
      if (isNaN(s)) return undefined;
      return s;
    }
    const str = String(s);
    const digits = str.replace(/\D/g, "");
    if (!digits) return undefined;
    return Number(digits) / 100;
  }

  function parseBrDate(s: string): string {
    const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
    if (!m) return "";
    const d = Number(m[1]);
    const mo = Number(m[2]) - 1;
    const y = Number(m[3].length === 2 ? `20${m[3]}` : m[3]);
    const dt = new Date(y, mo, d);
    if (isNaN(dt.getTime())) return "";
    return dt.toISOString();
  }

  function parseStatus(s: string): NonNullable<Tecnico["status"]> {
    const t = s.toLowerCase();
    if (t.includes("ativo")) return "Ativo";
    if (t.includes("ajudante")) return "Ajudante";
    if (t.includes("cancel")) return "Cancelado";
    return "Novo";
  }

  function formatImportedPhone(s: string): string {
    const digits = s.replace(/\D/g, "");
    if (digits.startsWith("55")) return digits;
    if (digits.length >= 10 && digits.length <= 11) return `55${digits}`;
    return digits ? `55${digits}` : "";
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
      const payload: Tecnico = { ...form, cep: cepDigits, categories: cats, category: cats[0], createdAt: new Date().toISOString() };
      const docRef = await addDoc(col, Object.fromEntries(Object.entries(payload).filter(([_, v]) => v !== undefined)) as Tecnico);
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
        <div className="text-2xl font-bold text-foreground">Técnicos</div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700" onClick={() => setOpen(true)}>Novo técnico</button>
          <input id="xlsx-tecnicos" type="file" accept=".xlsx,.xls" className="hidden" onChange={onExcelFile} />
          <label htmlFor="xlsx-tecnicos" className="px-3 py-2 rounded-md bg-muted text-foreground hover:bg-muted cursor-pointer">Importar Excel</label>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <input className="border border-border rounded-md px-3 py-2" placeholder="Filtrar por nome, telefone ou CPF" value={qQuery} onChange={(e) => setQQuery(e.target.value)} />
        <input className="border border-border rounded-md px-3 py-2" placeholder="Filtrar por cidade" value={qCity} onChange={(e) => setQCity(e.target.value)} />
        <div className="flex items-center gap-2">
          <button className="px-3 py-2 rounded-md border border-border text-foreground hover:bg-muted" onClick={() => setOpenStates(true)}>Estados</button>
          {qState && (<span className="text-xs px-2 py-1 rounded bg-muted text-foreground">UF: {qState}</span>)}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div className="border border-border rounded-md bg-surface p-3">
          <div className="text-xs text-foreground">Total de técnicos</div>
          <div className="text-lg font-bold text-foreground">{totalCount}</div>
        </div>
        <div className="border border-border rounded-md bg-surface p-3">
          <div className="text-xs text-foreground">Novos no mês</div>
          <div className="text-lg font-bold text-foreground">{newMonthCount}</div>
        </div>
        <div className="border border-border rounded-md bg-surface p-3">
          <div className="text-xs text-foreground">Ativos</div>
          <div className="text-lg font-bold text-foreground">{activeCount}</div>
        </div>
      </div>

      {view === "table" && (
        <div className="hidden sm:block overflow-x-auto">
          <table className="min-w-full border border-border bg-surface">
            <thead>
              <tr className="bg-muted">
                <th className="p-2 text-left">Nome</th>
                <th className="p-2 text-left">Categoria</th>
                <th className="p-2 text-left">Telefone</th>
                <th className="p-2 text-left">Cidade/UF</th>
                <th className="p-2 text-left">
                  <span className="sr-only">WhatsApp</span>
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="w-5 h-5">
                    <circle cx="12" cy="12" r="12" fill="#25D366" />
                    <path fill="#FFFFFF" d="M16.2 12.7c-.2.5-.9.9-1.3 1-.4.1-.9.1-1.5-.1-.3-.1-.8-.3-1.4-.5-2.4-1-3.9-3.4-4.1-3.6-.1-.2-1-1.3-1-2.5s.6-1.7.8-2c.2-.3.4-.3.6-.3s.3 0 .4 0c.1 0 .3-.1.5.4.2.5.6 1.5.7 1.6.1.1.1.2.1.4s-.1.3-.2.4-.2.3-.3.4-.2.2-.1.5c.1.2.5.9 1.1 1.4.8.7 1.4.9 1.6 1 .2.1.3.1.5-.1s.5-.6.7-.8.3-.2.5-.1c.2.1 1.3.6 1.5.7.2.1.3.2.4.3.1.1.1.5-.1 1.1z"/>
                  </svg>
                </th>
                <th className="p-2 text-left">Status</th>
                
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id} className="border-t border-border hover:bg-muted cursor-pointer" onClick={() => { setDetail(e); setDetailForm({ ...e }); }}>
                  <td className="p-2 text-foreground">{e.name.toUpperCase()}</td>
                  <td className="p-2 text-foreground">{displayCategory(e)}</td>
                  <td className="p-2 text-foreground">{e.country === "BR" ? formatBrPhoneDisplay(e.phoneNumber.slice(2)) : `+${e.phoneNumber}`}</td>
                  <td className="p-2 text-foreground">{e.cidade}/{e.estado}</td>
                  <td className="p-2">
                    <button aria-label="Abrir WhatsApp" className="p-2 rounded bg-green-500 text-white hover:bg-green-600 inline-flex items-center justify-center" onClick={(ev) => { ev.stopPropagation(); const msg = "Olá! Podemos falar sobre um atendimento?"; const url = `https://api.whatsapp.com/send?phone=${e.phoneNumber}&text=${encodeURIComponent(msg)}`; window.open(url, "_blank", "noopener,noreferrer"); }}>
                      <svg aria-hidden="true" viewBox="0 0 24 24" className="w-4 h-4">
                        <circle cx="12" cy="12" r="12" fill="#25D366" />
                        <path fill="#FFFFFF" d="M16.2 12.7c-.2.5-.9.9-1.3 1-.4.1-.9.1-1.5-.1-.3-.1-.8-.3-1.4-.5-2.4-1-3.9-3.4-4.1-3.6-.1-.2-1-1.3-1-2.5s.6-1.7.8-2c.2-.3.4-.3.6-.3s.3 0 .4 0c.1 0 .3-.1.5.4.2.5.6 1.5.7 1.6.1.1.1.2.1.4s-.1.3-.2.4-.2.3-.3.4-.2.2-.1.5c.1.2.5.9 1.1 1.4.8.7 1.4.9 1.6 1 .2.1.3.1.5-.1s.5-.6.7-.8.3-.2.5-.1c.2.1 1.3.6 1.5.7.2.1.3.2.4.3.1.1.1.5-.1 1.1z"/>
                      </svg>
                    </button>
                  </td>
                  <td className="p-2 text-foreground"><span>{statusEmoji(e.status)}</span> <span>{e.status || "Novo"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-between items-center mt-2">
            <button className="px-3 py-2 rounded-md bg-muted text-foreground hover:bg-muted" onClick={prevPage} disabled={!pageStack.length}>Anterior</button>
            <div className="flex items-center gap-3">
              <div className="text-sm text-foreground">{pageStack.length * pageSize + items.length} de {totalCount}</div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-foreground">Por página</label>
                <select className="border border-border rounded-md px-2 py-1" value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
            <button className="px-3 py-2 rounded-md bg-muted text-foreground hover:bg-muted" onClick={nextPage} disabled={!pageEnd}>Próxima</button>
          </div>
        </div>
      )}

      {/* Mobile cards */}
      <div className="sm:hidden space-y-2">
        {filtered.map((e) => (
          <div key={e.id} className="border border-border rounded-md bg-surface p-3" onClick={() => { setDetail(e); setDetailForm({ ...e }); }}>
            <div className="font-semibold text-foreground">{e.name.toUpperCase()}</div>
            <div className="text-sm text-foreground">{displayCategory(e)}</div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-foreground">{e.country === "BR" ? formatBrPhoneDisplay(e.phoneNumber.slice(2)) : `+${e.phoneNumber}`}</div>
              <button aria-label="Abrir WhatsApp" className="ml-2 p-2 rounded bg-green-500 text-white hover:bg-green-600 inline-flex items-center justify-center" onClick={(ev) => { ev.stopPropagation(); const msg = "Olá! Podemos falar sobre um atendimento?"; const url = `https://api.whatsapp.com/send?phone=${e.phoneNumber}&text=${encodeURIComponent(msg)}`; window.open(url, "_blank", "noopener,noreferrer"); }}>
                <svg aria-hidden="true" viewBox="0 0 24 24" className="w-4 h-4">
                  <circle cx="12" cy="12" r="12" fill="#25D366" />
                  <path fill="#FFFFFF" d="M16.2 12.7c-.2.5-.9.9-1.3 1-.4.1-.9.1-1.5-.1-.3-.1-.8-.3-1.4-.5-2.4-1-3.9-3.4-4.1-3.6-.1-.2-1-1.3-1-2.5s.6-1.7.8-2c.2-.3.4-.3.6-.3s.3 0 .4 0c.1 0 .3-.1.5.4.2.5.6 1.5.7 1.6.1.1.1.2.1.4s-.1.3-.2.4-.2.3-.3.4-.2.2-.1.5c.1.2.5.9 1.1 1.4.8.7 1.4.9 1.6 1 .2.1.3.1.5-.1s.5-.6.7-.8.3-.2.5-.1c.2.1 1.3.6 1.5.7.2.1.3.2.4.3.1.1.1.5-.1 1.1z"/>
                </svg>
              </button>
            </div>
            <div className="text-sm text-foreground">{e.cidade}/{e.estado}</div>
            <div className="text-sm text-foreground">Status: <span>{statusEmoji(e.status)}</span> <span>{e.status || "Novo"}</span></div>
          </div>
        ))}
      </div>
      <div className="sm:hidden flex justify-between items-center">
        <button className="px-3 py-2 rounded-md bg-muted text-foreground" onClick={prevPage} disabled={!pageStack.length}>Anterior</button>
        <div className="flex items-center gap-2">
          <div className="text-sm text-foreground">{pageStack.length * pageSize + items.length} de {totalCount}</div>
          <select className="border border-border rounded-md px-2 py-1" value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
        <button className="px-3 py-2 rounded-md bg-muted text-foreground" onClick={nextPage} disabled={!pageEnd}>Próxima</button>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center" onClick={() => setOpen(false)}>
          <div className="w-full max-w-3xl bg-surface rounded-lg p-4 sm:p-6 space-y-3 shadow-xl max-h-[85vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="text-lg font-bold text-foreground">Novo técnico</div>
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="text-sm font-semibold text-foreground">Categoria</div>
                <div className="grid grid-cols-2 gap-2">
                  <label className="inline-flex items-center gap-2 border border-border rounded-md px-3 py-2">
                    <input type="checkbox" name="categoria-create-r" checked={(form.categories || []).includes("Rastreador")} onChange={() => {
                      const has = (form.categories || []).includes("Rastreador");
                      const next: ("Rastreador" | "Informatica")[] = has ? (form.categories || []).filter((c) => c !== "Rastreador") as ("Rastreador" | "Informatica")[] : [ ...(form.categories || []), "Rastreador" ] as ("Rastreador" | "Informatica")[];
                      setForm({ ...form, categories: next, category: next[0] || undefined });
                    }} />
                    <span>Rastreador</span>
                  </label>
                  <label className="inline-flex items-center gap-2 border border-border rounded-md px-3 py-2">
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
                <div className="text-sm font-semibold text-foreground">Status</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select className="border border-border rounded-md px-3 py-2" value={form.status || "Novo"} onChange={(e) => { const v = e.target.value as NonNullable<Tecnico["status"]>; setForm((prev) => ({ ...prev, status: v, supervisorId: v === "Ajudante" ? prev.supervisorId : undefined })); if (v === "Ajudante") { setSupervisorTarget("create"); setOpenSupervisor(true); } }}>
                    <option value="Novo">🆕 Novo</option>
                    <option value="Ativo">🟢 Ativo</option>
                    <option value="Cancelado">❌ Cancelado</option>
                    <option value="Ajudante">🙋‍♂️ Ajudante</option>
                  </select>
                  {form.status === "Ajudante" && (
                    <button type="button" className="border border-border rounded-md px-3 py-2 text-left" onClick={() => { setSupervisorTarget("create"); setOpenSupervisor(true); }}>
                      {(() => {
                        const sel = items.find((t) => t.id === (form.supervisorId || ""));
                        return sel ? sel.name.toUpperCase() : "Selecione o técnico responsável";
                      })()}
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-semibold text-foreground">Dados pessoais</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input className="border border-border rounded-md px-3 py-2" placeholder="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value.toUpperCase() })} />
                  <input className="border border-border rounded-md px-3 py-2" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  <input className="border border-border rounded-md px-3 py-2" placeholder="RG" value={form.rg} onChange={(e) => setForm({ ...form, rg: e.target.value })} />
                  <input className="border border-border rounded-md px-3 py-2" placeholder="Data de Nascimento" value={formatDateBr(form.birthDate)} onClick={() => setOpenDateCreate(true)} readOnly />
                  <div className="flex flex-col sm:flex-row items-center gap-2 col-span-2">
                    <button type="button" className="border border-border rounded-md px-3 py-2 text-foreground w-full sm:w-28 text-left" onClick={() => { setDdiTarget("create"); setOpenDdi(true); }} style={{ fontFamily: '"Segoe UI Emoji","Noto Color Emoji","Apple Color Emoji",system-ui,sans-serif' }}>
                      <span className="inline-flex items-center gap-2"><span style={{ backgroundImage: `url(${flagUrl(country)})` }} className="inline-block w-5 h-4 bg-center bg-no-repeat bg-contain" aria-hidden="true" />+{getCountryCallingCode(country)}</span>
                    </button>
                    <input className="w-full sm:flex-1 border border-border rounded-md px-3 py-2" placeholder="DDD + número de WhatsApp" inputMode="numeric" value={phoneIntl} onChange={(e) => { const rawAll = e.target.value; const raw = rawAll.replace(/\D/g, ""); const limit = (ddi === "55" || country === "BR") ? 11 : Math.max(6, 15 - String(ddi).length); const nat = raw.slice(0, limit); setPhoneIntl(nat); if (ddi === "55" || country === "BR") { if (nat.length === 10 || nat.length === 11) { const dddDigits = nat.slice(0, 2); const f8 = normalizeFone(nat.slice(2)); if (f8) setForm((prev) => ({ ...prev, phoneNumber: `${ddi}${dddDigits}${f8}`, country })); } } else { if (nat) { const full = `+${ddi}${nat}`; const parsed = parsePhoneNumberFromString(full, country); if (parsed && parsed.isValid()) setForm((prev) => ({ ...prev, phoneNumber: `${ddi}${nat}`, country })); } } }} />
                  </div>
                  <input className="border border-border rounded-md px-3 py-2 col-span-2" placeholder="PIX" value={form.pix || ""} onChange={(e) => setForm({ ...form, pix: e.target.value })} />
                  <input className="border border-border rounded-md px-3 py-2 col-span-2" placeholder="Observações" value={form.obs || ""} onChange={(e) => setForm({ ...form, obs: e.target.value })} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-semibold text-foreground">Endereço</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input className="border border-border rounded-md px-3 py-2" placeholder="CEP" value={cep} onChange={(e) => setCep(e.target.value)} />
                  <input className="border border-border rounded-md px-3 py-2 col-span-2" placeholder="Rua" value={form.rua} onChange={(e) => setForm({ ...form, rua: e.target.value })} />
                  <input className="border border-border rounded-md px-3 py-2" placeholder="Número" value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} />
                  <input className="border border-border rounded-md px-3 py-2" placeholder="Complemento" value={form.complemento || ""} onChange={(e) => setForm({ ...form, complemento: e.target.value })} />
                  <input className="border border-border rounded-md px-3 py-2" placeholder="Bairro" value={form.bairro} onChange={(e) => setForm({ ...form, bairro: e.target.value })} />
                  <input className="border border-border rounded-md px-3 py-2" placeholder="Cidade" value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} />
                  <input className="border border-border rounded-md px-3 py-2" placeholder="Estado" value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })} />
                  <input className="border border-border rounded-md px-3 py-2 col-span-2" placeholder="Número/Bloco/Apartamento" value={form.numeroBlocoApartamento || ""} onChange={(e) => setForm({ ...form, numeroBlocoApartamento: e.target.value })} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-semibold text-foreground">Valores</div>
                {(form.categories || []).includes("Rastreador") && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <div className="text-xs text-foreground">Deslocamento (Rastreador)</div>
                      <div className="flex items-center"><span className="px-3 py-2 bg-muted border border-border rounded-l-md text-foreground">R$</span><input className="flex-1 border border-l-0 border-border rounded-r-md px-3 py-2" value={money.trackerMileage} onChange={handleCurrency("trackerMileage")} inputMode="numeric" /></div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-foreground">Instalação por rastreador</div>
                      <div className="flex items-center"><span className="px-3 py-2 bg-muted border border-border rounded-l-md text-foreground">R$</span><input className="flex-1 border border-l-0 border-border rounded-r-md px-3 py-2" value={money.trackerInstallationRate} onChange={handleCurrency("trackerInstallationRate")} inputMode="numeric" /></div>
                    </div>
                  </div>
                )}
                {(form.categories || []).includes("Informatica") && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <div className="text-xs text-foreground">Atendimento de 3h</div>
                      <div className="flex items-center"><span className="px-3 py-2 bg-muted border border-border rounded-l-md text-foreground">R$</span><input className="flex-1 border border-l-0 border-border rounded-r-md px-3 py-2" value={money.itRate3h} onChange={handleCurrency("itRate3h")} inputMode="numeric" /></div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-foreground">Hora adicional</div>
                      <div className="flex items-center"><span className="px-3 py-2 bg-muted border border-border rounded-l-md text-foreground">R$</span><input className="flex-1 border border-l-0 border-border rounded-r-md px-3 py-2" value={money.itAdditionalHour} onChange={handleCurrency("itAdditionalHour")} inputMode="numeric" /></div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-foreground">Diária</div>
                      <div className="flex items-center"><span className="px-3 py-2 bg-muted border border-border rounded-l-md text-foreground">R$</span><input className="flex-1 border border-l-0 border-border rounded-r-md px-3 py-2" value={money.itDaily} onChange={handleCurrency("itDaily")} inputMode="numeric" /></div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-foreground">Deslocamento (IT)</div>
                      <div className="flex items-center"><span className="px-3 py-2 bg-muted border border-border rounded-l-md text-foreground">R$</span><input className="flex-1 border border-l-0 border-border rounded-r-md px-3 py-2" value={money.itMileage} onChange={handleCurrency("itMileage")} inputMode="numeric" /></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 rounded-md py-2 bg-blue-600 text-white hover:bg-blue-700" onClick={create}>Salvar</button>
              <button className="flex-1 rounded-md py-2 bg-muted text-foreground hover:bg-muted" onClick={() => setOpen(false)}>Cancelar</button>
            </div>
            {openDateCreate && (
              <DateModal value={form.birthDate} onSave={(iso) => setForm((prev) => ({ ...prev, birthDate: iso }))} onClose={() => setOpenDateCreate(false)} />
            )}
          </div>
        </div>
      )}

      {openStates && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center" onClick={() => setOpenStates(false)}>
          <div className="w-full max-w-2xl bg-surface rounded-lg p-4 sm:p-6 space-y-3 shadow-xl max-h-[85vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="text-lg font-bold text-foreground">Estados</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {UF.map(({ uf, name }) => {
                const cnt = stateCounts[uf] ?? 0;
                return (
                  <button key={uf} className="flex items-center justify-between border border-border rounded-md px-3 py-2 hover:bg-muted" onClick={() => { setQState(uf); setOpenStates(false); }}>
                    <div className="text-sm text-foreground">{name} - {uf}</div>
                    <div className="text-sm font-semibold text-foreground">{cnt} Técnicos</div>
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between">
              <button className="px-3 py-2 rounded-md bg-muted text-foreground hover:bg-muted" onClick={() => setOpenStates(false)}>Fechar</button>
              <button className="px-3 py-2 rounded-md bg-muted text-foreground hover:bg-muted" onClick={() => { setQState(""); setOpenStates(false); }}>Limpar filtro</button>
            </div>
          </div>
        </div>
      )}

      {openDdi && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setOpenDdi(false)}>
          <div className="bg-surface w-full max-w-md rounded-lg shadow-xl p-4" onClick={(e) => e.stopPropagation()}>
            <div className="text-lg font-bold text-foreground">Selecionar DDI</div>
            <div className="mt-2"><input className="w-full border border-border rounded-md px-3 py-2" placeholder="Pesquisar país ou DDI" value={ddiQuery} onChange={(e) => setDdiQuery(e.target.value)} /></div>
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
                  <button key={c.iso} type="button" className="w-full flex items-center justify-between px-3 py-2 rounded hover:bg-muted" onClick={() => { setCountry(c.iso as CountryCode); setDdi(c.code); if (ddiTarget === "detail") { setDetailForm((prev) => ({ ...prev!, country: c.iso as string })); } else { setForm((prev) => ({ ...prev, country: c.iso as string })); } setOpenDdi(false); }} style={{ fontFamily: '"Segoe UI Emoji","Noto Color Emoji","Apple Color Emoji",system-ui,sans-serif' }}>
                    <span className="flex items-center gap-2"><span style={{ backgroundImage: `url(${flagUrl(c.iso)})` }} className="inline-block w-5 h-4 bg-center bg-no-repeat bg-contain" aria-hidden="true" /><span className="text-foreground">{c.name}</span></span>
                    <span className="text-foreground">+{c.code}</span>
                  </button>
                ))}
            </div>
            <div className="flex justify-end mt-3">
              <button className="px-3 py-2 rounded bg-muted text-foreground" onClick={() => setOpenDdi(false)}>Fechar</button>
            </div>
          </div>
        </div>
      )}

      {openSupervisor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setOpenSupervisor(false)}>
          <div className="bg-surface w-full max-w-xl rounded-lg shadow-xl p-4" onClick={(e) => e.stopPropagation()}>
            <div className="text-lg font-bold text-foreground">Selecionar técnico responsável</div>
            <div className="mt-2"><input className="w-full border border-border rounded-md px-3 py-2" placeholder="Buscar por nome" value={qSupervisor} onChange={(e) => setQSupervisor(e.target.value)} /></div>
            <div className="mt-2 max-h-64 overflow-auto space-y-1" onScroll={(e) => {
              const el = e.currentTarget;
              if (el.scrollTop + el.clientHeight >= el.scrollHeight - 24) {
                loadMoreSupervisors();
              }
            }}>
              {(supervisorItems.filter((t) => {
                const q = qSupervisor.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                const n = String(t.name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                const notSelf = supervisorTarget === 'detail' ? t.id !== (detailForm?.id || '') : true;
                return notSelf && (!q || n.includes(q));
              })).map((t) => (
                <button key={t.id} className="w-full text-left px-3 py-2 border border-border rounded hover:bg-muted" onClick={() => {
                  if (supervisorTarget === 'detail') {
                    setDetailForm((prev) => ({ ...prev!, supervisorId: t.id }));
                  } else {
                    setForm((prev) => ({ ...prev, supervisorId: t.id }));
                  }
                  setOpenSupervisor(false);
                }}>
                  {t.name.toUpperCase()}
                </button>
              ))}
              {supervisorLoading && (<div className="text-xs text-foreground px-3 py-2">Carregando...</div>)}
              {!supervisorLoading && !supervisorHasMore && (<div className="text-xs text-foreground px-3 py-2">Fim da lista</div>)}
            </div>
            <div className="flex justify-end mt-3">
              <button className="px-3 py-2 rounded bg-muted text-foreground" onClick={() => setOpenSupervisor(false)}>Fechar</button>
            </div>
          </div>
        </div>
      )}

  {detail && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center" onClick={() => { setDetail(null); setDetailForm(null); }}>
          <div className="w-full max-w-3xl bg-surface rounded-lg p-6 space-y-4 shadow-xl max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="text-lg font-bold text-foreground">{detail.name.toUpperCase()}</div>
            <div className="text-sm font-semibold text-foreground">Dados Pessoais</div>
            <hr className="border-border" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
            <div className="text-xs text-foreground">Categoria</div>
            <div className="grid grid-cols-2 gap-2">
              <label className="inline-flex items-center gap-2 border border-border rounded-md px-3 py-2">
                <input type="checkbox" name="categoria-detail-r" checked={((detailForm?.categories || (detailForm?.category ? [detailForm.category] : [])) || []).includes("Rastreador")} onChange={() => {
                  const curr: ("Rastreador" | "Informatica")[] = (detailForm?.categories && detailForm.categories.length) ? detailForm.categories as ("Rastreador" | "Informatica")[] : (detailForm?.category ? [detailForm.category] as ("Rastreador" | "Informatica")[] : []);
                  const has = curr.includes("Rastreador");
                  const next: ("Rastreador" | "Informatica")[] = has ? curr.filter((c) => c !== "Rastreador") : [...curr, "Rastreador"];
                  setDetailForm({ ...detailForm!, categories: next, category: next[0] || undefined });
                }} />
                <span>Rastreador</span>
              </label>
              <label className="inline-flex items-center gap-2 border border-border rounded-md px-3 py-2">
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
                <div className="text-xs text-foreground">Status</div>
                <select className="border border-border rounded-md px-3 py-2 w-full" value={detailForm!.status || "Novo"} onChange={(e) => { const v = e.target.value as NonNullable<Tecnico["status"]>; setDetailForm((prev) => ({ ...prev!, status: v, supervisorId: v === "Ajudante" ? prev?.supervisorId : undefined })); if (v === "Ajudante") { setSupervisorTarget("detail"); setOpenSupervisor(true); } }}>
                  <option value="Novo">🆕 Novo</option>
                  <option value="Ativo">🟢 Ativo</option>
                  <option value="Cancelado">❌ Cancelado</option>
                  <option value="Ajudante">🙋‍♂️ Ajudante</option>
                </select>
                {detailForm?.status === "Ajudante" && (
                  <div className="mt-2">
                    <div className="text-xs text-foreground">Técnico responsável</div>
                    <button type="button" className="border border-border rounded-md px-3 py-2 w-full text-left" onClick={() => { setSupervisorTarget("detail"); setOpenSupervisor(true); }}>
                      {(() => {
                        const sel = items.find((t) => t.id === (detailForm!.supervisorId || ""));
                        return sel ? sel.name.toUpperCase() : "Selecione";
                      })()}
                    </button>
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <div className="text-xs text-foreground">Email</div>
                <input className="border border-border rounded-md px-3 py-2 w-full" value={detailForm!.email || ""} onChange={(e) => setDetailForm({ ...detailForm!, email: e.target.value })} />
              </div>
              <div className="space-y-1">
                <div className="text-xs text-foreground">RG</div>
                <input className="border border-border rounded-md px-3 py-2 w-full" value={detailForm!.rg || ""} onChange={(e) => setDetailForm({ ...detailForm!, rg: e.target.value })} />
              </div>
              <div className="space-y-1">
                <div className="text-xs text-foreground">Data de Nascimento</div>
                <input className="border border-border rounded-md px-3 py-2 w-full" value={formatDateBr(detailForm!.birthDate)} onClick={() => setOpenDateDetail(true)} readOnly />
              </div>
              <div className="space-y-1">
                <div className="text-xs text-foreground">Telefone</div>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <button type="button" className="border border-border rounded-md px-3 py-2 text-foreground w-full sm:w-28 text-left" onClick={() => { setDdiTarget("detail"); setOpenDdi(true); }} style={{ fontFamily: '"Segoe UI Emoji","Noto Color Emoji","Apple Color Emoji",system-ui,sans-serif' }}>
                    <span className="inline-flex items-center gap-2"><span style={{ backgroundImage: `url(${flagUrl(detailForm!.country)})` }} className="inline-block w-5 h-4 bg-center bg-no-repeat bg-contain" aria-hidden="true" />+{getCountryCallingCode(detailForm!.country as CountryCode)}</span>
                  </button>
                  <input className="w-full sm:flex-1 border border-border rounded-md px-3 py-2" value={detailForm!.country === "BR" ? (detailForm!.phoneNumber || "").slice(2) : (detailForm!.phoneNumber || "")} onChange={(e) => {
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
                <div className="text-xs text-foreground">CEP</div>
                <input className="border border-border rounded-md px-3 py-2 w-full" value={detailForm!.cep} onChange={(e) => setDetailForm({ ...detailForm!, cep: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <div className="text-sm font-semibold text-foreground">Endereço</div>
                <hr className="border-border" />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <div className="text-xs text-foreground">Rua</div>
                <input className="border border-border rounded-md px-3 py-2 w-full" value={detailForm!.rua} onChange={(e) => setDetailForm({ ...detailForm!, rua: e.target.value })} />
              </div>
              <div className="space-y-1">
                <div className="text-xs text-foreground">Número</div>
                <input className="border border-border rounded-md px-3 py-2 w-full" value={detailForm!.numero} onChange={(e) => setDetailForm({ ...detailForm!, numero: e.target.value })} />
              </div>
              <div className="space-y-1">
                <div className="text-xs text-foreground">Complemento</div>
                <input className="border border-border rounded-md px-3 py-2 w-full" value={detailForm!.complemento || ""} onChange={(e) => setDetailForm({ ...detailForm!, complemento: e.target.value })} />
              </div>
              <div className="space-y-1">
                <div className="text-xs text-foreground">Número/Bloco/Apartamento</div>
                <input className="border border-border rounded-md px-3 py-2 w-full" value={detailForm!.numeroBlocoApartamento || ""} onChange={(e) => setDetailForm({ ...detailForm!, numeroBlocoApartamento: e.target.value })} />
              </div>
              <div className="space-y-1">
                <div className="text-xs text-foreground">Bairro</div>
                <input className="border border-border rounded-md px-3 py-2 w-full" value={detailForm!.bairro} onChange={(e) => setDetailForm({ ...detailForm!, bairro: e.target.value })} />
              </div>
              <div className="space-y-1">
                <div className="text-xs text-foreground">Cidade/UF</div>
                <div className="grid grid-cols-2 gap-2">
                  <input className="border border-border rounded-md px-3 py-2 w-full" value={detailForm!.cidade} onChange={(e) => setDetailForm({ ...detailForm!, cidade: e.target.value })} />
                  <input className="border border-border rounded-md px-3 py-2 w-full" value={detailForm!.estado} onChange={(e) => setDetailForm({ ...detailForm!, estado: e.target.value })} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-semibold text-foreground">Valores</div>
              {(detailForm?.categories || (detailForm?.category ? [detailForm.category] : [])).includes("Informatica") && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <div className="text-xs text-foreground">Atendimento de 3h</div>
                    <div className="flex items-center"><span className="px-3 py-2 bg-muted border border-border rounded-l-md text-foreground">R$</span><input className="flex-1 border border-l-0 border-border rounded-r-md px-3 py-2 w-full" value={formatCurrencyTech(detailForm?.itRate3h)} onChange={handleCurrencyDetailTech("itRate3h")} inputMode="numeric" /></div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-foreground">Hora adicional</div>
                    <div className="flex items-center"><span className="px-3 py-2 bg-muted border border-border rounded-l-md text-foreground">R$</span><input className="flex-1 border border-l-0 border-border rounded-r-md px-3 py-2 w-full" value={formatCurrencyTech(detailForm?.itAdditionalHour)} onChange={handleCurrencyDetailTech("itAdditionalHour")} inputMode="numeric" /></div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-foreground">Diária</div>
                    <div className="flex items-center"><span className="px-3 py-2 bg-muted border border-border rounded-l-md text-foreground">R$</span><input className="flex-1 border border-l-0 border-border rounded-r-md px-3 py-2 w-full" value={formatCurrencyTech(detailForm?.itDaily)} onChange={handleCurrencyDetailTech("itDaily")} inputMode="numeric" /></div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-foreground">Deslocamento (IT)</div>
                    <div className="flex items-center"><span className="px-3 py-2 bg-muted border border-border rounded-l-md text-foreground">R$</span><input className="flex-1 border border-l-0 border-border rounded-r-md px-3 py-2 w-full" value={formatCurrencyTech(detailForm?.itMileage)} onChange={handleCurrencyDetailTech("itMileage")} inputMode="numeric" /></div>
                  </div>
                </div>
              )}
              {(detailForm?.categories || (detailForm?.category ? [detailForm.category] : [])).includes("Rastreador") && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <div className="text-xs text-foreground">Deslocamento (Rastreador)</div>
                    <div className="flex items-center"><span className="px-3 py-2 bg-muted border border-border rounded-l-md text-foreground">R$</span><input className="flex-1 border border-l-0 border-border rounded-r-md px-3 py-2 w-full" value={formatCurrencyTech(detailForm?.trackerMileage)} onChange={handleCurrencyDetailTech("trackerMileage")} inputMode="numeric" /></div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-foreground">Instalação por rastreador</div>
                    <div className="flex items-center"><span className="px-3 py-2 bg-muted border border-border rounded-l-md text-foreground">R$</span><input className="flex-1 border border-l-0 border-border rounded-r-md px-3 py-2 w-full" value={formatCurrencyTech(detailForm?.trackerInstallationRate)} onChange={handleCurrencyDetailTech("trackerInstallationRate")} inputMode="numeric" /></div>
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <div className="text-sm font-semibold text-foreground">Pagamento</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <div className="text-xs text-foreground">PIX</div>
                  <input className="border border-border rounded-md px-3 py-2 w-full" value={detailForm!.pix || ""} onChange={(e) => setDetailForm({ ...detailForm!, pix: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-foreground">Observações</div>
                  <input className="border border-border rounded-md px-3 py-2 w-full" value={detailForm!.obs || ""} onChange={(e) => setDetailForm({ ...detailForm!, obs: e.target.value })} />
                </div>
              </div>
            </div>

            

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
                  const clean = Object.fromEntries(Object.entries(payload).filter(([_, v]) => v !== undefined));
                  await updateDoc(doc(db, "registrations", d.id), clean as Partial<Tecnico>);
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
              <button className="flex-1 rounded-md py-2 bg-muted text-foreground hover:bg-muted" onClick={() => { setDetail(null); setDetailForm(null); }}>Fechar</button>
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
