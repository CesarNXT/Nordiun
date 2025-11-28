export async function POST(req: Request) {
  try {
    const { q, limit } = (await req.json()) as { q?: string; limit?: number };
    if (!q) return Response.json({ error: "q required" }, { status: 400 });
    const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=${Math.min(Math.max(limit || 6, 1), 10)}&countrycodes=br&accept-language=pt-BR&q=${encodeURIComponent(q)}`;
    const resp = await fetch(url, { headers: { "User-Agent": "Nordiun/1.0" } });
    if (!resp.ok) {
      const txt = await resp.text().catch(() => "failed");
      return Response.json({ error: "osm_failed", detail: txt }, { status: 502 });
    }
    type NomResult = { display_name?: string; lat?: string; lon?: string };
    const raw = (await resp.json()) as NomResult[];
    const opts = raw.map((d) => ({ label: String(d.display_name || ""), lat: d.lat, lon: d.lon }));
    return Response.json({ options: opts });
  } catch {
    return Response.json({ error: "internal" }, { status: 500 });
  }
}

