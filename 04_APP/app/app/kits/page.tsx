import Link from "next/link";
import { createSupabaseAdmin, getCurrentUser } from "@/lib/supa/server";
import { isAdmin } from "@/lib/admin";
import { KITS, kitSlug, userKits } from "@/lib/kits";
import { checkoutUrl } from "@/lib/plans";

export const dynamic = "force-dynamic";

// Kits temáticos: 20 mapas prontos cada, liberados para quem comprou o kit.
export default async function KitsPage() {
  const user = (await getCurrentUser())!;
  const mine = userKits(user);
  const { data: maps } = await createSupabaseAdmin().from("library_maps").select("slug, title_pt, data->cover_image, data->emoji").like("slug", "kit-%");
  const ready = new Map((maps ?? []).map((m) => [m.slug as string, m as { slug: string; title_pt: string; cover_image: string | null; emoji: string | null }]));

  return (
    <>
      <h1 className="app-hello">Kits <span className="grad-text">temáticos</span></h1>
      <p className="app-sub">20 mapas prontos por tema, com áudio em todas as frases.</p>
      {KITS.map((k) => {
        const open = mine.includes(k.id) || isAdmin(user.email);
        const buy = checkoutUrl(`kit-${k.id}`, user.email);
        return (
          <section key={k.id} style={{ marginTop: 28 }}>
            <h2 style={{ margin: "0 0 4px" }}>{k.emoji} {k.name} {open ? "" : "🔒"}</h2>
            <p className="app-sub" style={{ margin: 0 }}>{k.text}</p>
            {!open && buy && <a href={buy} className="primary-btn grad-btn" style={{ display: "inline-block", marginTop: 12 }}>Liberar o {k.name} →</a>}
            <div className="map-grid">
              {k.topics.map(([topic, level], i) => {
                const slug = kitSlug(k.id, i);
                const m = ready.get(slug);
                const body = (
                  <>
                    {m?.cover_image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.cover_image} alt="" />
                    ) : (
                      <span style={{ fontSize: 40 }}>{m?.emoji ?? "⏳"}</span>
                    )}
                    <strong>{m?.title_pt ?? topic}</strong>
                    <small>{topic} · {level}</small>
                  </>
                );
                return open && m ? (
                  <Link key={slug} href={`/app/kits/${slug}`} className="map-card">{body}</Link>
                ) : (
                  <div key={slug} className="map-card" style={{ opacity: 0.5 }}>{body}</div>
                );
              })}
            </div>
          </section>
        );
      })}
    </>
  );
}
