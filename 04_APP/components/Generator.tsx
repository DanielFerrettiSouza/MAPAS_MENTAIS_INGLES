"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
const SUGGESTIONS = [
  "Viagem: aeroporto e hotel",
  "Entrevista de emprego",
  "Pedindo comida no restaurante",
  "Verbo to be",
  "Phrasal verbs do dia a dia",
];

export default function Generator({
  credits,
  defaultLevel = "A1",
  defaultGoal,
  autoFocus = false,
}: {
  credits: number;
  defaultLevel?: string;
  defaultGoal?: string;
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [topic, setTopic] = useState(params.get("topic") ?? "");
  const [level, setLevel] = useState(params.get("level") ?? defaultLevel);
  const goal = params.get("goal") ?? defaultGoal;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autoStarted = useRef(false);

  async function generate(t = topic) {
    if (!t.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-map", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: t, level, goal }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao gerar o mapa.");
      router.push(`/app/mapa/${data.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao gerar o mapa.");
      setLoading(false);
    }
  }

  // Vindo do quiz: gera o primeiro mapa automaticamente.
  useEffect(() => {
    if (params.get("topic") && !autoStarted.current && credits > 0) {
      autoStarted.current = true;
      // Limpa a URL para não gerar outro mapa ao voltar ou recarregar a página.
      window.history.replaceState(null, "", "/app/criar");
      void generate(params.get("topic")!);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (credits <= 0) {
    return (
      <div className="gen-box" style={{ textAlign: "center" }}>
        <h3 style={{ marginTop: 0 }}>Seus mapas grátis acabaram 🎉</h3>
        <p style={{ color: "var(--muted)" }}>Assine um plano para continuar criando mapas com áudio.</p>
        <Link href="/app/planos" className="primary-btn grad-btn">Ver planos</Link>
      </div>
    );
  }

  return (
    <div className="gen-box">
      <form
        className="create-form"
        style={{ margin: 0 }}
        onSubmit={(e) => {
          e.preventDefault();
          void generate();
        }}
      >
        <input
          id="topic-input"
          autoFocus={autoFocus}
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Sobre o que você quer aprender? Ex.: pedir comida no restaurante"
          maxLength={200}
        />
        <select value={level} onChange={(e) => setLevel(e.target.value)} aria-label="Nível">
          {LEVELS.map((l) => (
            <option key={l}>{l}</option>
          ))}
        </select>
        <button className="primary-btn grad-btn" disabled={loading || !topic.trim()}>
          {loading ? "Gerando…" : "✨ Criar mapa"}
        </button>
      </form>
      <div className="chips" style={{ margin: "14px 0 0" }}>
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
      {loading && <p className="loading">✨ Criando seu mapa, ilustrações e áudios… (uns 20–40 segundos)</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
