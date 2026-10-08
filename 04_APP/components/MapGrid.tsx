import Link from "next/link";

export type MapRow = {
  id: string;
  title_pt: string;
  topic: string;
  level: string;
  created_at: string;
  data: { branch_images?: (string | null)[]; cover_image?: string | null };
};

export default function MapGrid({ maps }: { maps: MapRow[] }) {
  if (!maps.length) {
    return (
      <div className="empty-box">
        <strong>Nenhum mapa ainda</strong>
        Crie seu primeiro mapa usando os temas sugeridos ou com uma ideia sua.
      </div>
    );
  }
  return (
    <div className="map-grid">
      {maps.map((m) => {
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
  );
}
