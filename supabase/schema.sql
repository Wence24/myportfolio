-- Portfolio studio content (projects + testimonials) in one row.
-- Run this in Supabase SQL Editor.

create extension if not exists "pgcrypto";

create table if not exists public.portfolio_content (
  id text primary key,
  projects jsonb not null default '{}'::jsonb,
  testimonials jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.portfolio_content enable row level security;

drop policy if exists "Public can read portfolio content" on public.portfolio_content;
create policy "Public can read portfolio content"
on public.portfolio_content
for select
to anon, authenticated
using (true);

drop policy if exists "Public can insert portfolio content" on public.portfolio_content;
create policy "Public can insert portfolio content"
on public.portfolio_content
for insert
to anon, authenticated
with check (true);

drop policy if exists "Public can update portfolio content" on public.portfolio_content;
create policy "Public can update portfolio content"
on public.portfolio_content
for update
to anon, authenticated
using (true)
with check (true);

insert into public.portfolio_content (id)
values ('main')
on conflict (id) do nothing;
