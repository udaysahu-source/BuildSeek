-- SideQuest Supabase Database Schema
-- Version 1.0 (Zero-cost Postgres with pg_trgm, FTS and RLS)

-- Enable extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- 1. Hackathons Table
create table if not exists public.hackathons (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  source_id text not null,
  title text not null,
  organizer text not null,
  description text,
  summary text,
  mode text not null check (mode in ('online', 'offline', 'hybrid')),
  city text,
  state text,
  start_date timestamptz not null,
  end_date timestamptz not null,
  reg_start timestamptz not null,
  reg_deadline timestamptz not null,
  prize_text text,
  prize_amount_inr integer default 0,
  team_min smallint default 1,
  team_max smallint default 4,
  eligibility jsonb default '{"students_only": true}'::jsonb,
  tags text[] default '{}'::text[],
  source_url text not null,
  image_url text,
  canonical_id uuid references public.hackathons(id) on delete set null,
  verified boolean default false,
  is_user_submitted boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  constraint hackathons_source_source_id_key unique (source, source_id)
);

-- Full-Text Search tsvector generated column
alter table public.hackathons add column if not exists fts tsvector generated always as (
  setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(organizer, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(summary, '')), 'C')
) stored;

-- Indexes for performance
create index if not exists hackathons_fts_idx on public.hackathons using gin (fts);
create index if not exists hackathons_tags_idx on public.hackathons using gin (tags);
create index if not exists hackathons_deadline_idx on public.hackathons (reg_deadline);
create index if not exists hackathons_mode_idx on public.hackathons (mode);
create index if not exists hackathons_city_idx on public.hackathons (city);
create index if not exists hackathons_last_seen_idx on public.hackathons (last_seen_at);
create index if not exists hackathons_title_trgm_idx on public.hackathons using gin (title gin_trgm_ops);

-- 2. Profiles Table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  skills text[] default '{}'::text[],
  year smallint,
  city text,
  calendar_token uuid default gen_random_uuid() unique not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Bookmarks Table
create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  hackathon_id uuid not null references public.hackathons(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint bookmarks_user_hackathon_key unique (user_id, hackathon_id)
);

create index if not exists bookmarks_user_idx on public.bookmarks (user_id);

-- 4. Alert Rules Table
create table if not exists public.alert_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  filters jsonb not null default '{}'::jsonb,
  channel text not null check (channel in ('telegram', 'email', 'both')),
  telegram_chat_id text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists alert_rules_user_idx on public.alert_rules (user_id);
create index if not exists alert_rules_active_idx on public.alert_rules (active) where active = true;

-- 5. Notifications Log Table (Idempotent alert delivery)
create table if not exists public.notifications_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  hackathon_id uuid not null references public.hackathons(id) on delete cascade,
  kind text not null check (kind in ('new_match', 'deadline_48h', 'deadline_24h', 'digest')),
  sent_at timestamptz not null default now(),
  constraint notifications_log_unique_key unique (user_id, hackathon_id, kind)
);

create index if not exists notifications_log_lookup_idx on public.notifications_log (user_id, hackathon_id, kind);

-- 6. User Submissions Table (Crowdsourcing with moderation)
create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  payload jsonb not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  rejection_reason text,
  submitted_by uuid references auth.users(id) on delete set null,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists submissions_status_idx on public.submissions (status);

-- 7. Scrape Runs Table (Ingestion Health Monitoring)
create table if not exists public.scrape_runs (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  fetched integer not null default 0,
  inserted integer not null default 0,
  updated integer not null default 0,
  error text
);

create index if not exists scrape_runs_source_idx on public.scrape_runs (source, started_at desc);

-- =========================================================================
-- Row Level Security (RLS)
-- =========================================================================

alter table public.hackathons enable row level security;
alter table public.profiles enable row level security;
alter table public.bookmarks enable row level security;
alter table public.alert_rules enable row level security;
alter table public.notifications_log enable row level security;
alter table public.submissions enable row level security;
alter table public.scrape_runs enable row level security;

-- Hackathons: anyone can read verified / live listings
create policy "Hackathons are publicly viewable"
  on public.hackathons for select
  using (true);

-- Profiles: users only access their own
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Bookmarks: users only manage their own
create policy "Users can view own bookmarks"
  on public.bookmarks for select
  using (auth.uid() = user_id);

create policy "Users can insert own bookmarks"
  on public.bookmarks for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own bookmarks"
  on public.bookmarks for delete
  using (auth.uid() = user_id);

-- Alert Rules: users only manage their own
create policy "Users can view own alert rules"
  on public.alert_rules for select
  using (auth.uid() = user_id);

create policy "Users can modify own alert rules"
  on public.alert_rules for all
  using (auth.uid() = user_id);

-- Notifications Log: users read their own
create policy "Users can view own notification history"
  on public.notifications_log for select
  using (auth.uid() = user_id);

-- Submissions: anyone can submit pending, users can view their own
create policy "Anyone can submit a hackathon for review"
  on public.submissions for insert
  with check (status = 'pending');

create policy "Users can view their own submissions"
  on public.submissions for select
  using (auth.uid() = submitted_by);

-- Scrape runs: public read for transparency / health monitor
create policy "Scrape runs are publicly readable"
  on public.scrape_runs for select
  using (true);
