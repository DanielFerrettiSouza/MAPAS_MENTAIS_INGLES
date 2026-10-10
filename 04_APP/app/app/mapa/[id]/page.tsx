import Link from "next/link";
import { notFound } from "next/navigation";
import MindMapView from "@/components/MindMapView";
import InkMapView from "@/components/InkMapView";
import ReviewQuiz from "@/components/ReviewQuiz";
import { createSupabaseServer, getCurrentUser, getProfile } from "@/lib/supa/server";
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
  const user = await getCurrentUser();
  const profile = user ? await getProfile(user.id) : null;
  const outOfFree = profile?.plan === "free" && profile.credits <= 0;

  return (
    <>
      <Link href="/app" className="back-link">← Voltar ao início</Link>
      <div style={{ height: 16 }} />
      {outOfFree && (
        <div className="out-banner">
          <p>🎉 Você usou seus 3 mapas grátis. Quer continuar criando?</p>
          <Link href="/app/planos" className="primary-btn grad-btn">Ver oferta →</Link>
        </div>
      )}
      {map.style === "ink" ? <InkMapView map={map} /> : <MindMapView map={map} />}
      {map.quiz?.length > 0 && <ReviewQuiz quiz={map.quiz} />}
    </>
  );
}
