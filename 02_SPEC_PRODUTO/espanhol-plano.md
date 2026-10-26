# Mapas Falantes em espanhol — plano (26/10/2026)

**Decisões do Daniel:** América Latina + Espanha · mesmo site em **/es** · primeira versão = **Método + order bumps** (Kit Viagem, Kit Trabalho, Pacote 5 mapas) · checkout **Stripe** (empresa dos EUA), moeda local · preço definido por pesquisa.

## Preço — DECIDIDO: US$ 27 (Daniel, 26/10)

Pesquisa de mercado (26/10):

| Referência | Preço |
|---|---|
| Cursos de inglês em espanhol na Hotmart (pagamento único, garantia de 7 dias) | US$ 42–47 é comum |
| Espanha: cursos online de pagamento único | €18 (promoção) a €55; academias €256+ |
| Open English (LatAm) | assinatura, a partir de ~US$ 39/mês, preço por país |

**Proposta para testar:**
- **América Latina:** **US$ 19** (âncora "de US$ 47"). Mesmo poder de compra do R$57 no Brasil.
- **Espanha:** **€19** no começo (mesmo valor; subir para €27 se converter bem).
- Order bumps: Kits **US$ 5** / Pacote 5 mapas **US$ 7** (mesma proporção do Brasil).
- O Stripe mostra o preço convertido na moeda local de cada país (Adaptive Pricing) e você recebe em dólar.
- Testar US$ 19 por 2 semanas; se o custo por venda ficar folgado, testar US$ 27.

## O que muda no produto

| Parte | Trabalho |
|---|---|
| 120 mapas | traduzir campos *_pt → *_es (frases, ramos, títulos, resumo, dica, exercícios) com script + revisão por amostra |
| "Erro comum" | **reescrever** para erros típicos de hispanofalantes (não traduzir o de brasileiro) |
| Bônus (frases, verbos, gírias) | traduzir a coluna PT |
| Inglês e áudios | **nada muda** (reaproveita tudo) |
| App (/es) | interface, teste de nível, plano de estudos, landing /es/metodo, página de obrigado |
| Mapas com IA | gerar com tradução em espanhol quando a conta for /es |
| Checkout | Stripe Checkout (produto Método + 3 bumps), webhook /api/stripe libera acesso (mesma lógica da Kiwify) |
| Meta | evento Purchase pela API de Conversões no webhook do Stripe |
| E-mails | fluxos em espanhol no Klaviyo: acesso imediato, comprou e não criou conta, carrinho abandonado (Stripe), app no celular |
| Anúncios | já existem vídeos dublados (05_ESPANHOL: Metodo 04, 05, 01_B, 02) |

## Fases

1. **Conteúdo** — script de tradução dos 120 mapas e bônus para espanhol neutro; reescrever "erro comum"; revisão de amostra pelo Daniel.
2. **App /es** — textos da interface, landing /es/metodo, teste de nível e plano em espanhol.
3. **Checkout Stripe** — produtos/preços no Stripe, Stripe Checkout com bumps, webhook que libera acesso + Purchase na Meta. Teste ponta a ponta em modo de teste.
4. **E-mails** — 4 fluxos em espanhol no Klaviyo (editor visual).
5. **Lançamento** — campanha nova na Meta (América Latina + Espanha), R$/US$ baixo, mesmos critérios de escala do Brasil.

## Pendências do Daniel
- Confirmar o preço (US$ 19 / €19).
- Chaves do Stripe (modo teste primeiro) na Vercel — eu não manuseio a chave; o Daniel cadastra.
- Revisar uma amostra de mapas traduzidos antes de traduzir todos.
