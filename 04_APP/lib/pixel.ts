// Pixel da Meta (Facebook/Instagram Ads). ID não é secreto.
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "1720499595717555";

type Fbq = (...args: unknown[]) => void;

// Envia o evento também pelo servidor (API de Conversões), com o mesmo event_id.
function sendServer(event: string, eventID: string, params?: Record<string, unknown>) {
  try {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, event_id: eventID, url: location.href, params }),
      keepalive: true,
    }).catch(() => {});
  } catch {}
}

const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

// Evento padrão (Lead, CompleteRegistration, InitiateCheckout...).
export function track(event: string, params?: Record<string, unknown>) {
  const eventID = newId();
  const fbq = (globalThis as { fbq?: Fbq }).fbq;
  if (fbq) fbq("track", event, params, { eventID });
  sendServer(event, eventID, params);
}

// Evento personalizado (ex.: MapCreated).
export function trackCustom(event: string, params?: Record<string, unknown>) {
  const eventID = newId();
  const fbq = (globalThis as { fbq?: Fbq }).fbq;
  if (fbq) fbq("trackCustom", event, params, { eventID });
  sendServer(event, eventID, params);
}
