"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, where, type CollectionReference } from "firebase/firestore";
import "leaflet/dist/leaflet.css";
import L, { Map as LeafletMap, Marker as LeafletMarker, Layer, CircleMarker } from "leaflet";
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

type Tecnico = { id: string; name: string; cidade?: string; estado?: string; status?: "Novo" | "Ativo" | "Cancelado" | "Ajudante"; phoneNumber?: string; geo?: { lat: number; lng: number } };

// Using Leaflet directly to avoid React peer dependency constraints

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const la1 = toRad(a.lat);
  const la2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export default function MapaTecnicosPage() {
  const [items, setItems] = useState<Tecnico[]>([]);
  const [center, setCenter] = useState<{ lat: number; lng: number }>({ lat: -14.235, lng: -51.925 });
  const [hasCenter, setHasCenter] = useState(false);
  const [qLocal, setQLocal] = useState("");
  const [cep, setCep] = useState("");
  const [map, setMap] = useState<LeafletMap | null>(null);
  const techMarkersRef = useRef<Layer[]>([]);
  const [geoCache, setGeoCache] = useState<Record<string, { lat: number; lng: number }>>({});
  const centerMarkerRef = useRef<LeafletMarker | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapDivId] = useState(() => `map-${Math.random().toString(36).slice(2)}`);
  const [selected, setSelected] = useState<(Tecnico & { km?: number }) | null>(null);

  useEffect(() => {
    if (!db) return;
    const col = collection(db, "registrations") as CollectionReference<Tecnico>;
    const base = query(col, where("geoStatus", "==", "ok"));
    const stop = onSnapshot(base, (snap) => {
      const list = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
      setItems(list.filter((t) => t.geo && typeof t.geo.lat === "number" && typeof t.geo.lng === "number"));
    });
    return () => stop();
  }, []);

  useEffect(() => {
    if (mapReady) return;
    const el = document.getElementById(mapDivId) as (HTMLElement & { _leaflet_id?: number }) | null;
    if (!el) return;
    if (el._leaflet_id) return;
    const m = L.map(el).setView([center.lat, center.lng], 6);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "&copy; OpenStreetMap" }).addTo(m);
    setTimeout(() => { setMap(m); setMapReady(true); }, 0);
  }, [mapReady, mapDivId, center.lat, center.lng]);

  useEffect(() => {
    const place = qLocal.trim();
    if (!place) return;
    const t = setTimeout(async () => {
      try {
        const q = `${place}, Brasil`;
        const resp = await fetch("/api/osm/search", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ q, limit: 1 }) });
        if (resp.ok) {
          const data = await resp.json();
          const o = Array.isArray(data?.options) && data.options[0];
          const lat = Number(o?.lat || 0);
          const lng = Number(o?.lon || 0);
          if (lat && lng) { setCenter({ lat, lng }); setHasCenter(true); }
        }
      } catch {}
    }, 400);
    return () => clearTimeout(t);
  }, [qLocal]);

  // Geocodifica por CEP
  useEffect(() => {
    const raw = cep.replace(/\D/g, "");
    if (raw.length !== 8) return;
    const t = setTimeout(async () => {
      try {
        const via = await fetch(`https://viacep.com.br/ws/${raw}/json/`);
        let q = raw;
        if (via.ok) {
          const data = await via.json();
          const rua = String(data?.logradouro || "");
          const cidade = String(data?.localidade || "");
          const uf = String(data?.uf || "");
          if (!data?.erro && (cidade || uf)) {
            q = [rua, cidade && `${cidade} - ${uf}`].filter(Boolean).join(" ");
          }
        }
        const resp = await fetch("/api/osm/search", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ q, limit: 1 }) });
        if (resp.ok) {
          const geo = await resp.json();
          const o = Array.isArray(geo?.options) && geo.options[0];
          const lat = Number(o?.lat || 0);
          const lng = Number(o?.lon || 0);
          if (lat && lng) { setCenter({ lat, lng }); setHasCenter(true); }
        }
      } catch {}
    }, 400);
    return () => clearTimeout(t);
  }, [cep]);

  const filtered = useMemo(() => items, [items]);

  const pendingCityKeys = useMemo(() => {
    const s = new Set<string>();
    for (const t of items) {
      const c = (t.cidade || "").trim();
      const uf = (t.estado || "").trim();
      if (!t.geo && c && uf) {
        const key = `${c} - ${uf}`;
        if (!geoCache[key]) s.add(key);
      }
    }
    return Array.from(s);
  }, [items, geoCache]);

  useEffect(() => {
    if (!pendingCityKeys.length) return;
    const run = async () => {
      const batch = pendingCityKeys.slice(0, 6);
      await Promise.all(
        batch.map(async (key) => {
          try {
            const q = `${key}, Brasil`;
            const resp = await fetch("/api/osm/search", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ q, limit: 1 }),
            });
            if (resp.ok) {
              const data = await resp.json();
              const o = Array.isArray(data?.options) && data.options[0];
              const lat = Number(o?.lat || 0);
              const lng = Number(o?.lon || 0);
              if (lat && lng) {
                setGeoCache((prev) => ({ ...prev, [key]: { lat, lng } }));
              } else {
                setGeoCache((prev) => ({ ...prev, [key]: prev[key] || undefined }));
              }
            }
          } catch {}
        })
      );
    };
    run();
  }, [pendingCityKeys]);

  const nearest = useMemo(() => {
    if (!hasCenter) return [] as Array<Tecnico & { km: number }>;
    return filtered
      .map((t) => {
        const c = (t.cidade || "").trim();
        const uf = (t.estado || "").trim();
        const fallback = c && uf ? geoCache[`${c} - ${uf}`] : undefined;
        const point = t.geo || fallback;
        const km = point ? haversineKm(center, point) : Number.POSITIVE_INFINITY;
        return { ...t, km };
      })
      .sort((a, b) => a.km - b.km);
  }, [filtered, center, hasCenter, geoCache]);

  useEffect(() => {
    if (!map) return;
    if (!hasCenter) return;
    if (!centerMarkerRef.current) {
      centerMarkerRef.current = L.marker([center.lat, center.lng]).addTo(map).bindPopup("Local do serviço");
    } else {
      centerMarkerRef.current.setLatLng([center.lat, center.lng]);
    }
    map.setView([center.lat, center.lng], 11);
  }, [center, map, hasCenter]);

  useEffect(() => {
    if (!map) return;
    for (const mk of techMarkersRef.current) { try { mk.remove(); } catch {} }
    const next: Layer[] = [];
    for (const t of filtered) {
      const c = (t.cidade || "").trim();
      const uf = (t.estado || "").trim();
      const fallback = c && uf ? geoCache[`${c} - ${uf}`] : undefined;
      const point = t.geo || fallback;
      if (point) {
        const mk: CircleMarker = L.circleMarker([point.lat, point.lng], { radius: 6, color: "#22c55e", fillColor: "#22c55e", fillOpacity: 0.9 }).addTo(map).bindPopup(`<b>${t.name}</b><br/>${t.cidade || ""}/${t.estado || ""}`);
        mk.on("click", () => {
          const km = hasCenter ? haversineKm(center, point) : undefined;
          setSelected({ ...t, km });
        });
        next.push(mk);
      }
    }
    techMarkersRef.current = next;
  }, [filtered, map, geoCache, center, hasCenter]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-2xl font-bold text-slate-900">Mapa de Técnicos</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <input className="border border-slate-300 rounded-md px-3 py-2" placeholder="Cidade - UF" value={qLocal} onChange={(e) => setQLocal(e.target.value)} />
        <input className="border border-slate-300 rounded-md px-3 py-2" placeholder="CEP" value={cep} onChange={(e) => setCep(e.target.value)} />
      </div>

      

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div id={mapDivId} className="h-[420px] sm:h-[520px] border border-slate-300 rounded-md overflow-hidden" />

        <div className="border border-slate-300 rounded-md bg-white overflow-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-slate-100">
                <th className="p-2 text-left">Nome</th>
                <th className="p-2 text-left">Cidade/UF</th>
                <th className="p-2 text-left">Distância</th>
              </tr>
            </thead>
            <tbody>
              {nearest.map((t) => (
                <tr key={t.id} className="border-t border-slate-200 hover:bg-slate-50 cursor-pointer" onClick={() => setSelected(t)}>
                  <td className="p-2">{t.name}</td>
                  <td className="p-2">{t.cidade}/{t.estado}</td>
                  <td className="p-2">{hasCenter && Number.isFinite(t.km) ? `${t.km.toFixed(1)} km` : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {!!selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000]" onClick={() => setSelected(null)}>
          <div className="bg-white w-full max-w-md rounded-lg shadow-xl p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold text-slate-900">Detalhes do técnico</div>
              <button className="text-xs text-slate-700" onClick={() => setSelected(null)}>Fechar</button>
            </div>
            <div className="mt-3 space-y-2">
              <div className="text-sm text-slate-800">{selected.name}</div>
              <div className="text-sm text-slate-700">{selected.cidade}/{selected.estado}</div>
              <div className="text-sm text-slate-700">Status: {selected.status || ""}</div>
              <div className="text-sm text-slate-700">Telefone: {formatBrPhoneDisplay(selected.phoneNumber || "")}</div>
              <div className="text-sm text-slate-700">Distância: {hasCenter && Number.isFinite(selected.km || NaN) ? `${(selected.km || 0).toFixed(1)} km` : "-"}</div>
            </div>
            <div className="flex justify-end mt-3">
              {!!(selected.phoneNumber || "").replace(/\D/g, "") && (
                <button type="button" className="px-3 py-2 rounded-md bg-green-600 text-white hover:bg-green-700" onClick={() => openWhatsApp(selected.phoneNumber || "")}>WhatsApp</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
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

function openWhatsApp(nat: string) {
  const digits = (nat || "").replace(/\D/g, "");
  if (!digits) return;
  const url = `https://wa.me/55${digits}`;
  try {
    const w = window.open(url, "_blank", "noopener,noreferrer");
    if (!w) window.location.href = url;
  } catch {
    window.location.href = url;
  }
}
