import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";

type Values = Record<string, unknown> & { category?: string; phoneNumber?: string };

export async function POST(req: Request) {
  try {
    const { number, values } = (await req.json()) as { number?: string; values?: Values };
    if (!number || !values) return Response.json({ error: "number and values required" }, { status: 400 });

    const vcol = collection(db, "verifications");
    const vq = query(vcol, where("number", "==", String(number).replace(/\D/g, "")));
    const vsnap = await getDocs(vq);
    const vdoc = vsnap.docs.sort((a, b) => {
      const ad = a.data() as { createdAt?: number };
      const bd = b.data() as { createdAt?: number };
      return (bd.createdAt ?? 0) - (ad.createdAt ?? 0);
    })[0];
    if (!vdoc) return Response.json({ error: "no verification" }, { status: 404 });
    const vdata = vdoc.data() as { status?: string; verifiedAt?: number };
    if (vdata.status !== "verified") return Response.json({ error: "not verified" }, { status: 401 });
    if (vdata.verifiedAt && Date.now() - vdata.verifiedAt > 5 * 60_000) return Response.json({ error: "verification expired" }, { status: 410 });

    const rcol = collection(db, "registrations");
    const rq = query(rcol, where("phoneNumber", "==", String(number).replace(/\D/g, "")));
    const rsnap = await getDocs(rq);
    const rdoc = rsnap.docs.find((d) => !(d.data() as { meta?: boolean }).meta);
    if (!rdoc) return Response.json({ error: "registration not found" }, { status: 404 });

    const current = rdoc.data() as { category?: string };
    const { category: _omit, ...rest } = values;
    void _omit;
    await updateDoc(doc(db, "registrations", rdoc.id), { ...rest, category: current.category });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "internal" }, { status: 500 });
  }
}
