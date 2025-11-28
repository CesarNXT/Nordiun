import { db } from "@/lib/firebase";
import { addDoc, collection } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const { number } = (await req.json()) as { number?: string };
    if (!number) return Response.json({ error: "number required" }, { status: 400 });

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const now = Date.now();
    const expiresAt = now + 120_000;

    await addDoc(collection(db, "verifications"), {
      number,
      code,
      createdAt: now,
      expiresAt,
      status: "pending",
    });

    const base = process.env.UAZAPI_BASE_URL || "https://vitoria4u.uazapi.com";
    const token = process.env.UAZAPI_TOKEN || "";
    if (!token) return Response.json({ error: "UAZ API not configured" }, { status: 500 });

    const text = `${code}`;

    const resp = await fetch(`${base}/send/text`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        token,
      },
      body: JSON.stringify({ number, text }),
    });
    if (!resp.ok) {
      const msg = await resp.text().catch(() => "failed");
      return Response.json({ error: "uaz_send_failed", detail: msg }, { status: 502 });
    }

    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "internal" }, { status: 500 });
  }
}

