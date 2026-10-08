-- Mapas Falantes IA — v2: pagamentos pela Kiwify.
-- Rodar no SQL Editor do Supabase DEPOIS do schema_app.sql.

-- E-mail no perfil (para ligar a compra da Kiwify à conta).
alter table profiles add column if not exists email text;
update profiles p set email = u.email from auth.users u where u.id = p.id and p.email is null;
create index if not exists idx_profiles_email on profiles (lower(email));

-- Compras feitas antes de a pessoa criar a conta: aplicadas no cadastro.
create table if not exists pending_upgrades (
  email text primary key,
  plan text not null,
  credits int not null,
  created_at timestamptz default now()
);
alter table pending_upgrades enable row level security;

-- Cadastro: cria o perfil (3 mapas grátis) ou já aplica o plano comprado.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  up pending_upgrades%rowtype;
begin
  select * into up from pending_upgrades where lower(email) = lower(new.email);
  insert into public.profiles (id, name, email, plan, credits)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(up.plan, 'free'),
    coalesce(up.credits, 3)
  )
  on conflict (id) do nothing;
  delete from pending_upgrades where lower(email) = lower(new.email);
  return new;
end;
$$;
