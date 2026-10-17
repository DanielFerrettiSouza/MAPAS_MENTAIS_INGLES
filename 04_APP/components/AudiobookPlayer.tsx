"use client";
import { useEffect, useRef, useState } from "react";

// Toca a história frase a frase (áudio do /api/tts) e destaca a frase atual.
// Tocar numa frase começa dali.
export default function AudiobookPlayer({ sentences }: { sentences: { en: string; pt: string }[] }) {
  const [current, setCurrent] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [showPt, setShowPt] = useState(true);
  const audio = useRef<HTMLAudioElement | null>(null);
  const rows = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => () => audio.current?.pause(), []);

  function play(i: number) {
    audio.current?.pause();
    if (i >= sentences.length) { setPlaying(false); setCurrent(null); return; }
    const a = new Audio(`/api/tts?text=${encodeURIComponent(sentences[i].en)}`);
    audio.current = a;
    setCurrent(i);
    setPlaying(true);
    rows.current[i]?.scrollIntoView({ block: "center", behavior: "smooth" });
    a.onended = () => play(i + 1);
    a.play().catch(() => setPlaying(false));
  }

  function toggle() {
    if (playing) { audio.current?.pause(); setPlaying(false); }
    else if (audio.current && current !== null) { audio.current.play(); setPlaying(true); }
    else play(0);
  }

  return (
    <div className="ab-player">
      <div className="ab-controls">
        <button className="primary-btn grad-btn" onClick={toggle}>{playing ? "⏸ Pausar" : current !== null ? "▶ Continuar" : "▶ Ouvir a história"}</button>
        <button className="ghost-btn" onClick={() => setShowPt(!showPt)}>{showPt ? "Esconder tradução" : "Mostrar tradução"}</button>
      </div>
      <div className="ab-text">
        {sentences.map((s, i) => (
          <div key={i} ref={(el) => { rows.current[i] = el; }} className={`ab-line${i === current ? " on" : ""}`} onClick={() => play(i)}>
            <p className="en">{s.en}</p>
            {showPt && <p className="pt">{s.pt}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
