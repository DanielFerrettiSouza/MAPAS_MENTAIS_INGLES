import { NextResponse } from "next/server";
import { generateIllustration, generateMapContent } from "@/lib/ai";
import { createSupabaseAdmin, getCurrentUser } from "@/lib/supa/server";
import type { MapWithImages } from "@/lib/mapSchema";

export const runtime = "nodejs";
export const maxDuration = 60;

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

// Sobe a ilustração (data URL) para o Storage e devolve a URL pública.
async function storeImage(
  admin: ReturnType<typeof createSupabaseAdmin>,
  path: string,
  dataUrl: string | null
) {
  if (!dataUrl) return null;
  const match = dataUrl.match(/^data:(.+?);base64,(.*)$/);
  if (!match) return null;
  const { error } = await admin.storage
    .from("map-images")
    .upload(path, Buffer.from(match[2], "base64"), { contentType: match[1], upsert: true });
  if (error) {
    console.error("Falha ao salvar imagem:", error.message);
    return null;
  }
  return admin.storage.from("map-images").getPublicUrl(path).data.publicUrl;
}

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
  const { data: profile } = await admin.from("profiles").select("credits").eq("id", user.id).maybeSingle();
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
    const map = await generateMapContent({ topic, level, goal });
    const [cover, ...branches] = await Promise.all([
      generateIllustration(map.cover_prompt),
      ...map.branches.map((b) => generateIllustration(b.illustration_prompt)),
    ]);

    const id = crypto.randomUUID();
    const base = `${user.id}/${id}`;
    const [cover_image, ...branch_images] = await Promise.all([
      storeImage(admin, `${base}/cover.png`, cover),
      ...branches.map((img, i) => storeImage(admin, `${base}/${i}.png`, img)),
    ]);

    const result: MapWithImages = { ...map, cover_image, branch_images };
    const { error } = await admin.from("generated_maps").insert({
      id,
      user_id: user.id,
      topic,
      level,
      title_pt: map.title_pt,
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
