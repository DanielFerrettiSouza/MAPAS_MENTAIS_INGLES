# Mapas Falantes IA — Especificação

Evolução do Mapas Falantes: de pacote fixo de 300 mapas (pagamento único) para **app por assinatura** que gera mapas mentais de inglês sob demanda com IA — **conteúdo + ilustrações + áudio nativo** — com revisão diária para criar hábito e recorrência.

## 1. Por que

- **Oferta validada:** Fluente com Legenda (mapas de inglês, R$37,90) passou de 190 para **215 anúncios ativos** (out/2026) — está escalando, inclusive com anúncios pagos em USD.
- **O modelo funciona em outros nichos:** "Abordagens da Psicologia" (44 anúncios ativos) vende o mesmo formato "esquematizado" para psicologia.
- **Lacuna:** os apps de inglês com IA (Duolingo Max ~R$89,90/mês, SpeakShark, Loora, Speakey) são todos de **conversação**. Nenhum entrega **mapa mental visual + áudio**.
- **Recorrência:** pagamento único acaba na compra. Gerar mapas novos + revisão diária justifica pagar todo mês.

## 2. Produto

1. **Gerar mapa por assunto:** a pessoa digita um tema (ou cola um texto/letra de música) e escolhe o nível → recebe um mapa mental ilustrado.
2. **Áudio em cada frase:** toca em qualquer item do mapa e ouve a pronúncia nativa (ElevenLabs).
3. **Revisão:** quiz de 3 perguntas por mapa; depois, repetição espaçada com lembrete diário.
4. **Biblioteca:** os mapas A1–C2 prontos continuam como base (e entrada barata do funil).
5. **Baixar/imprimir** o mapa em PNG (depois PDF).

### Decisão técnica importante: a imagem do mapa NÃO é gerada inteira por IA

Modelos de imagem erram texto (trocam letras, inventam palavras). Num produto de inglês isso é fatal. Por isso:

| Camada | Quem faz | Ferramenta |
|---|---|---|
| Conteúdo do mapa (ramos, frases, traduções, quiz) | IA de texto, em formato estruturado | Claude |
| Desenho do mapa (layout "página de caderno": seções numeradas, dica, erro comum, mini exercício) | O próprio app (HTML/CSS) — texto sempre correto | código |
| Ilustrações (capa + 1 ícone por ramo, sem texto) | IA de imagem | Gemini (Nano Banana) |
| Áudio de cada frase | TTS | ElevenLabs |
| Vídeos de anúncio / demonstração | IA de vídeo | Google Flow |

## 3. Funil

```
Anúncio → Quiz (nível, objetivo, tempo/dia) → captura e-mail/WhatsApp
       → gera o 1º mapa grátis personalizado na hora (efeito "uau")
       → Oferta
           A) Assinatura com 7 dias grátis
           B) Entrada R$37,90 (biblioteca pronta) + assinatura como upsell
       → App: gerar mapas + revisão diária → renovação
```

Sugestão de planos (validar com teste A/B):

| Plano | Preço | Inclui |
|---|---|---|
| Mensal | R$24,90/mês | 30 mapas novos/mês, biblioteca, revisão diária |
| Anual | R$179/ano (~R$14,90/mês) | igual, ilimitado "uso justo" |
| Entrada (pagamento único) | R$37,90 | só a biblioteca pronta, sem gerador |

## 4. Custo por mapa gerado (estimativa — confirmar com as faturas reais)

| Parte | Custo aprox. |
|---|---|
| Conteúdo (Claude, esforço baixo) | poucos centavos |
| 5–7 ilustrações (Gemini) | R$0,20–0,60 |
| Áudio de ~15 frases (ElevenLabs) | R$0,05–0,15 |
| **Total** | **~R$0,30–0,80** |

Cache: mapas de temas populares ("verbo to be", "aeroporto") são salvos e reaproveitados — custo zero na 2ª vez. Áudio de uma frase também é salvo e reaproveitado entre mapas.

## 5. O que já está no protótipo (`04_APP`)

- `/pt/quiz` — quiz do funil (3 perguntas) que leva ao 1º mapa personalizado
- `/pt/criar` — digita o assunto + nível → mapa ilustrado em SVG, frases clicáveis com áudio, quiz de revisão, botão de baixar PNG
- `POST /api/generate-map` — Claude gera o conteúdo estruturado; Gemini gera as ilustrações em paralelo
- `GET /api/tts?text=` — áudio ElevenLabs sob demanda (com cache HTTP)

Configuração: copiar `04_APP/.env.local.example` para `.env.local` e preencher `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`, `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID`.

## 6. Próximos passos para produção

1. **Salvar mapas gerados no Supabase** (mapa + imagens no Storage + áudios) — cache entre usuários e histórico do aluno
2. **Login por link mágico + limite de mapas por plano**
3. **Checkout de assinatura** (Stripe BR ou Hotmart/Kiwify com recorrência) e paywall
4. **Captura de lead no quiz** e e-mail/WhatsApp de recuperação
5. **Repetição espaçada + lembrete diário** (e-mail/push)
6. **Proteção de custo:** limite por usuário/dia e rate limit na API de geração
7. Depois de validar: mesma máquina para espanhol, psicologia, concursos (troca só o prompt e a copy)
