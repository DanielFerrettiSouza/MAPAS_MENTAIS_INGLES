import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { stripe, esPriceIds, ES_PRODUCTS } from "@/lib/stripe";

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
  const session = await s.checkout.sessions.create({
    mode: "payment",
    locale: "es",
    line_items: [{ price: ids[metodo.lookup], quantity: 1 }],
    optional_items: bumps.map((b) => ({ price: ids[b.lookup], quantity: 1 })),
    customer_creation: "always",
    phone_number_collection: { enabled: true },
    // Guarda o e-mail mesmo sem pagar (vira carrinho abandonado quando a sessão expira).
    consent_collection: { promotions: "auto" },
    after_expiration: { recovery: { enabled: true, allow_promotion_codes: false } },
    success_url: `${origin}/es/crear-cuenta?compro=1&session={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/es/metodo`,
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
