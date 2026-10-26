import Link from "next/link";
import { redirect } from "next/navigation";
import { IconCalendar, IconCrown, IconRepeat } from "@/components/Icons";
import QuickCreate from "@/components/QuickCreate";
import QuizPlan from "@/components/QuizPlan";
import OfferCard from "@/components/OfferCard";
import type { QuizAnswers } from "@/lib/quizPlan";
import MapGrid, { type MapRow } from "@/components/MapGrid";
import { createSupabaseServer, getCurrentUser, getProfile } from "@/lib/supa/server";
import { planName } from "@/lib/plans";
import { canUseLibrary } from "@/lib/library";
import { getLang, tr } from "@/lib/lang";

export const dynamic = "force-dynamic";

export default async function Dashboard({ searchParams }: { searchParams: Record<string, string> }) {
  // Links antigos (/app?topic=... ou ?criar=1) vão para a página de criar.
  if (searchParams.topic || searchParams.criar) redirect(`/app/criar?${new URLSearchParams(searchParams)}`);
  const user = (await getCurrentUser())!;
  const profile = await getProfile(user.id);
  // Quem tem o Método (biblioteca) não é tratado como plano grátis.
  const metodo = canUseLibrary(profile?.plan, user);
  const lang = getLang(user);
  const es = lang === "es";
  // Acabaram os mapas grátis: vai direto para a oferta.
  if (!es && (profile?.plan ?? "free") === "free" && !metodo && (profile?.credits ?? 0) <= 0) redirect("/app/planos");
  const { data: maps } = await createSupabaseServer()
    .from("generated_maps")
    .select("id, title_pt, topic, level, created_at, data")
    .order("created_at", { ascending: false })
    .limit(6);

  const name = profile?.name || user.email?.split("@")[0];
  const credits = profile?.credits ?? 0;

  return (
    <>
      <div className="app-top">
        {es ? (metodo && <span className="credit-pill"><b>Método</b> · acceso de por vida</span>) : <span className="credit-pill">Plano <b>{planName(profile?.plan ?? "free")}</b></span>}
        <span className="credit-pill"><b>{credits}</b> {es ? (credits === 1 ? "mapa con IA restante" : "mapas con IA restantes") : credits === 1 ? "mapa restante" : "mapas restantes"}</span>
      </div>

      <h1 className="app-hello">
        {tr(lang, "Olá", "Hola")}, <span className="grad-text">{name}</span>! {tr(lang, "O que vamos aprender hoje?", "¿Qué vamos a aprender hoy?")}
      </h1>
      <p className="app-sub">{tr(lang, "Crie um mapa novo, revise os que já fez ou veja seu plano.", "Crea un mapa nuevo, repasa los que ya hiciste o mira tu plan.")}</p>

      {metodo && !user.user_metadata?.level_test && (
        <Link href="/app/nivel" className="lt-banner lt-hero">
          <span>🧭</span>
          <div><b>{tr(lang, "Primeiro passo: descubra seu nível", "Primer paso: descubre tu nivel")}</b><small>{tr(lang, "12 perguntas, 3 minutos. Seu plano de estudos começa no ponto certo.", "12 preguntas, 3 minutos. Tu plan de estudio empieza en el punto correcto.")}</small></div>
          <em>{tr(lang, "Fazer o teste →", "Hacer el test →")}</em>
        </Link>
      )}

      <div className="quick-actions">
        <QuickCreate credits={credits} lang={lang} />
        <Link href="/app/mapas" className="qa purple"><IconRepeat /> {tr(lang, "Revisar meus mapas", "Repasar mis mapas")}</Link>
        {es ? (
          <Link href="/app/biblioteca" className="qa orange"><IconCalendar /> Biblioteca</Link>
        ) : (<>
          <Link href="/app/mapa-do-dia" className="qa orange"><IconCalendar /> Mapa do dia</Link>
          <Link href="/app/planos" className="qa green"><IconCrown /> Planos</Link>
        </>)}
      </div>

      {!es && (profile?.plan ?? "free") === "free" && !metodo && <OfferCard email={user.email} credits={credits} />}

      {!es && <QuizPlan saved={user.user_metadata?.quiz as QuizAnswers | undefined} credits={credits} />}

      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: 40 }}>
        <h2 style={{ margin: 0 }}>{tr(lang, "Mapas recentes", "Mapas recientes")}</h2>
        {maps && maps.length > 0 && <Link href="/app/mapas" className="back-link">{tr(lang, "Ver todos →", "Ver todos →")}</Link>}
      </div>
      <MapGrid maps={(maps ?? []) as MapRow[]} lang={lang} />
    </>
  );
}
