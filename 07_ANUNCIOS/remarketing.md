# Mapas Falantes — Remarketing (Meta Ads)

## Situação hoje (10/10/2026)
- Conta: **Cafe Y Calle 03** (765465382625344). Campanha de leads com 3 criativos (01, 02, 03).
  Total desde o início: R$36,94 · 18 leads · ~1.260 pessoas alcançadas.
  | Criativo | Gasto | Leads | Custo/lead | CTR link | Cliques |
  |---|---|---|---|---|---|
  | 01 | R$26,51 | 14 | R$1,89 | 4,46% | 46 |
  | 02 | R$6,67 | 4 | R$1,67 | 4,21% | 11 |
  | 03 | R$3,76 | 0 | — | 0,50% | 1 |
  → 01 e 02 bons (CTR acima de 4%). 03 fraco (CTR 0,5%): pausar ou trocar o gancho.
- Públicos criados: VIRAM OFERTA 180D, VISITARAM QUIZ 30D, LEAD 180D, LEADS 60D, APP 30D,
  INITIATE CHECKOUT 30D (todos com **~20 pessoas**, o mínimo que o Meta mostra) e VIDEOS 75% 365 (~1.000).
- **Problema:** com 20 pessoas o Meta quase não entrega. Remarketing por etapa só faz sentido
  com uns **500–1.000 por público**. Até lá: **1 campanha só, juntando todo mundo que já é "quente"**.

## Estrutura

### Fase 1 — agora (públicos pequenos)
**1 campanha · objetivo Vendas (conversão: Purchase) · R$10–15/dia · 1 conjunto**
- Incluir: VIDEOS 75% 365 + VISITARAM QUIZ 30D + LEAD 180D + APP 30D + VIRAM OFERTA 180D
  + (criar) Engajou com Instagram/Facebook 90D.
- Excluir: compradores (criar público "Purchase 180D" pelo pixel).
- Posicionamentos automáticos. Frequência alvo: até ~3/semana.
- Criativos: R1, R2 e R3 abaixo (mesmo conjunto, o Meta escolhe).
- Destino: **/app/planos** (quem tem conta cai na oferta; quem não tem, faz login/cadastro).

### Fase 2 — quando cada público passar de ~500
| Conjunto | Público | Exclui | Mensagem | Destino |
|---|---|---|---|---|
| A. Viu vídeo, não fez quiz | VIDEOS 75% | QUIZ 30D, LEADS | Demonstração + "3 mapas grátis" | /quiz |
| B. Fez quiz/cadastro, não assinou | LEADS 60D + APP 30D | Purchase | Prova + oferta + garantia 7 dias | /app/planos |
| C. Viu oferta / iniciou checkout | VIRAM OFERTA + INITIATE CHECKOUT 30D | Purchase | Objeção de preço + downsell (biblioteca R$37) | /app/planos |
Orçamento sugerido: A 30% · B 40% · C 30%.

Regra da casa (igual aos e-mails): **assinatura primeiro, downsell depois** — o conjunto C só
mostra a biblioteca R$37 para quem já viu a oferta de assinatura.

## Roteiros de remarketing (vídeo 9:16, 15–30s, legenda grande)
Base no Fluente com Legenda: tour "olha por dentro", depoimento/review, "o que você recebe".
Regras: só prometer o que o app faz; sem números inventados de alunos/avaliações.

### R1 — "Você ainda tem mapas grátis" (para quem criou conta)
**Gancho:** "Se você criou sua conta no Mapas Falantes e ainda não testou… isso é pra você."
Texto: **SEUS 3 MAPAS GRÁTIS 👀**
**Corpo:** abre o painel → digita um tema → mapa aparece → toca numa frase (áudio alto).
"30 segundos. Digita, ouve, repete."
**CTA:** "Clica em Saiba Mais e cria o seu agora."

### R2 — "Olha por dentro do plano Fluente" (tour)
**Gancho:** "Muita gente me pergunta o que vem no plano Fluente. Olha por dentro."
Texto: **O QUE TEM DENTRO? 📚**
**Corpo:** rola a biblioteca (120 mapas do A1 ao C2) → abre um mapa → toca áudio →
mostra exercício corrigindo → mostra "Criar mapa" com qualquer tema. "60 mapas novos por mês."
**CTA:** "R$49,90 por mês, cancela quando quiser e tem 7 dias de garantia. Saiba Mais."

### R3 — Objeção "não tenho tempo" (estudo de 5 min)
**Gancho:** "Não tem tempo pra estudar inglês? Faz só isso aqui, 5 minutos por dia."
Texto: **5 MINUTOS POR DIA ⏱️**
**Corpo:** um mapa por dia → toca as frases no ônibus/na fila → mini exercício no final.
**CTA:** "Testa 7 dias. Não gostou, devolvemos 100%. Saiba Mais."

### R4 — Downsell (só conjunto C, fase 2)
**Gancho:** "Não quer mais uma assinatura? Entendo. Então leva só isso."
Texto: **SEM MENSALIDADE ✅**
**Corpo:** rola a biblioteca de 120 mapas prontos com áudio. "Paga uma vez, usa pra sempre."
**CTA:** "Biblioteca vitalícia por R$37. Saiba Mais."

### Variações estáticas (rápidas de produzir)
- Print de um mapa estilo gravura + "Você vê. Você escuta. Você lembra." + botão.
- Carrossel "5 erros que brasileiro comete" (cada card = quadro "Não diga assim" de um mapa) → último card: oferta.

## Medição
- Pixel + CAPI já mandam Lead, CompleteRegistration, InitiateCheckout; Purchase vem do pixel da Kiwify.
- Colocar nos anúncios (Parâmetros de URL):
  `utm_source=meta&utm_campaign={{campaign.name}}&utm_content={{ad.name}}`
  → aparece na coluna **Origem** do /app/admin.
