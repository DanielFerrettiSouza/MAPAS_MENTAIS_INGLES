// Conteúdo das telas intercaladas do quiz (funil de conversão).
// Regra: nada de número inventado de alunos/avaliações — só o que o app faz de verdade.

export const LEVEL_MSG: Record<string, { title: string; text: string }> = {
  A1: {
    title: "Ótimo momento para começar 🌱",
    text: "Começar do zero tem uma vantagem: você já aprende do jeito certo, ouvindo a pronúncia desde a primeira frase. Os mapas do nível A1 vão do mais simples — cumprimentos, verbo to be, números — e cada frase tem áudio de nativo.",
  },
  A2: {
    title: "Você já tem a base 📘",
    text: "Agora o que faz diferença é vocabulário de situações reais. Cada mapa junta as frases de um assunto num lugar só, com o áudio pra você ouvir e repetir.",
  },
  B1: {
    title: "Você está no ponto de virada 💬",
    text: "É no intermediário que a maioria trava, porque estuda regra solta. Com frases prontas por situação — e ouvindo como soam — a conversa começa a sair sem traduzir na cabeça.",
  },
  B2: {
    title: "Falta pouco para a fluência 🚀",
    text: "O que te trava agora são detalhes: expressões naturais, phrasal verbs e os erros que brasileiro repete. Todo mapa traz o erro mais comum do assunto já corrigido.",
  },
  C1: {
    title: "Hora de polir 🎓",
    text: "Você já fala. Agora é soar natural: expressões idiomáticas, nuances e vocabulário mais rico — organizados por tema e com áudio para pegar a entonação.",
  },
};

// "Um pedaço do mapa" do objetivo da pessoa — com áudio de verdade.
export const GOAL_PREVIEW: Record<string, { title: string; en: string; items: { en: string; pt: string }[] }> = {
  viagem: {
    title: "No aeroporto",
    en: "At the airport",
    items: [
      { en: "Where is gate twelve?", pt: "Onde fica o portão doze?" },
      { en: "I'd like a window seat, please.", pt: "Eu queria um assento na janela, por favor." },
      { en: "How long is the delay?", pt: "Quanto tempo é o atraso?" },
    ],
  },
  trabalho: {
    title: "Em reuniões",
    en: "In meetings",
    items: [
      { en: "Let's get started.", pt: "Vamos começar." },
      { en: "Could you send me the report?", pt: "Você pode me mandar o relatório?" },
      { en: "I'll get back to you.", pt: "Eu te dou um retorno." },
    ],
  },
  series: {
    title: "Expressões de séries",
    en: "TV show expressions",
    items: [
      { en: "Are you kidding me?", pt: "Tá de brincadeira?" },
      { en: "I've got your back.", pt: "Pode contar comigo." },
      { en: "My bad.", pt: "Foi mal." },
    ],
  },
  prova: {
    title: "Conectivos para redação",
    en: "Linking words",
    items: [
      { en: "However, the results were different.", pt: "No entanto, os resultados foram diferentes." },
      { en: "In addition, it is cheaper.", pt: "Além disso, é mais barato." },
      { en: "As a result, prices went up.", pt: "Como resultado, os preços subiram." },
    ],
  },
};

export const PAIN_MSG: Record<string, { title: string; text: string }> = {
  listening: {
    title: "Entender fala rápida é treino de ouvido 👂",
    text: "Ninguém entende o que nunca ouviu. Quando você lê a frase e escuta o áudio ao mesmo tempo, o cérebro liga o som à palavra — e na próxima vez você reconhece.",
  },
  pronuncia: {
    title: "Vergonha some com repetição 🗣️",
    text: "O caminho mais rápido é ouvir a frase de um nativo e repetir em voz alta logo em seguida, quantas vezes quiser, sem ninguém olhando. É exatamente isso que cada mapa permite.",
  },
  vocabulario: {
    title: "Você não esquece por falta de memória 🧩",
    text: "Palavra solta não gruda. Palavra dentro de uma situação, organizada num mapa e ouvida em voz alta, gruda — porque o cérebro guarda por imagem, som e contexto.",
  },
  gramatica: {
    title: "Gramática se aprende pelo uso 📚",
    text: "Em vez de decorar regra, cada mapa mostra a regra com exemplos prontos, o erro mais comum de brasileiro e um exercício que corrige na hora.",
  },
};

