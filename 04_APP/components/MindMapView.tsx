"use client";

import { useRef, useState } from "react";
import type { MapWithImages } from "@/lib/mapSchema";

const COLORS = ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899"];
const W = 1500;
const H = 1000;
const CX = W / 2;
const CY = H / 2;

// Quebra o texto em linhas de até maxChars caracteres (por palavra).
function wrap(text: string, maxChars: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    if (line && (line + " " + word).length > maxChars) {
      lines.push(line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

const EN_CHARS = 24;
const PT_CHARS = 34;
const EN_LINE = 25;
const PT_LINE = 18;
const ITEM_GAP = 12;

export function playPhrase(text: string, audio: HTMLAudioElement) {
  audio.src = `/api/tts?text=${encodeURIComponent(text)}`;
  void audio.play();
}

// Desenha o mapa em SVG: texto renderizado pelo app (sempre correto),
// ilustrações da IA dentro dos círculos. Cada frase é clicável e toca o áudio.
export default function MindMapView({ map }: { map: MapWithImages }) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);

  function play(text: string) {
    if (!audioRef.current) return;
    setPlaying(text);
    playPhrase(text, audioRef.current);
  }

  function downloadPng() {
    const svg = svgRef.current;
    if (!svg) return;
    const xml = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, W, H);
      ctx.drawImage(img, 0, 0);
      const a = document.createElement("a");
      a.download = `${map.title_en.replace(/\s+/g, "_")}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(xml)}`;
  }

  const n = map.branches.length;

  return (
    <div>
      <audio ref={audioRef} onEnded={() => setPlaying(null)} />
      <div className="map-canvas">
        <svg
          ref={svgRef}
          xmlns="http://www.w3.org/2000/svg"
          viewBox={`0 0 ${W} ${H}`}
          fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        >
          <rect width={W} height={H} fill="#ffffff" />

          {map.branches.map((branch, i) => {
            const angle = (2 * Math.PI * i) / n - Math.PI / 2;
            const bx = CX + Math.cos(angle) * 360;
            const by = CY + Math.sin(angle) * 300;
            const color = COLORS[i % COLORS.length];
            const right = Math.cos(angle) >= -0.01;
            const tx = bx + (right ? 70 : -70);
            const anchor = right ? "start" : "end";
            const blocks = branch.items.map((item) => ({
              item,
              en: wrap(item.en, EN_CHARS),
              pt: wrap(item.pt, PT_CHARS),
            }));
            const heights = blocks.map(
              (b) => b.en.length * EN_LINE + b.pt.length * PT_LINE + ITEM_GAP
            );
            const total = heights.reduce((a, h) => a + h, 0);
            let cursor = by - total / 2 + EN_LINE - 6;
            const img = map.branch_images[i];

            return (
              <g key={i}>
                <path
                  d={`M ${CX} ${CY} Q ${(CX + bx) / 2} ${(CY + by) / 2 + 40} ${bx} ${by}`}
                  stroke={color}
                  strokeWidth={8}
                  fill="none"
                  strokeLinecap="round"
                />
                <circle cx={bx} cy={by} r={58} fill="#fff" stroke={color} strokeWidth={6} />
                {img && (
                  <>
                    <clipPath id={`clip-${i}`}>
                      <circle cx={bx} cy={by} r={52} />
                    </clipPath>
                    <image
                      href={img}
                      x={bx - 52}
                      y={by - 52}
                      width={104}
                      height={104}
                      clipPath={`url(#clip-${i})`}
                      preserveAspectRatio="xMidYMid slice"
                    />
                  </>
                )}
                <text
                  x={bx}
                  y={by - 72}
                  textAnchor="middle"
                  fontSize={26}
                  fontWeight={800}
                  fill={color}
                >
                  {branch.label_en}
                </text>

                {blocks.map((block, j) => {
                  const top = cursor;
                  cursor += heights[j];
                  const active = playing === block.item.en;
                  return (
                    <g
                      key={j}
                      style={{ cursor: "pointer" }}
                      onClick={() => play(block.item.en)}
                    >
                      <text
                        textAnchor={anchor}
                        fontSize={21}
                        fontWeight={700}
                        fill={active ? color : "#1c1917"}
                      >
                        {block.en.map((line, k) => (
                          <tspan key={k} x={tx} y={top + k * EN_LINE}>
                            {k === 0 ? (right ? `🔊 ${line}` : `${line} 🔊`) : line}
                          </tspan>
                        ))}
                      </text>
                      <text textAnchor={anchor} fontSize={14} fill="#78716c">
                        {block.pt.map((line, k) => (
                          <tspan
                            key={k}
                            x={tx}
                            y={top + (block.en.length - 1) * EN_LINE + 20 + k * PT_LINE}
                          >
                            {line}
                          </tspan>
                        ))}
                      </text>
                    </g>
                  );
                })}
              </g>
            );
          })}

          <circle cx={CX} cy={CY} r={110} fill="#1c1917" />
          {map.cover_image && (
            <>
              <clipPath id="clip-center">
                <circle cx={CX} cy={CY} r={102} />
              </clipPath>
              <image
                href={map.cover_image}
                x={CX - 102}
                y={CY - 102}
                width={204}
                height={204}
                clipPath="url(#clip-center)"
                preserveAspectRatio="xMidYMid slice"
                opacity={0.3}
              />
            </>
          )}
          {(() => {
            const title = wrap(map.title_en, 13).slice(0, 3);
            const sub = `${map.title_pt} · ${map.level}`;
            const subLines = wrap(sub, 22).slice(0, 2);
            const titleH = title.length * 30;
            const startY = CY - (titleH + subLines.length * 20) / 2 + 22;
            return (
              <>
                <text textAnchor="middle" fontSize={26} fontWeight={900} fill="#ffffff">
                  {title.map((line, k) => (
                    <tspan key={k} x={CX} y={startY + k * 30}>
                      {line}
                    </tspan>
                  ))}
                </text>
                <text textAnchor="middle" fontSize={15} fill="#e7e5e4">
                  {subLines.map((line, k) => (
                    <tspan key={k} x={CX} y={startY + titleH + 4 + k * 20}>
                      {line}
                    </tspan>
                  ))}
                </text>
              </>
            );
          })()}
        </svg>
      </div>

      <button className="secondary-btn" onClick={downloadPng}>
        ⬇ Baixar mapa (PNG)
      </button>
    </div>
  );
}
