import Link from "next/link";
import { notFound } from "next/navigation";
import { getMapById, getAudioForMap } from "@/lib/supabase";
import { SUPPORTED_LOCALES } from "@/lib/supabase";
import AudioRow from "./AudioRow";

export const revalidate = 0;

export default async function MapPage({
  params,
}: {
  params: { locale: string; id: string };
}) {
  if (!(SUPPORTED_LOCALES as readonly string[]).includes(params.locale)) notFound();
  const map = await getMapById(params.id);
  if (!map) notFound();

  const audios = await getAudioForMap(map.id);

  return (
    <main className="container">
      <Link href={`/${params.locale}/level/${map.level}`} className="back-link">
        ← {map.level}
      </Link>
      <h1>{map.topic}</h1>

      {map.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={map.image_url} alt={map.topic} className="map-image" />
      )}

      <h3>🔊 Ascolta la pronuncia</h3>
      {audios.map((a) => (
        <AudioRow key={a.id} text={a.text} audioUrl={a.audio_url} />
      ))}

      {audios.length === 0 && (
        <p style={{ color: "var(--muted)" }}>
          Audio non ancora disponibile per questa mappa.
        </p>
      )}
    </main>
  );
}
