"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Anton, Permanent_Marker, Roboto_Condensed } from "next/font/google";
import type { MapWithImages } from "@/lib/mapSchema";

// Fontes hospedadas no próprio site: assim o PNG baixado usa exatamente as mesmas
// fontes da tela (com Google Fonts externo o download trocava a fonte e embaralhava o texto).
const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--ink-display" });
const marker = Permanent_Marker({ weight: "400", subsets: ["latin"], variable: "--ink-brush" });
const condensed = Roboto_Condensed({ weight: ["400", "700"], subsets: ["latin"], variable: "--ink-body" });

const COLORS = ["#2f6b2f", "#b5241c", "#d97a13", "#1f4e79"];
const EXPORT_WIDTH = 1080;

function ttsUrl(text: string) {
  return `/api/tts?text=${encodeURIComponent(text)}`;
}

// Mapa no estilo gravura (papel envelhecido, nanquim, pincel). Todo o texto é
// escrito pelo app — a IA só fornece as ilustrações, sem letras.
export default function InkMapView({ map, preview = false }: { map: MapWithImages; preview?: boolean }) {
  const pageRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [typed, setTyped] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const [exporting, setExporting] = useState(false);

  const norm = (t: string) => t.toLowerCase().replace(/[’']/g, "'").replace(/[.!?,]/g, "").replace(/\s+/g, " ").trim();
  const isRight = (i: number) => norm(typed[i] ?? "") === norm(map.exercises[i].answer);
  const score = map.exercises.filter((_, i) => isRight(i)).length;

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
      const res = await fetch(ttsUrl(text)).catch(() => null);
      const detail = res && !res.ok ? await res.text() : "o navegador bloqueou o som";
      setAudioError(`Não foi possível tocar o áudio: ${detail}`);
    }
  }

  // Exporta sempre na largura de desktop (1080px), igual no celular e no computador.
  async function downloadPng() {
    if (!pageRef.current) return;
    setExporting(true);
    try {
      await document.fonts.ready;
      const dataUrl = await toPng(pageRef.current, {
        pixelRatio: 2,
        width: EXPORT_WIDTH,
        style: { width: `${EXPORT_WIDTH}px`, maxWidth: "none", margin: "0" },
        filter: (node) => !(node instanceof HTMLElement && node.dataset.noExport === "true"),
      });
      const a = document.createElement("a");
      a.download = `${map.title_en.replace(/\s+/g, "_")}.png`;
      a.href = dataUrl;
      a.click();
    } finally {
      setExporting(false);
    }
  }

  const sections = map.branches.slice(0, 4).map((branch, i) => ({
    branch,
    index: i,
    image: map.branch_images[i],
    color: COLORS[i % COLORS.length],
  }));

  function renderSection(s: (typeof sections)[number]) {
    return (
      <section key={s.index} className={`ink-sec ink-sec-${s.index}`}>
        {s.image ? (
          <div className="ink-ill" style={{ backgroundImage: `url(${s.image})` }} aria-hidden />
        ) : (
          s.branch.emoji && <span className="ink-ill ink-ill-emoji" aria-hidden>{s.branch.emoji}</span>
        )}
        <span className="ink-ribbon">
          <span className="ink-num" style={{ background: s.color }}>{s.index + 1}</span>
          {s.branch.label_pt}
        </span>
        <div className="ink-en-label" style={{ color: s.color }}>{s.branch.label_en}</div>
        <ul>
          {s.branch.items.map((item, j) => (
            <li key={j}>
              <button
                className={`ink-play ${playing === item.en ? "active" : ""}`}
                style={{ background: s.color }}
                onClick={() => play(item.en)}
                aria-label={`Ouvir: ${item.en}`}
              >
                {playing === item.en ? "🔊" : "▶"}
              </button>
              <span>
                <span className="ink-item-en">{item.en}</span> <span className="ink-item-pt">= {item.pt}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  return (
    <div>
      <audio ref={audioRef} onEnded={() => setPlaying(null)} />

      <div className={`ink-page ${anton.variable} ${marker.variable} ${condensed.variable}`} ref={pageRef}>
        <div className="ink-top">
          <span className="ink-kicker">INGLÊS • MAPA MENTAL</span>
          <span className="ink-level">{map.level}</span>
        </div>
        <h2 className="ink-title">{map.title_pt}</h2>
        <div className="ink-brush">{map.title_en}</div>
        <div className="ink-band">{map.summary_pt}</div>

        <div className="ink-grid">
          {renderSection(sections[0])}
          <div className="ink-center">
            {map.cover_image ? (
              <div className="ink-emblem" style={{ backgroundImage: `url(${map.cover_image})` }} aria-hidden />
            ) : (
              <div className="ink-emblem ink-emblem-emoji" aria-hidden>{map.emoji}</div>
            )}
          </div>
          {sections.slice(1).map(renderSection)}
        </div>

        <div className="ink-boxes">
          <div className="ink-box">
            <h3>💡 DICA RÁPIDA</h3>
            <p>{map.tip_pt}</p>
          </div>
          <div className="ink-box">
            <span className="ink-stamp">erro comum</span>
            <h3>⚠️ NÃO DIGA ASSIM</h3>
            <p>
              <span className="ink-wrong">✗ {map.common_mistake.wrong}</span>
              <br />
              <span className="ink-right">✓ {map.common_mistake.right}</span>{" "}
              <button
                className="ink-play ink-play-inline"
                style={{ background: "#2f6b2f" }}
                onClick={() => play(map.common_mistake.right)}
                aria-label={`Ouvir: ${map.common_mistake.right}`}
                data-no-export="true"
              >
                ▶
              </button>
              <br />
              <small>{map.common_mistake.why_pt}</small>
            </p>
          </div>
        </div>

        <div className="ink-box ink-exercise">
          <h3>✏️ MINI EXERCÍCIO</h3>
          <ol>
            {map.exercises.map((ex, i) => (
              <li key={i}>
                {ex.sentence.split("___").map((part, k, arr) => (
                  <span key={k}>
                    {part}
                    {k < arr.length - 1 && (
                      <>
                        <input
                          className={`ink-input ${checked ? (isRight(i) ? "ok" : "bad") : ""}`}
                          value={typed[i] ?? ""}
                          size={Math.max(6, ex.answer.length + 2)}
                          onChange={(e) => {
                            const next = [...typed];
                            next[i] = e.target.value;
                            setTyped(next);
                            setChecked(false);
                          }}
                          onKeyDown={(e) => e.key === "Enter" && setChecked(true)}
                          aria-label={`Resposta ${i + 1}`}
                          autoCapitalize="off"
                          autoCorrect="off"
                          spellCheck={false}
                        />
                        {checked &&
                          (isRight(i) ? (
                            <span className="ink-mark ok">✓</span>
                          ) : (
                            <span className="ink-mark bad">✗ {ex.answer}</span>
                          ))}
                      </>
                    )}
                  </span>
                ))}{" "}
                <small>{ex.hint_pt}</small>
              </li>
            ))}
          </ol>
          <div className="nb-ex-actions" data-no-export="true">
            <button className="nb-answers-btn nb-check-btn" onClick={() => setChecked(true)}>
              Verificar respostas
            </button>
            {checked && (
              <>
                <span className="nb-score">
                  {score === map.exercises.length ? "🎉 " : ""}
                  {score}/{map.exercises.length} certas
                </span>
                <button
                  className="nb-answers-btn"
                  onClick={() => {
                    setTyped([]);
                    setChecked(false);
                  }}
                >
                  Tentar de novo
                </button>
              </>
            )}
          </div>
        </div>

        <div className="ink-foot">
          🔊 MAPAS FALANTES
          <small>INGLÊS QUE VOCÊ VÊ E ESCUTA</small>
        </div>
      </div>

      {audioError && <p className="error">{audioError}</p>}

      {!preview && (
        <button className="secondary-btn" onClick={downloadPng} disabled={exporting}>
          {exporting ? "Gerando imagem…" : "⬇ Baixar mapa (PNG)"}
        </button>
      )}
    </div>
  );
}
