import { NextResponse } from "next/server";
import { createSupabaseAdmin, getCurrentUser } from "@/lib/supa/server";

export const runtime = "nodejs";

// Marca/desmarca um tema da biblioteca como estudado.
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Faça login." }, { status: 401 });
  const { slug, done } = await req.json().catch(() => ({}));
  if (!slug) return NextResponse.json({ error: "slug obrigatório" }, { status: 400 });
  const admin = createSupabaseAdmin();
  if (done) await admin.from("study_progress").upsert({ user_id: user.id, slug: String(slug) });
  else await admin.from("study_progress").delete().eq("user_id", user.id).eq("slug", String(slug));
  return NextResponse.json({ ok: true });
}
