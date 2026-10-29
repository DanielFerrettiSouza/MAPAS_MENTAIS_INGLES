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
    admin.from("study_progress").select("slug, done_at").eq("user_id", user.id),
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
  const pct = total ? Math.round((doneCount / total) * 100) : 0;
  // Semana atual do plano = primeira com mapa por fazer.
  const current = weeks.findIndex((w) => w.some((t) => !done.has(t.slug)));
  const byLevel = fromLevel.map((l) => {
    const t = ordered.filter((c) => c.level === l);
    return { level: l, total: t.length, done: t.filter((c) => done.has(c.slug)).length };
  });
  // Mapas concluídos em cada uma das últimas 8 semanas (pela data em que marcou como feito).
  const WEEK = 7 * 24 * 3600 * 1000;
  const now = Date.now();
  const history = Array.from({ length: 8 }, (_, i) => {
    const end = now - (7 - i) * WEEK;
    return (progress ?? []).filter((p) => { const d = new Date(p.done_at).getTime(); return d > end - WEEK && d <= end; }).length;
  });
  const maxH = Math.max(3, ...history);
  const R = 52, C = 2 * Math.PI * R;

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
      <p className="admin-note">{tr(lang, "Nível de partida", "Nivel de partida")}: <b>{level}</b> · <Link href="/app/nivel">{tr(lang, "refazer teste de nível", "rehacer test de nivel")}</Link></p>
      <div className="plan-dash">
        <div className="plan-card plan-ring">
          <svg viewBox="0 0 120 120" width="120" height="120" aria-hidden>
            <defs><linearGradient id="pg" x1="0" x2="1"><stop offset="0" stopColor="#ff2d6f" /><stop offset="1" stopColor="#ff8a3d" /></linearGradient></defs>
            <circle cx="60" cy="60" r={R} fill="none" stroke="var(--border)" strokeWidth="10" />
            <circle cx="60" cy="60" r={R} fill="none" stroke="url(#pg)" strokeWidth="10" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - pct / 100)} transform="rotate(-90 60 60)" />
            <text x="60" y="58" textAnchor="middle" fontSize="24" fontWeight="700" fill="var(--text)">{pct}%</text>
            <text x="60" y="78" textAnchor="middle" fontSize="11" fill="var(--muted)">{doneCount}/{total} {tr(lang, "mapas", "mapas")}</text>
          </svg>
          <div>
            <strong>{tr(lang, "Seu progresso", "Tu progreso")}</strong>
            <p>{current >= 0 ? <>{tr(lang, "Você está na", "Estás en la")} <b>{tr(lang, "Semana", "Semana")} {current + 1}</b></> : tr(lang, "Plano concluído! 🎉", "¡Plan completado! 🎉")}</p>
            <p>{tr(lang, "Esta semana", "Esta semana")}: <b>{history[7]}</b> {tr(lang, "mapas feitos", "mapas hechos")}</p>
          </div>
        </div>
        <div className="plan-card">
          <strong>{tr(lang, "Por nível", "Por nivel")}</strong>
          <div className="plan-levels">
            {byLevel.map((l) => (
              <div key={l.level} className="plan-level">
                <span>{l.level}</span>
                <div className="plan-bar"><div style={{ width: `${l.total ? (l.done / l.total) * 100 : 0}%` }} /></div>
                <small>{l.done}/{l.total}</small>
              </div>
            ))}
          </div>
        </div>
        <div className="plan-card">
          <strong>{tr(lang, "Mapas por semana", "Mapas por semana")}</strong>
          <div className="plan-chart">
            {history.map((n, i) => (
              <div key={i} title={`${n}`}>
                <em>{n || ""}</em>
                <i style={{ height: `${(n / maxH) * 100}%` }} className={i === 7 ? "on" : ""} />
                <small>{i === 7 ? tr(lang, "agora", "ahora") : `-${7 - i}`}</small>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="plan-weeks">
        {weeks.map((w, i) => (
          <div key={i} className={`plan-week ${i === current ? "plan-week-on" : ""} ${w.every((t) => done.has(t.slug)) ? "plan-week-done" : ""}`}>
            <strong>{tr(lang, "Semana", "Semana")} {i + 1}{i === current ? <em className="plan-tag">{tr(lang, "agora", "ahora")}</em> : null}</strong>
            <div className="plan-bar"><div style={{ width: `${(w.filter((t) => done.has(t.slug)).length / w.length) * 100}%` }} /></div>
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
