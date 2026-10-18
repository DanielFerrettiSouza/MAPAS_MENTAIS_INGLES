// Envia eventos do funil para o Klaviyo (fluxos de e-mail). Sem KLAVIYO_API_KEY não faz nada.
// Métricas com prefixo "MF" (Mapas Falantes).
export type MfEvent =
  | "MF Fez o quiz"
  | "MF Abandonou checkout"
  | "MF Criou conta"
  | "MF Gerou mapa"
  | "MF Acabaram os mapas gratis"
  | "MF Acabaram os mapas do Metodo"
  | "MF Clicou em assinar"
  | "MF Comprou"
  | "MF Cancelou"
  | "MF Depoimento";

export async function trackKlaviyo(
  email: string | null | undefined,
  metric: MfEvent,
  properties: Record<string, unknown> = {},
  profile: Record<string, unknown> = {},
  // Dados do perfil (telefone no formato +55..., nome): o telefone é o que o WhatsApp do Klaviyo usa.
  attrs: { phone_number?: string | null; first_name?: string | null } = {}
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
            profile: {
              data: {
                type: "profile",
                attributes: {
                  email,
                  ...(attrs.phone_number ? { phone_number: attrs.phone_number } : {}),
                  ...(attrs.first_name ? { first_name: attrs.first_name } : {}),
                  properties: profile,
                },
              },
            },
          },
        },
      }),
    });
    if (!res.ok) console.error("Klaviyo:", res.status, await res.text());
  } catch (err) {
    console.error("Klaviyo: falha ao enviar", err);
  }
}
