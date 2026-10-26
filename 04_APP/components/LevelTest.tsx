"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supa/client";
import { GOALS } from "@/lib/curriculum";
import { LEVEL_TEST as TEST_PT, LEVEL_NAMES as NAMES_PT, LEVEL_TEST_ES, LEVEL_NAMES_ES, GOAL_LABELS_ES, levelFromScore } from "@/lib/levelTest";

// Teste de nível: objetivo + 12 perguntas. Salva nível e objetivo no perfil e
// o plano de estudos passa a começar no nível certo.
export default function LevelTest({ lang = "pt" }: { lang?: "pt" | "es" }) {
  const es = lang === "es";
  const t = (pt: string, sp: string) => (es ? sp : pt);
  const LEVEL_TEST = es ? LEVEL_TEST_ES : TEST_PT;
  const LEVEL_NAMES = es ? LEVEL_NAMES_ES : NAMES_PT;
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
        <p className="lt-kicker">{t("Antes de começar", "Antes de empezar")}</p>
        <h2>{t("Qual é o seu principal objetivo com o inglês?", "¿Cuál es tu principal objetivo con el inglés?")}</h2>
        <div className="lt-options">
          {GOALS.map((g) => (
            <button key={g.tag} className="quiz-choice" onClick={() => setGoal(g.tag)}>{g.emoji} {es ? GOAL_LABELS_ES[g.tag] : g.label}</button>
          ))}
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="lt-card" style={{ textAlign: "center" }}>
        <p className="lt-kicker">{t("Resultado", "Resultado")}</p>
        <h2>{t("Seu nível:", "Tu nivel:")} <span className="grad-text">{result} · {LEVEL_NAMES[result]}</span></h2>
        <p className="app-sub">{t(`Você acertou ${correct} de ${LEVEL_TEST.length}. Seu plano de estudos começa no ${result}, com os temas do seu objetivo primeiro.`, `Acertaste ${correct} de ${LEVEL_TEST.length}. Tu plan de estudio empieza en ${result}, con los temas de tu objetivo primero.`)}</p>
        <Link href="/app/plano" className="primary-btn grad-btn" aria-disabled={saving} style={{ marginTop: 16, display: "inline-block" }}>
          {saving ? t("Montando seu plano…", "Armando tu plan…") : t("Ver meu plano de estudos →", "Ver mi plan de estudio →")}
        </Link>
      </div>
    );
  }

  const q = LEVEL_TEST[step];
  return (
    <div className="lt-card">
      <div className="lt-progress"><span style={{ width: `${(step / LEVEL_TEST.length) * 100}%` }} /></div>
      <p className="lt-kicker">{t("Pergunta", "Pregunta")} {step + 1} {t("de", "de")} {LEVEL_TEST.length}</p>
      <h2>{q.prompt}</h2>
      {q.audio && <button className="lt-audio" onClick={() => play(q.audio!)}>🔊 {t("Ouvir a frase", "Escuchar la frase")}</button>}
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
        <button className="lt-skip" onClick={() => answer(-1)}>{t("Não sei 🤷", "No sé 🤷")}</button>
      </div>
    </div>
  );
}
