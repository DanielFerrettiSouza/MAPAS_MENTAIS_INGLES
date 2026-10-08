"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import type { MapWithImages } from "@/lib/mapSchema";

// Cores das seções no estilo "página de caderno" (borda + fundo suave).
const SECTION_COLORS = [
  { main: "#16a34a", soft: "#f0fdf4" },
  { main: "#e11d48", soft: "#fff1f2" },
  { main: "#ea580c", soft: "#fff7ed" },
  { main: "#2563eb", soft: "#eff6ff" },
];

function ttsUrl(text: string) {
  return `/api/tts?text=${encodeURIComponent(text)}`;
}

// Desenha o mapa como uma página de caderno: título, seções numeradas em
// grade ao redor de um círculo central, dica, erro comum e mini exercício.
// Todo texto é renderizado pelo app (sempre correto); as ilustrações vêm da IA.
export default function MindMapView({ map }: { map: MapWithImages }) {
  const pageRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [showAnswers, setShowAnswers] = useState(false);

  async function play(text: string) {
    const audio = audioRef.current;
    if (!audio) return;
    setAudioError(null);
    setPlaying(text);
    audio.src = ttsUrl(text);
    try {
      await audio.play();
    } catch {
      setPlaying(null);
      // Busca a mensagem do servidor para mostrar o motivo real.
      const res = await fetch(ttsUrl(text)).catch(() => null);
      const detail = res && !res.ok ? await res.text() : "o navegador bloqueou o som";
      setAudioError(`Não foi possível tocar o áudio: ${detail}`);
    }
  }

  async function downloadPng() {
    if (!pageRef.current) return;
    const dataUrl = await toPng(pageRef.current, {
      pixelRatio: 2,
      backgroundColor: "#fffdf7",
      filter: (node) => !(node instanceof HTMLElement && node.dataset.noExport === "true"),
    });
    const a = document.createElement("a");
    a.download = `${map.title_en.replace(/\s+/g, "_")}.png`;
    a.href = dataUrl;
    a.click();
  }

  const sections = map.branches.slice(0, 4).map((branch, i) => ({
    branch,
    index: i,
    image: map.branch_images[i],
    color: SECTION_COLORS[i % SECTION_COLORS.length],
  }));

  function renderSection(s: (typeof sections)[number]) {
    return (
      <div
        key={s.index}
        className="nb-section"
        style={{ borderColor: s.color.main, background: s.color.soft, order: s.index + 1 }}
      >
        <div className="nb-section-head" style={{ color: s.color.main }}>
          <span className="nb-num" style={{ background: s.color.main }}>
            {s.index + 1}
          </span>
          <span>{s.branch.label_pt}</span>
          <span className="nb-section-en">{s.branch.label_en}</span>
        </div>
        {s.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="nb-icon" src={s.image} alt="" />
        )}
        <ul>
          {s.branch.items.map((item, j) => (
            <li key={j}>
              <button
                className={`nb-play ${playing === item.en ? "active" : ""}`}
                style={{ color: s.color.main }}
                onClick={() => play(item.en)}
                aria-label={`Ouvir: ${item.en}`}
                data-no-export="true"
              >
                {playing === item.en ? "🔊" : "▶"}
              </button>
              <span className="nb-en">{item.en}</span>
              <span className="nb-pt"> = {item.pt}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div>
      <audio ref={audioRef} onEnded={() => setPlaying(null)} />

      <div className="nb-page" ref={pageRef}>
        <div className="nb-spiral" aria-hidden />

        <header className="nb-header">
          <div>
            <h2 className="nb-title">
              <span className="nb-deco">≈</span> {map.title_pt}{" "}
              <span className="nb-deco">≈</span>
            </h2>
            <p className="nb-subtitle">{map.title_en}</p>
          </div>
          <span className="nb-badge">Nível {map.level}</span>
        </header>

        <div className="nb-grid">
          <div className="nb-col">
            {sections.filter((s) => s.index % 2 === 0).map(renderSection)}
          </div>

          <div className="nb-col nb-center">
            <div className="nb-circle">
              {map.cover_image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={map.cover_image} alt="" />
              )}
              <strong>{map.title_en}</strong>
              <span>{map.summary_pt}</span>
            </div>

            <div className="nb-card nb-tip">
              <div className="nb-card-head">💡 Dica rápida</div>
              <p>{map.tip_pt}</p>
            </div>

            <div className="nb-card nb-mistake">
              <div className="nb-card-head">⚠️ Erro comum</div>
              <p>
                <span className="nb-wrong">✗ {map.common_mistake.wrong}</span>
                <br />
                <span className="nb-right">✓ {map.common_mistake.right}</span>{" "}
                <button
                  className="nb-play"
                  style={{ color: "#16a34a" }}
                  onClick={() => play(map.common_mistake.right)}
                  aria-label={`Ouvir: ${map.common_mistake.right}`}
                  data-no-export="true"
                >
                  ▶
                </button>
              </p>
              <small>{map.common_mistake.why_pt}</small>
            </div>
          </div>

          <div className="nb-col">
            {sections.filter((s) => s.index % 2 === 1).map(renderSection)}
          </div>
        </div>

        <footer className="nb-exercise">
          <div className="nb-exercise-title">✏️ Mini exercício</div>
          <ol>
            {map.exercises.map((ex, i) => (
              <li key={i}>
                {ex.sentence.split("___").map((part, k, arr) => (
                  <span key={k}>
                    {part}
                    {k < arr.length - 1 && (
                      <span className="nb-blank">{showAnswers ? ex.answer : " "}</span>
                    )}
                  </span>
                ))}{" "}
                <small>{ex.hint_pt}</small>
              </li>
            ))}
          </ol>
          <button
            className="nb-answers-btn"
            onClick={() => setShowAnswers((v) => !v)}
            data-no-export="true"
          >
            {showAnswers ? "Esconder respostas" : "Ver respostas"}
          </button>
        </footer>
      </div>

      {audioError && <p className="error">{audioError}</p>}

      <button className="secondary-btn" onClick={downloadPng}>
        ⬇ Baixar mapa (PNG)
      </button>
    </div>
  );
}
