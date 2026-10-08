import type { MiniMap } from "@/lib/miniMaps";

const COLORS = ["#16a34a", "#e11d48", "#ea580c", "#2563eb"];

// Página de caderno em miniatura (versão estática para as animações da landing).
export default function MiniMapCard({ m }: { m: MiniMap }) {
  return (
    <div className="mini-page">
      <div className="mini-head">
        <strong>≈ {m.title} ≈</strong>
        <span className="mini-badge">{m.level}</span>
      </div>
      <div className="mini-center">
        <span>{m.emoji}</span>
        <em>{m.title_en}</em>
      </div>
      <div className="mini-grid">
        {m.sections.map((s, i) => (
          <div key={s.label} className="mini-sec" style={{ borderColor: COLORS[i], background: `${COLORS[i]}12` }}>
            <b style={{ color: COLORS[i] }}>
              <i style={{ background: COLORS[i] }}>{i + 1}</i> {s.label}
            </b>
            {s.items.map(([en, pt]) => (
              <p key={en}>
                <span style={{ color: COLORS[i] }}>▶</span> {en} <small>= {pt}</small>
              </p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
