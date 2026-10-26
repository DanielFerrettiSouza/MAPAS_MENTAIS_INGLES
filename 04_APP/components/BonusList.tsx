"use client";

import { useRef, useState } from "react";
import type { Bonus } from "@/lib/bonus";

// Lista de um bônus: cada item toca o áudio nativo (mesmo áudio dos mapas, guardado após o 1º play).
export default function BonusList({ sections, locked, lang = "pt" }: { sections: Bonus["sections"]; locked: number; lang?: "pt" | "es" }) {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);
  const play = (t: string) => {
    if (!audio.current) return;
    setPlaying(t);
    audio.current.src = `/api/tts?text=${encodeURIComponent(t)}`;
    audio.current.play().catch(() => setPlaying(null));
  };
  return (
    <div className="bonus">
      <audio ref={audio} onEnded={() => setPlaying(null)} />
      {sections.map((s, i) => (
        <section key={s.theme} className={`bonus-sec ${i >= sections.length - locked ? "bonus-locked" : ""}`}>
          <h2>{s.theme}</h2>
          <ul>
            {s.items.map((it) => (
              <li key={it.en}>
                <button className={`qmm-play ${playing === it.en ? "on" : ""}`} onClick={() => play(it.en)} aria-label={`${lang === "es" ? "Escuchar" : "Ouvir"}: ${it.en}`}>
                  {playing === it.en ? "🔊" : "▶"}
                </button>
                <div>
                  <b>{it.en}</b> <span className="bonus-pt">= {it.pt}</span>
                  {it.ex_en && (
                    <div className="bonus-ex">
                      <button className="link-btn" onClick={() => play(it.ex_en)}>▶</button> <i>{it.ex_en}</i> — {it.ex_pt}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
