"use client";
import { FormEvent, useEffect, useState } from "react";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try { document.documentElement.classList.remove("dark"); } catch {}
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) router.replace("/dashboard");
    });
    return () => unsub();
  }, [router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (!auth) throw new Error("Sem configuração");
      await signInWithEmailAndPassword(auth, email, password);
      try {
        const { getDocs, collection } = await import("firebase/firestore");
        const regsSnap = await getDocs(collection((await import("@/lib/firebase")).db, "registrations"));
        const empSnap = await getDocs(collection((await import("@/lib/firebase")).db, "empresas"));
        const chaSnap = await getDocs(collection((await import("@/lib/firebase")).db, "chamados"));
        const regs = regsSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Record<string, unknown>) }));
        const emps = empSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Record<string, unknown>) }));
        const chas = chaSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Record<string, unknown>) }));
        try {
          sessionStorage.setItem("prefetch_registrations", JSON.stringify(regs));
          sessionStorage.setItem("prefetch_empresas", JSON.stringify(emps));
          sessionStorage.setItem("prefetch_chamados", JSON.stringify(chas));
        } catch {}
      } catch {}
      router.replace("/dashboard");
    } catch (err: unknown) {
      let message = "Falha no login";
      const code = (err as { code?: string })?.code || "";
      switch (code) {
        case "auth/invalid-api-key":
          message = "API Key inválida para o projeto.";
          break;
        case "auth/operation-not-allowed":
          message = "Provider Email/Senha não habilitado no Firebase.";
          break;
        case "auth/invalid-login-credentials":
        case "auth/wrong-password":
        case "auth/user-not-found":
          message = "Email ou senha incorretos.";
          break;
        case "auth/too-many-requests":
          message = "Muitas tentativas. Tente novamente mais tarde.";
          break;
        case "auth/network-request-failed":
          message = "Falha de rede. Verifique sua conexão.";
          break;
        case "auth/unauthorized-domain":
          message = "Domínio não autorizado. Adicione localhost e seu IP em Authorized Domains.";
          break;
      }
      setError(message + (code ? ` (${code})` : ""));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm bg-surface border border-border rounded-lg p-6 space-y-5 shadow-xl"
      >
        <div className="text-2xl font-bold">Entrar</div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-800">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md px-3 py-2 border border-border bg-background text-foreground placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            name="email"
            autoComplete="email"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-800">Senha</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md px-3 py-2 border border-border bg-background text-foreground placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            name="current-password"
            autoComplete="current-password"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-md py-2 bg-blue-600 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
          disabled={loading}
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
