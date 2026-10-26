"use client";
import { useState } from "react";

// Botão grande da página de vendas: toca frases reais do mapa de amostra, uma por toque.
export default function ListenButton({ phrases, label = "Toque para ouvir" }: { phrases: string[]; label?: string }) {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const text = phrases[i % phrases.length];
  function play() {
    const a = new Audio(`/api/tts?text=${encodeURIComponent(text)}`);
    setPlaying(true);
    a.onended = () => setPlaying(false);
    a.play().catch(() => setPlaying(false));
    setI(i + 1);
  }
  return (
    <button className={`mt-listen${playing ? " on" : ""}`} onClick={play}>
      <span className="mt-listen-ico">{playing ? "🔊" : "▶"}</span>
      <span>
        <b>{label}</b>
        <small>“{text}”</small>
      </span>
    </button>
  );
}
