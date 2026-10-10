import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { sendCapi } from "@/lib/capi";
import { trackKlaviyo } from "@/lib/klaviyo";
import { getCurrentUser } from "@/lib/supa/server";

export const runtime = "nodejs";

const ALLOWED = new Set(["Lead", "CompleteRegistration", "InitiateCheckout", "QuizStart", "MapCreated"]);

// Recebe do navegador os eventos do pixel e repassa à API de Conversões.
export async function POST(req: Request) {
  const { event, event_id, url, params } = await req.json().catch(() => ({}));
  if (!ALLOWED.has(event) || typeof event_id !== "string") {
    return NextResponse.json({ error: "evento inválido" }, { status: 400 });
  }
  const h = headers();
  const c = cookies();
  const user = await getCurrentUser().catch(() => null);
  await sendCapi({
    event_name: event,
    event_id,
    event_source_url: typeof url === "string" ? url : undefined,
    email: user?.email,
    external_id: user?.id,
    ip: h.get("x-forwarded-for")?.split(",")[0]?.trim(),
    user_agent: h.get("user-agent"),
    fbp: c.get("_fbp")?.value,
    fbc: c.get("_fbc")?.value,
    custom_data: params && typeof params === "object" ? params : undefined,
  });
  // E-mails: cadastro e clique em assinar vão também para o Klaviyo.
  if (user && event === "CompleteRegistration") {
    const quiz = user.user_metadata?.quiz as Record<string, string> | undefined;
    await trackKlaviyo(user.email, "MF Criou conta", { ...quiz }, {
      first_name: user.user_metadata?.full_name ?? user.user_metadata?.name,
      mf_plano: "free",
      mf_nivel: quiz?.level,
      mf_objetivo: quiz?.goal,
    });
  }
  if (user && event === "InitiateCheckout") {
    await trackKlaviyo(user.email, "MF Clicou em assinar", { ...(params ?? {}) });
  }
  return NextResponse.json({ ok: true });
}
