export async function POST(req: Request) {
  try {
    const { input, languageCode, regionCode, sessionToken } = (await req.json()) as {
      input?: string;
      languageCode?: string;
      regionCode?: string;
      sessionToken?: string;
    };
    if (!input) return Response.json({ error: "input required" }, { status: 400 });

    const apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY || "";
    if (!apiKey) return Response.json({ error: "places_api_not_configured" }, { status: 500 });

    const body = {
      input,
      languageCode: languageCode || "pt-BR",
      regionCode: regionCode || "BR",
      sessionToken,
    };

    const resp = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "suggestions.placePrediction.placeId,suggestions.placePrediction.text.text,suggestions.placePrediction.structuredFormat.mainText,suggestions.placePrediction.structuredFormat.secondaryText",
      },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const txt = await resp.text().catch(() => "failed");
      return Response.json({ error: "places_autocomplete_failed", detail: txt }, { status: 502 });
    }

    const json = await resp.json();
    return Response.json(json);
  } catch {
    return Response.json({ error: "internal" }, { status: 500 });
  }
}
