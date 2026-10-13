// Pixel da Meta (Facebook/Instagram Ads). ID não é secreto.
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "1720499595717555";

type Fbq = (...args: unknown[]) => void;

// Envia o evento também pelo servidor (API de Conversões), com o mesmo event_id.
// Identificador anônimo e fixo do visitante (vai como external_id) e o e-mail
// digitado no quiz, se houver: melhoram a correspondência dos eventos na Meta.
function visitor() {
  try {
    let vid = localStorage.getItem("mf-vid");
    if (!vid) localStorage.setItem("mf-vid", (vid = `v-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`));
    return { vid, savedEmail: localStorage.getItem("mf-email") ?? undefined };
  } catch {
    return {};
  }
}

function sendServer(event: string, eventID: string, params?: Record<string, unknown>, email?: string) {
  try {
    const { vid, savedEmail } = visitor();
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, event_id: eventID, url: location.href, params, email: email ?? savedEmail, vid }),
      keepalive: true,
    }).catch(() => {});
  } catch {}
}

const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

// Evento padrão (Lead, CompleteRegistration, InitiateCheckout...).
// email: quando a pessoa ainda não tem conta mas informou o e-mail (fim do quiz).
export function track(event: string, params?: Record<string, unknown>, email?: string) {
  const eventID = newId();
  const fbq = (globalThis as { fbq?: Fbq }).fbq;
  if (fbq) fbq("track", event, params, { eventID });
  sendServer(event, eventID, params, email);
}

// Evento personalizado (ex.: MapCreated).
export function trackCustom(event: string, params?: Record<string, unknown>) {
  const eventID = newId();
  const fbq = (globalThis as { fbq?: Fbq }).fbq;
  if (fbq) fbq("trackCustom", event, params, { eventID });
  sendServer(event, eventID, params);
}
