export async function POST(req: Request) {
  try {
    const { placeId, languageCode, regionCode, sessionToken } = (await req.json()) as {
      placeId?: string;
      languageCode?: string;
      regionCode?: string;
      sessionToken?: string;
    };
    if (!placeId) return Response.json({ error: "placeId required" }, { status: 400 });

    const apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY || "";
    if (!apiKey) return Response.json({ error: "places_api_not_configured" }, { status: 500 });

    const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=${encodeURIComponent(languageCode || "pt-BR")}&regionCode=${encodeURIComponent(regionCode || "BR")}`;

    const resp = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "id,displayName,formattedAddress,location,addressComponents",
        ...(sessionToken ? { "X-Goog-Session-Token": sessionToken } : {}),
      },
    });

    if (!resp.ok) {
      const txt = await resp.text().catch(() => "failed");
      return Response.json({ error: "places_details_failed", detail: txt }, { status: 502 });
    }

    const data = await resp.json();
    return Response.json(data);
  } catch {
    return Response.json({ error: "internal" }, { status: 500 });
  }
}

