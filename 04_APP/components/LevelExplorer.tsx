"use client";
import { useState } from "react";
import { CURRICULUM } from "@/lib/curriculum";

const LEVELS = [
  { id: "A1", name: "Primeiros passos" },
  { id: "A2", name: "Sobrevivência" },
  { id: "B1", name: "Independente" },
  { id: "B2", name: "Natural" },
  { id: "C1", name: "Avançado" },
  { id: "C2", name: "Domínio" },
];

// Grade de níveis da página do método: clicar mostra os temas reais da biblioteca.
export default function LevelExplorer() {
  const [open, setOpen] = useState("A1");
  const topics = CURRICULUM.filter((t) => t.level === open);
  return (
    <>
      <div className="lv-grid">
        {LEVELS.map((l) => {
          const n = CURRICULUM.filter((t) => t.level === l.id).length;
          return (
            <button key={l.id} className={`lv-card${open === l.id ? " on" : ""}`} onClick={() => setOpen(l.id)}>
              <strong>{l.id}</strong>
              <span>{l.name}</span>
              <small>{n} mapas</small>
            </button>
          );
        })}
      </div>
      <p className="lv-hint">👆 Toque no nível para ver os temas</p>
      <ul className="lv-topics">
        {topics.map((t) => <li key={t.slug}>✓ {t.topic}</li>)}
      </ul>
    </>
  );
}
