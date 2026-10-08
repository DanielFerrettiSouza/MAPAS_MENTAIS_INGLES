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

export const GeneratedMapSchema = z.object({
  title_en: z.string(),
  title_pt: z.string(),
  level: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]),
  cover_prompt: z
    .string()
    .describe("Descrição em inglês de uma ilustração central sem texto para o tema"),
  branches: z.array(MapBranchSchema).describe("4 a 6 ramos"),
  quiz: z.array(QuizQuestionSchema).describe("3 perguntas de revisão sobre o mapa"),
});

export type GeneratedMap = z.infer<typeof GeneratedMapSchema>;

// Resposta da API: o mapa + ilustrações (data URL ou null se a geração de imagem falhar).
export type MapWithImages = GeneratedMap & {
  cover_image: string | null;
  branch_images: (string | null)[];
};
