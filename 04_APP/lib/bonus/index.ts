import frases from "./frases.json";
import verbos from "./verbos.json";
import expressoes from "./expressoes.json";

// Bônus do método: coleções prontas com áudio (conteúdo revisado, gerado uma vez).
export type BonusItem = { en: string; pt: string; ex_en: string; ex_pt: string };
export type Bonus = { title: string; sections: { theme: string; items: BonusItem[] }[] };

export const BONUS: Record<string, Bonus & { emoji: string; text: string }> = {
  frases: { ...(frases as Bonus), emoji: "💬", text: "As frases que você mais vai usar, por situação." },
  verbos: { ...(verbos as Bonus), emoji: "⚡", text: "Os verbos do dia a dia, com frase de exemplo." },
  expressoes: { ...(expressoes as Bonus), emoji: "😎", text: "O que os nativos falam de verdade." },
};
