import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe, itemFromLookup, ES_PRODUCTS } from "@/lib/stripe";
import { grantPurchase, type GrantItem } from "@/lib/grant";
import { sendCapi } from "@/lib/capi";
import { trackKlaviyo } from "@/lib/klaviyo";

export const runtime = "nodejs";

// Webhook do Stripe (versão em espanhol): compra paga libera o acesso, avisa a Meta e o Klaviyo;
// sessão expirada com e-mail vira carrinho abandonado.
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !process.env.STRIPE_SECRET_KEY) return NextResponse.json({ error: "Stripe não configurado" }, { status: 503 });
  const s = stripe();
  let event: Stripe.Event;
  try {
    event = s.webhooks.constructEvent(await req.text(), req.headers.get("stripe-signature") ?? "", secret);
  } catch {
    return NextResponse.json({ error: "assinatura inválida" }, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const cd = session.customer_details;
  const email = cd?.email?.toLowerCase();
  if (!email) return NextResponse.json({ ok: true, ignored: "sem e-mail" });
  const names = String(cd?.name ?? "").trim().split(/\s+/);
  const kv = { phone_number: cd?.phone ?? null, first_name: names[0] || null };

  // Compras do modo de teste liberam o acesso, mas não avisam a Meta nem o Klaviyo (não sujam anúncios e e-mails).
  const live = event.livemode;

  if (event.type === "checkout.session.expired") {
    if (!live) return NextResponse.json({ ok: true, ignored: "teste" });
    // Pacote avulso (upsell dentro do app) não vira carrinho abandonado do Método.
    if (session.metadata?.item === "pacote") return NextResponse.json({ ok: true, ignored: "pacote" });
    await trackKlaviyo(email, "MF ES Abandonou checkout", {
      produto: "biblioteca",
      idioma: "es",
      checkout_link: session.after_expiration?.recovery?.url ?? "https://www.mapasfalantes.com.br/es/metodo",
    }, { mf_idioma: "es" }, kv);
    return NextResponse.json({ ok: true, abandoned: true });
  }

  if (event.type !== "checkout.session.completed" && event.type !== "checkout.session.async_payment_succeeded") {
    return NextResponse.json({ ok: true, ignored: event.type });
  }
  if (session.payment_status !== "paid") return NextResponse.json({ ok: true, ignored: "não pago ainda" });

  const lines = await s.checkout.sessions.listLineItems(session.id, { limit: 10 });
  const products = lines.data.map((l) => itemFromLookup(l.price?.lookup_key)).filter((p): p is (typeof ES_PRODUCTS)[number] => !!p);
  const items = products.map((p) => p.key) as GrantItem[];
  if (!items.length) return NextResponse.json({ ok: true, ignored: "itens desconhecidos" });

  await grantPurchase(email, items);
  if (!live) return NextResponse.json({ ok: true, items, teste: true });

  // Meta: 1 compra por pedido, valor em dólar (soma dos preços base; o Stripe cobra na moeda local).
  const usd = products.reduce((n, p) => n + p.cents, 0) / 100;
  const m = session.metadata ?? {};
  await sendCapi({
    event_name: "Purchase",
    event_id: `stripe-${session.id}`,
    event_source_url: "https://www.mapasfalantes.com.br/es/metodo",
    email,
    ip: m.ip || null,
    user_agent: m.ua || null,
    fbp: m.fbp?.startsWith("fb.") ? m.fbp : null,
    fbc: m.fbc?.startsWith("fb.") ? m.fbc : null,
    phone: cd?.phone ?? null,
    first_name: names[0] || null,
    last_name: names.length > 1 ? names[names.length - 1] : null,
    city: cd?.address?.city ?? null,
    state: cd?.address?.state ?? null,
    zip: cd?.address?.postal_code ?? null,
    country: cd?.address?.country?.toLowerCase() ?? null,
    es: true,
    custom_data: { value: usd, currency: "USD", content_name: products.map((p) => p.name).join(" + "), num_items: products.length, order_id: session.id },
  });

  for (const it of items) {
    await trackKlaviyo(email, "MF ES Comprou", { produto: it, idioma: "es", status: "paid" }, it === "biblioteca" ? { mf_biblioteca: true, mf_idioma: "es" } : { mf_idioma: "es" }, kv);
  }
  return NextResponse.json({ ok: true, items });
}
