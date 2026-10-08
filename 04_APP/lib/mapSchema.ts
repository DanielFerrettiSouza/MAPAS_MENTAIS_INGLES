import { z } from "zod";

// Estrutura de um mapa gerado por IA. A IA de texto só devolve conteúdo;
// o desenho do mapa é feito pelo app (texto sempre correto) e as
// ilustrações vêm da IA de imagem, sem texto dentro.
export const MapItemSchema = z.object({
  en: z.string().describe("Palavra ou frase curta em inglês, como será falada no áudio"),
  pt: z.string().describe("Tradução natural em português do Brasil"),
});

export const MapBranchSchema = z.object({
  label_en: z.string().describe("Nome do ramo em inglês, 1 a 3 palavras"),
  label_pt: z.string().describe("Nome do ramo em português"),
  illustration_prompt: z
    .string()
    .describe("Descrição em inglês de um ícone simples e sem texto que represente o ramo"),
  items: z.array(MapItemSchema).describe("3 a 5 itens"),
});

export const QuizQuestionSchema = z.object({
  question_pt: z.string(),
  options: z.array(z.string()).describe("4 alternativas"),
  answer_index: z.number().int().describe("Índice (0-3) da alternativa correta"),
});

export const ExerciseSchema = z.object({
  sentence: z
    .string()
    .describe("Frase em inglês com uma lacuna marcada como ___ (três underlines)"),
  hint_pt: z.string().describe("Dica curta em português entre parênteses, ex.: (professor)"),
  answer: z.string().describe("Palavra que completa a lacuna"),
});

export const GeneratedMapSchema = z.object({
  title_en: z.string().describe("Título curto em inglês, 1 a 3 palavras"),
  title_pt: z.string().describe("Título curto em português, 1 a 3 palavras"),
  summary_pt: z
    .string()
    .describe("Explicação central do tema em português, 1 frase de até 15 palavras"),
  tip_pt: z.string().describe("Dica rápida de gramática ou uso, em português, até 25 palavras"),
  common_mistake: z.object({
    wrong: z.string().describe("Frase em inglês com o erro típico de brasileiros"),
    right: z.string().describe("A mesma frase corrigida"),
    why_pt: z.string().describe("Por que está errado, em português, até 12 palavras"),
  }),
  exercises: z.array(ExerciseSchema).describe("4 frases para completar"),
  level: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]),
  cover_prompt: z
    .string()
    .describe("Descrição em inglês de uma ilustração central sem texto para o tema"),
  branches: z.array(MapBranchSchema).describe("exatamente 4 ramos"),
  quiz: z.array(QuizQuestionSchema).describe("3 perguntas de revisão sobre o mapa"),
});

export type GeneratedMap = z.infer<typeof GeneratedMapSchema>;

// Resposta da API: o mapa + ilustrações (data URL ou null se a geração de imagem falhar).
export type MapWithImages = GeneratedMap & {
  cover_image: string | null;
  branch_images: (string | null)[];
};