export const TRIED_MSG: Record<string, { title: string; text: string }> = {
  pdf: {
    title: "O PDF mostra a regra, mas não o som",
    text: "Você lê, entende… e na hora de falar trava, porque nunca ouviu como aquilo soa. O mapa falante junta as duas coisas no mesmo lugar.",
  },
  apps: {
    title: "Apps de joguinho viciam, mas não organizam",
    text: "Você acumula pontos, mas não sabe o que falar numa situação real. Aqui cada mapa é uma situação inteira: as frases que você vai usar, com áudio e exercício.",
  },
  curso: {
    title: "Curso é bom, mas é no ritmo da turma",
    text: "Com os mapas você estuda o assunto que precisa hoje — a viagem da semana que vem, a reunião de amanhã — no seu tempo.",
  },
  nunca: {
    title: "Melhor ainda: você começa sem vícios",
    text: "Sem método antigo para desaprender. Você já começa vendo, ouvindo e repetindo — do jeito que criança aprende idioma.",
  },
};

export const TIME_MSG: Record<string, { title: string; text: string }> = {
  "5": { title: "5 minutos dão conta", text: "Um mapa leva uns 5 minutos: ouvir as frases, repetir e fazer o mini exercício. Em 30 dias, são 30 assuntos estudados com áudio." },
  "15": { title: "15 minutos é o ponto ideal", text: "Dá para fazer um mapa novo e revisar o de ontem. Em 30 dias, 30 assuntos aprendidos e revisados." },
  "30": { title: "Com 30 minutos você voa", text: "Um mapa novo, a revisão e ainda os exercícios da biblioteca. Em 30 dias, dá para cobrir um nível inteiro." },
};

// Os 3 cartões embaixo da tela "Seu ritmo", conforme o tempo escolhido.
export const TIME_STEPS: Record<string, { icon: string; text: string }[]> = {
  "5": [
    { icon: "⏱️", text: "5 minutos: 1 mapa novo por dia" },
    { icon: "🔊", text: "Ouve e repete cada frase" },
    { icon: "🗺️", text: "30 assuntos em 1 mês" },
  ],
  "15": [
    { icon: "🗺️", text: "1 mapa novo por dia" },
    { icon: "🔁", text: "+ revisão do mapa de ontem" },
    { icon: "🧠", text: "30 assuntos aprendidos e revisados em 1 mês" },
  ],
  "30": [
    { icon: "🗺️", text: "1 mapa novo + revisão por dia" },
    { icon: "✏️", text: "+ exercícios da biblioteca do seu nível" },
    { icon: "🎓", text: "Um nível inteiro coberto em cerca de 1 mês" },
  ],
};

export const FIRST_OPTIONS: Record<string, string[]> = {
  viagem: ["Inglês no aeroporto", "Check-in no hotel", "Pedindo comida no restaurante", "Pedindo informação na rua"],
  trabalho: ["Inglês para reuniões de trabalho", "Entrevista de emprego em inglês", "E-mails profissionais em inglês", "Me apresentando no trabalho"],
  series: ["Expressões comuns em séries americanas", "Gírias do inglês americano", "Phrasal verbs do dia a dia", "Frases de filmes famosos"],
  prova: ["Conectivos para redação em inglês", "Tempos verbais mais cobrados", "Vocabulário acadêmico", "Falsos cognatos"],
};

// Frases que podem tocar no quiz sem login (o áudio é gerado uma vez e fica guardado).
export const QUIZ_PHRASES = new Set(Object.values(GOAL_PREVIEW).flatMap((g) => g.items.map((i) => i.en)));

// Ícone de cada situação da pergunta "Qual situação você quer resolver primeiro?".
export const FIRST_EMOJI: Record<string, string> = {
  "Inglês no aeroporto": "🛫",
  "Check-in no hotel": "🏨",
  "Pedindo comida no restaurante": "🍽️",
  "Pedindo informação na rua": "🗺️",
  "Inglês para reuniões de trabalho": "👥",
  "Entrevista de emprego em inglês": "🤝",
  "E-mails profissionais em inglês": "📧",
  "Me apresentando no trabalho": "👋",
  "Expressões comuns em séries americanas": "📺",
  "Gírias do inglês americano": "😎",
  "Phrasal verbs do dia a dia": "🔤",
  "Frases de filmes famosos": "🎬",
  "Conectivos para redação em inglês": "✍️",
  "Tempos verbais mais cobrados": "⏳",
  "Vocabulário acadêmico": "🎓",
  "Falsos cognatos": "🎭",
};
