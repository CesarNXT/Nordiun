"use client";
import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { fetchCEP } from "@/lib/viacep";
import { db } from "@/lib/firebase";
import { addDoc, collection, CollectionReference, query, where, getDocs, doc, limit, getDoc } from "firebase/firestore";
import { DateModal } from "@/components/date-modal";
import { parsePhoneNumberFromString, getCountries, getCountryCallingCode, type CountryCode } from "libphonenumber-js/max";

  const schema = z
  .object({
    category: z.enum(["Rastreador", "Informatica"]),
    name: z.string().min(2),
    cpf: z.string().min(11),
    email: z.string().email(),
    rg: z.string().min(5),
    birthDate: z.string().min(8),
    country: z.string().min(2),
    phoneNumber: z.string().min(8),
    cep: z.string().min(8).refine((s) => s.replace(/\D/g, "").length === 8, "CEP inválido"),
    rua: z.string().min(1),
    numero: z.string().min(1),
    complemento: z.string().optional(),
    bairro: z.string().min(1),
    cidade: z.string().min(1),
    estado: z.string().min(2),
    itRate3h: z.number().optional(),
    itAdditionalHour: z.number().optional(),
    itDaily: z.number().optional(),
    itMileage: z.number().optional(),
    trackerMileage: z.number().optional(),
    trackerInstallationRate: z.number().optional(),
    pix: z.string().min(3, "Informe sua chave PIX"),
  })
  .superRefine((data, ctx) => {
    if (data.country === "BR") {
      if (data.phoneNumber.replace(/\D/g, "").length !== 12) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["phoneNumber"], message: "Telefone BR deve ter 12 dígitos (DDI+DDD+FONE)" });
      }
    } else {
      const digits = data.phoneNumber.replace(/\D/g, "");
      const full = `+${digits}`;
      const parsed = parsePhoneNumberFromString(full, data.country as CountryCode);
      if (!parsed || !parsed.isValid()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["phoneNumber"], message: "Telefone inválido para o país selecionado" });
      }
    }
  });

type FormData = z.infer<typeof schema>;

