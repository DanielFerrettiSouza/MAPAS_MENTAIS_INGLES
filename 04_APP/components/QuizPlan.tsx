"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supa/client";
import { quizPlan, type QuizAnswers } from "@/lib/quizPlan";

// Card do painel com o resultado do quiz: nível, dica e 3 mapas sugeridos.
// As respostas vêm do perfil (user_metadata.quiz) ou, logo após o cadastro,
// do localStorage — e aí são salvas no perfil.
export default function QuizPlan({ saved, credits }: { saved?: QuizAnswers; credits: number }) {
  const [answers, setAnswers] = useState<QuizAnswers | undefined>(saved);

  useEffect(() => {
    if (saved) return;
    try {
      const raw = localStorage.getItem("mf-quiz");
      if (!raw) return;
      const quiz = JSON.parse(raw) as QuizAnswers;
      setAnswers(quiz);
      void createSupabaseBrowser().auth.updateUser({ data: { quiz, level: quiz.level } });
    } catch {}
  }, [saved]);

  if (!answers) return null;
  const p = quizPlan(answers);

  return (
    <div className="gen-box quiz-plan">
      <p className="quiz-plan-kicker">Seu diagnóstico</p>
      <h2 style={{ margin: "4px 0 8px" }}>
        Seu nível: <span className="grad-text">{p.level} · {p.levelName}</span>
      </h2>
      <p style={{ color: "var(--muted)", lineHeight: 1.6, margin: "0 0 6px" }}>
        {p.levelText}
        {p.goal && <> Seu foco: <b style={{ color: "var(--text)" }}>{p.goal}</b>.</>}
        {p.time && <> Com {p.time} min por dia, 1 mapa por dia já faz diferença.</>}
      </p>
      {p.tip && <p style={{ color: "var(--muted)", lineHeight: 1.6, margin: "0 0 14px" }}>💡 {p.tip}</p>}
      <p style={{ fontWeight: 600, margin: "0 0 10px" }}>
        {credits > 0 ? `Mapas recomendados para você — escolha um para criar (você tem ${credits} grátis):` : "Mapas recomendados para você:"}
      </p>
      <div className="chips" style={{ marginBottom: 0 }}>
        {p.topics.map((t) => (
          <Link
            key={t}
            className="chip"
            href={credits > 0 ? `/app/criar?${new URLSearchParams({ topic: t, level: p.level })}` : "/app/planos"}
          >
            ✨ {t}
          </Link>
        ))}
      </div>
    </div>
  );
}
