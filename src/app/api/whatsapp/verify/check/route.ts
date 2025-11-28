import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const { number, code } = (await req.json()) as { number?: string; code?: string };
    if (!number || !code) return Response.json({ error: "number and code required" }, { status: 400 });

    const col = collection(db, "verifications");
    const q = query(col, where("number", "==", number));
    const snap = await getDocs(q);
    const first = snap.docs
      .sort((a, b) => {
        const ad = a.data() as { createdAt?: number };
        const bd = b.data() as { createdAt?: number };
        return (bd.createdAt ?? 0) - (ad.createdAt ?? 0);
      })[0];
    if (!first) return Response.json({ error: "no verification" }, { status: 404 });
    const data = first.data() as { code: string; expiresAt: number; status?: string };
    if (data.status === "verified") return Response.json({ ok: true });
    if (Date.now() > data.expiresAt) return Response.json({ error: "expired" }, { status: 410 });
    if (String(data.code) !== String(code)) return Response.json({ error: "invalid" }, { status: 401 });

    await updateDoc(doc(db, "verifications", first.id), { status: "verified", verifiedAt: Date.now() });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "internal" }, { status: 500 });
  }
}
