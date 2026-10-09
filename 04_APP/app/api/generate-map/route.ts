import { NextResponse } from "next/server";
import { buildMap } from "@/lib/buildMap";
import { createSupabaseAdmin, getCurrentUser } from "@/lib/supa/server";
import type { MapWithImages } from "@/lib/mapSchema";

export const runtime = "nodejs";
export const maxDuration = 60;

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Faça login para criar mapas." }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const topic = String(body.topic ?? "").trim().slice(0, 200);
  const level = LEVELS.includes(body.level) ? body.level : "A1";
  const goal = body.goal ? String(body.goal).slice(0, 200) : undefined;
  if (!topic) return NextResponse.json({ error: "Informe um assunto." }, { status: 400 });

  const admin = createSupabaseAdmin();

  // Reserva 1 crédito antes de gastar com IA (devolve se a geração falhar).
  const { data: profile } = await admin.from("profiles").select("credits, plan").eq("id", user.id).maybeSingle();
  const credits = profile?.credits ?? 0;
  if (credits <= 0) {
    return NextResponse.json({ error: "Seus mapas acabaram. Assine um plano para continuar." }, { status: 402 });
  }
  const { data: reserved } = await admin
    .from("profiles")
    .update({ credits: credits - 1 })
    .eq("id", user.id)
    .eq("credits", credits)
    .select("credits");
  if (!reserved?.length) {
    return NextResponse.json({ error: "Tente de novo em instantes." }, { status: 409 });
  }

  try {
    // Custo: plano pago ganha a capa ilustrada; grátis usa só emojis.
    const id = crypto.randomUUID();
    const result: MapWithImages = await buildMap(admin, {
      topic,
      level,
      goal,
      illustrate: !!profile?.plan && profile.plan !== "free",
      imagePath: `${user.id}/${id}`,
    });
    const { error } = await admin.from("generated_maps").insert({
      id,
      user_id: user.id,
      topic,
      level,
      title_pt: result.title_pt,
      data: result,
    });
    if (error) throw new Error(`Falha ao salvar o mapa: ${error.message}`);

    return NextResponse.json({ id });
  } catch (err) {
    console.error(err);
    await admin.from("profiles").update({ credits }).eq("id", user.id).eq("credits", credits - 1);
    const message = err instanceof Error ? err.message : "Erro ao gerar o mapa.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
