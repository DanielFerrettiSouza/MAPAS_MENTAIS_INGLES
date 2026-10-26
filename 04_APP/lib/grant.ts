import { createSupabaseAdmin } from "@/lib/supa/server";
import { EXTRAS, PLANS } from "@/lib/plans";

// Libera uma compra de pagamento único (Método, kits, pacote de mapas) pelo e-mail.
// Com conta: aplica na hora. Sem conta: guarda em pending_upgrades (aplicado no 1º acesso,
// ver app/app/layout.tsx) — mesma regra do webhook da Kiwify. Usado pelo checkout do Stripe.
export type GrantItem = "biblioteca" | "kit-viagem" | "kit-trabalho" | "pacote";

export async function grantPurchase(email: string, items: GrantItem[]) {
  const admin = createSupabaseAdmin();
  const { data: profile } = await admin.from("profiles").select("id, credits").ilike("email", email).maybeSingle();
  const kits = items.filter((i) => i.startsWith("kit-")).map((i) => i.slice(4));
  const library = items.includes("biblioteca");
  const extraCredits = items.filter((i) => i === "pacote").length * EXTRAS.credits;

  if (profile) {
    const { data: u } = await admin.auth.admin.getUserById(profile.id);
    const cur = Array.isArray(u.user?.app_metadata?.kits) ? (u.user!.app_metadata.kits as string[]) : [];
    const meta: Record<string, unknown> = {};
    if (library) meta.library = true;
    if (kits.length) meta.kits = [...new Set([...cur, ...kits])];
    if (Object.keys(meta).length) {
      const { error } = await admin.auth.admin.updateUserById(profile.id, { app_metadata: meta });
      if (error) throw new Error(error.message);
    }
    if (extraCredits) await admin.from("profiles").update({ credits: (profile.credits ?? 0) + extraCredits }).eq("id", profile.id);
    return "conta";
  }

  for (let attempt = 0; attempt < 8; attempt++) {
    const { data: cur } = await admin.from("pending_upgrades").select("email, plan, credits").ilike("email", email).maybeSingle();
    const parts = (cur?.plan ?? "free").split("|");
    const base = parts[0] === "biblioteca" || parts[0].startsWith("kit-") ? "free" : parts[0];
    const baseCredits = base === "free" ? 3 : PLANS.find((p) => p.id === base)?.credits ?? 3;
    const extra = Math.max(0, (cur?.credits ?? 3) - baseCredits) + extraCredits;
    const allKits = [...new Set([...parts.filter((p: string) => p.startsWith("kit-")), ...kits.map((k) => `kit-${k}`)])];
    const flags = [...(library || parts.includes("biblioteca") ? ["biblioteca"] : []), ...allKits];
    const plan = base === "free" && flags.length ? flags.join("|") : [base, ...flags].join("|");
    const credits = baseCredits + extra;
    if (cur) {
      const { data: done } = await admin.from("pending_upgrades").update({ plan, credits })
        .eq("email", cur.email).eq("plan", cur.plan).eq("credits", cur.credits).select("email");
      if (done?.length) return "pendente";
    } else {
      const { error } = await admin.from("pending_upgrades").insert({ email, plan, credits });
      if (!error) return "pendente";
    }
    await new Promise((r) => setTimeout(r, 80 + Math.random() * 250));
  }
  throw new Error("não consegui gravar a compra pendente");
}
