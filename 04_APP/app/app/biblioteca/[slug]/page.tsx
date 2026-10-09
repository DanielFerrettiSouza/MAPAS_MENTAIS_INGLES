import Link from "next/link";
import { notFound } from "next/navigation";
import MindMapView from "@/components/MindMapView";
import ReviewQuiz from "@/components/ReviewQuiz";
import StudyToggle from "@/components/StudyToggle";
import LibraryLocked from "@/components/LibraryLocked";
import { createSupabaseAdmin, getCurrentUser, getProfile } from "@/lib/supa/server";
import { canUseLibrary } from "@/lib/library";
import type { MapWithImages } from "@/lib/mapSchema";

export const dynamic = "force-dynamic";

export default async function LibraryMapPage({ params }: { params: { slug: string } }) {
  const user = (await getCurrentUser())!;
  const profile = await getProfile(user.id);
  if (!canUseLibrary(profile?.plan, user.email)) return <LibraryLocked what="A Biblioteca" />;

  const admin = createSupabaseAdmin();
  const [{ data }, { data: prog }] = await Promise.all([
    admin.from("library_maps").select("level, data").eq("slug", params.slug).maybeSingle(),
    admin.from("study_progress").select("slug").eq("user_id", user.id).eq("slug", params.slug).maybeSingle(),
  ]);
  if (!data) notFound();
  const map = data.data as MapWithImages;

  return (
    <>
      <Link href={`/app/biblioteca?nivel=${data.level}`} className="back-link">← Voltar à biblioteca</Link>
      <div style={{ height: 16 }} />
      <MindMapView map={map} />
      <div style={{ marginTop: 12 }}><StudyToggle slug={params.slug} done={!!prog} /></div>
      {map.quiz?.length > 0 && <ReviewQuiz quiz={map.quiz} />}
    </>
  );
}
