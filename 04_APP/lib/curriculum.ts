// Temas da Biblioteca pronta (20 por nível). Cada tema vira um mapa gerado uma
// única vez pelo dono (botão no /app/admin) e compartilhado com todos os assinantes.
// Tags de objetivo: v = viagem, t = trabalho, s = séries/músicas, p = prova, d = dia a dia.
export type Topic = { slug: string; level: string; topic: string; tags: string };

const L = (level: string, rows: [string, string][]): Topic[] =>
  rows.map(([topic, tags], i) => ({ slug: `${level.toLowerCase()}-${String(i + 1).padStart(2, "0")}`, level, topic, tags }));

export const CURRICULUM: Topic[] = [
  ...L("A1", [
    ["Alfabeto e soletrar nomes", "dvp"], ["Cumprimentos e apresentações", "dvt"], ["Verbo to be (am, is, are)", "dpv"],
    ["Números, idade e telefone", "dv"], ["Dias da semana, meses e datas", "dp"], ["Família", "d"],
    ["Profissões", "td"], ["Cores e roupas", "dv"], ["Comidas e bebidas", "dv"], ["Partes da casa e objetos", "d"],
    ["Rotina diária", "d"], ["Presente simples (I work, she works)", "pd"], ["Artigos a, an, the", "p"],
    ["Pronomes pessoais e possessivos", "p"], ["There is / There are", "dv"], ["Preposições de lugar (in, on, under)", "dp"],
    ["Horas e horários", "dvt"], ["Pedindo comida no restaurante", "v"], ["Fazendo compras e preços", "v"], ["Can e can't (habilidades)", "d"],
  ]),
  ...L("A2", [
    ["Passado do verbo to be (was, were)", "pd"], ["Passado simples: verbos regulares", "pd"], ["Passado simples: verbos irregulares", "pd"],
    ["Presente contínuo (I am working)", "pd"], ["Futuro com going to", "pd"], ["Comparativos e superlativos", "p"],
    ["Much, many, a lot of", "p"], ["Some e any", "p"], ["Preposições de tempo (in, on, at)", "p"],
    ["No aeroporto", "v"], ["No hotel", "v"], ["Pedindo e dando direções", "v"],
    ["No médico e na farmácia", "vd"], ["Clima e estações do ano", "dv"], ["Hobbies e tempo livre", "ds"],
    ["Adjetivos de personalidade", "ds"], ["Fazendo convites e planos", "d"], ["Advérbios de frequência", "pd"],
    ["Falando ao telefone", "tv"], ["Small talk: conversa rápida", "dtv"],
  ]),
  ...L("B1", [
    ["Presente perfeito (I have done)", "p"], ["Presente perfeito × passado simples", "p"], ["Passado contínuo (I was doing)", "p"],
    ["Will × going to", "p"], ["Condicional zero e primeiro (if)", "p"], ["Modal verbs: should, must, have to", "pt"],
    ["Phrasal verbs do dia a dia", "ds"], ["Phrasal verbs de viagem", "v"], ["Gerúndio × infinitivo", "p"],
    ["Pronomes relativos (who, which, that)", "p"], ["Entrevista de emprego", "t"], ["Reuniões online", "t"],
    ["E-mails profissionais", "t"], ["Dando opinião e concordando", "dtp"], ["Reclamações e problemas", "vd"],
    ["Expressões com get", "ds"], ["Expressões com make e do", "dp"], ["Falando de experiências de viagem", "v"],
    ["Ever, never, already, yet", "p"], ["Used to (costumava)", "ds"],
  ]),
  ...L("B2", [
    ["Segundo condicional (if I were)", "p"], ["Terceiro condicional (if I had known)", "p"], ["Voz passiva", "p"],
    ["Discurso indireto (reported speech)", "p"], ["Presente perfeito contínuo", "p"], ["Modais de dedução (must be, can't be)", "p"],
    ["Wish e if only", "ps"], ["Phrasal verbs de trabalho", "t"], ["Gírias de séries americanas", "s"],
    ["Expressões idiomáticas comuns", "sd"], ["Apresentações em inglês", "t"], ["Negociação", "t"],
    ["Conectivos (however, although, despite)", "pt"], ["Falsos cognatos", "dp"], ["Collocations essenciais", "p"],
    ["Expressando sentimentos", "ds"], ["Contando histórias no passado", "ds"], ["Fazendo pedidos educados", "tv"],
    ["Inglês para redes sociais", "s"], ["Linking words para redação", "p"],
  ]),
  ...L("C1", [
    ["Inversão para ênfase (never have I)", "p"], ["Cleft sentences (what I need is)", "p"], ["Modais no passado (should have)", "p"],
    ["Condicionais mistas", "p"], ["Phrasal verbs avançados", "ps"], ["Expressões idiomáticas de negócios", "t"],
    ["Hedging: falar com cautela", "tp"], ["Inglês para entrevistas difíceis", "t"], ["Debatendo e argumentando", "pt"],
    ["Ironia e sarcasmo em séries", "s"], ["Vocabulário de notícias", "p"], ["Redação acadêmica", "p"],
    ["Expressões com time", "ds"], ["Registro formal × informal", "tp"], ["Linguagem corporativa (buzzwords)", "t"],
    ["Descrevendo tendências e gráficos", "tp"], ["Humor e trocadilhos", "s"], ["Persuasão e vendas", "t"],
    ["Inglês britânico × americano", "sv"], ["Pronúncia: sons difíceis para brasileiros", "d"],
  ]),
  ...L("C2", [
    ["Nuances de modais", "p"], ["Subjuntivo (I suggest he go)", "p"], ["Estruturas enfáticas avançadas", "p"],
    ["Idioms raros e elegantes", "s"], ["Phrasal verbs com múltiplos sentidos", "p"], ["Gíria e linguagem de rua", "s"],
    ["Inglês jurídico básico", "t"], ["Inglês financeiro", "t"], ["Liderança e feedback", "t"],
    ["Falar em público", "t"], ["Escrita persuasiva", "p"], ["Literatura e figuras de linguagem", "ps"],
    ["Expressões de cultura pop", "s"], ["Diplomacia e linguagem indireta", "t"], ["Collocations avançadas", "p"],
    ["Conversas sobre política e sociedade", "p"], ["Entonação e ritmo nativo", "ds"], ["Abreviações e linguagem de chat", "s"],
    ["Provérbios em inglês", "ds"], ["Revisão: erros de falantes avançados", "p"],
  ]),
];

export const GOALS: { tag: string; label: string; emoji: string }[] = [
  { tag: "v", label: "Viajar", emoji: "✈️" },
  { tag: "t", label: "Trabalho", emoji: "💼" },
  { tag: "s", label: "Séries e músicas", emoji: "🎬" },
  { tag: "p", label: "Prova / gramática", emoji: "🎓" },
  { tag: "d", label: "Dia a dia", emoji: "💬" },
];

// Converte o objetivo salvo no perfil (texto) para uma tag.
export function goalTag(goal?: string | null) {
  const g = (goal ?? "").toLowerCase();
  if (g.includes("viag")) return "v";
  if (g.includes("trab") || g.includes("carre")) return "t";
  if (g.includes("série") || g.includes("serie") || g.includes("filme") || g.includes("músic")) return "s";
  if (g.includes("prova") || g.includes("interc")) return "p";
  return "d";
}

export const LIBRARY_PLANS = ["fluente", "professor"];
