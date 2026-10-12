// Kits temáticos (order bumps do Método): 20 mapas prontos cada, no mesmo
// formato da biblioteca. Gerados uma vez (scripts/gen-kits.ts) e guardados em
// library_maps com slug "kit-<id>-NN". Acesso em app_metadata.kits (webhook).
export type Kit = { id: string; name: string; emoji: string; text: string; topics: [string, string][] };

export const KITS: Kit[] = [
  {
    id: "viagem",
    name: "Kit Viagem",
    emoji: "✈️",
    text: "Do aeroporto ao hotel, do restaurante à farmácia: o inglês da viagem inteira.",
    topics: [
      ["Planejando a viagem e fazendo reservas", "A2"],
      ["Check-in no aeroporto", "A2"],
      ["Segurança e embarque", "A2"],
      ["Dentro do avião", "A2"],
      ["Imigração e alfândega", "B1"],
      ["Bagagem perdida ou extraviada", "B1"],
      ["Do aeroporto ao hotel: táxi, Uber e transfer", "A2"],
      ["Check-in e problemas no hotel", "A2"],
      ["Airbnb: conversando com o anfitrião", "B1"],
      ["Pedindo informações e direções na rua", "A2"],
      ["Metrô, ônibus e trem", "A2"],
      ["Alugando um carro e dirigindo", "B1"],
      ["Restaurante: reserva, pedido e gorjeta", "A2"],
      ["Fast food e cafeterias", "A1"],
      ["Compras, tamanhos e trocas", "A2"],
      ["Parques temáticos e atrações", "A2"],
      ["Passeios e tours guiados", "B1"],
      ["Farmácia e emergências médicas", "B1"],
      ["Imprevistos: voo atrasado, perdas e reclamações", "B1"],
      ["Conversando com locais e outros turistas", "B1"],
    ],
  },
  {
    id: "trabalho",
    name: "Kit Trabalho",
    emoji: "💼",
    text: "Reuniões, e-mails, entrevistas e calls: o inglês que o mercado pede.",
    topics: [
      ["Apresentando-se no trabalho", "A2"],
      ["Entrevista de emprego: perguntas comuns", "B1"],
      ["Entrevista: falando de experiências e conquistas", "B2"],
      ["Escrevendo e-mails profissionais", "B1"],
      ["Reuniões: abrir, participar e encerrar", "B1"],
      ["Videochamadas e problemas técnicos", "B1"],
      ["Dando opinião e discordando com educação", "B2"],
      ["Apresentações e pitch", "B2"],
      ["Telefonemas profissionais", "B1"],
      ["Prazos, tarefas e atualizações de projeto", "B1"],
      ["Negociação", "B2"],
      ["Atendimento ao cliente", "B1"],
      ["Vendas e conversa com clientes", "B2"],
      ["Feedback e avaliação de desempenho", "B2"],
      ["Conversa informal no escritório", "B1"],
      ["Mensagens no Slack e no Teams", "B1"],
      ["Phrasal verbs do trabalho", "B1"],
      ["Termos de tecnologia e TI", "B2"],
      ["Viagem a trabalho e eventos", "B1"],
      ["LinkedIn e networking", "B2"],
    ],
  },
];

export const kitSlug = (kit: string, i: number) => `kit-${kit}-${String(i + 1).padStart(2, "0")}`;

export function kitFromProductName(name: string): string | null {
  const n = name.toLowerCase();
  if (!n.includes("kit")) return null;
  return KITS.find((k) => n.includes(k.id))?.id ?? null;
}

type UserLike = { email?: string | null; app_metadata?: Record<string, unknown> } | null | undefined;
export function userKits(user: UserLike): string[] {
  const k = user?.app_metadata?.kits;
  return Array.isArray(k) ? (k as string[]) : [];
}
