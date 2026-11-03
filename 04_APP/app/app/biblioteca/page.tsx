import Link from "next/link";
import { createSupabaseAdmin, getCurrentUser, getProfile } from "@/lib/supa/server";
import { canUseLibrary, FREE_LIBRARY_SLUGS } from "@/lib/library";
import { CURRICULUM } from "@/lib/curriculum";
import LibraryLocked from "@/components/LibraryLocked";
import { bonusFor } from "@/lib/bonus";
import { getLang, tr } from "@/lib/lang";
import TITLES_ES from "@/data/es/titles.json";

export const dynamic = "force-dynamic";
const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

export default async function LibraryPage({ searchParams }: { searchParams: { nivel?: string; q?: string } }) {
  const user = (await getCurrentUser())!;
  const profile = await getProfile(user.id);
  const lang = getLang(user);
  const titleEs = (slug: string) => (TITLES_ES as Record<string, string>)[slug];
  const header = (
    <>
      <h1 className="app-hello">{tr(lang, "Biblioteca", "Biblioteca")} <span className="grad-text">A1–C2</span></h1>
      <p className="app-sub">{tr(lang, "Mapas prontos por nível. Estudar aqui não gasta seus créditos.", "Mapas listos por nivel. Estudiar aquí no gasta tus créditos.")}</p>
    </>
  );
  const unlocked = canUseLibrary(profile?.plan, user);

  // Sem acesso: mostra a amostra grátis (A1) e a oferta.
  const level = !unlocked ? "A1" : LEVELS.includes(searchParams.nivel ?? "") ? searchParams.nivel! : ((user.user_metadata?.level as string) ?? "A1");
  // Busca: procura em todos os níveis pelo nome em português, em inglês ou em espanhol (sem acento).
  const q = unlocked ? (searchParams.q ?? "").trim() : "";
  const norm = (v: string) => v.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const admin = createSupabaseAdmin();
  const mapsQuery = admin.from("library_maps").select("slug, title_pt, data->cover_image, data->emoji, data->title_en");
  const [{ data: maps }, { data: progress }] = await Promise.all([
    q ? mapsQuery : mapsQuery.eq("level", level),
    admin.from("study_progress").select("slug").eq("user_id", user.id),
  ]);
  const ready = new Map((maps ?? []).map((m) => [m.slug as string, m as { slug: string; title_pt: string; cover_image: string | null; emoji: string | null; title_en: string | null }]));
  const done = new Set((progress ?? []).map((p) => p.slug));
  const topics = q
    ? CURRICULUM.filter((t) => {
        const m = ready.get(t.slug);
        return norm([t.topic, m?.title_pt, m?.title_en, titleEs(t.slug)].filter(Boolean).join(" ")).includes(norm(q));
      })
    : CURRICULUM.filter((t) => t.level === level);

  return (
    <>
      {header}
      {unlocked && !user.user_metadata?.level_test && (
        <Link href="/app/nivel" className="lt-banner">
          <span>🧭</span>
          <div><b>{tr(lang, "Comece pelo teste de nível", "Empieza con el test de nivel")}</b><small>{tr(lang, "3 minutos para o seu plano começar no ponto certo.", "3 minutos para que tu plan empiece en el punto correcto.")}</small></div>
          <em>{tr(lang, "Fazer agora →", "Hacerlo ahora →")}</em>
        </Link>
      )}
      {!unlocked && <LibraryLocked what="A Biblioteca completa" email={user.email} sample />}
      {unlocked && (
        <form action="/app/biblioteca" className="lib-search">
          <span>🔍</span>
          <input name="q" type="search" defaultValue={q} placeholder={tr(lang, "Buscar mapa: present perfect, aeroporto, verbos…", "Buscar mapa: present perfect, aeropuerto, verbos…")} />
          {q && <Link href="/app/biblioteca">{tr(lang, "Limpar", "Borrar")}</Link>}
        </form>
      )}
      {unlocked && !q && <div className="chips" style={{ marginTop: 16 }}>
        {LEVELS.map((l) => (
          <Link key={l} href={`/app/biblioteca?nivel=${l}`} className={`chip ${l === level ? "chip-on" : ""}`}>{l}</Link>
        ))}
      </div>}
      {!q && <>
      <h2 style={{ margin: "28px 0 4px" }}>🎁 {tr(lang, "Bônus do método", "Bonos del método")}</h2>
      <div className="map-grid">
        {Object.entries(bonusFor(lang)).map(([k, b]) => (
          <Link key={k} href={`/app/biblioteca/bonus/${k}`} className="map-card">
            <span style={{ fontSize: 40 }}>{b.emoji}</span>
            <strong>{b.title}</strong>
            <small>{b.text}</small>
          </Link>
        ))}
      </div>
      </>}
      <h2 style={{ margin: "28px 0 4px" }}>
        {q ? `${tr(lang, "Resultados para", "Resultados para")} “${q}” (${topics.length})` : `${tr(lang, "Mapas do nível", "Mapas del nivel")} ${level}`}
      </h2>
      {q && !topics.length && <p className="app-sub">{tr(lang, "Nenhum mapa com esse nome. Tente outra palavra, em português ou em inglês.", "Ningún mapa con ese nombre. Prueba otra palabra, en español o en inglés.")}</p>}
      <div className="map-grid">
        {topics.map((t) => {
          const m = ready.get(t.slug);
          const body = (
            <>
              {m?.cover_image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.cover_image} alt="" />
              ) : (
                <span style={{ fontSize: 40 }}>{m?.emoji ?? "⏳"}</span>
              )}
              <strong>{done.has(t.slug) ? "✅ " : ""}{lang === "es" ? titleEs(t.slug) ?? t.topic : m?.title_pt ?? t.topic}</strong>
              <small>{q ? `${t.level} · ` : ""}{m ? (lang === "es" ? m.title_en ?? "" : m.title_en ?? t.topic) : tr(lang, "Em breve", "Próximamente")}</small>
            </>
          );
          const open = unlocked || FREE_LIBRARY_SLUGS.includes(t.slug);
          if (m && !open) return <div key={t.slug} className="map-card" style={{ opacity: 0.5 }}>{body}<small>🔒</small></div>;
          return m ? (
            <Link key={t.slug} href={`/app/biblioteca/${t.slug}`} className="map-card">{body}</Link>
          ) : (
            <div key={t.slug} className="map-card" style={{ opacity: 0.5 }}>{body}</div>
          );
        })}
      </div>
    </>
  );
}
