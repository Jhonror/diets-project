-- Run this in Supabase → SQL Editor (once, after schema.sql).
-- Creates profiles table, admin helper, trigger for new signups,
-- and RLS policies so admin can manage all diets.

-- 1. Profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

-- 2. Helper: avoids RLS recursion when checking admin status
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- 3. Trigger: auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (
    new.id,
    new.email,
    case when lower(new.email) = 'jhon.jromerot@gmail.com' then 'admin' else 'user' end
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4. Backfill: create profiles for users that already exist
insert into public.profiles (id, email, role)
select
  id,
  email,
  case when lower(email) = 'jhon.jromerot@gmail.com' then 'admin' else 'user' end
from auth.users
where id not in (select id from public.profiles)
on conflict (id) do nothing;

-- 5. RLS on profiles
alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated
  using (auth.uid() = id);

drop policy if exists "profiles_select_admin" on public.profiles;
create policy "profiles_select_admin" on public.profiles
  for select to authenticated
  using (public.is_admin());

grant select on public.profiles to authenticated;

-- 6. Admin RLS on diets (existing user policy stays)
drop policy if exists "diets_select_admin" on public.diets;
create policy "diets_select_admin" on public.diets
  for select to authenticated
  using (public.is_admin());

drop policy if exists "diets_insert_admin" on public.diets;
create policy "diets_insert_admin" on public.diets
  for insert to authenticated
  with check (public.is_admin());

drop policy if exists "diets_update_admin" on public.diets;
create policy "diets_update_admin" on public.diets
  for update to authenticated
  using (public.is_admin());

drop policy if exists "diets_delete_admin" on public.diets;
create policy "diets_delete_admin" on public.diets
  for delete to authenticated
  using (public.is_admin());

grant insert, update, delete on public.diets to authenticated;

-- 7. Add type column to diets for future training programs
alter table public.diets add column if not exists type text not null default 'diet';
