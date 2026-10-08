"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import MindMapView from "@/components/MindMapView";
import ReviewQuiz from "@/components/ReviewQuiz";
import type { MapWithImages } from "@/lib/mapSchema";

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
const SUGGESTIONS = [
  "Viagem: aeroporto e hotel",
  "Entrevista de emprego",
  "Pedindo comida no restaurante",
  "Verbo to be",
  "Phrasal verbs do dia a dia",
];

export default function CreateMapPage() {
  return (
    <Suspense>
      <CreateMap />
    </Suspense>
  );
}

function CreateMap() {
  const params = useSearchParams();
  const [topic, setTopic] = useState(params.get("topic") ?? "");
  const [level, setLevel] = useState(params.get("level") ?? "A1");
  const goal = params.get("goal") ?? undefined;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [map, setMap] = useState<MapWithImages | null>(null);
  const autoStarted = useRef(false);

  async function generate(t = topic) {
    if (!t.trim()) return;
    setLoading(true);
    setError(null);
    setMap(null);
    try {
      const res = await fetch("/api/generate-map", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: t, level, goal }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao gerar o mapa.");
      setMap(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao gerar o mapa.");
    } finally {
      setLoading(false);
    }
  }

  // Vindo do quiz do funil: já gera o primeiro mapa automaticamente.
  useEffect(() => {
    if (params.get("topic") && !autoStarted.current) {
      autoStarted.current = true;
      void generate(params.get("topic")!);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="container wide">
      <h1>Mapas Falantes</h1>
      <p style={{ color: "var(--muted)" }}>
        Digite qualquer assunto. A IA monta o mapa mental ilustrado e você toca em
        cada frase para ouvir a pronúncia nativa.
      </p>

      <form
        className="create-form"
        onSubmit={(e) => {
          e.preventDefault();
          void generate();
        }}
      >
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Ex.: inglês para viagem"
          maxLength={200}
        />
        <select value={level} onChange={(e) => setLevel(e.target.value)}>
          {LEVELS.map((l) => (
            <option key={l}>{l}</option>
          ))}
        </select>
        <button className="primary-btn" disabled={loading || !topic.trim()}>
          {loading ? "Gerando…" : "Gerar mapa"}
        </button>
      </form>

      <div className="chips">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            className="chip"
            disabled={loading}
            onClick={() => {
              setTopic(s);
              void generate(s);
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {loading && (
        <p className="loading">
          ✨ Criando seu mapa, ilustrações e áudios… (leva uns 20–40 segundos)
        </p>
      )}
      {error && <p className="error">{error}</p>}

      {map && (
        <>
          <MindMapView map={map} />
          <ReviewQuiz quiz={map.quiz} />
        </>
      )}
    </main>
  );
}
