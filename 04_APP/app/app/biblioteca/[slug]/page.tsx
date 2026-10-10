import Link from "next/link";
import { notFound } from "next/navigation";
import MindMapView from "@/components/MindMapView";
import ReviewQuiz from "@/components/ReviewQuiz";
import StudyToggle from "@/components/StudyToggle";
import LibraryLocked from "@/components/LibraryLocked";
import { createSupabaseAdmin, getCurrentUser, getProfile } from "@/lib/supa/server";
import { canUseLibrary, FREE_LIBRARY_SLUGS } from "@/lib/library";
import type { MapWithImages } from "@/lib/mapSchema";

export const dynamic = "force-dynamic";

export default async function LibraryMapPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { de?: string; objetivo?: string };
}) {
  const user = (await getCurrentUser())!;
  const profile = await getProfile(user.id);
  if (!canUseLibrary(profile?.plan, user) && !FREE_LIBRARY_SLUGS.includes(params.slug)) return <LibraryLocked what="A Biblioteca" email={user.email} />;

  const admin = createSupabaseAdmin();
  const [{ data }, { data: prog }] = await Promise.all([
    admin.from("library_maps").select("level, data").eq("slug", params.slug).maybeSingle(),
    admin.from("study_progress").select("slug").eq("user_id", user.id).eq("slug", params.slug).maybeSingle(),
  ]);
  if (!data) notFound();
  // Abrir o mapa já conta como estudado (dá para desmarcar no botão).
  if (!prog) await admin.from("study_progress").upsert({ user_id: user.id, slug: params.slug });
  const fromPlan = searchParams.de === "plano";
  const back = fromPlan
    ? { href: `/app/plano${searchParams.objetivo ? `?objetivo=${encodeURIComponent(searchParams.objetivo)}` : ""}`, label: "← Voltar ao meu plano" }
    : { href: `/app/biblioteca?nivel=${data.level}`, label: "← Voltar à biblioteca" };
  const map = data.data as MapWithImages;

  return (
    <>
      <Link href={back.href} className="back-link">{back.label}</Link>
      <div style={{ height: 16 }} />
      <MindMapView map={map} />
      <div style={{ marginTop: 12 }}><StudyToggle slug={params.slug} done /></div>
      {map.quiz?.length > 0 && <ReviewQuiz quiz={map.quiz} />}
    </>
  );
}
