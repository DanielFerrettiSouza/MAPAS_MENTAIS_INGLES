-- Mapas Falantes — v3: Biblioteca pronta + plano de estudos.
-- Rodar no SQL Editor do Supabase DEPOIS do schema_app_v2.sql.

-- Mapas prontos da biblioteca (gerados uma vez pelo dono, lidos pelo servidor).
create table if not exists library_maps (
  slug text primary key,
  level text not null,
  topic text not null,
  title_pt text,
  data jsonb not null,
  created_at timestamptz default now()
);
alter table library_maps enable row level security;

-- Progresso do aluno no plano de estudos.
create table if not exists study_progress (
  user_id uuid references auth.users on delete cascade,
  slug text not null,
  done_at timestamptz default now(),
  primary key (user_id, slug)
);
alter table study_progress enable row level security;
create policy "ver o proprio progresso" on study_progress for select using (auth.uid() = user_id);
