"use client";

import { useEffect, useRef, useState } from "react";
import { track, trackCustom } from "@/lib/pixel";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { FIRST_EMOJI, FIRST_OPTIONS, GOAL_PREVIEW, LEVEL_MSG, PAIN_MSG, TIME_MSG, TIME_STEPS, TRIED_MSG } from "@/lib/quizFunnel";
import { LEVEL_INFO } from "@/lib/quizPlan";

// Quiz = funil de conversão: cada resposta é seguida de uma tela que reforça a decisão
// (incentivo, amostra de mapa com áudio, explicação do método), até o plano e o cadastro.
type Option = { label: string; value: string; emoji: string };
type Question = { kind: "q"; key: string; question: string; options: Option[] };
type Info = { kind: "info"; key: string };
type Screen = Question | Info;

const SCREENS: Screen[] = [
  {
    kind: "q",
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
  { kind: "info", key: "level" },
  {
    kind: "q",
    key: "goal",
    question: "Para que você quer o inglês?",
    options: [
      { emoji: "✈️", label: "Viajar", value: "viagem" },
      { emoji: "💼", label: "Trabalho e carreira", value: "trabalho" },
      { emoji: "🎬", label: "Filmes, séries e músicas", value: "series" },
      { emoji: "🎓", label: "Prova ou intercâmbio", value: "prova" },
    ],
  },
  { kind: "info", key: "goal" },
  {
    kind: "q",
    key: "pain",
    question: "O que mais te trava hoje?",
    options: [
      { emoji: "👂", label: "Não entendo quando falam rápido", value: "listening" },
      { emoji: "🗣️", label: "Tenho vergonha da minha pronúncia", value: "pronuncia" },
      { emoji: "🧩", label: "Esqueço o vocabulário", value: "vocabulario" },
      { emoji: "📚", label: "A gramática me confunde", value: "gramatica" },
    ],
  },
  { kind: "info", key: "pain" },
  {
    kind: "q",
    key: "tried",
    question: "Você já tentou estudar com...",
    options: [
      { emoji: "📄", label: "PDFs e apostilas", value: "pdf" },
      { emoji: "📱", label: "Apps de idioma", value: "apps" },
      { emoji: "🏫", label: "Curso ou escola", value: "curso" },
      { emoji: "🙋", label: "Nunca estudei de verdade", value: "nunca" },
    ],
  },
  { kind: "info", key: "tried" },
  {
    kind: "q",
    key: "time",
    question: "Quanto tempo por dia você tem?",
    options: [
      { emoji: "⏱️", label: "5 minutos", value: "5" },
      { emoji: "⏳", label: "15 minutos", value: "15" },
      { emoji: "🕐", label: "30 minutos ou mais", value: "30" },
    ],
  },
  { kind: "info", key: "time" },
  { kind: "q", key: "first", question: "Qual situação você quer resolver primeiro?", options: [] },
];

const QUESTIONS = SCREENS.filter((s) => s.kind === "q").length;

const ANALYSIS = [
  "Analisando seu nível…",
  "Escolhendo os temas para o seu objetivo…",
  "Montando seu plano de 30 dias…",
];

export default function QuizPage() {
  const router = useRouter();
  const [step, setStep] = useState(-1); // -1 = abertura
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [emailDone, setEmailDone] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const analyzing = step === SCREENS.length;
  const screen = SCREENS[step] as Screen | undefined;
  const asked = SCREENS.slice(0, Math.max(0, step + 1)).filter((s) => s.kind === "q").length;

  useEffect(() => {
    if (!analyzing) return;
    const timer = setInterval(() => setProgress((p) => Math.min(p + 1, ANALYSIS.length)), 900);
    return () => clearInterval(timer);
  }, [analyzing]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [step]);

  // Os áudios da amostra já ficam guardados no servidor; aqui são pré-carregados
  // assim que a pessoa escolhe o objetivo, para tocar na hora do clique.
  const preloaded = useRef<Record<string, HTMLAudioElement>>({});
  useEffect(() => {
    const g = GOAL_PREVIEW[answers.goal ?? ""];
    if (!g) return;
    for (const it of g.items) {
      if (preloaded.current[it.en]) continue;
      const a = new Audio(`/api/tts?text=${encodeURIComponent(it.en)}`);
      a.preload = "auto";
      a.onended = () => setPlaying(null);
      preloaded.current[it.en] = a;
    }
  }, [answers.goal]);

  function choose(key: string, value: string) {
    if (step === 0) trackCustom("QuizStart");
    setAnswers({ ...answers, [key]: value });
    setStep(step + 1);
  }

  function play(text: string) {
    Object.values(preloaded.current).forEach((x) => x.pause());
    const a = preloaded.current[text] ?? audioRef.current;
    if (!a) return;
    setPlaying(text);
    if (!preloaded.current[text]) a.src = `/api/tts?text=${encodeURIComponent(text)}`;
    a.currentTime = 0;
    a.play().catch(() => setPlaying(null));
  }

  // E-mail no fim do quiz: o Lead vai com e-mail (Meta encontra a pessoa) e o Klaviyo
  // consegue lembrar quem viu o plano e não criou conta.
  function submitEmail(e: React.FormEvent) {
    e.preventDefault();
    const clean = email.trim().toLowerCase();
    track("Lead", { content_name: answers.goal, content_category: answers.level, ...answers }, clean);
    try {
      localStorage.setItem("mf-quiz", JSON.stringify(answers));
      localStorage.setItem("mf-email", clean);
    } catch {}
    setEmailDone(true);
  }

  function finish() {
    try {
      localStorage.setItem("mf-quiz", JSON.stringify(answers));
    } catch {}
    const next = answers.first
      ? `/app/criar?${new URLSearchParams({ topic: answers.first, level: answers.level ?? "A1" })}`
      : "/app";
    router.push(`/criar-conta?next=${encodeURIComponent(next)}`);
  }

  const options = (s: Question): Option[] =>
    s.key === "first"
      ? (FIRST_OPTIONS[answers.goal ?? ""] ?? FIRST_OPTIONS.viagem).map((t) => ({ emoji: FIRST_EMOJI[t] ?? "🗺️", label: t, value: t }))
      : s.options;

  const next = (
    <button className="primary-btn grad-btn quiz-next" onClick={() => setStep(step + 1)}>
      Continuar →
    </button>
  );

  function renderInfo(key: string) {
    if (key === "level") {
      const m = LEVEL_MSG[answers.level ?? "A1"];
      return (
        <div className="quiz-info">
          <Ill name={(answers.level ?? "A1").toLowerCase()} />
          <p className="quiz-kicker">Seu ponto de partida: {answers.level} · {LEVEL_INFO[answers.level ?? "A1"]?.name}</p>
          <h1>{m.title}</h1>
          <p>{m.text}</p>
          {next}
        </div>
      );
    }
    if (key === "goal") {
      const g = GOAL_PREVIEW[answers.goal ?? "viagem"];
      return (
        <div className="quiz-info">
          <p className="quiz-kicker">Olha um pedaço de um mapa para você</p>
          <h1>Toque e ouça 🔊</h1>
          <div className="quiz-mini-map">
            <img className="qmm-ill" src={`/quiz/${answers.goal ?? "viagem"}.webp`} alt="" aria-hidden />
            <div className="qmm-title">{g.title}</div>
            <div className="qmm-en">{g.en}</div>
            <ul>
              {g.items.map((it) => (
                <li key={it.en}>
                  <button className={`qmm-play ${playing === it.en ? "on" : ""}`} onClick={() => play(it.en)} aria-label={`Ouvir: ${it.en}`}>
                    {playing === it.en ? "🔊" : "▶"}
                  </button>
                  <span><b>{it.en}</b> = {it.pt}</span>
                </li>
              ))}
            </ul>
          </div>
          <p>No app, cada mapa tem as frases do assunto, o áudio de nativo, o erro mais comum de brasileiro e um mini exercício. E você cria um sobre <b>qualquer situação</b> em segundos.</p>
          {next}
        </div>
      );
    }
    const m =
      key === "pain" ? PAIN_MSG[answers.pain ?? ""] : key === "tried" ? TRIED_MSG[answers.tried ?? ""] : TIME_MSG[answers.time ?? "5"];
    if (!m) return next;
    return (
      <div className="quiz-info">
        <Ill name={key === "pain" ? answers.pain ?? "" : key === "tried" ? (answers.tried === "nunca" ? "a1" : answers.tried ?? "") : "time"} />
        {key === "pain" && <p className="quiz-kicker">O método: ver + ouvir + repetir</p>}
        {key === "tried" && <p className="quiz-kicker">Por que agora vai ser diferente</p>}
        {key === "time" && <p className="quiz-kicker">Seu ritmo</p>}
        <h1>{m.title}</h1>
        <p>{m.text}</p>
        {key === "pain" && (
          <div className="quiz-steps">
            <div><span>👀</span>Vê a frase organizada no mapa</div>
            <div><span>🔊</span>Ouve a pronúncia de nativo</div>
            <div><span>🗣️</span>Repete e fixa com o exercício</div>
          </div>
        )}
        {key === "time" && (
          <div className="quiz-steps">
            {(TIME_STEPS[answers.time ?? "5"] ?? TIME_STEPS["5"]).map((t) => (
              <div key={t.text}><span>{t.icon}</span>{t.text}</div>
            ))}
          </div>
        )}
        {next}
      </div>
    );
  }

  return (
    <main className="quiz-page">
      <audio ref={audioRef} onEnded={() => setPlaying(null)} />
      <Logo size={30} />

      <div className="quiz-card">
        {step === -1 && (
          <div style={{ textAlign: "center" }}>
            <h1>Descubra o jeito mais rápido de <span className="grad-text">destravar seu inglês</span></h1>
            <p style={{ color: "var(--muted)", fontSize: 18, lineHeight: 1.6 }}>
              Responda 6 perguntas rápidas, descubra seu nível e receba um plano de estudos com mapas mentais
              que falam — e 3 mapas grátis para começar.
            </p>
            <button className="primary-btn grad-btn" style={{ fontSize: 18, padding: "18px 30px", marginTop: 12 }} onClick={() => setStep(0)}>
              Começar (1 minuto) →
            </button>
          </div>
        )}

        {screen && (
          <>
            <div className="progress">
              <div style={{ width: `${(asked / QUESTIONS) * 100}%`, background: "var(--grad)" }} />
            </div>
            {screen.kind === "q" ? (
              <>
                <p style={{ color: "var(--muted)" }}>Pergunta {asked} de {QUESTIONS}</p>
                <h1>{screen.question}</h1>
                {options(screen).map((opt) => (
                  <button key={opt.value} className="quiz-choice" onClick={() => choose(screen.key, opt.value)}>
                    <span className="emoji">{opt.emoji}</span>
                    {opt.label}
                  </button>
                ))}
              </>
            ) : (
              renderInfo(screen.key)
            )}
            {step > 0 && (
              <button className="secondary-btn" style={{ marginTop: 10 }} onClick={() => setStep(step - 1)}>← Voltar</button>
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
            {progress >= ANALYSIS.length && !emailDone && (
              <form className="quiz-email" onSubmit={submitEmail}>
                <p>Para onde enviamos o seu plano?</p>
                <input
                  className="field"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="Seu melhor e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button className="primary-btn grad-btn" style={{ fontSize: 18, padding: "16px 24px", width: "100%" }}>
                  Ver meu plano →
                </button>
                <small>🔒 Sem spam. Só o seu plano e dicas de estudo.</small>
              </form>
            )}
            {progress >= ANALYSIS.length && emailDone && (
              <div className="quiz-result">
                <div className="quiz-result-row"><span>Seu nível</span><b>{answers.level} · {LEVEL_INFO[answers.level ?? "A1"]?.name}</b></div>
                <div className="quiz-result-row"><span>Seu primeiro mapa</span><b>{answers.first}</b></div>
                <div className="quiz-result-row"><span>Seu ritmo</span><b>{answers.time} min por dia · 1 mapa por dia</b></div>
                <p className="quiz-result-note">
                  ✅ Crie sua conta grátis e gere o mapa <b>&quot;{answers.first}&quot;</b> agora, com áudio em cada frase.
                  Você ganha <b>3 mapas grátis</b> — sem cartão.
                </p>
                <button className="primary-btn grad-btn" style={{ fontSize: 18, padding: "18px 30px", width: "100%" }} onClick={finish}>
                  Criar meu primeiro mapa grátis →
                </button>
                <p className="quiz-result-small">
                  Depois dos 3 grátis, o Plano Fluente sai por R$49,90/mês, com 7 dias de garantia. Sem compromisso.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

// Ilustração em gravura (mesmo estilo dos mapas novos), sobre um "papel" claro.
function Ill({ name }: { name: string }) {
  if (!name) return null;
  return (
    <div className="quiz-ill">
      <img src={`/quiz/${name}.webp`} alt="" aria-hidden />
    </div>
  );
}
