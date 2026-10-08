import Link from "next/link";
import { notFound } from "next/navigation";
import MindMapView from "@/components/MindMapView";
import ReviewQuiz from "@/components/ReviewQuiz";
import { createSupabaseServer } from "@/lib/supa/server";
import type { MapWithImages } from "@/lib/mapSchema";

export const dynamic = "force-dynamic";

export default async function MapPage({ params }: { params: { id: string } }) {
  const { data } = await createSupabaseServer()
    .from("generated_maps")
    .select("data")
    .eq("id", params.id)
    .maybeSingle();
  if (!data) notFound();
  const map = data.data as MapWithImages;

  return (
    <>
      <Link href="/app" className="back-link">← Voltar ao início</Link>
      <div style={{ height: 16 }} />
      <MindMapView map={map} />
      {map.quiz?.length > 0 && <ReviewQuiz quiz={map.quiz} />}
    </>
  );
}
