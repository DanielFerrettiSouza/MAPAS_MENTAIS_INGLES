import Link from "next/link";
import { getMapsByLevel, type Level } from "@/lib/supabase";

export const revalidate = 0;

export default async function LevelPage({
  params,
}: {
  params: { locale: string; level: string };
}) {
  const level = params.level.toUpperCase() as Level;
  const maps = await getMapsByLevel(params.locale, level);

  return (
    <main className="container">
      <Link href={`/${params.locale}`} className="back-link">
        ← Tutti i livelli
      </Link>
      <h1>{level}</h1>
      <p style={{ color: "var(--muted)" }}>{maps.length} mappe in questo livello</p>

      {maps.map((m) => (
        <Link key={m.id} href={`/${params.locale}/map/${m.id}`} className="map-list-item">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={m.image_url ?? ""} alt={m.topic} />
          <span>{m.topic}</span>
        </Link>
      ))}

      {maps.length === 0 && (
        <p style={{ color: "var(--muted)" }}>
          Nessuna mappa ancora caricata per questo livello.
        </p>
      )}
    </main>
  );
}
