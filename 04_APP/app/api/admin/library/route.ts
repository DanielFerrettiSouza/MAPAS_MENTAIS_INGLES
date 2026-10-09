import { NextResponse } from "next/server";
import { buildMap } from "@/lib/buildMap";
import { CURRICULUM } from "@/lib/curriculum";
import { isAdmin } from "@/lib/admin";
import { createSupabaseAdmin, getCurrentUser } from "@/lib/supa/server";

export const runtime = "nodejs";
export const maxDuration = 60;

// Gera o PRÓXIMO tema da biblioteca que ainda não existe (1 por chamada, para
// caber no limite de tempo). O botão do /app/admin chama em sequência.
export async function POST() {
  const user = await getCurrentUser();
  if (!isAdmin(user?.email)) return NextResponse.json({ error: "Sem permissão." }, { status: 403 });

  const admin = createSupabaseAdmin();
  const { data: done, error } = await admin.from("library_maps").select("slug");
  if (error) return NextResponse.json({ error: `Rode o schema_app_v3.sql no Supabase. (${error.message})` }, { status: 500 });
  const have = new Set((done ?? []).map((d) => d.slug));
  const next = CURRICULUM.find((t) => !have.has(t.slug));
  if (!next) return NextResponse.json({ done: true, total: CURRICULUM.length, ready: have.size });

  try {
    const map = await buildMap(admin, { topic: next.topic, level: next.level, illustrate: true, imagePath: `library/${next.slug}` });
    const { error: insErr } = await admin.from("library_maps").upsert({
      slug: next.slug, level: next.level, topic: next.topic, title_pt: map.title_pt, data: map,
    });
    if (insErr) throw new Error(insErr.message);
    return NextResponse.json({ done: false, created: next.topic, total: CURRICULUM.length, ready: have.size + 1 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao gerar.";
    return NextResponse.json({ error: `${next.topic}: ${message}` }, { status: 500 });
  }
}
