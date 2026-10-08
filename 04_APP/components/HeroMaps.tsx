import MiniMapCard from "./MiniMap";
import { MINI_MAPS } from "@/lib/miniMaps";

// Pilha de mapas de caderno rolando ao lado do título da landing.
export default function HeroMaps() {
  const cols = [0, 1].map((i) => MINI_MAPS.filter((_, k) => k % 2 === i));
  return (
    <div className="stack" aria-hidden>
      <div className="stack-plane">
        {cols.map((col, i) => (
          <div key={i} className={`wall-col ${i % 2 ? "down" : "up"}`}>
            {[...col, ...col].map((m, k) => (
              <MiniMapCard key={k} m={m} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
