import Link from "next/link";
import { notFound } from "next/navigation";
import MindMapView from "@/components/MindMapView";
import ReviewQuiz from "@/components/ReviewQuiz";
import StudyToggle from "@/components/StudyToggle";
import LibraryLocked from "@/components/LibraryLocked";
import { createSupabaseAdmin, getCurrentUser, getProfile } from "@/lib/supa/server";
import { canUseLibrary, FREE_LIBRARY_SLUGS } from "@/lib/library";
import type { MapWithImages } from "@/lib/mapSchema";
import { canTeach } from "@/lib/teacher";
import { getLang, localizedMap, tr } from "@/lib/lang";
import ClassLinkButton from "@/components/ClassLinkButton";

export const dynamic = "force-dynamic";

export default async function LibraryMapPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { de?: string; objetivo?: string };
}) {
  // Mapas dos kits têm página própria (/app/kits), com acesso separado.
  if (params.slug.startsWith("kit-")) notFound();
  const user = (await getCurrentUser())!;
  const profile = await getProfile(user.id);
  const lang = getLang(user);
  if (!canUseLibrary(profile?.plan, user) && !FREE_LIBRARY_SLUGS.includes(params.slug)) return <LibraryLocked what="A Biblioteca" email={user.email} />;

  const admin = createSupabaseAdmin();
  const [{ data }, { data: prog }] = await Promise.all([
    admin.from("library_maps").select("level, data").eq("slug", params.slug).maybeSingle(),
    admin.from("study_progress").select("slug").eq("user_id", user.id).eq("slug", params.slug).maybeSingle(),
  ]);
  if (!data) notFound();
  const fromPlan = searchParams.de === "plano";
  const back = searchParams.de === "aula"
    ? { href: "/app/aulas", label: tr(lang, "← Voltar à aula pronta", "← Volver a la clase") }
    : fromPlan
    ? { href: `/app/plano${searchParams.objetivo ? `?objetivo=${encodeURIComponent(searchParams.objetivo)}` : ""}`, label: tr(lang, "← Voltar ao meu plano", "← Volver a mi plan") }
    : { href: `/app/biblioteca?nivel=${data.level}`, label: tr(lang, "← Voltar à biblioteca", "← Volver a la biblioteca") };
  const map = await localizedMap(params.slug, data.data as MapWithImages, lang);

  return (
    <>
      <Link href={back.href} className="back-link">{back.label}</Link>
      {canTeach(profile?.plan, user.email) && <a href={`/imprimir/biblioteca/${params.slug}`} className="ghost-btn print-link" target="_blank" rel="noopener">🖨️ Imprimir para a turma</a>}
      {canTeach(profile?.plan, user.email) && <ClassLinkButton tipo="biblioteca" id={params.slug} />}
      <div style={{ height: 16 }} />
      <MindMapView map={map} lang={lang} />
      <div style={{ marginTop: 12 }}><StudyToggle slug={params.slug} done={!!prog} lang={lang} /></div>
      {map.quiz?.length > 0 && <ReviewQuiz quiz={map.quiz} lang={lang} />}
    </>
  );
}
