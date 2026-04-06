-- Run this in Supabase → SQL Editor (once per project).
-- Creates diets table and RLS: each user only sees rows where user_id = auth.uid().

create table if not exists public.diets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  slug text not null,
  title text not null,
  body_html text not null,
  created_at timestamptz not null default now(),
  unique (user_id, slug)
);

create index if not exists diets_user_id_idx on public.diets (user_id);

alter table public.diets enable row level security;

drop policy if exists "diets_select_own" on public.diets;

-- Authenticated users: read only their rows
create policy "diets_select_own"
  on public.diets
  for select
  to authenticated
  using (auth.uid() = user_id);

-- No insert/update/delete from the client (only service role / SQL editor)
grant select on public.diets to authenticated;
