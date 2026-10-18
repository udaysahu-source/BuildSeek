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
drop policy if exists "Hackathons public select" on public.hackathons;
drop policy if exists "Hackathons service_role write" on public.hackathons;

drop policy if exists "Bookmarks owner select" on public.bookmarks;
drop policy if exists "Bookmarks owner insert" on public.bookmarks;
drop policy if exists "Bookmarks owner delete" on public.bookmarks;

drop policy if exists "Alert rules owner select" on public.alert_rules;
drop policy if exists "Alert rules owner insert" on public.alert_rules;
drop policy if exists "Alert rules owner update" on public.alert_rules;
drop policy if exists "Alert rules owner delete" on public.alert_rules;

drop policy if exists "Notifications log owner select" on public.notifications_log;
drop policy if exists "Notifications log service_role all" on public.notifications_log;

drop policy if exists "Submissions pending insert" on public.submissions;
drop policy if exists "Submissions submitter select" on public.submissions;
drop policy if exists "Submissions service_role all" on public.submissions;

drop policy if exists "Scrape runs public select" on public.scrape_runs;
drop policy if exists "Scrape runs service_role all" on public.scrape_runs;

-- 3. Public.hackathons: Public SELECT, strictly Service Role writes
create policy "Hackathons public select"
  on public.hackathons for select
  using (true);

create policy "Hackathons service_role write"
  on public.hackathons for all
  to service_role
  using (true)
  with check (true);

-- 4. Public.profiles: Owner-only access with (select auth.uid()) for InitPlan optimization
drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- 5. Public.bookmarks: Strictly user's own items (BOLA defense)
create policy "Bookmarks owner select"
  on public.bookmarks for select
  using ((select auth.uid()) = user_id);

create policy "Bookmarks owner insert"
  on public.bookmarks for insert
  with check ((select auth.uid()) = user_id);

create policy "Bookmarks owner delete"
  on public.bookmarks for delete
  using ((select auth.uid()) = user_id);

revoke update on public.bookmarks from anon, authenticated;

-- 6. Public.alert_rules: Strictly user's own alert configuration
create policy "Alert rules owner select"
  on public.alert_rules for select
  using ((select auth.uid()) = user_id);

create policy "Alert rules owner insert"
  on public.alert_rules for insert
  with check ((select auth.uid()) = user_id);

create policy "Alert rules owner update"
  on public.alert_rules for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Alert rules owner delete"
  on public.alert_rules for delete
  using ((select auth.uid()) = user_id);

-- 7. Public.notifications_log: Owner read only, service_role write
create policy "Notifications log owner select"
  on public.notifications_log for select
  using ((select auth.uid()) = user_id);

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
    (submitted_by is null or submitted_by = (select auth.uid()))
  );

create policy "Submissions submitter select"
  on public.submissions for select
  using (
    (select auth.uid()) is not null and
    (select auth.uid()) = submitted_by
  );

create policy "Submissions service_role all"
  on public.submissions for all
  to service_role
  using (true)
  with check (true);

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

-- 10. Security Definer View hardening: force security_invoker = true
alter view if exists public.active_friend_presence set (security_invoker = true);

-- 11. Auth RLS InitPlan optimizations for existing tables
alter policy if exists "Users can read own roles" on public.user_roles 
  using (((select auth.uid()) = user_id) or (get_user_role() = any (array['admin'::text, 'super_admin'::text])));

alter policy if exists "Users can view their friendships" on public.friendships 
  using (((select auth.uid()) = sender_id) or ((select auth.uid()) = receiver_id));

alter policy if exists "Users can request friendship" on public.friendships 
  with check ((select auth.uid()) = sender_id);

alter policy if exists "Users can edit friendship status" on public.friendships 
  using (((select auth.uid()) = sender_id) or ((select auth.uid()) = receiver_id));

-- 12. Function search_path and trigger hardening
alter function if exists public.block_audit_log_modification() set search_path = public;
alter function if exists public.clean_stale_presence() set search_path = public;
alter function if exists public.get_user_role() set search_path = public;
alter function if exists public.get_contextual_recommendations(double precision, double precision, double precision, text, text, integer) set search_path = public, extensions;
alter function if exists public.verify_geofence(uuid, double precision, double precision, double precision) set search_path = public, extensions;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
