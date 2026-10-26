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

// Versão em espanhol: mesmas perguntas, áudios e respostas; enunciados e alternativas traduzidos.
const ES_TEXT: Record<number, { prompt?: string; options?: string[] }> = {
  1: { prompt: "Escucha. ¿Qué preguntó la persona?", options: ["¿Cuántos años tienes?", "¿Cómo estás?", "¿Dónde vives?", "¿Cómo te llamas?"] },
  3: { prompt: "¿Qué significa “I'm looking for the station”?", options: ["Estoy buscando la estación", "Estoy mirando la estación", "Estoy saliendo de la estación", "Estoy cerca de la estación"] },
  5: { prompt: "Escucha. ¿Qué dijo la persona?", options: ["Llovió ayer y nos quedamos en casa", "Si lloviera, nos quedaríamos en casa", "Si llueve mañana, nos vamos a quedar en casa", "Mañana vamos a salir aunque llueva"] },
  7: { prompt: "¿Qué significa “It's not worth it”?", options: ["No está listo", "No es verdad", "No vale la pena", "No es barato"] },
  9: { prompt: "Escucha. ¿Qué dijo la persona?", options: ["Ya se lo conté a todo el mundo", "Deberías contárselo a alguien", "No sabía que lo habías contado", "Preferiría que no se lo contaras a nadie"] },
  11: { prompt: "¿Qué significa “He's beating around the bush”?", options: ["Está trabajando en el jardín", "Está dando rodeos para no ir al grano", "Está muy enojado", "Está huyendo de alguien"] },
};
export const LEVEL_TEST_ES: LevelQuestion[] = LEVEL_TEST.map((q, i) => ({ ...q, ...ES_TEXT[i] }));
export const LEVEL_NAMES_ES: Record<string, string> = {
  A1: "Primeros pasos", A2: "Supervivencia", B1: "Independiente", B2: "Natural", C1: "Avanzado", C2: "Dominio",
};
export const GOAL_LABELS_ES: Record<string, string> = { v: "Viajar", t: "Trabajo", s: "Series y música", p: "Exámenes / gramática", d: "Día a día" };
