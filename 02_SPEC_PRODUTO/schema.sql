-- Mappe Parlanti — schema Supabase
-- Rodar direto no SQL Editor do Supabase (projeto novo ou o mesmo do Unpuff, dependendo da decisão de infra).

create extension if not exists "pgcrypto";

-- Mapas mentais (1 linha por mapa/tópico, dentro de um nível e idioma de vitrine)
create table if not exists mind_maps (
  id uuid primary key default gen_random_uuid(),
  level text not null check (level in ('A1','A2','B1','B2','C1','C2')),
  topic text not null,
  order_index int not null default 0,
  image_url text,
  locale text not null default 'it',  -- idioma da VITRINE (it, fr, pt, de...) — o conteúdo ensinado é sempre inglês
  created_at timestamptz default now(),
  unique (level, topic, locale)
);

-- Áudios de pronúncia vinculados a cada mapa (granular: 1 mapa tem N frases faladas)
create table if not exists mind_map_audio (
  id uuid primary key default gen_random_uuid(),
  mind_map_id uuid not null references mind_maps(id) on delete cascade,
  text text not null,
  audio_url text not null,
  position int not null default 0,
  created_at timestamptz default now()
);

create index if not exists idx_mind_map_audio_mind_map_id on mind_map_audio(mind_map_id);

-- Progresso do usuário (mínimo: o que já visualizou)
create table if not exists user_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  mind_map_id uuid not null references mind_maps(id) on delete cascade,
  viewed_at timestamptz default now(),
  primary key (user_id, mind_map_id)
);

-- RLS: cada usuário só vê/edita o próprio progresso; mapas e áudio são públicos pra leitura
alter table mind_maps enable row level security;
alter table mind_map_audio enable row level security;
alter table user_progress enable row level security;

create policy "mind_maps: leitura pública" on mind_maps
  for select using (true);

create policy "mind_map_audio: leitura pública" on mind_map_audio
  for select using (true);

create policy "user_progress: cada usuário só vê o próprio" on user_progress
  for select using (auth.uid() = user_id);

create policy "user_progress: cada usuário só insere o próprio" on user_progress
  for insert with check (auth.uid() = user_id);

-- Buckets de storage (criar manualmente no painel Storage se este bloco falhar por permissão)
insert into storage.buckets (id, name, public)
values ('mind-map-audio', 'mind-map-audio', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('mind-map-images', 'mind-map-images', true)
on conflict (id) do nothing;
