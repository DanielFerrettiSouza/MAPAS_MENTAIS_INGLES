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
  if (!name || text.length < 10 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Preencha nome, e-mail e o depoimento." }, { status: 400 });
  }
  if (!consent) return NextResponse.json({ error: "Marque a autorização de uso." }, { status: 400 });

  const admin = createSupabaseAdmin();
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  let photo: string | null = null;
  const file = form.get("photo");
  if (file instanceof File && file.size > 0) {
    if (file.size > 5_000_000 || !/^image\/(jpeg|png|webp)$/.test(file.type)) {
      return NextResponse.json({ error: "Foto em JPG, PNG ou WEBP, até 5 MB." }, { status: 400 });
    }
    const ext = file.type.split("/")[1].replace("jpeg", "jpg");
    const path = `depoimentos/${id}.${ext}`;
    const { error } = await admin.storage.from("map-images").upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type });
    if (!error) photo = path;
  }
  const record = { id, name, email, city, text, stars, photo, consent, created_at: new Date().toISOString() };
  const { error } = await admin.storage.from("map-images").upload(`depoimentos/${id}.json`, JSON.stringify(record, null, 2), { contentType: "application/json" });
  if (error) return NextResponse.json({ error: "Não foi possível salvar. Tente de novo." }, { status: 500 });
  await trackKlaviyo(email, "MF Depoimento", { stars, text: text.slice(0, 200) });
  return NextResponse.json({ ok: true });
}
