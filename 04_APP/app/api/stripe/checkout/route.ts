import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { stripe, esPriceIds, ES_PRODUCTS, esCountry, esCurrency } from "@/lib/stripe";

export const runtime = "nodejs";

// Abre o checkout do Método em espanhol (com os 3 order bumps como itens opcionais).
// GET /api/stripe/checkout → redireciona para a página de pagamento do Stripe.
export async function GET(req: Request) {
  if (!process.env.STRIPE_SECRET_KEY) return NextResponse.json({ error: "Stripe não configurado" }, { status: 503 });
  const s = stripe();
  const ids = await esPriceIds(s);
  const [metodo, ...bumps] = ES_PRODUCTS;
  const origin = new URL(req.url).origin;
  const c = cookies();
  const url = new URL(req.url);
  // Mesma moeda da página: o Stripe cobra exatamente o valor que a pessoa viu.
  const country = esCountry(url.searchParams.get("pais"), req.headers.get("x-vercel-ip-country"));
  const session = await s.checkout.sessions.create({
    mode: "payment",
    currency: esCurrency(country),
    locale: "es",
    line_items: [{ price: ids[metodo.lookup], quantity: 1 }],
    optional_items: bumps.map((b) => ({ price: ids[b.lookup], quantity: 1 })),
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
  return NextResponse.redirect(session.url!, 303);
}
