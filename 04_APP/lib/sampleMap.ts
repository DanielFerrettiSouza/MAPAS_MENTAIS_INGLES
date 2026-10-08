import type { MapWithImages } from "./mapSchema";

const it = (pairs: [string, string][]) => pairs.map(([en, pt]) => ({ en, pt }));

// Mapa de exemplo usado na landing page (sem custo de IA).
export const SAMPLE_MAP: MapWithImages = {
  title_en: "Professions",
  title_pt: "Profissões",
  level: "A1",
  summary_pt: "Usamos palavras de profissão para dizer o que as pessoas fazem.",
  tip_pt: "Use a / an antes da profissão no singular: I am a teacher. He is an engineer.",
  common_mistake: { wrong: "I am teacher.", right: "I am a teacher.", why_pt: "Falta o artigo a antes da profissão." },
  exercises: [
    { sentence: "I am a ___.", hint_pt: "(professor)", answer: "teacher" },
    { sentence: "She is a ___.", hint_pt: "(médica)", answer: "doctor" },
    { sentence: "They are ___.", hint_pt: "(estudantes)", answer: "students" },
    { sentence: "He is a ___.", hint_pt: "(motorista)", answer: "driver" },
  ],
  cover_prompt: "",
  cover_image: null,
  branch_images: [null, null, null, null],
  quiz: [],
  branches: [
    { label_en: "Common jobs", label_pt: "Profissões comuns", illustration_prompt: "", items: it([["teacher", "professor(a)"], ["doctor", "médico(a)"], ["student", "estudante"], ["driver", "motorista"]]) },
    { label_en: "Other jobs", label_pt: "Outras profissões", illustration_prompt: "", items: it([["engineer", "engenheiro(a)"], ["police officer", "policial"], ["designer", "designer"]]) },
    { label_en: "Patterns", label_pt: "Padrões com to be", illustration_prompt: "", items: it([["I am a teacher.", "Eu sou professor."], ["She is a doctor.", "Ela é médica."], ["They are students.", "Eles são estudantes."]]) },
    { label_en: "Useful questions", label_pt: "Perguntas úteis", illustration_prompt: "", items: it([["What do you do?", "O que você faz?"], ["What is your job?", "Qual é o seu trabalho?"], ["Where do you work?", "Onde você trabalha?"]]) },
  ],
};
