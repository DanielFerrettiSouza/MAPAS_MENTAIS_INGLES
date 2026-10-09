import Link from "next/link";
import { createSupabaseAdmin, getCurrentUser, getProfile } from "@/lib/supa/server";
import { canUseLibrary } from "@/lib/library";
import { CURRICULUM, GOALS, goalTag } from "@/lib/curriculum";
import LibraryLocked from "@/components/LibraryLocked";

export const dynamic = "force-dynamic";
const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
const PER_WEEK = 3;

// Plano de estudos: temas da biblioteca a partir do nível da pessoa, com os do
// objetivo dela primeiro, divididos em semanas de 3 mapas. Sem custo de IA.
export default async function StudyPlanPage({ searchParams }: { searchParams: { objetivo?: string } }) {
  const user = (await getCurrentUser())!;
  const profile = await getProfile(user.id);
  const header = (
    <>
      <h1 className="app-hello">Meu <span className="grad-text">plano de estudos</span></h1>
      <p className="app-sub">3 mapas por semana, do seu nível em diante, priorizando o seu objetivo.</p>
    </>
  );
  if (!canUseLibrary(profile?.plan, user.email)) return <>{header}<LibraryLocked what="O plano de estudos" /></>;

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
      <div className="chips" style={{ marginTop: 16 }}>
        {GOALS.map((g) => (
          <Link key={g.tag} href={`/app/plano?objetivo=${g.tag}`} className={`chip ${g.tag === goal ? "chip-on" : ""}`}>{g.emoji} {g.label}</Link>
        ))}
      </div>
      <p className="admin-note">Nível de partida: <b>{level}</b> (mude em Configurações). Progresso: {doneCount}/{total} mapas.</p>
      <div className="plan-weeks">
        {weeks.map((w, i) => (
          <div key={i} className="plan-week">
            <strong>Semana {i + 1}</strong>
            <ul>
              {w.map((t) => (
                <li key={t.slug}>
                  {have.has(t.slug) ? (
                    <Link href={`/app/biblioteca/${t.slug}`}>{done.has(t.slug) ? "✅" : "⬜"} {t.topic}</Link>
                  ) : (
                    <span style={{ opacity: 0.5 }}>⏳ {t.topic}</span>
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
