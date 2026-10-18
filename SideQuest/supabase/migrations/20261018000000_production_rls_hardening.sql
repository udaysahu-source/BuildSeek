-- ==============================================================================
-- SideQuest Production Hardening Migration: Restrictive RLS & Policy Audit
-- Migration: 20261018000000_production_rls_hardening.sql
-- ==============================================================================

-- 1. Ensure RLS is active on all core tables
alter table if exists public.hackathons enable row level security;
alter table if exists public.profiles enable row level security;
alter table if exists public.bookmarks enable row level security;
alter table if exists public.alert_rules enable row level security;
alter table if exists public.notifications_log enable row level security;
alter table if exists public.submissions enable row level security;
alter table if exists public.scrape_runs enable row level security;

-- 2. Drop legacy / overly permissive policies if any
drop policy if exists "Hackathons are publicly viewable" on public.hackathons;
drop policy if exists "Hackathons write restricted" on public.hackathons;
drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can delete own profile" on public.profiles;
drop policy if exists "Users can view own bookmarks" on public.bookmarks;
drop policy if exists "Users can insert own bookmarks" on public.bookmarks;
drop policy if exists "Users can delete own bookmarks" on public.bookmarks;
drop policy if exists "Users can modify own bookmarks" on public.bookmarks;
drop policy if exists "Users can view own alert rules" on public.alert_rules;
drop policy if exists "Users can modify own alert rules" on public.alert_rules;
drop policy if exists "Users can view own notification history" on public.notifications_log;
drop policy if exists "Anyone can submit a hackathon for review" on public.submissions;
drop policy if exists "Users can view their own submissions" on public.submissions;
drop policy if exists "Scrape runs are publicly readable" on public.scrape_runs;

-- 3. Public.hackathons: Public SELECT, strictly Service Role writes
create policy "Hackathons public select"
  on public.hackathons for select
  using (true);

create policy "Hackathons service_role write"
  on public.hackathons for all
  to service_role
  using (true)
  with check (true);

-- 4. Public.profiles: Owner-only access (with DELETE policy for GDPR / Account Erasure)
create policy "Profiles owner select"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Profiles owner insert"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Profiles owner update"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Profiles owner delete"
  on public.profiles for delete
  using (auth.uid() = id);

-- 5. Public.bookmarks: Strictly user's own items (BOLA defense)
create policy "Bookmarks owner select"
  on public.bookmarks for select
  using (auth.uid() = user_id);

create policy "Bookmarks owner insert"
  on public.bookmarks for insert
  with check (auth.uid() = user_id);

create policy "Bookmarks owner delete"
  on public.bookmarks for delete
  using (auth.uid() = user_id);

-- Deny update explicitly on bookmarks (bookmarks are toggle only: insert or delete)
revoke update on public.bookmarks from anon, authenticated;

-- 6. Public.alert_rules: Strictly user's own alert configuration
create policy "Alert rules owner select"
  on public.alert_rules for select
  using (auth.uid() = user_id);

create policy "Alert rules owner insert"
  on public.alert_rules for insert
  with check (auth.uid() = user_id);

create policy "Alert rules owner update"
  on public.alert_rules for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Alert rules owner delete"
  on public.alert_rules for delete
  using (auth.uid() = user_id);

-- 7. Public.notifications_log: Owner read only, service_role write
create policy "Notifications log owner select"
  on public.notifications_log for select
  using (auth.uid() = user_id);

create policy "Notifications log service_role all"
  on public.notifications_log for all
  to service_role
  using (true)
  with check (true);

revoke insert, update, delete on public.notifications_log from anon, authenticated;

-- 8. Public.submissions: Sanitized user submission, submitter view only
create policy "Submissions pending insert"
  on public.submissions for insert
  with check (
    status = 'pending' and
    (submitted_by is null or submitted_by = auth.uid())
  );

create policy "Submissions submitter select"
  on public.submissions for select
  using (
    auth.uid() is not null and
    auth.uid() = submitted_by
  );

create policy "Submissions service_role all"
  on public.submissions for all
  to service_role
  using (true)
  with check (true);

-- Compatibility view / table for hackathon_submissions
create or replace view public.hackathon_submissions as
  select 
    id,
    payload,
    status,
    rejection_reason,
    submitted_by,
    reviewed_by,
    reviewed_at,
    created_at
  from public.submissions;

-- 9. Public.scrape_runs: Public view for platform health, service_role write only
create policy "Scrape runs public select"
  on public.scrape_runs for select
  using (true);

create policy "Scrape runs service_role all"
  on public.scrape_runs for all
  to service_role
  using (true)
  with check (true);

revoke insert, update, delete on public.scrape_runs from anon, authenticated;
