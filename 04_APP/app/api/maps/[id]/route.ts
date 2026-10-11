import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supa/server";

export const dynamic = "force-dynamic";

// Ilustrações de um mapa (o mapa abre antes e consulta aqui até elas ficarem prontas).
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { data } = await createSupabaseServer().from("generated_maps").select("data").eq("id", params.id).maybeSingle();
  if (!data) return NextResponse.json({ error: "não encontrado" }, { status: 404 });
  const m = data.data as { cover_image: string | null; branch_images: (string | null)[]; pending?: number[] };
  return NextResponse.json({ cover_image: m.cover_image, branch_images: m.branch_images, pending: m.pending ?? [] });
}
