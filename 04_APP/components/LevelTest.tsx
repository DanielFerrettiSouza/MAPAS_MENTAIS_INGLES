"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supa/client";
import { GOALS } from "@/lib/curriculum";
import { LEVEL_TEST, LEVEL_NAMES, levelFromScore } from "@/lib/levelTest";

// Teste de nível: objetivo + 12 perguntas. Salva nível e objetivo no perfil e
// o plano de estudos passa a começar no nível certo.
export default function LevelTest() {
  const router = useRouter();
  const [goal, setGoal] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const play = (text: string) => void new Audio(`/api/tts?text=${encodeURIComponent(text)}`).play().catch(() => {});

  async function finish(total: number) {
    const level = levelFromScore(total);
    setResult(level);
    setSaving(true);
    const label = GOALS.find((g) => g.tag === goal)?.label ?? "Dia a dia";
    await createSupabaseBrowser().auth.updateUser({ data: { level, goal: label, level_test: true } });
    setSaving(false);
    router.refresh();
  }

  function answer(i: number) {
    if (picked !== null) return;
    setPicked(i);
    const q = LEVEL_TEST[step];
    const total = correct + (i === q.answer ? 1 : 0);
    setTimeout(() => {
      setCorrect(total);
      setPicked(null);
      if (step + 1 < LEVEL_TEST.length) setStep(step + 1);
      else void finish(total);
    }, 650);
  }

  if (!goal) {
    return (
      <div className="lt-card">
        <p className="lt-kicker">Antes de começar</p>
        <h2>Qual é o seu principal objetivo com o inglês?</h2>
        <div className="lt-options">
          {GOALS.map((g) => (
            <button key={g.tag} className="quiz-choice" onClick={() => setGoal(g.tag)}>{g.emoji} {g.label}</button>
          ))}
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="lt-card" style={{ textAlign: "center" }}>
        <p className="lt-kicker">Resultado</p>
        <h2>Seu nível: <span className="grad-text">{result} · {LEVEL_NAMES[result]}</span></h2>
        <p className="app-sub">Você acertou {correct} de {LEVEL_TEST.length}. Seu plano de estudos começa no {result}, com os temas do seu objetivo primeiro.</p>
        <Link href="/app/plano" className="primary-btn grad-btn" aria-disabled={saving} style={{ marginTop: 16, display: "inline-block" }}>
          {saving ? "Montando seu plano…" : "Ver meu plano de estudos →"}
        </Link>
      </div>
    );
  }

  const q = LEVEL_TEST[step];
  return (
    <div className="lt-card">
      <div className="lt-progress"><span style={{ width: `${(step / LEVEL_TEST.length) * 100}%` }} /></div>
      <p className="lt-kicker">Pergunta {step + 1} de {LEVEL_TEST.length}</p>
      <h2>{q.prompt}</h2>
      {q.audio && <button className="lt-audio" onClick={() => play(q.audio!)}>🔊 Ouvir a frase</button>}
      <div className="lt-options">
        {q.options.map((o, i) => (
          <button
            key={o}
            className={`quiz-option${picked !== null && i === q.answer ? " correct" : ""}${picked === i && i !== q.answer ? " wrong" : ""}`}
            onClick={() => answer(i)}
          >
            {o}
          </button>
        ))}
        <button className="lt-skip" onClick={() => answer(-1)}>Não sei 🤷</button>
      </div>
    </div>
  );
}
