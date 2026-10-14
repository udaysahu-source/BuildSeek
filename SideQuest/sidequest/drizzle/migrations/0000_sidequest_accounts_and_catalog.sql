CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE TABLE public.hackathons (
 id text PRIMARY KEY, source text NOT NULL, source_id text NOT NULL, title text NOT NULL, organizer text NOT NULL, source_url text NOT NULL, mode text NOT NULL CHECK(mode IN ('online','offline','hybrid')), city text NOT NULL, tags text[] NOT NULL DEFAULT '{}', prize_amount_inr integer NOT NULL DEFAULT 0 CHECK(prize_amount_inr >= 0), team_min integer NOT NULL DEFAULT 1 CHECK(team_min > 0), team_max integer NOT NULL DEFAULT 4, reg_start timestamptz NOT NULL, reg_deadline timestamptz NOT NULL, start_date timestamptz NOT NULL, end_date timestamptz NOT NULL, eligibility text NOT NULL, description text NOT NULL, is_sample boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now(), search_vector tsvector GENERATED ALWAYS AS (to_tsvector('english',title || ' ' || organizer || ' ' || city || ' ' || description)) STORED, UNIQUE(source,source_id), CHECK(team_max >= team_min), CHECK(reg_deadline > reg_start), CHECK(end_date >= start_date)
);
GRANT SELECT ON public.hackathons TO anon, authenticated;
GRANT ALL ON public.hackathons TO service_role;
ALTER TABLE public.hackathons ENABLE ROW LEVEL SECURITY;
CREATE POLICY catalog_read ON public.hackathons FOR SELECT TO anon, authenticated USING (true);
CREATE INDEX hackathons_search_idx ON public.hackathons USING gin(search_vector);
CREATE INDEX hackathons_title_trgm_idx ON public.hackathons USING gin(title gin_trgm_ops);
CREATE INDEX hackathons_deadline_idx ON public.hackathons(reg_deadline);
CREATE TABLE public.bookmarks (user_id uuid NOT NULL DEFAULT auth.uid(), hackathon_id text NOT NULL REFERENCES public.hackathons(id) ON DELETE CASCADE, created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(user_id,hackathon_id));
GRANT SELECT,INSERT,DELETE ON public.bookmarks TO authenticated;
GRANT ALL ON public.bookmarks TO service_role;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY bookmarks_read ON public.bookmarks FOR SELECT TO authenticated USING(user_id=auth.uid());
CREATE POLICY bookmarks_insert ON public.bookmarks FOR INSERT TO authenticated WITH CHECK(user_id=auth.uid());
CREATE POLICY bookmarks_delete ON public.bookmarks FOR DELETE TO authenticated USING(user_id=auth.uid());
CREATE TABLE public.alert_rules (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL DEFAULT auth.uid(), mode text CHECK(mode IN ('online','offline','hybrid')), city text, tags text[] NOT NULL DEFAULT '{}', min_prize integer NOT NULL DEFAULT 0 CHECK(min_prize >= 0), enabled boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT,INSERT,UPDATE,DELETE ON public.alert_rules TO authenticated;
GRANT ALL ON public.alert_rules TO service_role;
ALTER TABLE public.alert_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY alert_rules_own ON public.alert_rules FOR ALL TO authenticated USING(user_id=auth.uid()) WITH CHECK(user_id=auth.uid());
CREATE INDEX alert_rules_user_idx ON public.alert_rules(user_id);
CREATE TABLE public.notifications_log (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL, hackathon_id text NOT NULL REFERENCES public.hackathons(id) ON DELETE CASCADE, kind text NOT NULL, sent_at timestamptz NOT NULL DEFAULT now(), UNIQUE(user_id,hackathon_id,kind));
GRANT SELECT ON public.notifications_log TO authenticated;
GRANT ALL ON public.notifications_log TO service_role;
ALTER TABLE public.notifications_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY notifications_own_read ON public.notifications_log FOR SELECT TO authenticated USING(user_id=auth.uid());
CREATE TABLE public.submissions (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL DEFAULT auth.uid(), title text NOT NULL, organizer text NOT NULL, source_url text NOT NULL, details jsonb NOT NULL DEFAULT '{}', status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')), created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT,INSERT ON public.submissions TO authenticated;
GRANT ALL ON public.submissions TO service_role;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY submissions_own_read ON public.submissions FOR SELECT TO authenticated USING(user_id=auth.uid());
CREATE POLICY submissions_pending_insert ON public.submissions FOR INSERT TO authenticated WITH CHECK(user_id=auth.uid() AND status='pending');
CREATE INDEX submissions_user_idx ON public.submissions(user_id);
CREATE TABLE public.scrape_runs (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), source text NOT NULL, started_at timestamptz NOT NULL DEFAULT now(), finished_at timestamptz, status text NOT NULL DEFAULT 'running' CHECK(status IN ('running','success','failed')), fetched_count integer NOT NULL DEFAULT 0, upserted_count integer NOT NULL DEFAULT 0, error text);
GRANT ALL ON public.scrape_runs TO service_role;
ALTER TABLE public.scrape_runs ENABLE ROW LEVEL SECURITY;
INSERT INTO public.hackathons(id,source,source_id,title,organizer,source_url,mode,city,tags,prize_amount_inr,team_min,team_max,reg_start,reg_deadline,start_date,end_date,eligibility,description,is_sample)
SELECT 'sq-'||n, (ARRAY['via Unstop','via Devfolio','via college website','via community board'])[(n-1)%4+1], 'sample-'||n,title,organizer,'https://example.com',mode,city,tags,prize,CASE WHEN (n-1)%3=0 THEN 1 ELSE 2 END,CASE WHEN (n-1)%4=0 THEN 5 ELSE 4 END,'2026-10-14T11:00:00Z'::timestamptz + CASE WHEN deadline>700 THEN deadline-300 ELSE -360 END * interval '1 hour','2026-10-14T11:00:00Z'::timestamptz + deadline*interval '1 hour','2026-10-14T11:00:00Z'::timestamptz +(deadline+72)*interval '1 hour','2026-10-14T11:00:00Z'::timestamptz +(deadline+120)*interval '1 hour',CASE WHEN students THEN 'College students only' ELSE 'Open to everyone' END,'Bring your ideas to life at '||title||', a fictional challenge hosted by '||organizer||'. Build a working prototype with your team and present it to mentors. This is sample data for the SideQuest preview, not a real event. No actual registration is available.',true
FROM (VALUES
(1,'Buildverse 2026','Nexus Institute of Technology','online','Pan India',200000,ARRAY['AI / ML','Web development'],54,true),
(2,'Hack the Horizon','Horizon Student Collective','hybrid','Bengaluru',150000,ARRAY['Open innovation','Sustainability'],120,true),
(3,'GreenSprint','Verdant Engineering College','offline','Delhi',100000,ARRAY['Sustainability','Web development'],10,true),
(4,'Code Circuit','Circuit Campus Club','online','Pan India',75000,ARRAY['Web development','Open innovation'],240,false),
(5,'Neural Nights','Synapse Student Society','offline','Hyderabad',300000,ARRAY['AI / ML','Healthtech'],68,true),
(6,'FinForge','Ledger Institute','hybrid','Mumbai',250000,ARRAY['Fintech','Blockchain'],168,false),
(7,'Pixel Pioneers','Pixel Campus Collective','online','Pan India',50000,ARRAY['Web development'],36,true),
(8,'CareCode Challenge','WellSpring Technical College','offline','Chennai',125000,ARRAY['Healthtech','AI / ML'],288,true),
(9,'Campus Catalyst','Catalyst Student Guild','hybrid','Pune',80000,ARRAY['Open innovation'],400,true),
(10,'Block & Build','Chainwave Innovation Club','online','Pan India',180000,ARRAY['Blockchain','Fintech'],520,false),
(11,'RiverHack','Riverstone Institute','offline','Kolkata',60000,ARRAY['Sustainability'],-24,true),
(12,'Desert Debug','Dune Technical Society','offline','Jaipur',90000,ARRAY['Web development','AI / ML'],216,true),
(13,'Launchpad Labs','Orbit Campus Collective','online','Pan India',400000,ARRAY['Open innovation','Web development'],600,false),
(14,'Sparkathon','Spark Engineering Academy','hybrid','Delhi',120000,ARRAY['AI / ML','Sustainability'],60,true),
(15,'MindMesh','Cognition College Club','offline','Bengaluru',220000,ARRAY['AI / ML'],800,true),
(16,'ByteBloom','Bloom Student Network','online','Pan India',35000,ARRAY['Web development','Healthtech'],-80,true),
(17,'Urban Uplink','Metro Innovation Society','hybrid','Mumbai',160000,ARRAY['Sustainability','Open innovation'],360,false),
(18,'Quantum Campus','Quanta Institute of Engineering','offline','Pune',500000,ARRAY['AI / ML','Open innovation'],1000,true),
(19,'OpenOrbit','Orbit Student Developers','online','Pan India',0,ARRAY['Open innovation','Web development'],480,false),
(20,'MedSprint','Pulse Technical Collective','hybrid','Hyderabad',140000,ARRAY['Healthtech','AI / ML'],900,true)
) AS seed(n,title,organizer,mode,city,prize,tags,deadline,students);