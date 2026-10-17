"use client";
import { useRef, useState } from "react";

// Toca a história inteira de forma contínua e destaca a frase que está sendo lida.
// Tocar numa frase pula para ela.
export default function AudiobookPlayer({ audio, duration, sentences }: { audio: string; duration: number; sentences: { en: string; pt: string; t: number }[] }) {
  const [current, setCurrent] = useState(-1);
  const [showPt, setShowPt] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const total = duration;
  const player = useRef<HTMLAudioElement>(null);
  const rows = useRef<(HTMLDivElement | null)[]>([]);

  function onTime() {
    const now = player.current?.currentTime ?? 0;
    setTime(now);
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

  function toggle() {
    const a = player.current;
    if (!a) return;
    if (a.paused) void a.play();
    else a.pause();
  }

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  return (
    <div className="ab-player">
      <div className="ab-controls">
        <audio ref={player} src={audio} preload="metadata" onTimeUpdate={onTime} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} />
        <button className="primary-btn grad-btn" onClick={toggle}>{playing ? "⏸ Pausar" : time > 0 ? "▶ Continuar" : "▶ Ouvir a história"}</button>
        <input className="ab-seek" type="range" min={0} max={total} step={0.5} value={time} aria-label="Posição do áudio"
          onChange={(e) => { const v = Number(e.target.value); setTime(v); if (player.current) player.current.currentTime = v; onTime(); }} />
        <span className="ab-time">{fmt(time)} / {fmt(total)}</span>
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
