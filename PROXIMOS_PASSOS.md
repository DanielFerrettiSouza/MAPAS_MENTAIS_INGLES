# Mapas Falantes — estado do projeto e próximos passos

> Documento de passagem: leia isto antes de continuar o trabalho (no Mac, com Claude Code local).

## Estado atual (out/2026)
- **App no ar:** https://mapas-falantes.vercel.app (Vercel publica sozinho a cada push no `main`).
- **Código:** `04_APP` (Next.js 14). Rodar local: `cd 04_APP && npm run dev` (precisa do `.env.local`).
- **Banco/Login:** Supabase (projeto MAPAS_FALANTES). Tabelas: `profiles` (plano, créditos, e-mail), `generated_maps`, `pending_upgrades`. SQL em `05_MAPAS_FALANTES_IA/schema_app*.sql`.
- **Pagamentos:** Kiwify → webhook `/api/kiwify` libera/remove plano pelo e-mail (nome do produto precisa conter Essencial/Essential, Fluente, Professor/Teacher). Testado e funcionando.
- **IA:** Claude (conteúdo), Gemini (ilustrações), ElevenLabs (áudio).
- **Funciona:** landing + quiz → cadastro (e-mail ou Google) → 1º mapa automático → painel (Início, Criar mapa, Meus mapas, Configurações) → planos/checkout. Mini exercício preenchível com "Verificar respostas". Garantia de 7 dias no site.
- **Suporte:** mapasmentaisfalantes@gmail.com. E-mail de confirmação do Supabase via SMTP do Gmail.

## Materiais prontos
- `06_MARCA/` — logos; `checkout/` (imagens dos planos, horizontais e quadradas); `redes/` (capa do Facebook, post 1 em carrossel).
- `07_ANUNCIOS/roteiros_10_criativos.md` (+ .docx) — 10 roteiros de vídeo baseados nos 35 anúncios do Fluente com Legenda.

## PRÓXIMO: rastreamento do funil + e-mails (NÃO implementado ainda)

### Etapas e onde está o dado
| Etapa | Hoje | Falta |
|---|---|---|
| Visitou a landing | — | Pixel da Meta (PageView) |
| Terminou o quiz | só no localStorage (`mf-quiz`) | salvar respostas no perfil ao criar a conta (user_metadata ou colunas em `profiles`) + evento |
| Criou conta | `profiles` | evento CompleteRegistration |
| Gerou mapa grátis | `generated_maps` | — |
| Usou os 3 grátis | calcular (credits = 0 e plan = free) | — |
| Clicou em Assinar | — | registrar clique (tabela `events` ou coluna `checkout_clicked_at`) + InitiateCheckout |
| Comprou / cancelou | webhook Kiwify | evento Purchase + gravar data |

### Implementar (nesta ordem)
1. **Tabela `events`** no Supabase (user_id, email, type, data jsonb, created_at). Tipos: `quiz_done`, `signup`, `map_created`, `credits_zero`, `checkout_click`, `purchase`, `cancel`. Gravar nos pontos do código:
   - quiz/cadastro: `app/quiz/page.tsx` (respostas no localStorage) → salvar após signup (`app/auth/callback`, `components/AuthForm.tsx`).
   - mapa: `app/api/generate-map/route.ts`.
   - checkout: `components/PlansGrid.tsx` (clique) → rota `/api/track`.
   - compra/cancelamento: `app/api/kiwify/route.ts`.
2. **Painel `/app/admin`** (só para o e-mail do dono, via env `ADMIN_EMAIL`): contagem por etapa (hoje/7d/30d), taxas de conversão, lista de pessoas com estágio atual.
3. **Pixel da Meta** — FEITO (ID 1720499595717555, `components/MetaPixel.tsx`): PageView em todas as páginas, QuizStart, Lead (fim do quiz), CompleteRegistration, MapCreated, InitiateCheckout; Purchase pelo pixel nativo da Kiwify. Pendente: Conversions API. Texto antigo: env `NEXT_PUBLIC_META_PIXEL_ID`; eventos PageView, Lead (quiz), CompleteRegistration, InitiateCheckout; Purchase pelo lado do servidor (Conversions API) no webhook — opcional depois.
4. **E-mails (Brevo)**: env `BREVO_API_KEY` (colocar só na Vercel/.env.local). App envia contato + atributo/lista por etapa; sequências montadas no painel do Brevo:
   - criou conta e não gerou mapa (24h) → "Seu primeiro mapa está te esperando";
   - usou os 3 grátis e não assinou → 3 e-mails (oferta + garantia);
   - clicou em Assinar e não comprou → abandono;
   - assinou → boas-vindas.
5. **Kiwify**: ativar a recuperação de carrinho nativa (Produto → Configurações).

### O que o dono precisa fornecer
- Conta grátis no brevo.com (com mapasmentaisfalantes@gmail.com) → chave de API (SMTP & API → API Keys).
- Pixel da Meta → ID do Pixel (Gerenciador de Eventos).

## Custos no painel admin (pedido do dono)
O painel `/app/admin` já mostra contas, mapas por dia/período e lista de pessoas.
**Próximo:** mostrar o **gasto real** ali dentro:
- Opção simples: tabela `costs` (dia, fornecedor, valor) + formulário no admin para lançar o gasto diário (Claude, Google/Gemini, ElevenLabs) → painel calcula **custo por mapa** e **custo por cliente**, e margem por plano.
- Opção automática (depois): puxar uso via API (Anthropic Usage/Cost API; Google Cloud Billing export) e/ou registrar tokens/imagens gerados em cada mapa (`generated_maps` com colunas de custo estimado) para calcular sem lançamento manual.
- Fazer depois da 1ª semana de anúncios, com os gastos reais em mãos.
- Custo atual estimado: ~R$0,30 por mapa pago (1 ilustração) e ~R$0,05 por mapa grátis (só emojis).

## Outras pendências
- Trocar `ELEVENLABS_VOICE_ID` por uma voz americana (Vercel + Redeploy).
- **Biblioteca + Plano de estudos (Fluente/Professor):** implementados (`/app/biblioteca`, `/app/plano`, temas em `04_APP/lib/curriculum.ts`). Para ativar: rodar `05_MAPAS_FALANTES_IA/schema_app_v3.sql` no Supabase e clicar em **Gerar biblioteca** no `/app/admin` (120 mapas, ~R$35 uma vez).
- Testar reembolso na Kiwify (conta deve voltar ao grátis).
- Domínio próprio → depois: Resend no lugar do Gmail, logo na tela de login do Google.
- Ilustrações 3D na landing (aguardando exemplos).
