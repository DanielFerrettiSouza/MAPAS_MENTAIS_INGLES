import Link from "next/link";
import { redirect } from "next/navigation";
import { IconCrown, IconRepeat } from "@/components/Icons";
import QuickCreate from "@/components/QuickCreate";
import QuizPlan from "@/components/QuizPlan";
import type { QuizAnswers } from "@/lib/quizPlan";
import MapGrid, { type MapRow } from "@/components/MapGrid";
import { createSupabaseServer, getCurrentUser, getProfile } from "@/lib/supa/server";
import { planName } from "@/lib/plans";

export const dynamic = "force-dynamic";

export default async function Dashboard({ searchParams }: { searchParams: Record<string, string> }) {
  // Links antigos (/app?topic=... ou ?criar=1) vão para a página de criar.
  if (searchParams.topic || searchParams.criar) redirect(`/app/criar?${new URLSearchParams(searchParams)}`);
  const user = (await getCurrentUser())!;
  const profile = await getProfile(user.id);
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
        <span className="credit-pill">Plano <b>{planName(profile?.plan ?? "free")}</b></span>
        <span className="credit-pill"><b>{credits}</b> {credits === 1 ? "mapa restante" : "mapas restantes"}</span>
      </div>

      <h1 className="app-hello">
        Olá, <span className="grad-text">{name}</span>! O que vamos aprender hoje?
      </h1>
      <p className="app-sub">Crie um mapa novo, revise os que já fez ou veja seu plano.</p>

      <div className="quick-actions">
        <QuickCreate credits={credits} />
        <Link href="/app/mapas" className="qa purple"><IconRepeat /> Revisar meus mapas</Link>
        <Link href="/app/planos" className="qa green"><IconCrown /> Planos</Link>
      </div>

      <QuizPlan saved={user.user_metadata?.quiz as QuizAnswers | undefined} credits={credits} />

      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: 40 }}>
        <h2 style={{ margin: 0 }}>Mapas recentes</h2>
        {maps && maps.length > 0 && <Link href="/app/mapas" className="back-link">Ver todos →</Link>}
      </div>
      <MapGrid maps={(maps ?? []) as MapRow[]} />
    </>
  );
}