export default function CadastroPage() {
  const [step, setStep] = useState(1);
  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    formState: { isSubmitting, errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { country: "BR" },
  });
  const [category, setCategory] = useState<FormData["category"] | null>(null);
  const [cep, setCep] = useState("");
  const cepReady = cep.replace(/\D/g, "").length === 8;
  const [openDate, setOpenDate] = useState(false);
  const [ddi, setDdi] = useState("55");
  // DDD e telefone agora são inseridos juntos em um único campo (phoneIntl)
  const [country, setCountry] = useState<CountryCode>("BR");
  const [phoneIntl, setPhoneIntl] = useState("");
  const countries = getCountries();
  const [money, setMoney] = useState<{ [k: string]: string }>({
    itRate3h: "",
    itAdditionalHour: "",
    itDaily: "",
    itMileage: "",
    trackerMileage: "",
    trackerInstallationRate: "",
  });
  const [existingId, setExistingId] = useState<string | null>(null);
  
  const [advanceError, setAdvanceError] = useState("");
  const [openDdi, setOpenDdi] = useState(false);
  const [ddiQuery, setDdiQuery] = useState("");
  const [birthDisplay, setBirthDisplay] = useState("");
  const [existingMode, setExistingMode] = useState(false);
  const [verifyRequested, setVerifyRequested] = useState(false);
  const [verifyCode, setVerifyCode] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [verifySeconds, setVerifySeconds] = useState(0);

  useEffect(() => {
    if (step === 7 && verifySeconds <= 0 && verifyRequested) {
      setTimeout(() => {
        setVerifyRequested(false);
        setVerifyCode("");
        setAdvanceError("Acesso expirado. Valide seu número novamente.");
        setStep(1);
      }, 0);
    }
  }, [verifySeconds, step, verifyRequested]);

  type InfoKeys = "itRate3h" | "itAdditionalHour" | "itDaily" | "itMileage" | "trackerMileage";
  const [info, setInfo] = useState<Record<InfoKeys, boolean>>({
    itRate3h: false,
    itAdditionalHour: false,
    itDaily: false,
    itMileage: false,
    trackerMileage: false,
  });

  const infoTimer = useRef<number | null>(null);
  function flashInfo(key: InfoKeys) {
    setInfo({ itRate3h: false, itAdditionalHour: false, itDaily: false, itMileage: false, trackerMileage: false });
    setInfo((prev) => ({ ...prev, [key]: true }));
    if (infoTimer.current) clearTimeout(infoTimer.current);
    infoTimer.current = setTimeout(() => {
      setInfo((prev) => ({ ...prev, [key]: false }));
    }, 4000) as unknown as number;
  }

  function formatDisplay(s: string) {
    const digits = s.replace(/\D/g, "");
    if (!digits) return "";
    const cents = parseInt(digits, 10);
    const amount = cents / 100;
    return amount.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function handleCurrency(field: keyof FormData) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      const display = formatDisplay(val);
      setMoney((prev) => ({ ...prev, [field]: display }));
      const digits = val.replace(/\D/g, "");
      if (!digits) {
        setValue(field, undefined);
        return;
      }
      const cents = parseInt(digits, 10);
      setValue(field, cents / 100);
    };
  }
  function formatDateBr(iso?: string) {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("pt-BR");
  }

  useEffect(() => {
    async function ensureRegistrations() {
      try {
        const col = collection(db, "registrations");
        const snap = await getDocs(query(col, limit(1)));
        if (snap.empty) {
          const meta = collection(db, "registrations") as CollectionReference<Record<string, unknown>>;
          await addDoc(meta, { meta: true, createdAt: Date.now() });
        }
      } catch {}
    }
    ensureRegistrations();
  }, []);

  const supportWhats = (process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || "1152429323").replace(/\D/g, "");
  const [blocked, setBlocked] = useState<string | null>(null);

  async function checkPhone(): Promise<{ found: boolean; id?: string; status?: string }> {
    const national = phoneIntl.replace(/\D/g, "");
    const current = (ddi === "55" || country === "BR")
      ? `${ddi}${national.slice(0, 2)}${normalizeFone(national.slice(2))}`
      : `${ddi}${national}`;
    const clean = current.replace(/\D/g, "");
    if (!clean) {
      setExistingId(null);
      return { found: false };
    }
    const col = collection(db, "registrations");
    const q = query(col, where("phoneNumber", "==", clean));
    const snap = await getDocs(q);
    const first = snap.docs.find((d) => !(d.data() as { meta?: boolean }).meta);
    if (!first) {
      setExistingId(null);
      return { found: false };
    }
    setExistingId(first.id);
    const data = first.data() as { status?: string };
    return { found: true, id: first.id, status: data.status };
  }

  async function prefillExisting(id: string) {
    const docRef = doc(db, "registrations", id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return;
    const data = snap.data() as Partial<FormData> & { phoneNumber?: string };
    if (data.category) { setCategory(data.category); setValue("category", data.category); }
    if (data.name) setValue("name", data.name);
    if (data.cpf) setValue("cpf", (data.cpf || "").replace(/\D/g, ""));
    if (data.email) setValue("email", data.email);
    if (data.rg) setValue("rg", data.rg);
    if (data.birthDate) setValue("birthDate", data.birthDate);
    if (data.phoneNumber) setValue("phoneNumber", (data.phoneNumber || "").replace(/\D/g, ""));
    if (data.cep) setValue("cep", data.cep);
    if (data.rua) setValue("rua", data.rua);
    if (data.numero) setValue("numero", data.numero);
    if (data.complemento) setValue("complemento", data.complemento);
    if (data.bairro) setValue("bairro", data.bairro);
    if (data.cidade) setValue("cidade", data.cidade);
    if (data.estado) setValue("estado", data.estado);
    if ((data as Record<string, unknown>).pix) setValue("pix", String((data as Record<string, unknown>).pix || ""));
    setMoney((prev) => ({
      ...prev,
      itRate3h: data.itRate3h != null ? (data.itRate3h).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : prev.itRate3h,
      itAdditionalHour: data.itAdditionalHour != null ? (data.itAdditionalHour).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : prev.itAdditionalHour,
      itDaily: data.itDaily != null ? (data.itDaily).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : prev.itDaily,
      itMileage: data.itMileage != null ? (data.itMileage).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : prev.itMileage,
      trackerMileage: data.trackerMileage != null ? (data.trackerMileage).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : prev.trackerMileage,
      trackerInstallationRate: data.trackerInstallationRate != null ? (data.trackerInstallationRate).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : prev.trackerInstallationRate,
    }));
  }

function normalizeFone(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 9) {
    return digits.slice(1);
  }
  if (digits.length === 8) {
    return digits;
  }
  return "";
}

  useEffect(() => {
    setValue("country", country);
    const national = phoneIntl.replace(/\D/g, "");
    if (ddi === "55" || country === "BR") {
      if (national.length === 10 || national.length === 11) {
        const dddDigits = national.slice(0, 2);
        const f8 = normalizeFone(national.slice(2));
        if (f8) setValue("phoneNumber", `${ddi}${dddDigits}${f8}`);
      }
      return;
    }
    if (!national) return;
    const full = `+${ddi}${national}`;
    const parsed = parsePhoneNumberFromString(full, country);
    if (parsed && parsed.isValid()) {
      setValue("phoneNumber", `${ddi}${national}`);
    }
  }, [country, ddi, phoneIntl, setValue]);

  async function tryAdvanceFromPhone() {
    setAdvanceError("");
    const national = phoneIntl.replace(/\D/g, "");
    if (ddi === "55" || country === "BR") {
      if (!(national.length === 10 || national.length === 11)) {
        setAdvanceError("Número incompleto");
        return;
      }
      const dddDigits = national.slice(0, 2);
      const f8 = normalizeFone(national.slice(2));
      if (!f8) {
        setAdvanceError("Número incompleto");
        return;
      }
      setValue("phoneNumber", `${ddi}${dddDigits}${f8}`);
      const found = await checkPhone();
      if (found.found && found.status === "Cancelado") {
        setBlocked("Cancelado");
        setExistingMode(false);
        setStep(8);
        return;
      }
      if (found.found) {
        await requestVerification(`${ddi}${dddDigits}${f8}`);
        setStep(7);
        return;
      }
      setStep(2);
      return;
    }
    if (!national) {
      setAdvanceError("Número inválido para o país selecionado");
      return;
    }
    const full = `+${ddi}${national}`;
    const parsed = parsePhoneNumberFromString(full, country);
    if (!(parsed && parsed.isValid())) {
      setAdvanceError("Número inválido para o país selecionado");
      return;
    }
    setValue("phoneNumber", `${ddi}${national}`);
    const found = await checkPhone();
    if (found.found && found.status === "Cancelado") {
      setBlocked("Cancelado");
      setExistingMode(false);
      setStep(8);
      return;
    }
    if (found.found) {
      await requestVerification(`${ddi}${national}`);
      setStep(7);
      return;
    }
    setStep(2);
  }

  async function requestVerification(number: string) {
    try {
      setVerifyError("");
      setVerifyRequested(true);
      setVerifySeconds(120);
      const timer = setInterval(() => {
        setVerifySeconds((s) => {
          if (s <= 1) {
            clearInterval(timer);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
      await fetch("/api/whatsapp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number }),
      });
    } catch {
      setVerifyError("Falha ao enviar o código. Tente novamente.");
    }
  }

  function currentNumber(): string {
    const nat = phoneIntl.replace(/\D/g, "");
    if (ddi === "55" || country === "BR") {
      const dddDigits = nat.slice(0, 2);
      const f8 = normalizeFone(nat.slice(2));
      return `${ddi}${dddDigits}${f8}`.replace(/\D/g, "");
    }
    return `${ddi}${nat}`.replace(/\D/g, "");
  }

  async function resendVerification() {
    setVerifyCode("");
    await requestVerification(currentNumber());
  }

      async function confirmVerification() {
        try {
          setVerifyError("");
          const current = (ddi === "55" || country === "BR")
            ? `${ddi}${phoneIntl.replace(/\D/g, "").slice(0, 2)}${normalizeFone(phoneIntl.replace(/\D/g, "").slice(2))}`
            : `${ddi}${phoneIntl.replace(/\D/g, "")}`;
          const res = await fetch("/api/whatsapp/verify/check", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ number: current.replace(/\D/g, ""), code: verifyCode.replace(/\D/g, "") }),
          });
          if (!res.ok) {
            const data = await res.json().catch(() => ({ error: "invalid" }));
            setVerifyError(data.error === "expired" ? "Código expirado" : "Código inválido");
            return;
          }
          const found = await checkPhone();
          if (found.found) {
            if (found.status === "Cancelado") {
              setBlocked("Cancelado");
              setExistingMode(false);
              setStep(8);
            } else {
              if (found.id) await prefillExisting(found.id);
              setExistingMode(true);
              setStep(2);
            }
          } else {
            setStep(2);
          }
          setVerifyRequested(false);
          setVerifyCode("");
        } catch {
          setVerifyError("Erro ao validar o código");
        }
      }

  useEffect(() => {
    async function fill() {
      const data = await fetchCEP(cep || "");
      if (data) {
        setValue("rua", data.logradouro || "");
        setValue("bairro", data.bairro || "");
        setValue("cidade", data.localidade || "");
        setValue("estado", data.uf || "");
      }
    }
    if (cep && cep.replace(/\D/g, "").length === 8) fill();
  }, [cep, setValue]);

  async function onSubmit(values: FormData) {
    if (existingId) {
      const resp = await fetch("/api/registration/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number: values.phoneNumber, values }),
      });
      if (!resp.ok) {
        setExistingMode(false);
        setExistingId(null);
        setVerifyRequested(false);
        setVerifyCode("");
        setAdvanceError("Acesso expirado. Valide seu número novamente.");
        setStep(1);
        return;
      }
      return;
    }
    const col = collection(db, "registrations") as CollectionReference<Record<string, unknown>>;
    const docRef = await addDoc(col, { ...values, status: "Novo" });
    try {
      await fetch("/api/geocode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: docRef.id, cep: values.cep, cidade: values.cidade, estado: values.estado, rua: values.rua, numero: values.numero, bairro: values.bairro }),
      });
    } catch {}
    setStep(6);
  }

  

  return (
    <div className="min-h-screen relative flex items-center justify-center px-3 py-6 overflow-hidden bg-[#0A0F1A]">
      <div className="absolute inset-0 -z-10" style={{ backgroundImage: "radial-gradient(800px 400px at 15% 10%, #0b2b56 0%, transparent 70%), radial-gradient(700px 350px at 85% 90%, #0a3a2f 0%, transparent 70%)" }} />
      <div className="absolute inset-0 -z-10 opacity-20" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent 0, transparent 23px, rgba(255,255,255,.06) 24px), repeating-linear-gradient(90deg, transparent 0, transparent 23px, rgba(255,255,255,.06) 24px)" }} />
      <div className="absolute left-0 top-1/2 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent opacity-40 animate-pulse" />
      
      <div className="w-full max-w-lg sm:max-w-xl md:max-w-2xl bg-white border border-slate-200 rounded-lg p-4 sm:p-6 shadow-2xl">
        <div className="flex items-center justify-center">
          <div className="text-2xl font-bold text-slate-900 text-center">{category === "Informatica" ? "Técnico de Informática" : category === "Rastreador" ? "Técnico de Rastreador Veicular" : "Cadastro de Técnico"}</div>
        </div>
        {!existingMode && step >= 1 && step <= 6 && !blocked && (
          <div className="mt-2">
            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-2 bg-blue-600"
                style={{ width: `${Math.min(100, Math.round(((Math.min(6, Math.max(1, step)) - 1) / 5) * 100))}%` }}
              />
            </div>
          </div>
        )}

        {existingMode && (
        <form className="mt-4 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-800">Seu número de WhatsApp</label>
              <div className="flex items-center gap-2">
                <button type="button" className="border border-slate-300 rounded-md px-3 py-2 text-slate-900 w-28 text-left" onClick={() => setOpenDdi(true)} style={{ fontFamily: '"Segoe UI Emoji","Noto Color Emoji","Apple Color Emoji",system-ui,sans-serif' }}>
                  <span className="inline-flex items-center gap-2"><span style={{ backgroundImage: `url(${flagUrl(country)})` }} className="inline-block w-5 h-4 bg-center bg-no-repeat bg-contain" aria-hidden="true" />+{getCountryCallingCode(country)}</span>
                </button>
                <input className="flex-1 border border-slate-300 rounded-md px-3 py-2 text-slate-900 placeholder:text-slate-500" placeholder="DDD + número de WhatsApp" inputMode="numeric" value={phoneIntl} onChange={(e) => { const raw = e.target.value.replace(/\D/g, ""); const limit = (ddi === "55" || country === "BR") ? 11 : Math.max(6, 15 - String(ddi).length); setPhoneIntl(raw.slice(0, limit)); }} />
              </div>
              
            </div>

            

            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-800">Nome <span className="text-red-600">*</span></label>
              <input className={`w-full border ${errors.name ? "border-red-600" : "border-slate-300"} rounded-md px-3 py-2 text-slate-900 placeholder:text-slate-500`} placeholder="Nome" style={{ textTransform: "uppercase" }} {...register("name", { onChange: (e) => setValue("name", (e.target as HTMLInputElement).value.toUpperCase(), { shouldValidate: true }) })} />
              {errors.name && (<div className="text-xs text-red-600">{errors.name.message as string}</div>)}
              <label className="text-sm font-medium text-slate-800">CPF <span className="text-red-600">*</span></label>
              <input className={`w-full border ${errors.cpf ? "border-red-600" : "border-slate-300"} rounded-md px-3 py-2 text-slate-900 placeholder:text-slate-500`} placeholder="CPF" inputMode="numeric" {...register("cpf")} />
              {errors.cpf && (<div className="text-xs text-red-600">{errors.cpf.message as string}</div>)}
              <label className="text-sm font-medium text-slate-800">RG <span className="text-red-600">*</span></label>
              <input className={`w-full border ${errors.rg ? "border-red-600" : "border-slate-300"} rounded-md px-3 py-2 text-slate-900 placeholder:text-slate-500`} placeholder="RG" {...register("rg")} />
              {errors.rg && (<div className="text-xs text-red-600">{errors.rg.message as string}</div>)}
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-800">Data de Nascimento <span className="text-red-600">*</span></label>
                <input className={`w-full border ${errors.birthDate ? "border-red-600" : "border-slate-300"} rounded-md px-3 py-2 text-slate-900 placeholder:text-slate-500`} placeholder="Data de Nascimento" value={birthDisplay} onClick={() => setOpenDate(true)} readOnly />
                {errors.birthDate && (<div className="text-xs text-red-600">{errors.birthDate.message as string}</div>)}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-800">Email <span className="text-red-600">*</span></label>
                <input className={`w-full border ${errors.email ? "border-red-600" : "border-slate-300"} rounded-md px-3 py-2 text-slate-900 placeholder:text-slate-500`} placeholder="Email" type="email" {...register("email")} />
                {errors.email && (<div className="text-xs text-red-600">{errors.email.message as string}</div>)}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-800">Chave PIX <span className="text-red-600">*</span></label>
                <input className={`w-full border ${errors.pix ? "border-red-600" : "border-slate-300"} rounded-md px-3 py-2 text-slate-900 placeholder:text-slate-500`} placeholder="Chave PIX" {...register("pix")} />
                {errors.pix && (<div className="text-xs text-red-600">{errors.pix.message as string}</div>)}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-800">CEP <span className="text-red-600">*</span></label>
              <input className={`w-full border ${errors.cep ? "border-red-600" : "border-slate-300"} rounded-md px-3 py-2 text-slate-900 placeholder:text-slate-500`} placeholder="CEP" {...register("cep")}
                onChange={(e) => { const v = e.target.value; setCep(v); setValue("cep", v); }} />
              {errors.cep && (<div className="text-xs text-red-600">{errors.cep.message as string}</div>)}
              <label className="text-sm font-medium text-slate-800">Rua <span className="text-red-600">*</span></label>
              <input className={`w-full border ${errors.rua ? "border-red-600" : "border-slate-300"} rounded-md px-3 py-2 text-slate-900 placeholder:text-slate-500 disabled:bg-slate-100`} placeholder="Rua" {...register("rua")} disabled={!cepReady} />
              {errors.rua && (<div className="text-xs text-red-600">{errors.rua.message as string}</div>)}
              <label className="text-sm font-medium text-slate-800">Bairro <span className="text-red-600">*</span></label>
              <input className={`w-full border ${errors.bairro ? "border-red-600" : "border-slate-300"} rounded-md px-3 py-2 text-slate-900 placeholder:text-slate-500 disabled:bg-slate-100`} placeholder="Bairro" {...register("bairro")} disabled={!cepReady} />
              {errors.bairro && (<div className="text-xs text-red-600">{errors.bairro.message as string}</div>)}
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-800">Cidade <span className="text-red-600">*</span></label>
                <input className={`w-full border ${errors.cidade ? "border-red-600" : "border-slate-300"} rounded-md px-3 py-2 text-slate-900 placeholder:text-slate-500 disabled:bg-slate-100`} placeholder="Cidade" {...register("cidade")} disabled={!cepReady} />
                {errors.cidade && (<div className="text-xs text-red-600">{errors.cidade.message as string}</div>)}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-800">Estado <span className="text-red-600">*</span></label>
                <input className={`w-full border ${errors.estado ? "border-red-600" : "border-slate-300"} rounded-md px-3 py-2 text-slate-900 placeholder:text-slate-500 disabled:bg-slate-100`} placeholder="Estado" {...register("estado")} disabled={!cepReady} />
                {errors.estado && (<div className="text-xs text-red-600">{errors.estado.message as string}</div>)}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-800">Número <span className="text-red-600">*</span></label>
                <input className={`w-full border ${errors.numero ? "border-red-600" : "border-slate-300"} rounded-md px-3 py-2 text-slate-900 placeholder:text-slate-500 disabled:bg-slate-100`} placeholder="Número" {...register("numero")} disabled={!cepReady} />
                {errors.numero && (<div className="text-xs text-red-600">{errors.numero.message as string}</div>)}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-800">Complemento (opcional)</label>
                <input className="w-full border border-slate-300 rounded-md px-3 py-2 text-slate-900 placeholder:text-slate-500 disabled:bg-slate-100" placeholder="Complemento (opcional)" {...register("complemento")} disabled={!cepReady} />
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-sm font-medium text-slate-800">Valores</div>
              {category === "Rastreador" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between"><div className="text-sm font-medium text-slate-800">Deslocamento</div><button type="button" className="text-xs text-slate-600 px-2 py-1 border border-slate-300 rounded hover:bg-slate-100" aria-expanded={info.trackerMileage} onClick={() => flashInfo("trackerMileage")}>ℹ️</button></div>
                  {info.trackerMileage && (<div className="text-xs text-slate-600">Valor por km rodado (ida e volta). Acima de 40 km, cada parte arca sua quilometragem.</div>)}
                  <div className="flex items-center"><span className="px-3 py-2 bg-slate-100 border border-slate-300 rounded-l-md text-slate-700">R$</span><input className="flex-1 border border-l-0 border-slate-300 rounded-r-md px-3 py-2 text-slate-900 placeholder:text-slate-500" placeholder="0,80" value={money.trackerMileage} onChange={handleCurrency("trackerMileage")} inputMode="numeric" /></div>
                  <div className="text-sm font-medium text-slate-800">Instalação por rastreador</div>
                  <div className="flex items-center"><span className="px-3 py-2 bg-slate-100 border border-slate-300 rounded-l-md text-slate-700">R$</span><input className="flex-1 border border-l-0 border-slate-300 rounded-r-md px-3 py-2 text-slate-900 placeholder:text-slate-500" placeholder="35,00" value={money.trackerInstallationRate} onChange={handleCurrency("trackerInstallationRate")} inputMode="numeric" /></div>
                </div>
              )}
              {category === "Informatica" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between"><div className="text-sm font-medium text-slate-800">Atendimento de 3h</div><button type="button" className="text-xs text-slate-600 px-2 py-1 border border-slate-300 rounded hover:bg-slate-100" aria-expanded={info.itRate3h} onClick={() => flashInfo("itRate3h")}>ℹ️</button></div>
                  {info.itRate3h && (<div className="text-xs text-slate-600">Atendimento inicial de até 3 horas. Informe o valor que você cobra por até 3h.</div>)}
                  <div className="flex items-center"><span className="px-3 py-2 bg-slate-100 border border-slate-300 rounded-l-md text-slate-700">R$</span><input className="flex-1 border border-l-0 border-slate-300 rounded-r-md px-3 py-2 text-slate-900 placeholder:text-slate-500" placeholder="80,00" value={money.itRate3h} onChange={handleCurrency("itRate3h")} inputMode="numeric" /></div>
                  <div className="flex items-center justify-between"><div className="text-sm font-medium text-slate-800">Hora adicional</div><button type="button" className="text-xs text-slate-600 px-2 py-1 border border-slate-300 rounded hover:bg-slate-100" aria-expanded={info.itAdditionalHour} onClick={() => flashInfo("itAdditionalHour")}>ℹ️</button></div>
                  {info.itAdditionalHour && (<div className="text-xs text-slate-600">Valor cobrado por hora após exceder 3 horas. Pode ser proporcional após 15 minutos.</div>)}
                  <div className="flex items-center"><span className="px-3 py-2 bg-slate-100 border border-slate-300 rounded-l-md text-slate-700">R$</span><input className="flex-1 border border-l-0 border-slate-300 rounded-r-md px-3 py-2 text-slate-900 placeholder:text-slate-500" placeholder="15,00" value={money.itAdditionalHour} onChange={handleCurrency("itAdditionalHour")} inputMode="numeric" /></div>
                  <div className="flex items-center justify-between"><div className="text-sm font-medium text-slate-800">Diária</div><button type="button" className="text-xs text-slate-600 px-2 py-1 border border-slate-300 rounded hover:bg-slate-100" aria-expanded={info.itDaily} onClick={() => flashInfo("itDaily")}>ℹ️</button></div>
                  {info.itDaily && (<div className="text-xs text-slate-600">Se atingir 9 horas no dia, cobra-se diária. Informe seu valor de diária.</div>)}
                  <div className="flex items-center"><span className="px-3 py-2 bg-slate-100 border border-slate-300 rounded-l-md text-slate-700">R$</span><input className="flex-1 border border-l-0 border-slate-300 rounded-r-md px-3 py-2 text-slate-900 placeholder:text-slate-500" placeholder="180,00" value={money.itDaily} onChange={handleCurrency("itDaily")} inputMode="numeric" /></div>
                  <div className="flex items-center justify-between"><div className="text-sm font-medium text-slate-800">Deslocamento</div><button type="button" className="text-xs text-slate-600 px-2 py-1 border border-slate-300 rounded hover:bg-slate-100" aria-expanded={info.itMileage} onClick={() => flashInfo("itMileage")}>ℹ️</button></div>
                  {info.itMileage && (<div className="text-xs text-slate-600">Valor por km rodado (ida e volta). Acima de 40 km, cada parte arca sua quilometragem.</div>)}
                  <div className="flex items-center"><span className="px-3 py-2 bg-slate-100 border border-slate-300 rounded-l-md text-slate-700">R$</span><input className="flex-1 border border-l-0 border-slate-300 rounded-r-md px-3 py-2 text-slate-900 placeholder:text-slate-500" placeholder="0,80" value={money.itMileage} onChange={handleCurrency("itMileage")} inputMode="numeric" /></div>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button type="submit" className="rounded-md px-4 py-2 bg-blue-600 text-white hover:bg-blue-700" disabled={isSubmitting}>Salvar</button>
            </div>
          </form>
        )}

        {step === 1 && (
          <div className="mt-4 space-y-3">
            <label className="text-sm font-medium text-slate-800">Seu número de WhatsApp</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="border border-slate-300 rounded-md px-3 py-2 text-slate-900 w-28 text-left"
                onClick={() => setOpenDdi(true)}
                style={{ fontFamily: '"Segoe UI Emoji","Noto Color Emoji","Apple Color Emoji",system-ui,sans-serif' }}
              >
                <span className="inline-flex items-center gap-2">
                  <span style={{ backgroundImage: `url(${flagUrl(country)})` }} className="inline-block w-5 h-4 bg-center bg-no-repeat bg-contain" aria-hidden="true" />
                  +{getCountryCallingCode(country)}
                </span>
              </button>
              <input
                className="flex-1 border border-slate-300 rounded-md px-3 py-2 text-slate-900 placeholder:text-slate-500"
                placeholder="DDD + número de WhatsApp"
                inputMode="numeric"
                value={phoneIntl}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, "");
                  const limit = (ddi === "55" || country === "BR") ? 11 : Math.max(6, 15 - String(ddi).length);
                  setPhoneIntl(raw.slice(0, limit));
                }}
                onBlur={checkPhone}
              />
            </div>
            {advanceError && (
              <div className="text-xs text-red-600">
                {advanceError === "Número incompleto" ? "Número incompleto (DDD + número)" : advanceError}
              </div>
            )}
            
            <div className="flex justify-end">
              <button className="rounded-md px-4 py-2 bg-blue-600 text-white hover:bg-blue-700" onClick={tryAdvanceFromPhone}>Continuar</button>
            </div>
          </div>
        )}

        {step === 7 && (
          <div className="mt-4 space-y-3">
            <div className="text-sm text-slate-700">Digite o código enviado via WhatsApp. Expira em {verifySeconds}s.</div>
            <input className="w-full border border-slate-300 rounded-md px-3 py-2 text-slate-900 placeholder:text-slate-500" placeholder="Código de 6 dígitos" inputMode="numeric" value={verifyCode} onChange={(e) => setVerifyCode(e.target.value)} />
            
            {verifyError && <div className="text-xs text-red-600">{verifyError}</div>}
            <div className="flex justify-between">
              <button className="rounded-md px-4 py-2 bg-slate-200 text-slate-900 hover:bg-slate-300" onClick={() => setStep(1)}>Voltar</button>
              <div className="flex gap-2">
                <button className="rounded-md px-4 py-2 bg-slate-200 text-slate-900 hover:bg-slate-300" onClick={resendVerification} disabled={verifySeconds > 0}>Reenviar código</button>
                <button className="rounded-md px-4 py-2 bg-blue-600 text-white hover:bg-blue-700" onClick={confirmVerification} disabled={!verifyRequested || !verifyCode || verifySeconds <= 0}>Validar</button>
              </div>
            </div>
          </div>
        )}

        {!existingMode && step === 2 && (
          <div className="mt-4 space-y-4">
            <label className="text-sm font-medium text-slate-800">Categoria</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                className={`flex flex-col items-center gap-2 border rounded-xl p-4 text-center ${
                  category === "Informatica" ? "border-blue-600 bg-blue-50" : "border-slate-300 bg-white"
                }`}
                onClick={() => {
                  setCategory("Informatica");
                  setValue("category", "Informatica");
                  setStep(3);
                }}
              >
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-2xl">👨‍�</div>
                <div className="text-slate-900 font-semibold">Técnicos de Informática</div>
                <div className="text-slate-600 text-sm">Atendimento, hora adicional, diária, deslocamento</div>
              </button>
              <button
                type="button"
                className={`flex flex-col items-center gap-2 border rounded-xl p-4 text-center ${
                  category === "Rastreador" ? "border-blue-600 bg-blue-50" : "border-slate-300 bg-white"
                }`}
                onClick={() => {
                  setCategory("Rastreador");
                  setValue("category", "Rastreador");
                  setStep(3);
                }}
              >
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-2xl">🧑‍🔧</div>
                <div className="text-slate-900 font-semibold">Técnicos de Rastreador Veicular</div>
                <div className="text-slate-600 text-sm">Instalação e deslocamento</div>
              </button>
            </div>
            <div className="flex justify-between">
              <button className="rounded-md px-4 py-2 bg-slate-200 text-slate-900 hover:bg-slate-300" onClick={() => setStep(1)}>Voltar</button>
              <button className="rounded-md px-4 py-2 bg-blue-600 text-white hover:bg-blue-700" onClick={() => setStep(3)}>Continuar</button>
            </div>
          </div>
        )}

        {!existingMode && step === 3 && (
          <div className="mt-4 space-y-3">
            <label className="text-sm font-medium text-slate-800">Nome <span className="text-red-600">*</span></label>
            <input className={`w-full border ${errors.name ? "border-red-600" : "border-slate-300"} rounded-md px-3 py-2 text-slate-900 placeholder:text-slate-500`} placeholder="Nome" style={{ textTransform: "uppercase" }} {...register("name", { onChange: (e) => setValue("name", (e.target as HTMLInputElement).value.toUpperCase(), { shouldValidate: true }) })} />
            {errors.name && (<div className="text-xs text-red-600">{errors.name.message as string}</div>)}
            <label className="text-sm font-medium text-slate-800">CPF <span className="text-red-600">*</span></label>
            <input className={`w-full border ${errors.cpf ? "border-red-600" : "border-slate-300"} rounded-md px-3 py-2 text-slate-900 placeholder:text-slate-500`} placeholder="CPF" inputMode="numeric" {...register("cpf")} />
            {errors.cpf && (<div className="text-xs text-red-600">{errors.cpf.message as string}</div>)}
            <label className="text-sm font-medium text-slate-800">RG <span className="text-red-600">*</span></label>
            <input className={`w-full border ${errors.rg ? "border-red-600" : "border-slate-300"} rounded-md px-3 py-2 text-slate-900 placeholder:text-slate-500`} placeholder="RG" {...register("rg")} />
            {errors.rg && (<div className="text-xs text-red-600">{errors.rg.message as string}</div>)}
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-800">Data de Nascimento <span className="text-red-600">*</span></label>
              <input
                className={`w-full border ${errors.birthDate ? "border-red-600" : "border-slate-300"} rounded-md px-3 py-2 text-slate-900 placeholder:text-slate-500`}
                placeholder="Data de Nascimento"
                value={birthDisplay}
                onClick={() => setOpenDate(true)}
                readOnly
              />
              {errors.birthDate && (<div className="text-xs text-red-600">{errors.birthDate.message as string}</div>)}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-800">Email <span className="text-red-600">*</span></label>
              <input className={`w-full border ${errors.email ? "border-red-600" : "border-slate-300"} rounded-md px-3 py-2 text-slate-900 placeholder:text-slate-500`} placeholder="Email" type="email" {...register("email")} />
              {errors.email && (<div className="text-xs text-red-600">{errors.email.message as string}</div>)}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-800">Chave PIX <span className="text-red-600">*</span></label>
              <input className={`w-full border ${errors.pix ? "border-red-600" : "border-slate-300"} rounded-md px-3 py-2 text-slate-900 placeholder:text-slate-500`} placeholder="Chave PIX" {...register("pix")} />
              {errors.pix && (<div className="text-xs text-red-600">{errors.pix.message as string}</div>)}
            </div>
            <div className="flex justify-between">
              <button className="rounded-md px-4 py-2 bg-slate-200 text-slate-900 hover:bg-slate-300" onClick={() => setStep(2)}>Voltar</button>
              <button className="rounded-md px-4 py-2 bg-blue-600 text-white hover:bg-blue-700" onClick={async () => { const ok = await trigger(["name","cpf","rg","birthDate","email"]); if (ok) setStep(4); }}>Continuar</button>
            </div>
          </div>
        )}

        {!existingMode && step === 4 && (
          <div className="mt-4 space-y-3">
            <label className="text-sm font-medium text-slate-800">CEP <span className="text-red-600">*</span></label>
            <input
              className={`w-full border ${errors.cep ? "border-red-600" : "border-slate-300"} rounded-md px-3 py-2 text-slate-900 placeholder:text-slate-500`}
              placeholder="CEP"
              {...register("cep")}
              onChange={(e) => {
                const v = e.target.value;
                setCep(v);
                setValue("cep", v);
              }}
            />
            {errors.cep && (<div className="text-xs text-red-600">{errors.cep.message as string}</div>)}
            <label className="text-sm font-medium text-slate-800">Rua <span className="text-red-600">*</span></label>
            <input className={`w-full border ${errors.rua ? "border-red-600" : "border-slate-300"} rounded-md px-3 py-2 text-slate-900 placeholder:text-slate-500 disabled:bg-slate-100`} placeholder="Rua" {...register("rua")} disabled={!cepReady} />
            {errors.rua && (<div className="text-xs text-red-600">{errors.rua.message as string}</div>)}
            <label className="text-sm font-medium text-slate-800">Bairro <span className="text-red-600">*</span></label>
            <input className={`w-full border ${errors.bairro ? "border-red-600" : "border-slate-300"} rounded-md px-3 py-2 text-slate-900 placeholder:text-slate-500 disabled:bg-slate-100`} placeholder="Bairro" {...register("bairro")} disabled={!cepReady} />
            {errors.bairro && (<div className="text-xs text-red-600">{errors.bairro.message as string}</div>)}
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-800">Cidade <span className="text-red-600">*</span></label>
              <input className={`w-full border ${errors.cidade ? "border-red-600" : "border-slate-300"} rounded-md px-3 py-2 text-slate-900 placeholder:text-slate-500 disabled:bg-slate-100`} placeholder="Cidade" {...register("cidade")} disabled={!cepReady} />
              {errors.cidade && (<div className="text-xs text-red-600">{errors.cidade.message as string}</div>)}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-800">Estado <span className="text-red-600">*</span></label>
              <input className={`w-full border ${errors.estado ? "border-red-600" : "border-slate-300"} rounded-md px-3 py-2 text-slate-900 placeholder:text-slate-500 disabled:bg-slate-100`} placeholder="Estado" {...register("estado")} disabled={!cepReady} />
              {errors.estado && (<div className="text-xs text-red-600">{errors.estado.message as string}</div>)}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-800">Número <span className="text-red-600">*</span></label>
              <input className={`w-full border ${errors.numero ? "border-red-600" : "border-slate-300"} rounded-md px-3 py-2 text-slate-900 placeholder:text-slate-500 disabled:bg-slate-100`} placeholder="Número" {...register("numero")} disabled={!cepReady} />
              {errors.numero && (<div className="text-xs text-red-600">{errors.numero.message as string}</div>)}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-800">Complemento (opcional)</label>
              <input className="w-full border border-slate-300 rounded-md px-3 py-2 text-slate-900 placeholder:text-slate-500 disabled:bg-slate-100" placeholder="Complemento (opcional)" {...register("complemento")} disabled={!cepReady} />
            </div>
            <div className="text-xs text-slate-600">Digite o CEP para liberar os demais campos.</div>
            <div className="flex justify-between">
              <button className="rounded-md px-4 py-2 bg-slate-200 text-slate-900 hover:bg-slate-300" onClick={() => setStep(3)}>Voltar</button>
              <button className="rounded-md px-4 py-2 bg-blue-600 text-white hover:bg-blue-700" onClick={async () => { const ok = await trigger(["cep","rua","bairro","cidade","estado","numero"]); if (ok) setStep(5); }}>Continuar</button>
            </div>
          </div>
        )}

        {!existingMode && step === 5 && (
          <form className="mt-4 space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="text-sm font-medium text-slate-800">Valores</div>
            {category === "Rastreador" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-slate-800">Deslocamento</div>
                  <button type="button" className="text-xs text-slate-600 px-2 py-1 border border-slate-300 rounded hover:bg-slate-100" aria-expanded={info.trackerMileage} onClick={() => flashInfo("trackerMileage")}>ℹ️</button>
                </div>
                {info.trackerMileage && (
                  <div className="text-xs text-slate-600">Valor por km rodado (ida e volta). Acima de 40 km, cada parte arca sua quilometragem.</div>
                )}
                <div className="flex items-center">
                  <span className="px-3 py-2 bg-slate-100 border border-slate-300 rounded-l-md text-slate-700">R$</span>
                  <input className="flex-1 border border-l-0 border-slate-300 rounded-r-md px-3 py-2 text-slate-900 placeholder:text-slate-500" placeholder="0,80" value={money.trackerMileage} onChange={handleCurrency("trackerMileage")} inputMode="numeric" />
                </div>
                <div className="text-sm font-medium text-slate-800">Instalação por rastreador</div>
                <div className="flex items-center">
                  <span className="px-3 py-2 bg-slate-100 border border-slate-300 rounded-l-md text-slate-700">R$</span>
                  <input className="flex-1 border border-l-0 border-slate-300 rounded-r-md px-3 py-2 text-slate-900 placeholder:text-slate-500" placeholder="35,00" value={money.trackerInstallationRate} onChange={handleCurrency("trackerInstallationRate")} inputMode="numeric" />
                </div>
              </div>
            )}
            {category === "Informatica" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-slate-800">Atendimento de 3h</div>
                  <button type="button" className="text-xs text-slate-600 px-2 py-1 border border-slate-300 rounded hover:bg-slate-100" aria-expanded={info.itRate3h} onClick={() => flashInfo("itRate3h")}>ℹ️</button>
                </div>
                {info.itRate3h && (
                  <div className="text-xs text-slate-600">Atendimento inicial de até 3 horas. Informe o valor que você cobra por até 3h.</div>
                )}
                <div className="flex items-center">
                  <span className="px-3 py-2 bg-slate-100 border border-slate-300 rounded-l-md text-slate-700">R$</span>
                  <input className="flex-1 border border-l-0 border-slate-300 rounded-r-md px-3 py-2 text-slate-900 placeholder:text-slate-500" placeholder="80,00" value={money.itRate3h} onChange={handleCurrency("itRate3h")} inputMode="numeric" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-slate-800">Hora adicional</div>
                  <button type="button" className="text-xs text-slate-600 px-2 py-1 border border-slate-300 rounded hover:bg-slate-100" aria-expanded={info.itAdditionalHour} onClick={() => flashInfo("itAdditionalHour")}>ℹ️</button>
                </div>
                {info.itAdditionalHour && (
                  <div className="text-xs text-slate-600">Valor cobrado por hora após exceder 3 horas. Pode ser proporcional após 15 minutos.</div>
                )}
                <div className="flex items-center">
                  <span className="px-3 py-2 bg-slate-100 border border-slate-300 rounded-l-md text-slate-700">R$</span>
                  <input className="flex-1 border border-l-0 border-slate-300 rounded-r-md px-3 py-2 text-slate-900 placeholder:text-slate-500" placeholder="15,00" value={money.itAdditionalHour} onChange={handleCurrency("itAdditionalHour")} inputMode="numeric" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-slate-800">Diária</div>
                  <button type="button" className="text-xs text-slate-600 px-2 py-1 border border-slate-300 rounded hover:bg-slate-100" aria-expanded={info.itDaily} onClick={() => flashInfo("itDaily")}>ℹ️</button>
                </div>
                {info.itDaily && (
                  <div className="text-xs text-slate-600">Se atingir 9 horas no dia, cobra-se diária. Informe seu valor de diária.</div>
                )}
                <div className="flex items-center">
                  <span className="px-3 py-2 bg-slate-100 border border-slate-300 rounded-l-md text-slate-700">R$</span>
                  <input className="flex-1 border border-l-0 border-slate-300 rounded-r-md px-3 py-2 text-slate-900 placeholder:text-slate-500" placeholder="180,00" value={money.itDaily} onChange={handleCurrency("itDaily")} inputMode="numeric" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-slate-800">Deslocamento</div>
                  <button type="button" className="text-xs text-slate-600 px-2 py-1 border border-slate-300 rounded hover:bg-slate-100" aria-expanded={info.itMileage} onClick={() => flashInfo("itMileage")}>ℹ️</button>
                </div>
                {info.itMileage && (
                  <div className="text-xs text-slate-600">Valor por km rodado (ida e volta). Acima de 40 km, cada parte arca sua quilometragem.</div>
                )}
                <div className="flex items-center">
                  <span className="px-3 py-2 bg-slate-100 border border-slate-300 rounded-l-md text-slate-700">R$</span>
                  <input className="flex-1 border border-l-0 border-slate-300 rounded-r-md px-3 py-2 text-slate-900 placeholder:text-slate-500" placeholder="0,80" value={money.itMileage} onChange={handleCurrency("itMileage")} inputMode="numeric" />
                </div>
              </div>
            )}
            <div className="flex justify-between">
              <button type="button" className="rounded-md px-4 py-2 bg-slate-200 text-slate-900 hover:bg-slate-300" onClick={() => setStep(3)}>Voltar</button>
              <button type="submit" className="rounded-md px-4 py-2 bg-blue-600 text-white hover:bg-blue-700" disabled={isSubmitting}>Enviar</button>
            </div>
          </form>
        )}

        {!existingMode && step === 6 && (
          <div className="mt-6 space-y-4 text-center">
            <img src="https://files.catbox.moe/3ttomj.png" alt="Nordiun" className="mx-auto h-12 sm:h-16" />
            <div className="text-2xl font-bold text-slate-900">Obrigado!</div>
            <div className="text-slate-700">Seu cadastro foi recebido. Em breve entraremos em contato.</div>
            <div className="flex justify-center">
              <a href="/chamados" className="rounded-md px-4 py-2 bg-blue-600 text-white hover:bg-blue-700">Ir para Chamados</a>
            </div>
          </div>
        )}

        {step === 8 && blocked === "Cancelado" && (
          <div className="mt-6 space-y-4 text-center">
            <div className="text-lg font-semibold text-slate-900">Não foi possível validar o seu cadastro.</div>
            <div className="text-slate-700">Fale com o suporte para continuar.</div>
            <div className="flex justify-center">
              <a href={`https://wa.me/${supportWhats}`} className="rounded-md px-4 py-2 bg-green-600 text-white hover:bg-green-700">Falar com suporte</a>
            </div>
          </div>
        )}
        
      </div>

      {openDate && (
        <DateModal
          value={undefined}
          onSave={(iso) => {
            setValue("birthDate", iso);
            setBirthDisplay(formatDateBr(iso));
          }}
          onClose={() => setOpenDate(false)}
        />
      )}

      {openDdi && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setOpenDdi(false)}>
          <div className="bg-white w-full max-w-md rounded-lg shadow-xl p-4" onClick={(e) => e.stopPropagation()}>
            <div className="text-lg font-semibold text-slate-900 mb-2">Selecionar DDI</div>
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
                  <button
                    key={c.iso}
                    type="button"
                    className="w-full flex items-center justify-between px-3 py-2 rounded hover:bg-slate-100"
                    style={{ fontFamily: '"Segoe UI Emoji","Noto Color Emoji","Apple Color Emoji",system-ui,sans-serif' }}
                    onClick={() => {
                      setCountry(c.iso as CountryCode);
                      setDdi(c.code);
                      setOpenDdi(false);
                    }}
                  >
                    <span className="flex items-center gap-2"><span style={{ backgroundImage: `url(${flagUrl(c.iso)})` }} className="inline-block w-5 h-4 bg-center bg-no-repeat bg-contain" aria-hidden="true" /><span className="text-slate-900">{c.name}</span></span>
                    <span className="text-slate-700">+{c.code}</span>
                  </button>
                ))}
            </div>
            <div className="flex justify-end gap-2 mt-3">
              <button className="px-3 py-2 rounded bg-slate-200 text-slate-900" onClick={() => setOpenDdi(false)}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function flagUrl(iso: string) {
  return `https://flagcdn.com/w20/${iso.toLowerCase()}.png`;
}
