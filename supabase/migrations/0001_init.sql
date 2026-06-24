-- ResumeAI India — initial schema
-- Phase 1 is fully anonymous and does NOT require this schema.
-- These tables back optional accounts (Phase 3) and usage analytics / rate limiting.
-- Run via the Supabase SQL editor or `supabase db push`.

-- ── Extensions ────────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ── profiles ──────────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz not null default now()
);

-- ── analyses ──────────────────────────────────────────────────
-- user_id is NULLABLE: null = anonymous/guest analysis.
-- We store the analysis OUTPUT only — never raw resume text.
create table if not exists public.analyses (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references auth.users (id) on delete cascade,
  share_token       text unique,
  resume_filename   text not null,
  job_description    text,
  ats_score         int  not null,
  strength_score    int  not null,
  match_score       int,
  missing_keywords  jsonb not null default '[]'::jsonb,
  matched_keywords  jsonb not null default '[]'::jsonb,
  strengths         jsonb not null default '[]'::jsonb,
  weaknesses        jsonb not null default '[]'::jsonb,
  recommendations   jsonb not null default '[]'::jsonb,
  optimized_resume  jsonb not null default '{}'::jsonb,
  engine            text  not null default 'rule-based',
  created_at        timestamptz not null default now()
);

create index if not exists analyses_user_id_idx on public.analyses (user_id);
create index if not exists analyses_share_token_idx on public.analyses (share_token);

-- ── usage_events (analytics + rate limiting) ──────────────────
-- Stores a salted hash of the IP, never the raw IP.
create table if not exists public.usage_events (
  id          bigint generated always as identity primary key,
  ip_hash     text not null,
  event       text not null,            -- 'upload' | 'analyze' | 'download'
  created_at  timestamptz not null default now()
);

create index if not exists usage_events_created_at_idx on public.usage_events (created_at);

-- ── Row Level Security ────────────────────────────────────────
alter table public.profiles    enable row level security;
alter table public.analyses    enable row level security;
alter table public.usage_events enable row level security;

-- profiles: a user can read/update only their own profile.
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- analyses: owners manage their own rows.
-- (Guest inserts and share-token reads go through server routes using the
--  service-role key, which bypasses RLS.)
create policy "analyses_select_own" on public.analyses
  for select using (auth.uid() = user_id);
create policy "analyses_insert_own" on public.analyses
  for insert with check (auth.uid() = user_id);
create policy "analyses_update_own" on public.analyses
  for update using (auth.uid() = user_id);
create policy "analyses_delete_own" on public.analyses
  for delete using (auth.uid() = user_id);

-- usage_events: no direct client access (writes via service role only).
-- (No policies => RLS denies all anon/authenticated access by default.)

-- ── Auto-create a profile row when a new auth user signs up ────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
