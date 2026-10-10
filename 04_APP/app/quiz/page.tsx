"use client";

import { useEffect, useState } from "react";
import { track, trackCustom } from "@/lib/pixel";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";

// Quiz do funil: segmenta o aluno, mostra a "análise" e leva à criação de conta.
// O diagnóstico (nível + mapas sugeridos) aparece no painel; o aluno escolhe o que criar.
type Option = { label: string; value: string; emoji: string };
type Step = { key: string; question: string; options: Option[] };

const STEPS: Step[] = [
  {
    key: "level",
    question: "Como está seu inglês hoje?",
    options: [
      { emoji: "🌱", label: "Não sei quase nada", value: "A1" },
      { emoji: "📘", label: "Entendo o básico", value: "A2" },
      { emoji: "💬", label: "Me viro em conversas simples", value: "B1" },
      { emoji: "🚀", label: "Converso, mas travo às vezes", value: "B2" },
      { emoji: "🎓", label: "Sou avançado, quero polir", value: "C1" },
    ],
  },
  {
    key: "goal",
    question: "Para que você quer o inglês?",
    options: [
      { emoji: "✈️", label: "Viajar", value: "viagem" },
      { emoji: "💼", label: "Trabalho e carreira", value: "trabalho" },
      { emoji: "🎬", label: "Filmes, séries e músicas", value: "series" },
      { emoji: "🎓", label: "Prova ou intercâmbio", value: "prova" },
    ],
  },
  {
    key: "pain",
    question: "O que mais te trava hoje?",
    options: [
      { emoji: "👂", label: "Não entendo quando falam rápido", value: "listening" },
      { emoji: "🗣️", label: "Tenho vergonha da minha pronúncia", value: "pronuncia" },
      { emoji: "🧩", label: "Esqueço o vocabulário", value: "vocabulario" },
      { emoji: "📚", label: "A gramática me confunde", value: "gramatica" },
    ],
  },
  {
    key: "tried",
    question: "Você já tentou estudar com...",
    options: [
      { emoji: "📄", label: "PDFs e apostilas", value: "pdf" },
      { emoji: "📱", label: "Apps de idioma", value: "apps" },
      { emoji: "🏫", label: "Curso ou escola", value: "curso" },
      { emoji: "🙋", label: "Nunca estudei de verdade", value: "nunca" },
    ],
  },
  {
    key: "time",
    question: "Quanto tempo por dia você tem?",
    options: [
      { emoji: "⏱️", label: "5 minutos", value: "5" },
      { emoji: "⏳", label: "15 minutos", value: "15" },
      { emoji: "🕐", label: "30 minutos ou mais", value: "30" },
    ],
  },
];

const ANALYSIS = [
  "Analisando seu nível…",
  "Escolhendo os temas para o seu objetivo…",
  "Separando os mapas ideais para você…",
];

export default function QuizPage() {
  const router = useRouter();
  const [step, setStep] = useState(-1); // -1 = abertura
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [progress, setProgress] = useState(0);

  const analyzing = step === STEPS.length;

  useEffect(() => {
    if (!analyzing) return;
    const timer = setInterval(() => setProgress((p) => Math.min(p + 1, ANALYSIS.length)), 900);
    return () => clearInterval(timer);
  }, [analyzing]);

  function choose(value: string) {
    if (step === 0) trackCustom("QuizStart");
    const next = { ...answers, [STEPS[step].key]: value };
    setAnswers(next);
    setStep(step + 1);
  }

  function finish() {
    track("Lead", { content_name: answers.goal, content_category: answers.level });
    try {
      localStorage.setItem("mf-quiz", JSON.stringify(answers));
    } catch {}
    router.push(`/criar-conta?next=${encodeURIComponent("/app")}`);
  }

  return (
    <main className="quiz-page">
      <Logo size={30} />

      <div className="quiz-card">
        {step === -1 && (
          <div style={{ textAlign: "center" }}>
            <h1>Descubra o jeito mais rápido de <span className="grad-text">destravar seu inglês</span></h1>
            <p style={{ color: "var(--muted)", fontSize: 18, lineHeight: 1.6 }}>
              Responda 5 perguntas rápidas, descubra seu nível e crie 3 mapas mentais
              com áudio grátis, para o seu objetivo.
            </p>
            <button className="primary-btn grad-btn" style={{ fontSize: 18, padding: "18px 30px", marginTop: 12 }} onClick={() => setStep(0)}>
              Começar (1 minuto) →
            </button>
          </div>
        )}

        {step >= 0 && !analyzing && (
          <>
            <div className="progress">
              <div style={{ width: `${((step + 1) / STEPS.length) * 100}%`, background: "var(--grad)" }} />
            </div>
            <p style={{ color: "var(--muted)" }}>Pergunta {step + 1} de {STEPS.length}</p>
            <h1>{STEPS[step].question}</h1>
            {STEPS[step].options.map((opt) => (
              <button key={opt.value} className="quiz-choice" onClick={() => choose(opt.value)}>
                <span className="emoji">{opt.emoji}</span>
                {opt.label}
              </button>
            ))}
            {step > 0 && (
              <button className="secondary-btn" onClick={() => setStep(step - 1)}>← Voltar</button>
            )}
          </>
        )}

        {analyzing && (
          <div className="analyzing">
            <h1>{progress < ANALYSIS.length ? "Montando seu plano…" : "Seu plano está pronto! 🎉"}</h1>
            <div className="bar"><div style={{ width: `${(progress / ANALYSIS.length) * 100}%` }} /></div>
            <ul style={{ padding: 0 }}>
              {ANALYSIS.map((a, i) => (
                <li key={a} className={i < progress ? "done" : ""}>{i < progress ? "✓" : "○"} {a}</li>
              ))}
            </ul>
            {progress >= ANALYSIS.length && (
              <>
                <p style={{ color: "var(--muted)", lineHeight: 1.6 }}>
                  Seu nível estimado: <b style={{ color: "var(--text)" }}>{answers.level}</b>.
                  Crie sua conta grátis para ver seu diagnóstico completo e criar 3 mapas com áudio de presente.
                </p>
                <button className="primary-btn grad-btn" style={{ fontSize: 18, padding: "18px 30px" }} onClick={finish}>
                  Ver meu diagnóstico →
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
