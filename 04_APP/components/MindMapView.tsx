"use client";

import { useRef, useState } from "react";
import { Amatic_SC, Caveat, Patrick_Hand } from "next/font/google";

// Fontes hospedadas no próprio site para o PNG sair com as mesmas letras da tela.
const amatic = Amatic_SC({ weight: "700", subsets: ["latin"], preload: false, variable: "--nb-amatic" });
const caveat = Caveat({ weight: "600", subsets: ["latin"], preload: false, variable: "--nb-caveat" });
const hand = Patrick_Hand({ weight: "400", subsets: ["latin"], preload: false, variable: "--nb-hand" });
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
export default function MindMapView({ map, preview = false, lang = "pt" }: { map: MapWithImages; preview?: boolean; lang?: "pt" | "es" }) {
  const t = (pt: string, es: string) => (lang === "es" ? es : pt);
  const pageRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [typed, setTyped] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);

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
      // Busca a mensagem do servidor para mostrar o motivo real.
      const res = await fetch(ttsUrl(text)).catch(() => null);
      const detail = res && !res.ok ? await res.text() : t("o navegador bloqueou o som", "el navegador bloqueó el sonido");
      setAudioError(`${t("Não foi possível tocar o áudio", "No se pudo reproducir el audio")}: ${detail}`);
    }
  }

  async function downloadPng() {
    if (!pageRef.current) return;
    const { savePng } = await import("@/lib/savePng"); // carrega o html-to-image só no clique
    // Download em pé, na proporção de uma folha A4 (1080 × 1527), para imprimir sem sobrar metade da folha.
    const page = pageRef.current;
    page.classList.add("nb-a4");
    try {
      await savePng(page, `${map.title_en.replace(/\s+/g, "_")}.png`, {
        backgroundColor: "#fffdf7",
        width: 1080,
        style: { margin: "0", padding: "28px 28px 28px 60px", minHeight: "1527px" },
      });
    } finally {
      page.classList.remove("nb-a4");
    }
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
        {s.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="nb-icon" src={s.image} alt="" crossOrigin="anonymous" />
        ) : (
          s.branch.emoji && <span className="nb-icon nb-emoji">{s.branch.emoji}</span>
        )}
        <ul>
          {s.branch.items.map((item, j) => (
            <li key={j}>
              <button
                className={`nb-play ${playing === item.en ? "active" : ""}`}
                style={{ color: s.color.main }}
                onClick={() => play(item.en)}
                aria-label={`${t("Ouvir", "Escuchar")}: ${item.en}`}
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

      <div className={`nb-page ${amatic.variable} ${caveat.variable} ${hand.variable}`} ref={pageRef}>
        <div className="nb-spiral" aria-hidden />

        <header className="nb-header">
          <div>
            <h2 className="nb-title">
              <span className="nb-deco">≈</span>
              <span>{map.title_pt}</span>
              <span className="nb-deco">≈</span>
            </h2>
            <p className="nb-subtitle">{map.title_en}</p>
          </div>
          <span className="nb-badge">{t("Nível", "Nivel")} {map.level}</span>
        </header>

        <div className="nb-grid">
          <div className="nb-col">
            {sections.filter((s) => s.index % 2 === 0).map(renderSection)}
          </div>

          <div className="nb-col nb-center">
            <div className="nb-circle">
              {map.cover_image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={map.cover_image} alt="" crossOrigin="anonymous" />
              ) : (
                map.emoji && <span className="nb-cover-emoji">{map.emoji}</span>
              )}
              <strong className={map.title_en.length > 16 ? "nb-long" : undefined}>{map.title_en}</strong>
            </div>
            {/* A descrição fica fora do círculo: assim nunca é cortada, seja qual for o tamanho. */}
            {map.summary_pt && <p className="nb-summary">{map.summary_pt}</p>}

            <div className="nb-card nb-tip">
              <div className="nb-card-head">💡 {t("Dica rápida", "Consejo rápido")}</div>
              <p>{map.tip_pt}</p>
            </div>

            <div className="nb-card nb-mistake">
              <div className="nb-card-head">⚠️ {t("Erro comum", "Error común")}</div>
              <p>
                <span className="nb-wrong">✗ {map.common_mistake.wrong}</span>
                <br />
                <span className="nb-right">✓ {map.common_mistake.right}</span>{" "}
                <button
                  className="nb-play"
                  style={{ color: "#16a34a" }}
                  onClick={() => play(map.common_mistake.right)}
                  aria-label={`${t("Ouvir", "Escuchar")}: ${map.common_mistake.right}`}
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
          <div className="nb-exercise-title">✏️ {t("Mini exercício", "Mini ejercicio")}</div>
          <ol>
            {map.exercises.map((ex, i) => (
              <li key={i}>
                {ex.sentence.split("___").map((part, k, arr) => (
                  <span key={k}>
                    {part}
                    {k < arr.length - 1 && (
                      <>
                        <input
                          className={`nb-blank nb-input ${checked ? (isRight(i) ? "ok" : "bad") : ""}`}
                          value={typed[i] ?? ""}
                          size={Math.max(6, ex.answer.length + 2)}
                          onChange={(e) => {
                            const next = [...typed];
                            next[i] = e.target.value;
                            setTyped(next);
                            setChecked(false);
                          }}
                          onKeyDown={(e) => e.key === "Enter" && setChecked(true)}
                          aria-label={`${t("Resposta", "Respuesta")} ${i + 1}`}
                          autoCapitalize="off"
                          autoCorrect="off"
                          spellCheck={false}
                        />
                        {checked &&
                          (isRight(i) ? (
                            <span className="nb-mark ok">✓</span>
                          ) : (
                            <span className="nb-mark bad">✗ {ex.answer}</span>
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
              {t("Verificar respostas", "Comprobar respuestas")}
            </button>
            {checked && (
              <>
                <span className="nb-score">
                  {score === map.exercises.length ? "🎉 " : ""}
                  {score}/{map.exercises.length} {t("certas", "correctas")}
                </span>
                <button
                  className="nb-answers-btn"
                  onClick={() => {
                    setTyped([]);
                    setChecked(false);
                  }}
                >
                  {t("Tentar de novo", "Intentar de nuevo")}
                </button>
              </>
            )}
          </div>
        </footer>
      </div>

      {audioError && <p className="error">{audioError}</p>}

      {!preview && <button className="secondary-btn" onClick={downloadPng}>
        ⬇ {t("Baixar mapa (PNG)", "Descargar mapa (PNG)")}
      </button>}
    </div>
  );
}
