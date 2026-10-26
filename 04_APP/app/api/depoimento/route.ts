import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supa/server";
import { trackKlaviyo } from "@/lib/klaviyo";

export const runtime = "nodejs";

// Recebe um depoimento (com autorização de uso) e guarda no Storage:
// depoimentos/<id>.json e, se houver, a foto depoimentos/<id>.jpg|png.
export async function POST(req: Request) {
  const form = await req.formData();
  const name = String(form.get("name") ?? "").trim().slice(0, 60);
  const email = String(form.get("email") ?? "").trim().toLowerCase().slice(0, 120);
  const city = String(form.get("city") ?? "").trim().slice(0, 60);
  const text = String(form.get("text") ?? "").trim().slice(0, 800);
  const stars = Math.min(5, Math.max(1, Number(form.get("stars")) || 5));
  const consent = form.get("consent") === "on";
  if (!name || text.length < 80 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Preencha nome, e-mail e um depoimento de pelo menos 80 caracteres." }, { status: 400 });
  }
  if (!consent) return NextResponse.json({ error: "Marque a autorização de uso." }, { status: 400 });

  const admin = createSupabaseAdmin();
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  let photo: string | null = null;
  const file = form.get("photo");
  // Foto é obrigatória: depoimento sem rosto não serve para o site nem para anúncios.
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Envie uma foto sua para concluir o depoimento." }, { status: 400 });
  }
  {
    if (file.size > 10_000_000 || !/^image\/(jpeg|png|webp|heic|heif)$/.test(file.type)) {
      return NextResponse.json({ error: "Foto em JPG, PNG, WEBP ou HEIC, até 10 MB." }, { status: 400 });
    }
    const ext = file.type.split("/")[1].replace("jpeg", "jpg");
    const path = `depoimentos/${id}.${ext}`;
    const { error } = await admin.storage.from("map-images").upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type });
    if (error) return NextResponse.json({ error: "Não foi possível salvar a foto. Tente de novo." }, { status: 500 });
    photo = path;
  }
  const record = { id, name, email, city, text, stars, photo, consent, created_at: new Date().toISOString() };
  const { error } = await admin.storage.from("map-images").upload(`depoimentos/${id}.json`, JSON.stringify(record, null, 2), { contentType: "application/json" });
  if (error) return NextResponse.json({ error: "Não foi possível salvar. Tente de novo." }, { status: 500 });
  await trackKlaviyo(email, "MF Depoimento", { stars, text: text.slice(0, 200) });

  // Presente: 5 mapas com IA, uma vez por conta. Sem conta ainda, fica pendente para o cadastro.
  let gift: "ok" | "ja" | "sem-conta" = "sem-conta";
  const { data: profile } = await admin.from("profiles").select("id, credits").ilike("email", email).maybeSingle();
  if (profile) {
    const { data: u } = await admin.auth.admin.getUserById(profile.id);
    gift = "ja";
    if (!u.user?.app_metadata?.depoimento_bonus) {
      await admin.from("profiles").update({ credits: (profile.credits ?? 0) + 5 }).eq("id", profile.id);
      await admin.auth.admin.updateUserById(profile.id, { app_metadata: { depoimento_bonus: true } });
      gift = "ok";
    }
  }
  return NextResponse.json({ ok: true, gift });
}
