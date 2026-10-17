import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supa/server";
import { trackKlaviyo } from "@/lib/klaviyo";
import { EXTRAS, PLANS, extraFromProductName, planFromProductName } from "@/lib/plans";
import { kitFromProductName } from "@/lib/kits";
import { sendCapi } from "@/lib/capi";

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
  const status: string = event.webhook_event_type ?? event.order_status ?? event.status ?? "";
  const email: string | undefined = (event.Customer?.email ?? event.email)?.trim().toLowerCase();
  // O plano pode estar no nome do produto, da oferta ou do plano de assinatura.
  const productName: string = [
    event.Product?.product_name ?? event.product_name,
    event.Product?.product_offer_name,
    event.Subscription?.plan?.name,
  ]
    .filter(Boolean)
    .join(" ");
  console.log("Kiwify:", { status, email, productName });
  if (!email) return NextResponse.json({ ok: true, ignored: "sem e-mail" });

  // Carrinho abandonado: a pessoa preencheu o checkout e não pagou. Vira evento no
  // Klaviyo para o fluxo de recuperação (quem comprar depois sai do fluxo).
  if (/abandon/i.test(status) || (!event.order_status && event.checkout_link)) {
    console.log("Kiwify carrinho abandonado (campos):", Object.keys(event).join(","));
    const name = productName || String(event.product_name ?? "");
    await trackKlaviyo(email, "MF Abandonou checkout", {
      produto: extraFromProductName(name) ?? kitFromProductName(name) ?? planFromProductName(name)?.id ?? name,
      produto_nome: name,
      // A Kiwify manda só o código do checkout (ex.: "NDaCasU"): vira o link completo.
      checkout_link: event.checkout_link ? (String(event.checkout_link).startsWith("http") ? event.checkout_link : `https://pay.kiwify.com.br/${event.checkout_link}`) : null,
    });
    return NextResponse.json({ ok: true, abandoned: true });
  }

  // Compra paga: avisa a Meta pelo servidor (API de Conversões), com o valor real de cada
  // pedido (Método e cada order bump). Só no pagamento aprovado, não no Pix gerado.
  if (ACTIVATE.has(status) && status !== "subscription_renewed") {
    const c = event.Commissions ?? {};
    const cents = Number(c.charge_amount ?? c.product_base_price ?? 0);
    const t = event.TrackingParameters ?? {};
    await sendCapi({
      event_name: "Purchase",
      event_id: `kiwify-${event.order_id ?? event.order_ref ?? `${email}-${productName}`}`,
      event_source_url: "https://www.mapasfalantes.com.br/metodo",
      email,
      ip: event.Customer?.ip ?? null,
      fbc: t.fbclid ? `fb.1.${Date.now()}.${t.fbclid}` : null,
      custom_data: { value: cents / 100, currency: "BRL", content_name: productName, order_id: event.order_id },
    });
    console.log("Kiwify → Meta Purchase:", { value: cents / 100, productName, order: event.order_id });
  }

  const admin = createSupabaseAdmin();
  const { data: profile } = await admin
    .from("profiles")
    .select("id, credits")
    .ilike("email", email)
    .maybeSingle();

  // Compra sem conta: soma ao que já estava pendente (Método + bump + upsell podem chegar
  // em webhooks separados). Plano com "|biblioteca" = também tem o Método vitalício
  // (convertido em app/app/layout.tsx no primeiro acesso).
  // Os avisos de compra do mesmo pedido (Método + bumps) chegam juntos: cada gravação só
  // vale se o registro não mudou desde a leitura; se mudou, lê de novo e soma (sem apagar a outra).
  async function addPending(change: { library?: boolean; kit?: string; plan?: string; planCredits?: number; extraCredits?: number }) {
    for (let attempt = 0; attempt < 8; attempt++) {
      const { data: cur } = await admin.from("pending_upgrades").select("email, plan, credits").ilike("email", email!).maybeSingle();
      const parts = (cur?.plan ?? "free").split("|");
      let base = parts[0] === "biblioteca" || parts[0].startsWith("kit-") ? "free" : parts[0];
      let library = parts.includes("biblioteca");
      const baseCredits = base === "free" ? 3 : PLANS.find((p) => p.id === base)?.credits ?? 3;
      let extra = Math.max(0, (cur?.credits ?? 3) - baseCredits);
      if (change.library) library = true;
      if (change.plan) base = change.plan;
      if (change.extraCredits) extra += change.extraCredits;
      const credits = (change.planCredits ?? (base === "free" ? 3 : PLANS.find((p) => p.id === base)?.credits ?? 3)) + extra;
      const kits = [...new Set([...parts.filter((p: string) => p.startsWith("kit-")), ...(change.kit ? [`kit-${change.kit}`] : [])])];
      const flags = [...(library ? ["biblioteca"] : []), ...kits];
      const plan = base === "free" && flags.length ? flags.join("|") : [base, ...flags].join("|");
      if (cur) {
        const { data: done } = await admin.from("pending_upgrades").update({ plan, credits })
          .eq("email", cur.email).eq("plan", cur.plan).eq("credits", cur.credits).select("email");
        if (done?.length) return;
      } else {
        const { error } = await admin.from("pending_upgrades").insert({ email, plan, credits });
        if (!error) return;
      }
      await new Promise((r) => setTimeout(r, 80 + Math.random() * 250));
    }
    console.error("Kiwify: não consegui gravar a compra pendente", { email, change });
  }


  // Kits temáticos (order bumps do Método): liberam um conjunto de mapas prontos.
  const kit = kitFromProductName(productName);
  if (kit && (ACTIVATE.has(status) || DEACTIVATE.has(status))) {
    const on = ACTIVATE.has(status);
    if (profile) {
      // Os dois kits podem chegar juntos: grava, relê e repete até o kit constar (ou sair).
      for (let attempt = 0; attempt < 6; attempt++) {
        const { data: u } = await admin.auth.admin.getUserById(profile.id);
        const cur = Array.isArray(u.user?.app_metadata?.kits) ? (u.user!.app_metadata.kits as string[]) : [];
        if (cur.includes(kit) === on) break;
        const kits = on ? [...new Set([...cur, kit])] : cur.filter((k) => k !== kit);
        const { error } = await admin.auth.admin.updateUserById(profile.id, { app_metadata: { kits } });
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        await new Promise((r) => setTimeout(r, 80 + Math.random() * 250));
      }
    } else if (on) {
      await addPending({ kit });
    }
    await trackKlaviyo(email, on ? "MF Comprou" : "MF Cancelou", { produto: `kit-${kit}`, status });
    return NextResponse.json({ ok: true, kit, on });
  }

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
        await addPending({ library: true });
      }
    } else if (profile) {
      const credits = Math.max(0, (profile.credits ?? 0) + (on ? EXTRAS.credits : -EXTRAS.credits));
      await admin.from("profiles").update({ credits }).eq("id", profile.id);
    } else if (on) {
      await addPending({ extraCredits: EXTRAS.credits });
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
      await addPending({ plan: plan.id, planCredits: plan.credits });
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
