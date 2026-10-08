import { Suspense } from "react";
import Link from "next/link";
import Generator from "@/components/Generator";
import { createSupabaseServer, getCurrentUser, getProfile } from "@/lib/supa/server";
import { planName } from "@/lib/plans";

export const dynamic = "force-dynamic";

type MapRow = { id: string; title_pt: string; topic: string; level: string; created_at: string; data: { branch_images?: (string | null)[]; cover_image?: string | null } };

export default async function Dashboard() {
  const user = (await getCurrentUser())!;
  const profile = await getProfile(user.id);
  const { data: maps } = await createSupabaseServer()
    .from("generated_maps")
    .select("id, title_pt, topic, level, created_at, data")
    .order("created_at", { ascending: false })
    .limit(60);

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
      <p className="app-sub">Digite qualquer assunto e receba um mapa mental ilustrado com áudio nativo.</p>

      <Suspense>
        <Generator credits={credits} />
      </Suspense>

      <h2 id="meus-mapas" style={{ marginTop: 40, marginBottom: 0 }}>Meus mapas</h2>
      {maps && maps.length > 0 ? (
        <div className="map-grid">
          {(maps as MapRow[]).map((m) => {
            const thumb = m.data?.cover_image ?? m.data?.branch_images?.find(Boolean);
            return (
              <Link key={m.id} href={`/app/mapa/${m.id}`} className="map-card">
                {thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumb} alt="" />
                ) : (
                  <span style={{ fontSize: 40 }}>🗺️</span>
                )}
                <strong>{m.title_pt}</strong>
                <small>{m.level} · {new Date(m.created_at).toLocaleDateString("pt-BR")}</small>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="empty-box">
          <strong>Nenhum mapa ainda</strong>
          Crie seu primeiro mapa usando os temas sugeridos ou com uma ideia sua.
        </div>
      )}
    </>
  );
}
