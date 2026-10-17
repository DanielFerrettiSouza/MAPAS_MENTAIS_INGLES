"use client";
import { useRef, useState } from "react";

// Toca a história inteira de forma contínua e destaca a frase que está sendo lida.
// Tocar numa frase pula para ela.
export default function AudiobookPlayer({ audio, sentences }: { audio: string; sentences: { en: string; pt: string; t: number }[] }) {
  const [current, setCurrent] = useState(-1);
  const [showPt, setShowPt] = useState(true);
  const player = useRef<HTMLAudioElement>(null);
  const rows = useRef<(HTMLDivElement | null)[]>([]);

  function onTime() {
    const now = player.current?.currentTime ?? 0;
    let i = -1;
    while (i + 1 < sentences.length && sentences[i + 1].t <= now + 0.05) i++;
    if (i !== current) {
      setCurrent(i);
      rows.current[i]?.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }

  function jump(i: number) {
    if (!player.current) return;
    player.current.currentTime = sentences[i].t;
    void player.current.play();
  }

  return (
    <div className="ab-player">
      <div className="ab-controls">
        <audio ref={player} src={audio} controls preload="metadata" onTimeUpdate={onTime} />
        <button className="ghost-btn" onClick={() => setShowPt(!showPt)}>{showPt ? "Esconder tradução" : "Mostrar tradução"}</button>
      </div>
      <div className="ab-text">
        {sentences.map((s, i) => (
          <div key={i} ref={(el) => { rows.current[i] = el; }} className={`ab-line${i === current ? " on" : ""}`} onClick={() => jump(i)}>
            <p className="en">{s.en}</p>
            {showPt && <p className="pt">{s.pt}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
