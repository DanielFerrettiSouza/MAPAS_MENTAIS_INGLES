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
    price: "R$29,90",
    oldPrice: "R$59,90",
    credits: 30,
    features: ["30 mapas por mês", "Áudio nativo em cada frase", "Exercícios e revisão", "Histórico dos seus mapas", "Download em PNG"],
  },
  {
    id: "fluente",
    name: "Fluente",
    tagline: "Para quem estuda todo dia.",
    price: "R$49,90",
    oldPrice: "R$99,90",
    credits: 60,
    highlight: true,
    features: ["60 mapas por mês", "Tudo do Essencial", "Biblioteca com 120 mapas prontos (A1–C2)", "Plano de estudos pelo seu objetivo", "Suporte prioritário"],
  },
  {
    id: "professor",
    name: "Professor",
    tagline: "Para quem ensina inglês.",
    price: "R$99,90",
    oldPrice: "R$199,90",
    credits: 200,
    features: ["200 mapas por mês", "Tudo do Fluente", "Mapas para imprimir e usar em aula", "Uso comercial com seus alunos"],
  },
];

// Link do checkout da Kiwify de cada plano (configurado na Vercel).
export function checkoutUrl(planId: string, email?: string | null) {
  const urls: Record<string, string | undefined> = {
    essencial: process.env.NEXT_PUBLIC_KIWIFY_ESSENCIAL,
    fluente: process.env.NEXT_PUBLIC_KIWIFY_FLUENTE,
    professor: process.env.NEXT_PUBLIC_KIWIFY_PROFESSOR,
  };
  const url = urls[planId];
  if (!url) return null;
  return email ? `${url}${url.includes("?") ? "&" : "?"}email=${encodeURIComponent(email)}` : url;
}

// Descobre o plano pelo nome do produto na Kiwify (ex.: "Mapas Falantes - Fluente").
export function planFromProductName(name: string) {
  // Aceita também as grafias em inglês (ex.: "Mapas Falantes Essential").
  const n = name.toLowerCase().replace("essential", "essencial").replace("fluent ", "fluente ").replace("teacher", "professor");
  return PLANS.find((p) => p.id !== "free" && n.includes(p.name.toLowerCase())) ?? null;
}

export function planName(id: string) {
  return PLANS.find((p) => p.id === id)?.name ?? "Grátis";
}
