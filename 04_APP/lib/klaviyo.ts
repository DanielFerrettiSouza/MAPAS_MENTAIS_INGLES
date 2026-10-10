// Envia eventos do funil para o Klaviyo (fluxos de e-mail). Sem KLAVIYO_API_KEY não faz nada.
// Métricas com prefixo "MF" (Mapas Falantes).
export type MfEvent =
  | "MF Criou conta"
  | "MF Gerou mapa"
  | "MF Acabaram os mapas gratis"
  | "MF Clicou em assinar"
  | "MF Comprou"
  | "MF Cancelou";

export async function trackKlaviyo(
  email: string | null | undefined,
  metric: MfEvent,
  properties: Record<string, unknown> = {},
  profile: Record<string, unknown> = {}
) {
  const key = process.env.KLAVIYO_API_KEY;
  if (!key || !email) return;
  try {
    const res = await fetch("https://a.klaviyo.com/api/events", {
      method: "POST",
      headers: {
        Authorization: `Klaviyo-API-Key ${key}`,
        revision: "2024-10-15",
        "Content-Type": "application/vnd.api+json",
        Accept: "application/vnd.api+json",
      },
      body: JSON.stringify({
        data: {
          type: "event",
          attributes: {
            properties,
            metric: { data: { type: "metric", attributes: { name: metric } } },
            profile: { data: { type: "profile", attributes: { email, properties: profile } } },
          },
        },
      }),
    });
    if (!res.ok) console.error("Klaviyo:", res.status, await res.text());
  } catch (err) {
    console.error("Klaviyo: falha ao enviar", err);
  }
}
