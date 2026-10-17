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
  // O que o plano soma para quem já comprou o Método (biblioteca, plano e bônus já são dele).
  metodoFeatures?: string[];
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
    credits: 15,
    features: ["15 mapas por mês", "Áudio nativo em cada frase", "Exercícios e revisão", "Histórico dos seus mapas", "Download em PNG"],
    metodoFeatures: ["Tudo do Método: 120 mapas, plano de estudos e bônus", "15 mapas com IA por mês, sobre o assunto que você quiser", "🎧 1 audiobook novo por mês, com texto em inglês e português"],
  },
  {
    id: "fluente",
    name: "Fluente",
    tagline: "Para quem estuda todo dia.",
    price: "R$49,90",
    oldPrice: "R$99,90",
    credits: 30,
    highlight: true,
    features: ["30 mapas por mês", "Tudo do Essencial", "Biblioteca com 120 mapas prontos (A1–C2)", "Plano de estudos pelo seu objetivo", "🎁 Bônus: 500 frases, 100 verbos e 150 expressões com áudio", "Suporte prioritário"],
    metodoFeatures: ["Tudo do Essencial", "30 mapas com IA por mês", "🎧 2 audiobooks novos por mês", "🗣️ Correção de pronúncia: grave a frase e veja o que ajustar", "Suporte prioritário"],
  },
  {
    id: "professor",
    name: "Professor",
    tagline: "Para quem ensina inglês.",
    price: "R$99,90",
    oldPrice: "R$199,90",
    credits: 50,
    features: ["50 mapas por mês", "Tudo do Fluente", "Mapas para imprimir e usar em aula", "Uso comercial com seus alunos"],
    metodoFeatures: ["Tudo do Fluente", "50 mapas com IA por mês", "📦 Aula pronta toda semana: audiobook + mapa + atividade com gabarito", "🔗 Link para a turma: alunos ouvem no celular, sem criar conta", "📝 Atividade em PDF com 1 clique, a partir de qualquer mapa", "🏷️ Material com o seu nome para entregar aos alunos"],
  },
];

// Link do checkout da Kiwify de cada plano (configurado na Vercel).
export function checkoutUrl(planId: string, email?: string | null) {
  const urls: Record<string, string | undefined> = {
    essencial: process.env.NEXT_PUBLIC_KIWIFY_ESSENCIAL,
    fluente: process.env.NEXT_PUBLIC_KIWIFY_FLUENTE,
    professor: process.env.NEXT_PUBLIC_KIWIFY_PROFESSOR,
    biblioteca: process.env.NEXT_PUBLIC_KIWIFY_BIBLIOTECA,
    pacote: process.env.NEXT_PUBLIC_KIWIFY_PACOTE,
    "kit-viagem": process.env.NEXT_PUBLIC_KIWIFY_KIT_VIAGEM ?? "https://pay.kiwify.com.br/FmUMtH7",
    "kit-trabalho": process.env.NEXT_PUBLIC_KIWIFY_KIT_TRABALHO ?? "https://pay.kiwify.com.br/3BH0kko",
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

// Produtos avulsos (pagamento único), vendidos como downsell.
export const EXTRAS = {
  biblioteca: { name: "Método Mapas Falantes (vitalício)", price: "R$57", installments: "12x de R$5,90", text: "120 mapas prontos do A1 ao C2, plano de estudos e os bônus (500 frases, 100 verbos, 150 gírias), tudo com áudio. Pague uma vez, acesse para sempre." },
  pacote: { name: "Pacote de 5 mapas", price: "R$19,90", text: "5 mapas novos com IA, sobre o assunto que você quiser. Sem assinatura." },
  credits: 5,
};

// Produto avulso pelo nome na Kiwify ("Mapas Falantes - Biblioteca", "Pacote 10 mapas").
export function extraFromProductName(name: string): "biblioteca" | "pacote" | null {
  const n = name.toLowerCase();
  if (n.includes("biblioteca") || n.includes("library") || n.includes("método") || n.includes("metodo")) return "biblioteca";
  if (n.includes("pacote") || n.includes("avulso") || n.includes("pack")) return "pacote";
  return null;
}
