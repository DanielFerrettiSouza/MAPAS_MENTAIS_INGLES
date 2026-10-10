import Link from "next/link";
import { createSupabaseAdmin, getCurrentUser, getProfile } from "@/lib/supa/server";
import { canUseLibrary, FREE_LIBRARY_SLUGS } from "@/lib/library";
import { CURRICULUM } from "@/lib/curriculum";
import LibraryLocked from "@/components/LibraryLocked";

export const dynamic = "force-dynamic";
const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

export default async function LibraryPage({ searchParams }: { searchParams: { nivel?: string } }) {
  const user = (await getCurrentUser())!;
  const profile = await getProfile(user.id);
  const header = (
    <>
      <h1 className="app-hello">Biblioteca <span className="grad-text">A1–C2</span></h1>
      <p className="app-sub">Mapas prontos por nível. Estudar aqui não gasta seus créditos.</p>
    </>
  );
  const unlocked = canUseLibrary(profile?.plan, user);

  // Sem acesso: mostra a amostra grátis (A1) e a oferta.
  const level = !unlocked ? "A1" : LEVELS.includes(searchParams.nivel ?? "") ? searchParams.nivel! : ((user.user_metadata?.level as string) ?? "A1");
  const admin = createSupabaseAdmin();
  const [{ data: maps }, { data: progress }] = await Promise.all([
    admin.from("library_maps").select("slug, title_pt, data->cover_image, data->emoji").eq("level", level),
    admin.from("study_progress").select("slug").eq("user_id", user.id),
  ]);
  const ready = new Map((maps ?? []).map((m) => [m.slug as string, m as { slug: string; title_pt: string; cover_image: string | null; emoji: string | null }]));
  const done = new Set((progress ?? []).map((p) => p.slug));
  const topics = CURRICULUM.filter((t) => t.level === level);

  return (
    <>
      {header}
      {!unlocked && <LibraryLocked what="A Biblioteca completa" email={user.email} sample />}
      {unlocked && <div className="chips" style={{ marginTop: 16 }}>
        {LEVELS.map((l) => (
          <Link key={l} href={`/app/biblioteca?nivel=${l}`} className={`chip ${l === level ? "chip-on" : ""}`}>{l}</Link>
        ))}
      </div>}
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
              <strong>{done.has(t.slug) ? "✅ " : ""}{m?.title_pt ?? t.topic}</strong>
              <small>{m ? t.topic : "Em breve"}</small>
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
