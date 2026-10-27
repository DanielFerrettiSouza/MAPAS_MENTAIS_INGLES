import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { stripe, esPriceIds, ES_PRODUCTS, esCountry, esCurrency } from "@/lib/stripe";
import { getCurrentUser } from "@/lib/supa/server";
import { sendCapi } from "@/lib/capi";

export const runtime = "nodejs";

// Abre o checkout do Método em espanhol (com os 3 order bumps como itens opcionais).
// GET /api/stripe/checkout → redireciona para a página de pagamento do Stripe.
// ?item=pacote → só o Pacote de 5 mapas (upsell para quem já usou os mapas com IA), com o e-mail da conta.
export async function GET(req: Request) {
  if (!process.env.STRIPE_SECRET_KEY) return NextResponse.json({ error: "Stripe não configurado" }, { status: 503 });
  const s = stripe();
  const ids = await esPriceIds(s);
  // Order bumps: só os kits. O Pacote de 5 mapas é upsell dentro do app, quando os 3 mapas com IA acabam.
  const [metodo, ...rest] = ES_PRODUCTS;
  const bumps = rest.filter((p) => p.key !== "pacote");
  const origin = new URL(req.url).origin;
  const c = cookies();
  const url = new URL(req.url);
  // Mesma moeda da página: o Stripe cobra exatamente o valor que a pessoa viu.
  const country = esCountry(url.searchParams.get("pais"), req.headers.get("x-vercel-ip-country"));

  if (url.searchParams.get("item") === "pacote") {
    const pacote = ES_PRODUCTS.find((p) => p.key === "pacote")!;
    const email = (await getCurrentUser())?.email ?? url.searchParams.get("email") ?? undefined;
    const session = await s.checkout.sessions.create({
      mode: "payment",
      currency: esCurrency(country),
      locale: "es",
      line_items: [{ price: ids[pacote.lookup], quantity: 1 }],
      customer_email: email || undefined,
      success_url: `${origin}/app/criar?compro=1`,
      cancel_url: `${origin}/app/criar`,
      metadata: { item: "pacote", ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "", ua: req.headers.get("user-agent")?.slice(0, 400) ?? "" },
    });
    return NextResponse.redirect(session.url!, 303);
  }
  const session = await s.checkout.sessions.create({
    mode: "payment",
    currency: esCurrency(country),
    locale: "es",
    line_items: [{ price: ids[metodo.lookup], quantity: 1 }],
    optional_items: bumps.map((b) => ({ price: ids[b.lookup], quantity: 1, adjustable_quantity: { enabled: false } })),
    customer_creation: "always",
    phone_number_collection: { enabled: true },
    // Sessão expirada vira carrinho abandonado (webhook → Klaviyo, com o link de recuperação).
    after_expiration: { recovery: { enabled: true, allow_promotion_codes: false } },
    success_url: `${origin}/es/crear-cuenta?compro=1&session={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/es/metodo${country ? `?pais=${country.toLowerCase()}` : ""}`,
    metadata: {
      fbp: c.get("_fbp")?.value ?? "",
      fbc: c.get("_fbc")?.value ?? (url.searchParams.get("fbclid") ? `fb.1.${Date.now()}.${url.searchParams.get("fbclid")}` : ""),
      ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "",
      ua: req.headers.get("user-agent")?.slice(0, 400) ?? "",
      utm: url.search.slice(0, 450),
    },
  });
  // Início de checkout para o pixel Mapas Parlantes (o botão da página é um link simples).
  await sendCapi({
    es: true,
    event_name: "InitiateCheckout",
    // Mesmo event_id do pixel do navegador (botão da página), para a Meta contar uma vez só.
    event_id: url.searchParams.get("eid")?.slice(0, 80) || `stripe-ic-${session.id}`,
    event_source_url: `${origin}/es/metodo`,
    ip: session.metadata?.ip || null,
    user_agent: session.metadata?.ua || null,
    fbp: session.metadata?.fbp || null,
    fbc: session.metadata?.fbc || null,
    custom_data: { currency: "USD", value: ES_PRODUCTS[0].cents / 100, content_name: ES_PRODUCTS[0].name },
  });
  return NextResponse.redirect(session.url!, 303);
}
