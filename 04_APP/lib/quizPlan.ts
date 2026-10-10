// Diagnóstico do quiz: o que mostrar no painel e quais mapas sugerir.
export type QuizAnswers = { level?: string; goal?: string; pain?: string; tried?: string; time?: string };

export const LEVEL_INFO: Record<string, { name: string; text: string }> = {
  A1: { name: "Iniciante", text: "Comece pelo essencial: frases prontas e vocabulário do dia a dia." },
  A2: { name: "Básico", text: "Você já tem a base. Agora é ganhar vocabulário e frases úteis para situações reais." },
  B1: { name: "Intermediário", text: "Você se vira. O próximo passo é ganhar fluidez com expressões e phrasal verbs." },
  B2: { name: "Intermediário avançado", text: "Falta pouco para a fluência: foque em expressões naturais e nos erros que te travam." },
  C1: { name: "Avançado", text: "Hora de polir: expressões idiomáticas, nuances e vocabulário mais rico." },
  C2: { name: "Proficiente", text: "Refinamento: estilo, nuances e expressões de nativo." },
};

const GOAL_LABEL: Record<string, string> = {
  viagem: "viajar",
  trabalho: "trabalho e carreira",
  series: "filmes, séries e músicas",
  prova: "prova ou intercâmbio",
};

const PAIN_TIP: Record<string, string> = {
  listening: "Toque nas frases do mapa e ouça várias vezes — treina o ouvido para a fala rápida.",
  pronuncia: "Ouça cada frase e repita em voz alta logo depois: é o jeito mais rápido de perder a vergonha.",
  vocabulario: "Revise seus mapas no dia seguinte: a revisão é o que faz a palavra ficar.",
  gramatica: "Os mapas mostram a regra com exemplos prontos — aprenda pelo uso, não pela decoreba.",
};

const GOAL_TOPICS: Record<string, string[]> = {
  viagem: ["Inglês no aeroporto", "Check-in no hotel", "Pedindo comida no restaurante"],
  trabalho: ["Inglês para reuniões de trabalho", "Entrevista de emprego em inglês", "E-mails profissionais em inglês"],
  series: ["Expressões comuns em séries americanas", "Gírias do inglês americano", "Phrasal verbs do dia a dia"],
  prova: ["Conectivos para redação em inglês", "Tempos verbais mais cobrados", "Vocabulário acadêmico"],
};

const BASIC_TOPICS = ["Verbo to be", "Apresentar-se em inglês", "Números, horas e datas"];

export function quizPlan(a: QuizAnswers) {
  const level = a.level && LEVEL_INFO[a.level] ? a.level : "A1";
  const goalTopics = GOAL_TOPICS[a.goal ?? ""] ?? ["Inglês do dia a dia", "Phrasal verbs do dia a dia", "Pedindo comida no restaurante"];
  // Iniciante: 1 tema de base + 2 do objetivo.
  const topics = level === "A1" ? [BASIC_TOPICS[0], ...goalTopics.slice(0, 2)] : goalTopics;
  return {
    level,
    levelName: LEVEL_INFO[level].name,
    levelText: LEVEL_INFO[level].text,
    goal: a.goal ? GOAL_LABEL[a.goal] : undefined,
    tip: a.pain ? PAIN_TIP[a.pain] : undefined,
    time: a.time,
    topics,
  };
}
