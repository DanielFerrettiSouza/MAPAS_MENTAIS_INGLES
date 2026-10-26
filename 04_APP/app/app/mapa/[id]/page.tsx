import Link from "next/link";
import { notFound } from "next/navigation";
import MindMapView from "@/components/MindMapView";
import InkMapView from "@/components/InkMapView";
import ReviewQuiz from "@/components/ReviewQuiz";
import { createSupabaseServer, getCurrentUser, getProfile } from "@/lib/supa/server";
import type { MapWithImages } from "@/lib/mapSchema";
import { canTeach } from "@/lib/teacher";
import ClassLinkButton from "@/components/ClassLinkButton";
import { getLang, tr } from "@/lib/lang";

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
  const lang = getLang(user);
  const outOfFree = lang !== "es" && profile?.plan === "free" && profile.credits <= 0;

  return (
    <>
      <Link href="/app" className="back-link">{tr(lang, "← Voltar ao início", "← Volver al inicio")}</Link>
      {canTeach(profile?.plan, user?.email) && <a href={`/imprimir/meu/${params.id}`} className="ghost-btn print-link" target="_blank" rel="noopener">🖨️ Imprimir para a turma</a>}
      {canTeach(profile?.plan, user?.email) && <ClassLinkButton tipo="meu" id={params.id} />}
      <div style={{ height: 16 }} />
      {outOfFree && (
        <div className="out-banner">
          <p>🎉 Você usou seus 3 mapas grátis. Quer continuar criando?</p>
          <Link href="/app/planos" className="primary-btn grad-btn">Ver oferta →</Link>
        </div>
      )}
      {map.style === "ink" ? <InkMapView map={map} mapId={params.id} /> : <MindMapView map={map} lang={lang} />}
      {map.quiz?.length > 0 && <ReviewQuiz quiz={map.quiz} lang={lang} />}
    </>
  );
}
