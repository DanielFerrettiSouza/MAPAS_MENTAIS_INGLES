import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { GoogleGenAI } from "@google/genai";
import { GeneratedMapSchema, type GeneratedMap } from "./mapSchema";

const anthropic = new Anthropic(); // lê ANTHROPIC_API_KEY

const SYSTEM_PROMPT = `Você cria mapas mentais de inglês para brasileiros.
Regras:
- Conteúdo adequado ao nível CEFR pedido; frases curtas, naturais e úteis no dia a dia.
- Inglês correto e consistente (inglês britânico). Traduções naturais em português do Brasil.
- 4 a 6 ramos, cada um com 3 a 5 itens. Cada item é algo que vale a pena ouvir e repetir.
- Os prompts de ilustração descrevem ícones simples, coloridos, estilo flat, SEM nenhum texto ou letra.
- O quiz testa itens do próprio mapa.`;

export async function generateMapContent(input: {
  topic: string;
  level: string;
  goal?: string;
}): Promise<GeneratedMap> {
  const goalLine = input.goal ? `\nObjetivo do aluno: ${input.goal}` : "";
  const response = await anthropic.messages.parse({
    model: "claude-opus-5-5",
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    output_config: { effort: "low", format: zodOutputFormat(GeneratedMapSchema) },
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Tema: ${input.topic}\nNível: ${input.level}${goalLine}`,
      },
    ],
  });

  if (response.stop_reason === "refusal") {
    throw new Error("A IA recusou gerar esse tema. Tente outro assunto.");
  }
  if (!response.parsed_output) {
    throw new Error(`Resposta da IA incompleta (stop_reason: ${response.stop_reason}).`);
  }
  return response.parsed_output;
}

const IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL ?? "gemini-2.5-flash-image";
const IMAGE_STYLE =
  "Flat vector illustration, soft pastel colors, white background, centered, friendly, no text, no letters, no words.";

let gemini: GoogleGenAI | null = null;

// Gera uma ilustração via Gemini e devolve como data URL. Retorna null em
// caso de falha para que o mapa continue funcionando sem a imagem.
export async function generateIllustration(prompt: string): Promise<string | null> {
  if (!process.env.GEMINI_API_KEY) return null;
  gemini ??= new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const res = await gemini.models.generateContent({
      model: IMAGE_MODEL,
      contents: `${prompt}. ${IMAGE_STYLE}`,
    });
    for (const part of res.candidates?.[0]?.content?.parts ?? []) {
      if (part.inlineData?.data) {
        return `data:${part.inlineData.mimeType ?? "image/png"};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (err) {
    console.error("Falha ao gerar ilustração:", err);
    return null;
  }
}
