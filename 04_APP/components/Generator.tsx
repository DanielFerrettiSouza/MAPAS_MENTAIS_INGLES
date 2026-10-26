"use client";

import { trackCustom } from "@/lib/pixel";
import { useState } from "react";
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
const SUGGESTIONS_ES = [
  "Viaje: aeropuerto y hotel",
  "Entrevista de trabajo",
  "Pedir comida en el restaurante",
  "Verbo to be",
  "Phrasal verbs del día a día",
];

export default function Generator({
  credits,
  defaultLevel = "A1",
  defaultGoal,
  autoFocus = false,
  lang = "pt",
}: {
  credits: number;
  defaultLevel?: string;
  defaultGoal?: string;
  autoFocus?: boolean;
  lang?: "pt" | "es";
}) {
  const es = lang === "es";
  const tx = (pt: string, sp: string) => (es ? sp : pt);
  const router = useRouter();
  const params = useSearchParams();
  const [topic, setTopic] = useState(params.get("topic") ?? "");
  const [level, setLevel] = useState(params.get("level") ?? defaultLevel);
  const goal = params.get("goal") ?? defaultGoal;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      if (!res.ok) throw new Error(data.error ?? tx("Erro ao gerar o mapa.", "Error al crear el mapa."));
      trackCustom("MapCreated", { level });
      router.push(`/app/mapa/${data.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : tx("Erro ao gerar o mapa.", "Error al crear el mapa."));
      setLoading(false);
    }
  }

  if (credits <= 0 && es) {
    return (
      <div className="gen-box" style={{ textAlign: "center" }}>
        <h3 style={{ marginTop: 0 }}>Ya usaste tus mapas con IA 🎉</h3>
        <p style={{ color: "var(--muted)" }}>¿Quieres más mapas sobre los temas que tú elijas? El Paquete de 5 mapas con IA es un pago único y los créditos llegan a tu cuenta apenas pagas.</p>
        <a href="/api/stripe/checkout?item=pacote" className="primary-btn grad-btn">Quiero 5 mapas más →</a>
        <p style={{ marginTop: 14 }}><Link href="/app/biblioteca" className="back-link">O sigue con los 120 mapas de la biblioteca (no gastan créditos)</Link></p>
      </div>
    );
  }
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
          placeholder={tx("Sobre o que você quer aprender? Ex.: pedir comida no restaurante", "¿Qué quieres aprender? Ej.: pedir comida en el restaurante")}
          maxLength={200}
        />
        <select value={level} onChange={(e) => setLevel(e.target.value)} aria-label={tx("Nível", "Nivel")}>
          {LEVELS.map((l) => (
            <option key={l}>{l}</option>
          ))}
        </select>
        <button className="primary-btn grad-btn" disabled={loading || !topic.trim()}>
          {loading ? tx("Gerando…", "Creando…") : tx("✨ Criar mapa", "✨ Crear mapa")}
        </button>
      </form>
      <div className="chips" style={{ margin: "14px 0 0" }}>
        {(es ? SUGGESTIONS_ES : SUGGESTIONS).map((s) => (
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
      {loading && <p className="loading">✨ {tx("Criando seu mapa, ilustrações e áudios… (uns 20–40 segundos)", "Creando tu mapa, ilustraciones y audios… (unos 20–40 segundos)")}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
