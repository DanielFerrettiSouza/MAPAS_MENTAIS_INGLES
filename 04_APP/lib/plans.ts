// Planos de assinatura (preços em reais). O checkout entra numa próxima etapa.
export type Plan = {
  id: string;
  name: string;
  tagline: string;
  price: string;
  oldPrice?: string;
  credits: number;
  highlight?: boolean;
  features: string[];
};

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Grátis",
    tagline: "Para experimentar.",
    price: "R$0",
    credits: 3,
    features: ["3 mapas com IA", "Áudio nativo em cada frase", "Exercícios e revisão", "Download em PNG"],
  },
  {
    id: "essencial",
    name: "Essencial",
    tagline: "Para estudar no seu ritmo.",
    price: "R$19,90",
    oldPrice: "R$39,90",
    credits: 30,
    features: ["30 mapas por mês", "Áudio nativo em cada frase", "Exercícios e revisão", "Histórico dos seus mapas", "Download em PNG"],
  },
  {
    id: "fluente",
    name: "Fluente",
    tagline: "Para quem estuda todo dia.",
    price: "R$29,90",
    oldPrice: "R$59,90",
    credits: 60,
    highlight: true,
    features: ["60 mapas por mês", "Tudo do Essencial", "Biblioteca A1–C2 pronta", "Plano de estudos pelo seu objetivo", "Suporte prioritário"],
  },
  {
    id: "professor",
    name: "Professor",
    tagline: "Para quem ensina inglês.",
    price: "R$59,90",
    oldPrice: "R$119,90",
    credits: 200,
    features: ["200 mapas por mês", "Tudo do Fluente", "Mapas para imprimir e usar em aula", "Uso comercial com seus alunos"],
  },
];

export function planName(id: string) {
  return PLANS.find((p) => p.id === id)?.name ?? "Grátis";
}
