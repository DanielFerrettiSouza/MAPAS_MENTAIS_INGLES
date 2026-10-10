import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { sendCapi } from "@/lib/capi";
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
  return NextResponse.json({ ok: true });
}
