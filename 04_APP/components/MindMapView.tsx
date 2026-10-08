"use client";

import { useRef, useState } from "react";
import type { MapWithImages } from "@/lib/mapSchema";

const COLORS = ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899"];
const W = 1400;
const H = 1000;
const CX = W / 2;
const CY = H / 2;

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
            const itemsTop = by - ((branch.items.length - 1) * 50) / 2 + 6;
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

                {branch.items.map((item, j) => (
                  <g
                    key={j}
                    style={{ cursor: "pointer" }}
                    onClick={() => play(item.en)}
                  >
                    <text
                      x={tx}
                      y={itemsTop + j * 50}
                      textAnchor={anchor}
                      fontSize={21}
                      fontWeight={700}
                      fill={playing === item.en ? color : "#1c1917"}
                    >
                      {right ? `🔊 ${item.en}` : `${item.en} 🔊`}
                    </text>
                    <text
                      x={tx}
                      y={itemsTop + j * 50 + 20}
                      textAnchor={anchor}
                      fontSize={14}
                      fill="#78716c"
                    >
                      {item.pt}
                    </text>
                  </g>
                ))}
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
                opacity={0.35}
              />
            </>
          )}
          <text
            x={CX}
            y={CY - 4}
            textAnchor="middle"
            fontSize={30}
            fontWeight={900}
            fill="#ffffff"
          >
            {map.title_en}
          </text>
          <text x={CX} y={CY + 30} textAnchor="middle" fontSize={18} fill="#e7e5e4">
            {map.title_pt} · {map.level}
          </text>
        </svg>
      </div>

      <button className="secondary-btn" onClick={downloadPng}>
        ⬇ Baixar mapa (PNG)
      </button>
    </div>
  );
}
