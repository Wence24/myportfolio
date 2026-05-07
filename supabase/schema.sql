-- Portfolio studio content (projects, testimonials, and experience entries) in one row.
-- Run this in Supabase SQL Editor.

create extension if not exists "pgcrypto";

create table if not exists public.portfolio_content (
  id text primary key,
  projects jsonb not null default '{}'::jsonb,
  testimonials jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.portfolio_content
add column if not exists experience_entries jsonb not null default '[]'::jsonb;

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

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portfolio-assets',
  'portfolio-assets',
  true,
  268435456,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
    'video/mp4'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view portfolio assets" on storage.objects;
create policy "Public can view portfolio assets"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'portfolio-assets');

drop policy if exists "Public can upload portfolio assets" on storage.objects;
create policy "Public can upload portfolio assets"
on storage.objects
for insert
to anon, authenticated
with check (bucket_id = 'portfolio-assets');

drop policy if exists "Public can update portfolio assets" on storage.objects;
create policy "Public can update portfolio assets"
on storage.objects
for update
to anon, authenticated
using (bucket_id = 'portfolio-assets')
with check (bucket_id = 'portfolio-assets');

drop policy if exists "Public can delete portfolio assets" on storage.objects;
create policy "Public can delete portfolio assets"
on storage.objects
for delete
to anon, authenticated
using (bucket_id = 'portfolio-assets');
