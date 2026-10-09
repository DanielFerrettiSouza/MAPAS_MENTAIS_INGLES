// Pixel da Meta (Facebook/Instagram Ads). ID não é secreto.
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "1720499595717555";

type Fbq = (...args: unknown[]) => void;

// Evento padrão (Lead, CompleteRegistration, InitiateCheckout...).
export function track(event: string, params?: Record<string, unknown>) {
  const fbq = (globalThis as { fbq?: Fbq }).fbq;
  if (fbq) fbq("track", event, params);
}

// Evento personalizado (ex.: MapCreated).
export function trackCustom(event: string, params?: Record<string, unknown>) {
  const fbq = (globalThis as { fbq?: Fbq }).fbq;
  if (fbq) fbq("trackCustom", event, params);
}
