import MiniMapCard from "./MiniMap";
import { MINI_MAPS } from "@/lib/miniMaps";

// Colunas de mapas rolando sem parar. variant="hero": pilha reta ao lado do título;
// variant="wall": parede inclinada em 3D.
export default function MapWall({ variant = "wall" }: { variant?: "wall" | "hero" }) {
  const n = variant === "hero" ? 2 : 4;
  const cols = Array.from({ length: n }, (_, i) =>
    MINI_MAPS.filter((_, k) => k % n === i).concat(MINI_MAPS.filter((_, k) => k % n !== i).slice(0, 2))
  );
  return (
    <div className={variant === "hero" ? "stack" : "wall"} aria-hidden>
      <div className={variant === "hero" ? "stack-plane" : "wall-plane"}>
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
