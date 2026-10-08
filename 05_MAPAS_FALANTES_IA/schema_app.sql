-- Mapas Falantes IA — contas, créditos e mapas gerados.
-- Rodar inteiro no SQL Editor do Supabase (projeto novo).

create extension if not exists "pgcrypto";

-- Perfil de cada usuário: plano e créditos de mapas.
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  plan text not null default 'free',
  credits int not null default 3,          -- mapas restantes no período
  created_at timestamptz default now()
);

-- Cria o perfil automaticamente quando alguém cria a conta (3 mapas grátis).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Mapas gerados (o conteúdo completo fica em data; imagens no Storage).
create table if not exists generated_maps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic text not null,
  level text not null,
  title_pt text not null,
  data jsonb not null,
  created_at timestamptz default now()
);
create index if not exists idx_generated_maps_user on generated_maps(user_id, created_at desc);

-- Cada usuário só lê o próprio perfil e os próprios mapas.
-- Escritas (gerar mapa, gastar crédito) acontecem só no servidor, com a service role.
alter table profiles enable row level security;
alter table generated_maps enable row level security;

drop policy if exists "profiles: ler o próprio" on profiles;
create policy "profiles: ler o próprio" on profiles for select using (auth.uid() = id);

drop policy if exists "maps: ler os próprios" on generated_maps;
create policy "maps: ler os próprios" on generated_maps for select using (auth.uid() = user_id);

-- Bucket público para as ilustrações dos mapas.
insert into storage.buckets (id, name, public)
values ('map-images', 'map-images', true)
on conflict (id) do nothing;
