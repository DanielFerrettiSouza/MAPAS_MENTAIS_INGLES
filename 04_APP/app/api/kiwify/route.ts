import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supa/server";
import { planFromProductName } from "@/lib/plans";

export const runtime = "nodejs";

// Webhook da Kiwify: libera, renova ou cancela o plano do aluno.
// A Kiwify assina o corpo com HMAC-SHA1 usando o token do webhook e envia
// a assinatura no parâmetro ?signature= da URL.
function validSignature(body: string, signature: string | null) {
  const token = process.env.KIWIFY_WEBHOOK_TOKEN;
  if (!token || !signature) return false;
  const expected = createHmac("sha1", token).update(body).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}

const ACTIVATE = new Set(["order_approved", "paid", "subscription_renewed", "approved"]);
const DEACTIVATE = new Set(["subscription_canceled", "refunded", "chargeback", "subscription_late"]);

export async function POST(req: Request) {
  const raw = await req.text();
  if (!validSignature(raw, new URL(req.url).searchParams.get("signature"))) {
    return NextResponse.json({ error: "assinatura inválida" }, { status: 401 });
  }

  const event = JSON.parse(raw);
  const status: string = event.webhook_event_type ?? event.order_status ?? "";
  const email: string | undefined = event.Customer?.email?.toLowerCase();
  const productName: string = event.Product?.product_name ?? "";
  if (!email) return NextResponse.json({ ok: true, ignored: "sem e-mail" });

  const admin = createSupabaseAdmin();
  const { data: profile } = await admin
    .from("profiles")
    .select("id")
    .ilike("email", email)
    .maybeSingle();

  if (ACTIVATE.has(status)) {
    const plan = planFromProductName(productName);
    if (!plan) return NextResponse.json({ ok: true, ignored: `produto desconhecido: ${productName}` });
    if (profile) {
      await admin.from("profiles").update({ plan: plan.id, credits: plan.credits }).eq("id", profile.id);
    } else {
      // Pagou antes de criar a conta: o plano é aplicado no cadastro.
      await admin.from("pending_upgrades").upsert({ email, plan: plan.id, credits: plan.credits });
    }
    return NextResponse.json({ ok: true, plan: plan.id });
  }

  if (DEACTIVATE.has(status) && profile) {
    await admin.from("profiles").update({ plan: "free", credits: 0 }).eq("id", profile.id);
    return NextResponse.json({ ok: true, plan: "free" });
  }

  return NextResponse.json({ ok: true, ignored: status });
}
