# Mappe Parlanti — App (MVP mínimo viável)

3 telas, conforme `../02_SPEC_PRODUTO/spec_mvp.md`, agora com **idioma no caminho da URL** (não subdomínio):

- `/it` — Itália (padrão, pra onde `/` redireciona)
- `/it/level/A1` — lista de mapas do nível
- `/it/map/[id]` — imagem do mapa + botão de play por frase

Quando validar e abrir outro país, é só rodar o pipeline de áudio com `locale=fr` (ou `pt`, `de`) e o mesmo app já serve em `/fr`, `/pt`, `/de` automaticamente — nenhuma mudança de código, nenhum domínio novo.

## Por que caminho e não subdomínio

Subdomínio (`it.mappeparlanti.com`) exige já ter comprado o domínio e configurado DNS. Caminho (`mappeparlanti.vercel.app/it`) funciona hoje, de graça, no subdomínio que a Vercel já dá no deploy — e quando comprar o domínio de verdade depois, é só apontar pro mesmo projeto sem tocar em código.

## Rodar localmente

```bash
npm install
cp .env.local.example .env.local
# preencher com a URL e anon key do Supabase
npm run dev
```

Abre em `http://localhost:3000` — redireciona pra `http://localhost:3000/it`.

## Pré-requisito

Rodar o `../02_SPEC_PRODUTO/schema.sql` no Supabase e gerar pelo menos os mapas de exemplo com `../03_SCRIPTS/generate_audio.js` antes — sem isso as telas carregam vazias (mensagem "Nessuna mappa ancora caricata").

## O que falta pra produção (não incluído de propósito nesse MVP)

- Autenticação (link mágico) e o registro de `user_progress` — as telas de leitura já funcionam sem login; login só é necessário se quiser salvar progresso entre sessões
- Checkout/paywall — hoje qualquer um acessa `/it/level/A1` livremente; a versão de venda precisa bloquear atrás do Stripe
- Detecção automática de idioma do navegador pra decidir o redirect da raiz (`/` → `/it` está fixo por enquanto)
- Design de verdade — isso aqui é esqueleto funcional, não a arte final da marca Mappe Parlanti
