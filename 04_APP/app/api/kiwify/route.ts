import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supa/server";
import { trackKlaviyo } from "@/lib/klaviyo";
import { EXTRAS, extraFromProductName, planFromProductName } from "@/lib/plans";

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
const DEACTIVATE = new Set([
  "subscription_canceled",
  "refunded",
  "order_refunded",
  "chargeback",
  "subscription_late",
]);

export async function POST(req: Request) {
  const raw = await req.text();
  if (!validSignature(raw, new URL(req.url).searchParams.get("signature"))) {
    console.error("Kiwify: assinatura inválida (confira KIWIFY_WEBHOOK_TOKEN e faça Redeploy)");
    return NextResponse.json({ error: "assinatura inválida" }, { status: 401 });
  }

  // A Kiwify pode mandar os dados na raiz ou dentro de "order".
  const body = JSON.parse(raw);
  const event = body.order ?? body;
  const status: string = event.webhook_event_type ?? event.order_status ?? "";
  const email: string | undefined = event.Customer?.email?.trim().toLowerCase();
  // O plano pode estar no nome do produto, da oferta ou do plano de assinatura.
  const productName: string = [
    event.Product?.product_name,
    event.Product?.product_offer_name,
    event.Subscription?.plan?.name,
  ]
    .filter(Boolean)
    .join(" ");
  console.log("Kiwify:", { status, email, productName });
  if (!email) return NextResponse.json({ ok: true, ignored: "sem e-mail" });

  const admin = createSupabaseAdmin();
  const { data: profile } = await admin
    .from("profiles")
    .select("id, credits")
    .ilike("email", email)
    .maybeSingle();

  // Produtos avulsos (pagamento único): biblioteca vitalícia e pacote de mapas.
  const extra = extraFromProductName(productName);
  if (extra && (ACTIVATE.has(status) || DEACTIVATE.has(status))) {
    const on = ACTIVATE.has(status);
    if (extra === "biblioteca") {
      if (profile) {
        const { error } = await admin.auth.admin.updateUserById(profile.id, { app_metadata: { library: on } });
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      } else if (on) {
        // Comprou antes de criar a conta: o app converte ao entrar (ver app/app/layout.tsx).
        await admin.from("pending_upgrades").upsert({ email, plan: "biblioteca", credits: 3 });
      }
    } else if (profile) {
      const credits = Math.max(0, (profile.credits ?? 0) + (on ? EXTRAS.credits : -EXTRAS.credits));
      await admin.from("profiles").update({ credits }).eq("id", profile.id);
    } else if (on) {
      await admin.from("pending_upgrades").upsert({ email, plan: "free", credits: 3 + EXTRAS.credits });
    }
    await trackKlaviyo(email, on ? "MF Comprou" : "MF Cancelou", { produto: extra, status }, on && extra === "biblioteca" ? { mf_biblioteca: true } : {});
    return NextResponse.json({ ok: true, extra, on });
  }

  if (ACTIVATE.has(status)) {
    const plan = planFromProductName(productName);
    if (!plan) console.error("Kiwify: produto sem nome de plano:", productName);
    if (!plan) return NextResponse.json({ ok: true, ignored: `produto desconhecido: ${productName}` });
    if (profile) {
      const { error } = await admin
        .from("profiles")
        .update({ plan: plan.id, credits: plan.credits })
        .eq("id", profile.id);
      if (error) {
        console.error("Kiwify: falha ao atualizar perfil:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else {
      // Pagou antes de criar a conta: o plano é aplicado no cadastro.
      await admin.from("pending_upgrades").upsert({ email, plan: plan.id, credits: plan.credits });
    }
    await trackKlaviyo(email, "MF Comprou", { produto: plan.id, status }, { mf_plano: plan.id });
    return NextResponse.json({ ok: true, plan: plan.id });
  }

  if (DEACTIVATE.has(status) && profile) {
    await admin.from("profiles").update({ plan: "free", credits: 0 }).eq("id", profile.id);
    await trackKlaviyo(email, "MF Cancelou", { produto: productName, status }, { mf_plano: "free" });
    return NextResponse.json({ ok: true, plan: "free" });
  }

  return NextResponse.json({ ok: true, ignored: status });
}
