create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  cidade text not null default 'Betim',
  estado text not null default 'MG',
  role text not null default 'Cidadão',
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.problemas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  titulo text not null check (char_length(titulo) between 3 and 80),
  descricao text not null check (char_length(descricao) between 10 and 600),
  categoria text not null,
  endereco text not null,
  bairro text not null,
  status text not null default 'Pendente'
    check (status in ('Pendente', 'Em andamento', 'Resolvido')),
  apoios integer not null default 0 check (apoios >= 0),
  imagem_url text,
  comentarios jsonb not null default '[]'::jsonb,
  latitude double precision,
  longitude double precision,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists problemas_created_at_idx
  on public.problemas (created_at desc);

create index if not exists problemas_user_id_idx
  on public.problemas (user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, nome)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nome', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists problemas_set_updated_at on public.problemas;
create trigger problemas_set_updated_at
  before update on public.problemas
  for each row execute procedure public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.problemas enable row level security;

drop policy if exists "Perfis são públicos para leitura" on public.profiles;
create policy "Perfis são públicos para leitura"
  on public.profiles for select
  using (true);

drop policy if exists "Usuário atualiza o próprio perfil" on public.profiles;
create policy "Usuário atualiza o próprio perfil"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Problemas são públicos para leitura" on public.problemas;
create policy "Problemas são públicos para leitura"
  on public.problemas for select
  using (true);

drop policy if exists "Usuário autenticado cria problemas" on public.problemas;
create policy "Usuário autenticado cria problemas"
  on public.problemas for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Usuários autenticados atualizam problemas" on public.problemas;
create policy "Usuários autenticados atualizam problemas"
  on public.problemas for update
  to authenticated
  using (true)
  with check (true);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'problemas',
  'problemas',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Fotos de problemas são públicas" on storage.objects;
create policy "Fotos de problemas são públicas"
  on storage.objects for select
  using (bucket_id = 'problemas');

drop policy if exists "Usuário envia fotos na própria pasta" on storage.objects;
create policy "Usuário envia fotos na própria pasta"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'problemas'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

