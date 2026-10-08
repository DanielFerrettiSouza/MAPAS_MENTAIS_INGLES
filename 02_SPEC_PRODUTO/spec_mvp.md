# Mappe Parlanti — Especificação Técnica do MVP

Escopo: mínimo viável pra validar se "mapa + áudio integrado" converte melhor que PDF puro, antes de investir em app nativo. Meta: rodar com o menor esforço de dev possível, reaproveitando stack que Daniel já usa no Unpuff (Next.js/Vercel/Supabase, ElevenLabs).

## 1. Formato do portal

**Decisão: web app leve (Next.js), não Notion.**
Motivo: Notion não permite tocar áudio inline por mapa de forma limpa (precisaria embed externo por linha, feio e lento). Um Next.js simples com Supabase por trás é pouco mais de trabalho e já é o padrão que a stack do Daniel domina — reaproveita componentes do Unpuff.

**Não é app nativo, não tem login complexo** — acesso via link mágico por e-mail (mesmo padrão de entrega usado pela oferta original: "recebe o acesso por e-mail depois da compra").

## 2. Estrutura de dados (Supabase)

```sql
-- Tabela de mapas mentais
create table mind_maps (
  id uuid primary key default gen_random_uuid(),
  level text not null,              -- 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
  topic text not null,              -- ex: "Preposizioni di tempo"
  order_index int not null,         -- ordem de exibição dentro do nível
  image_url text not null,          -- imagem do mapa mental (Supabase Storage)
  locale text not null default 'it', -- 'it' | 'es' | 'pt' — permite reuso futuro pra outros idiomas sem duplicar schema
  created_at timestamptz default now()
);

-- Áudios vinculados a cada mapa (pode ter vários por mapa: palavras/frases individuais)
create table mind_map_audio (
  id uuid primary key default gen_random_uuid(),
  mind_map_id uuid references mind_maps(id) on delete cascade,
  text text not null,               -- o que está sendo pronunciado (ex: "I am")
  audio_url text not null,          -- arquivo gerado via ElevenLabs (Supabase Storage)
  position int not null default 0,  -- ordem de reprodução dentro do mapa
  created_at timestamptz default now()
);

-- Progresso do usuário (mínimo: o que já viu)
create table user_progress (
  user_id uuid references auth.users(id),
  mind_map_id uuid references mind_maps(id),
  viewed_at timestamptz default now(),
  primary key (user_id, mind_map_id)
);
```

**Por que separar `mind_map_audio` do `mind_maps`:** cada mapa tem várias palavras/frases faladas (ex: o mapa do "TO BE" tem "I am", "you are", "he is"...). Um mapa → N áudios, não 1 áudio por mapa. Isso é o que de fato diferencia de "PDF + bônus de áudio solto": o áudio é granular, ligado a cada elemento do mapa, não um áudio genérico de 2 minutos por nível.

## 3. Geração de conteúdo (pipeline, não trabalho manual)

1. **Mapas mentais (imagem):** gerar via Canva/IA (Nano Banana ou similar) a partir de um template visual consistente — mesmo processo que já foi usado pra gerar as artes originais mineradas.
2. **Áudio:** para cada mapa, listar as palavras/frases nele → gerar via ElevenLabs (voz nativa britânica, conforme prometido na copy) → subir pro Supabase Storage → popular `mind_map_audio`.
3. **Automação sugerida:** um script (Node ou Python) que lê um CSV/planilha simples (nível, tópico, lista de frases) e:
   - chama a API do ElevenLabs pra cada frase
   - sobe o áudio resultante pro Storage
   - insere as linhas em `mind_map_audio`

   Isso evita gerar e subir 1000+ arquivos de áudio na mão.

## 4. Telas do MVP (mínimo, 3 telas)

1. **Home / seleção de nível** — grid A1-C2, igual estrutura da landing
2. **Lista de mapas do nível** — thumbnails dos mapas daquele nível
3. **Visualização do mapa** — imagem do mapa em tela cheia + lista de botões de play (um por frase/palavra daquele mapa), usando `mind_map_audio`

Não tem: quiz de nivelamento, gamificação, exercícios interativos — isso fica pra depois de validar. A oferta original nem tinha quiz nessa (era só landing direta), então não é regressão.

## 5. O que reaproveitar 1:1 do Unpuff

- Autenticação por link mágico (Supabase Auth)
- Estrutura de billing (Stripe, EUR pra Itália)
- Deploy (Vercel)
- Pipeline de voz (ElevenLabs) — já usado nos criativos do Unpuff, mesma conta/API

## 6. Estimativa de esforço

- Schema + 3 telas + auth: 1-2 dias de dev (reaproveitando componentes do Unpuff)
- Pipeline de geração de áudio: meio dia pra escrever o script, depois é rodar e esperar
- Conteúdo (30-50 mapas pra validar, não os 300 completos): depende do ritmo de produção das artes — sugiro validar com um nível só (A1, ~50 mapas) antes de produzir os outros 5 níveis

## 7. Critério de "validou ou não"

Rodar tráfego pro portal MVP (só nível A1 completo + 2-3 mapas de amostra dos outros níveis pra mostrar que existe mais) e comparar taxa de conversão/reembolso contra o histórico de PDF puro do mercado (não temos benchmark direto, mas o sinal a observar é: reclamação de reembolso caindo e tempo médio de uso subindo, já que o áudio deveria reduzir a dor "comprei achando que seria só mais um PDF comum" que aparece nos próprios depoimentos da oferta original).
