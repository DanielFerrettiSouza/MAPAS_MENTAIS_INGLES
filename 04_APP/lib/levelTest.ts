// Teste de nível do Método: 12 perguntas fixas (2 por nível, do A1 ao C2),
// algumas de compreensão de áudio. Sem custo de IA.
export type LevelQuestion = {
  level: string;
  prompt: string;
  audio?: string; // frase em inglês que a pessoa ouve antes de responder
  options: string[];
  answer: number; // índice da opção certa
};

export const LEVEL_TEST: LevelQuestion[] = [
  { level: "A1", prompt: "She ___ a teacher.", options: ["is", "are", "am", "be"], answer: 0 },
  { level: "A1", prompt: "Ouça. O que a pessoa perguntou?", audio: "How old are you?", options: ["Quantos anos você tem?", "Como você está?", "Onde você mora?", "Qual é o seu nome?"], answer: 0 },
  { level: "A2", prompt: "Yesterday I ___ to the beach.", options: ["go", "went", "gone", "going"], answer: 1 },
  { level: "A2", prompt: "O que significa “I'm looking for the station”?", options: ["Estou procurando a estação", "Estou olhando a estação", "Estou saindo da estação", "Estou perto da estação"], answer: 0 },
  { level: "B1", prompt: "I have lived here ___ 2015.", options: ["for", "since", "from", "during"], answer: 1 },
  { level: "B1", prompt: "Ouça. O que a pessoa disse?", audio: "If it rains tomorrow, we'll stay home.", options: ["Choveu ontem e ficamos em casa", "Se chovesse, ficaríamos em casa", "Se chover amanhã, vamos ficar em casa", "Amanhã vamos sair mesmo com chuva"], answer: 2 },
  { level: "B2", prompt: "If I ___ more time, I would travel more.", options: ["have", "had", "will have", "would have"], answer: 1 },
  { level: "B2", prompt: "O que significa “It's not worth it”?", options: ["Não está pronto", "Não é verdade", "Não vale a pena", "Não é barato"], answer: 2 },
  { level: "C1", prompt: "Hardly ___ arrived when the meeting started.", options: ["I had", "had I", "did I", "I have"], answer: 1 },
  { level: "C1", prompt: "Ouça. O que a pessoa disse?", audio: "I'd rather you didn't tell anyone.", options: ["Eu já contei para todo mundo", "Você deveria contar para alguém", "Eu não sabia que você tinha contado", "Eu preferiria que você não contasse para ninguém"], answer: 3 },
  { level: "C2", prompt: "The proposal was rejected, ___ its obvious merits.", options: ["despite of", "although", "notwithstanding", "whereas"], answer: 2 },
  { level: "C2", prompt: "O que significa “He's beating around the bush”?", options: ["Ele está trabalhando no jardim", "Ele está enrolando para não ir direto ao ponto", "Ele está muito irritado", "Ele está fugindo de alguém"], answer: 1 },
];

export const TEST_PHRASES = new Set(LEVEL_TEST.flatMap((q) => (q.audio ? [q.audio] : [])));

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
export const LEVEL_NAMES: Record<string, string> = {
  A1: "Primeiros passos", A2: "Sobrevivência", B1: "Independente", B2: "Natural", C1: "Avançado", C2: "Domínio",
};

// Acertos → nível: 0–2 A1, 3–4 A2, 5–6 B1, 7–8 B2, 9–10 C1, 11–12 C2.
export function levelFromScore(correct: number) {
  return LEVELS[Math.min(5, Math.floor(Math.max(0, correct - 1) / 2))];
}
