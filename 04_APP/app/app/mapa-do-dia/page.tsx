import { createSupabaseAdmin } from "@/lib/supa/server";

export const dynamic = "force-dynamic";

type Post = { id: string; date: string; title: string; slides: string[] };

// Mapa do dia: os carrosséis diários do Instagram, publicados por scripts/sync-posts.mjs.
export default async function MapaDoDiaPage() {
  const { data } = await createSupabaseAdmin().storage.from("map-images").download("posts/index.json");
  const posts: Post[] = data ? JSON.parse(await data.text()) : [];
  const fmt = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });

  return (
    <>
      <h1 className="app-hello">Mapa <span className="grad-text">do dia</span></h1>
      <p className="app-sub">Um mapa novo por dia, para revisar em 2 minutos. Arraste para o lado para ver todas as partes.</p>
      {posts.length === 0 && <p className="app-sub">Em breve.</p>}
      {posts.map((p) => (
        <section key={p.id} style={{ marginTop: 28 }}>
          <h2 style={{ margin: "0 0 10px", fontSize: 20 }}>
            {p.title} <small className="app-sub" style={{ fontSize: 14, fontWeight: 400 }}>· {fmt(p.date)}</small>
          </h2>
          <a href={`/imprimir/mapa-do-dia/${p.id}`} target="_blank" rel="noopener" className="ghost-btn print-link" style={{ display: "inline-block", marginBottom: 10 }}>🖨️ Imprimir</a>
          <div className="mdd-strip">
            {p.slides.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={src} src={src} alt={`${p.title} — parte ${i + 1}`} loading="lazy" />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
