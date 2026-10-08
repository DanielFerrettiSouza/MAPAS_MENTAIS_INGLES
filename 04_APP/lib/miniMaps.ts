// Mapas de exemplo (resumidos) usados nas animações da landing.
export type MiniMap = {
  emoji: string;
  title: string;
  title_en: string;
  level: string;
  sections: { label: string; items: [string, string][] }[];
};

export const MINI_MAPS: MiniMap[] = [
  {
    emoji: "✈️", title: "No aeroporto", title_en: "At the Airport", level: "A2",
    sections: [
      { label: "Check-in", items: [["I'd like a window seat.", "Quero janela."], ["Here's my passport.", "Aqui está meu passaporte."]] },
      { label: "Segurança", items: [["Do I take off my shoes?", "Tiro os sapatos?"], ["It's just a laptop.", "É só um notebook."]] },
      { label: "Embarque", items: [["Where is gate 12?", "Onde é o portão 12?"], ["Is the flight on time?", "O voo está no horário?"]] },
      { label: "Problemas", items: [["My flight is delayed.", "Meu voo atrasou."], ["I lost my bag.", "Perdi minha mala."]] },
    ],
  },
  {
    emoji: "🍔", title: "No restaurante", title_en: "At the Restaurant", level: "A1",
    sections: [
      { label: "Chegando", items: [["A table for two, please.", "Mesa para dois."], ["Can I see the menu?", "Posso ver o cardápio?"]] },
      { label: "Pedindo", items: [["I'll have the burger.", "Vou querer o hambúrguer."], ["No onions, please.", "Sem cebola, por favor."]] },
      { label: "Bebidas", items: [["Just water, thanks.", "Só água, obrigado."], ["Can I get a refill?", "Pode encher de novo?"]] },
      { label: "Pagando", items: [["Check, please!", "A conta, por favor!"], ["Can I pay by card?", "Posso pagar no cartão?"]] },
    ],
  },
  {
    emoji: "💼", title: "Entrevista de emprego", title_en: "Job Interview", level: "B1",
    sections: [
      { label: "Apresentação", items: [["Tell me about yourself.", "Fale sobre você."], ["I work in marketing.", "Trabalho com marketing."]] },
      { label: "Pontos fortes", items: [["I'm a team player.", "Trabalho bem em equipe."], ["I learn fast.", "Aprendo rápido."]] },
      { label: "Experiência", items: [["I led a team of five.", "Liderei 5 pessoas."], ["I handled clients.", "Atendia clientes."]] },
      { label: "Perguntas", items: [["What's the next step?", "Qual o próximo passo?"], ["Is it remote?", "É remoto?"]] },
    ],
  },
  {
    emoji: "🎬", title: "Gírias de séries", title_en: "TV Show Slang", level: "B2",
    sections: [
      { label: "Concordar", items: [["I'm down.", "Tô dentro."], ["For sure.", "Com certeza."]] },
      { label: "Elogiar", items: [["That's lit!", "Que massa!"], ["She nailed it.", "Ela arrasou."]] },
      { label: "Verdade", items: [["No cap.", "Sem mentira."], ["For real?", "Sério?"]] },
      { label: "Reclamar", items: [["That's sketchy.", "Que suspeito."], ["I'm so done.", "Cansei."]] },
    ],
  },
  {
    emoji: "🏨", title: "No hotel", title_en: "At the Hotel", level: "A2",
    sections: [
      { label: "Reserva", items: [["I have a reservation.", "Tenho uma reserva."], ["Under Silva.", "No nome de Silva."]] },
      { label: "Horários", items: [["What time is checkout?", "Que horas é o checkout?"], ["Is breakfast included?", "O café está incluso?"]] },
      { label: "Pedidos", items: [["Can I get more towels?", "Mais toalhas?"], ["What's the Wi-Fi password?", "Qual a senha do Wi-Fi?"]] },
      { label: "Problemas", items: [["The AC isn't working.", "O ar não funciona."], ["It's too noisy.", "Está barulhento."]] },
    ],
  },
  {
    emoji: "🧩", title: "Phrasal verbs", title_en: "Everyday Phrasal Verbs", level: "B1",
    sections: [
      { label: "Desistir", items: [["Give up", "Desistir"], ["Back out", "Voltar atrás"]] },
      { label: "Entender", items: [["Figure out", "Descobrir"], ["Catch on", "Pegar o jeito"]] },
      { label: "Esperar", items: [["Look forward to", "Aguardar ansioso"], ["Hold on", "Espere"]] },
      { label: "Resolver", items: [["Sort out", "Resolver"], ["Work out", "Dar certo"]] },
    ],
  },
  {
    emoji: "📞", title: "Reuniões online", title_en: "Online Meetings", level: "B1",
    sections: [
      { label: "Começando", items: [["Can you hear me?", "Está me ouvindo?"], ["Let's get started.", "Vamos começar."]] },
      { label: "Problemas", items: [["You're on mute.", "Você está no mudo."], ["You froze.", "Você travou."]] },
      { label: "Opinião", items: [["I agree with that.", "Concordo."], ["Good point.", "Bom ponto."]] },
      { label: "Encerrando", items: [["Let's wrap up.", "Vamos encerrar."], ["I'll follow up.", "Eu retorno."]] },
    ],
  },
  {
    emoji: "🛒", title: "No supermercado", title_en: "At the Grocery Store", level: "A1",
    sections: [
      { label: "Procurando", items: [["Where's the milk?", "Onde está o leite?"], ["Aisle five.", "Corredor cinco."]] },
      { label: "Preço", items: [["How much is this?", "Quanto custa?"], ["Is it on sale?", "Está em promoção?"]] },
      { label: "No caixa", items: [["Paper or plastic?", "Papel ou plástico?"], ["Do you need a bag?", "Precisa de sacola?"]] },
      { label: "Pagando", items: [["Cash or card?", "Dinheiro ou cartão?"], ["Here's your receipt.", "Seu recibo."]] },
    ],
  },
];
