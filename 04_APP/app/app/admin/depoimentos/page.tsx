import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseAdmin, getCurrentUser } from "@/lib/supa/server";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

type Depo = { id: string; name: string; email: string; city: string; text: string; stars: number; photo: string | null; created_at: string };

// Depoimentos recebidos em /depoimento (guardados no Storage em depoimentos/<id>.json).
export default async function DepoimentosAdmin() {
  const user = await getCurrentUser();
  if (!isAdmin(user?.email)) redirect("/app");
  const store = createSupabaseAdmin().storage.from("map-images");
  const { data: files } = await store.list("depoimentos", { limit: 1000, sortBy: { column: "name", order: "desc" } });
  const depos = (
    await Promise.all(
      (files ?? [])
        .filter((f) => f.name.endsWith(".json"))
        .map(async (f) => {
          const { data } = await store.download(`depoimentos/${f.name}`);
          return data ? (JSON.parse(await data.text()) as Depo) : null;
        })
    )
  ).filter((d): d is Depo => !!d);

  return (
    <>
      <Link href="/app/admin" className="back-link">← Voltar ao painel</Link>
      <h1 className="app-hello">Depoimentos <span className="grad-text">({depos.length})</span></h1>
      <p className="app-sub">Todos autorizaram o uso no site e em anúncios, informando que receberam 5 mapas de presente.</p>
      {depos.length === 0 && <p className="app-sub">Nenhum depoimento ainda.</p>}
      {depos.map((d) => (
        <div key={d.id} className="lt-card" style={{ maxWidth: 720, marginTop: 16, display: "flex", gap: 16 }}>
          {d.photo && (
            // eslint-disable-next-line @next/next/no-img-element
            <a href={store.getPublicUrl(d.photo).data.publicUrl} target="_blank" rel="noopener"><img src={store.getPublicUrl(d.photo).data.publicUrl} alt="" style={{ width: 96, height: 96, objectFit: "cover", borderRadius: 12 }} /></a>
          )}
          <div>
            <div style={{ color: "#ffb020" }}>{"★".repeat(d.stars)}{"☆".repeat(5 - d.stars)}</div>
            <p style={{ margin: "8px 0" }}>{d.text}</p>
            <small className="app-sub">{d.name}{d.city ? ` · ${d.city}` : ""} · {d.email} · {new Date(d.created_at).toLocaleDateString("pt-BR")}</small>
          </div>
        </div>
      ))}
    </>
  );
}
