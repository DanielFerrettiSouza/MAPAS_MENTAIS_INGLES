"use client";
import { useState } from "react";
import { CURRICULUM } from "@/lib/curriculum";
import TITLES_ES from "@/data/es/titles.json";

const NAMES_ES: Record<string, string> = { A1: "Primeros pasos", A2: "Supervivencia", B1: "Independiente", B2: "Natural", C1: "Avanzado", C2: "Dominio" };

const LEVELS = [
  { id: "A1", name: "Primeiros passos" },
  { id: "A2", name: "Sobrevivência" },
  { id: "B1", name: "Independente" },
  { id: "B2", name: "Natural" },
  { id: "C1", name: "Avançado" },
  { id: "C2", name: "Domínio" },
];

// Grade de níveis da página do método: clicar mostra os temas reais da biblioteca.
export default function LevelExplorer({ lang }: { lang?: "es" }) {
  const es = lang === "es";
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
              <span>{es ? NAMES_ES[l.id] : l.name}</span>
              <small>{n} mapas</small>
            </button>
          );
        })}
      </div>
      <p className="lv-hint">{es ? "👆 Toca el nivel para ver los temas" : "👆 Toque no nível para ver os temas"}</p>
      <ul className="lv-topics">
        {topics.map((t) => <li key={t.slug}>✓ {es ? (TITLES_ES as Record<string, string>)[t.slug] ?? t.topic : t.topic}</li>)}
      </ul>
    </>
  );
}
