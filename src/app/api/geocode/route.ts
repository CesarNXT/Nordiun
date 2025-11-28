import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const { id, cep, cidade, estado, rua, numero, bairro } = (await req.json()) as { id?: string; cep?: string; cidade?: string; estado?: string; rua?: string; numero?: string; bairro?: string };
    if (!id || !cep || !cidade || !estado) return Response.json({ error: "missing" }, { status: 400 });
    const parts = [rua, numero, bairro, cidade, estado, cep].filter((x) => !!x).join(" ");
    const q = encodeURIComponent(parts);
    const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=1&countrycodes=br&accept-language=pt-BR&q=${q}`;
    const resp = await fetch(url, { headers: { "User-Agent": "Nordiun/1.0" } });
    if (!resp.ok) {
      await updateDoc(doc(db, "registrations", id), { geoStatus: "error" });
      return Response.json({ error: "geocode_failed" }, { status: 502 });
    }
    const arr = (await resp.json()) as Array<{ lat: string; lon: string }>;
    if (!arr.length) {
      await updateDoc(doc(db, "registrations", id), { geoStatus: "no_result" });
      return Response.json({ ok: true, geoStatus: "no_result" });
    }
    const { lat, lon } = arr[0];
    await updateDoc(doc(db, "registrations", id), { geoStatus: "ok", geo: { lat: parseFloat(lat), lng: parseFloat(lon) } });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "internal" }, { status: 500 });
  }
}
