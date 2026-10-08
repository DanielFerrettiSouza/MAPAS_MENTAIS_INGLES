"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Quiz de entrada do funil: segmenta o aluno e termina gerando
// o primeiro mapa grátis personalizado (efeito "uau" antes da oferta).
type Step = {
  key: "level" | "goal" | "time";
  question: string;
  options: { label: string; value: string }[];
};

const STEPS: Step[] = [
  {
    key: "level",
    question: "Como está seu inglês hoje?",
    options: [
      { label: "Não sei quase nada", value: "A1" },
      { label: "Entendo o básico", value: "A2" },
      { label: "Me viro em conversas simples", value: "B1" },
      { label: "Converso, mas travo às vezes", value: "B2" },
      { label: "Sou avançado, quero polir", value: "C1" },
    ],
  },
  {
    key: "goal",
    question: "Para que você quer o inglês?",
    options: [
      { label: "✈️ Viajar", value: "viagem" },
      { label: "💼 Trabalho e carreira", value: "trabalho" },
      { label: "🎬 Filmes, séries e músicas", value: "series" },
      { label: "🎓 Prova ou intercâmbio", value: "prova" },
    ],
  },
  {
    key: "time",
    question: "Quanto tempo por dia você tem para estudar?",
    options: [
      { label: "5 minutos", value: "5" },
      { label: "15 minutos", value: "15" },
      { label: "30 minutos ou mais", value: "30" },
    ],
  },
];

const FIRST_TOPIC: Record<string, string> = {
  viagem: "Inglês no aeroporto e no hotel",
  trabalho: "Inglês para reuniões de trabalho",
  series: "Expressões comuns em séries americanas",
  prova: "Conectivos para redação em inglês",
};

export default function QuizPage({ params }: { params: { locale: string } }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  function choose(value: string) {
    const next = { ...answers, [STEPS[step].key]: value };
    setAnswers(next);
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      return;
    }
    // TODO produção: capturar e-mail/WhatsApp aqui antes de gerar o mapa.
    const qs = new URLSearchParams({
      level: next.level,
      goal: `${next.goal}, ${next.time} min por dia`,
      topic: FIRST_TOPIC[next.goal],
    });
    router.push(`/${params.locale}/criar?${qs}`);
  }

  const current = STEPS[step];

  return (
    <main className="container">
      <div className="progress">
        <div style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
      </div>
      <p style={{ color: "var(--muted)" }}>
        Pergunta {step + 1} de {STEPS.length}
      </p>
      <h1>{current.question}</h1>
      {current.options.map((opt) => (
        <button key={opt.value} className="quiz-choice" onClick={() => choose(opt.value)}>
          {opt.label}
        </button>
      ))}
    </main>
  );
}
