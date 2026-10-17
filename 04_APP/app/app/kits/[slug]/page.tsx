import Link from "next/link";
import { notFound } from "next/navigation";
import MindMapView from "@/components/MindMapView";
import ReviewQuiz from "@/components/ReviewQuiz";
import { createSupabaseAdmin, getCurrentUser, getProfile } from "@/lib/supa/server";
import { isAdmin } from "@/lib/admin";
import { userKits } from "@/lib/kits";
import type { MapWithImages } from "@/lib/mapSchema";
import { canTeach } from "@/lib/teacher";

export const dynamic = "force-dynamic";

export default async function KitMapPage({ params }: { params: { slug: string } }) {
  const kit = params.slug.match(/^kit-([a-z]+)-\d+$/)?.[1];
  if (!kit) notFound();
  const user = (await getCurrentUser())!;
  const profile = await getProfile(user.id);
  if (!userKits(user, profile?.plan).includes(kit) && !isAdmin(user.email)) notFound();
  const { data } = await createSupabaseAdmin().from("library_maps").select("data").eq("slug", params.slug).maybeSingle();
  if (!data) notFound();
  const map = data.data as MapWithImages;
  return (
    <>
      <Link href="/app/kits" className="back-link">← Voltar aos kits</Link>
      {canTeach(profile?.plan, user.email) && <a href={`/imprimir/biblioteca/${params.slug}`} className="ghost-btn print-link" target="_blank" rel="noopener">🖨️ Imprimir para a turma</a>}
      <div style={{ height: 16 }} />
      <MindMapView map={map} />
      {map.quiz?.length > 0 && <ReviewQuiz quiz={map.quiz} />}
    </>
  );
}
