import { createHash } from "node:crypto";
import { META_PIXEL_ID } from "@/lib/pixel";

// API de Conversões da Meta: envia, pelo servidor, os mesmos eventos do pixel.
// O mesmo event_id do navegador faz a Meta contar cada evento uma vez só.
// Sem META_CAPI_TOKEN não faz nada.
export type CapiEvent = {
  event_name: string;
  event_id: string;
  event_source_url?: string;
  email?: string | null;
  external_id?: string | null;
  ip?: string | null;
  user_agent?: string | null;
  fbp?: string | null;
  fbc?: string | null;
  custom_data?: Record<string, unknown>;
  // Dados extras do comprador (vêm da Kiwify): melhoram a correspondência da compra com quem viu o anúncio.
  phone?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  country?: string | null;
};

const sha256 = (v: string) => createHash("sha256").update(v.trim().toLowerCase()).digest("hex");

export async function sendCapi(e: CapiEvent) {
  const token = process.env.META_CAPI_TOKEN;
  if (!token || !META_PIXEL_ID) return;

  const user_data: Record<string, unknown> = {};
  if (e.email) user_data.em = [sha256(e.email)];
  if (e.external_id) user_data.external_id = [sha256(e.external_id)];
  if (e.ip) user_data.client_ip_address = e.ip;
  if (e.user_agent) user_data.client_user_agent = e.user_agent;
  if (e.fbp) user_data.fbp = e.fbp;
  if (e.fbc) user_data.fbc = e.fbc;
  const norm = (v?: string | null) => (v ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const phone = (e.phone ?? "").replace(/\D/g, "");
  if (phone) user_data.ph = [sha256(phone.length <= 11 ? `55${phone}` : phone)];
  if (norm(e.first_name)) user_data.fn = [sha256(norm(e.first_name))];
  if (norm(e.last_name)) user_data.ln = [sha256(norm(e.last_name))];
  if (norm(e.city)) user_data.ct = [sha256(norm(e.city))];
  if (norm(e.state)) user_data.st = [sha256(norm(e.state))];
  if (norm(e.zip)) user_data.zp = [sha256(norm(e.zip))];
  if (norm(e.country)) user_data.country = [sha256(norm(e.country))];

  const body: Record<string, unknown> = {
    data: [
      {
        event_name: e.event_name,
        event_time: Math.floor(Date.now() / 1000),
        event_id: e.event_id,
        action_source: "website",
        event_source_url: e.event_source_url,
        user_data,
        custom_data: e.custom_data,
      },
    ],
  };
  // Para ver os eventos em "Eventos de teste" no Gerenciador de Eventos.
  if (process.env.META_TEST_EVENT_CODE) body.test_event_code = process.env.META_TEST_EVENT_CODE;

  try {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${META_PIXEL_ID}/events?access_token=${encodeURIComponent(token)}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
    );
    if (!res.ok) console.error("CAPI:", res.status, await res.text());
  } catch (err) {
    console.error("CAPI: falha ao enviar", err);
  }
}
