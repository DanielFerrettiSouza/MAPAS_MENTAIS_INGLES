import Link from "next/link";
import { createSupabaseAdmin, getCurrentUser, getProfile } from "@/lib/supa/server";
import { canUseLibrary } from "@/lib/library";
import { CURRICULUM, GOALS, goalTag } from "@/lib/curriculum";
import LibraryLocked from "@/components/LibraryLocked";
import { getLang, tr } from "@/lib/lang";
import { GOAL_LABELS_ES } from "@/lib/levelTest";
import TITLES_ES from "@/data/es/titles.json";

export const dynamic = "force-dynamic";
const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
const PER_WEEK = 3;

// Plano de estudos: temas da biblioteca a partir do nível da pessoa, com os do
// objetivo dela primeiro, divididos em semanas de 3 mapas. Sem custo de IA.
export default async function StudyPlanPage({ searchParams }: { searchParams: { objetivo?: string } }) {
  const user = (await getCurrentUser())!;
  const profile = await getProfile(user.id);
  const lang = getLang(user);
  const es = lang === "es";
  const topic = (t: { slug: string; topic: string }) => (es ? (TITLES_ES as Record<string, string>)[t.slug] ?? t.topic : t.topic);
  const header = (
    <>
      <h1 className="app-hello">{tr(lang, "Meu", "Mi")} <span className="grad-text">{tr(lang, "plano de estudos", "plan de estudio")}</span></h1>
      <p className="app-sub">{tr(lang, "3 mapas por semana, do seu nível em diante, priorizando o seu objetivo.", "3 mapas por semana, desde tu nivel en adelante, priorizando tu objetivo.")}</p>
    </>
  );
  if (!canUseLibrary(profile?.plan, user)) return <>{header}<LibraryLocked what="O plano de estudos" email={user.email} /></>;

  const meta = (user.user_metadata ?? {}) as { level?: string; goal?: string };
  const level = LEVELS.includes(meta.level ?? "") ? meta.level! : "A1";
  const goal = GOALS.some((g) => g.tag === searchParams.objetivo) ? searchParams.objetivo! : goalTag(meta.goal);

  const admin = createSupabaseAdmin();
  const [{ data: ready }, { data: progress }] = await Promise.all([
    admin.from("library_maps").select("slug"),
    admin.from("study_progress").select("slug").eq("user_id", user.id),
  ]);
  const have = new Set((ready ?? []).map((r) => r.slug));
  const done = new Set((progress ?? []).map((p) => p.slug));

  const fromLevel = LEVELS.slice(LEVELS.indexOf(level));
  const ordered = fromLevel.flatMap((l) => {
    const t = CURRICULUM.filter((c) => c.level === l);
    return [...t.filter((c) => c.tags.includes(goal)), ...t.filter((c) => !c.tags.includes(goal))];
  });
  const weeks = Array.from({ length: Math.ceil(ordered.length / PER_WEEK) }, (_, i) => ordered.slice(i * PER_WEEK, i * PER_WEEK + PER_WEEK)).slice(0, 12);
  const total = ordered.length;
  const doneCount = ordered.filter((t) => done.has(t.slug)).length;

  return (
    <>
      {header}
      {!user.user_metadata?.level_test && (
        <Link href="/app/nivel" className="lt-banner">
          <span>🧭</span>
          <div><b>{tr(lang, "Comece pelo teste de nível", "Empieza con el test de nivel")}</b><small>{tr(lang, "3 minutos para o seu plano começar no ponto certo.", "3 minutos para que tu plan empiece en el punto correcto.")}</small></div>
          <em>{tr(lang, "Fazer agora →", "Hacerlo ahora →")}</em>
        </Link>
      )}
      <div className="chips" style={{ marginTop: 16 }}>
        {GOALS.map((g) => (
          <Link key={g.tag} href={`/app/plano?objetivo=${g.tag}`} className={`chip ${g.tag === goal ? "chip-on" : ""}`}>{g.emoji} {es ? GOAL_LABELS_ES[g.tag] : g.label}</Link>
        ))}
      </div>
      <p className="admin-note">{tr(lang, "Nível de partida", "Nivel de partida")}: <b>{level}</b> · <Link href="/app/nivel">{tr(lang, "refazer teste de nível", "rehacer test de nivel")}</Link>. {tr(lang, "Progresso", "Progreso")}: {doneCount}/{total} mapas.</p>
      <div className="plan-weeks">
        {weeks.map((w, i) => (
          <div key={i} className="plan-week">
            <strong>{tr(lang, "Semana", "Semana")} {i + 1}</strong>
            <ul>
              {w.map((t) => (
                <li key={t.slug}>
                  {have.has(t.slug) ? (
                    <Link href={`/app/biblioteca/${t.slug}?de=plano&objetivo=${goal}`}>{done.has(t.slug) ? "✅" : "⬜"} {topic(t)}</Link>
                  ) : (
                    <span style={{ opacity: 0.5 }}>⏳ {topic(t)}</span>
                  )}
                  <small> · {t.level}</small>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </>
  );
}
