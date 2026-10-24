# Architectural & Technical Decisions Log

This document records all meaningful architectural decisions, library selections, and accepted trade-offs across BuildSeek.

---

## 1. Multi-Source Ingestion Pipeline with Fault Isolation

### Context
BuildSeek aggregates hackathon opportunities across multiple platforms: Curated real data, Devpost, Unstop, Devfolio, and Hack2skill. External platforms can suffer API rate limits, schema drifts, or network timeouts.

### Decision
- **SourceAdapter Interface**: Standardized adapter pattern (`isEnabled()`, `fetchListings(useFixture)`, `normalize(raw)`).
- **Fault Isolation & Retries**: Each adapter executes inside an isolated `try/catch` with an automatic 1-retry backoff policy (`maxAttempts = 2`).
- **Resilience Policy**: If an adapter fails, its failure is logged to `ScrapeRun` with an error message, but the pipeline continues to process all remaining healthy adapters.

### Alternatives Considered
- *Monolithic Scraper Script*: Single failure aborts entire scraping process, leading to data loss.
- *Distributed Task Queue (Celery/BullMQ)*: Heavy operational complexity with Redis/worker infrastructure unnecessary for BuildSeek's batch cron workflow.

### Trade-Offs Accepted
- Adapters are executed sequentially in a single process rather than asynchronously in parallel to respect rate limits of free target endpoints and avoid triggering anti-bot IP bans.

---

## 2. In-Memory JSON Master Dataset with Supabase Real-Time Mirror

### Context
Next.js server components and client discovery state need ultra-low latency access to hackathon records. External database latency (especially cold starts on serverless Supabase instances) degrades first-contentful-paint (FCP).

### Decision
- **Dual-Tier Storage Strategy**:
  1. Primary Local Store: `data/hackathons.json` loaded directly by `lib/db/hackathons.ts` or falling back to `seed/hackathons.ts` (`REAL_HACKATHONS`).
  2. Cloud Mirror: Optional Supabase PostgreSQL database mirrored via upsert (`onConflict: 'source,source_id'`).
- The web app reads from `data/hackathons.json` synchronously with near-zero latency, while background GitHub Actions workflows run ingestion and update both the repository data store and Supabase.

### Alternatives Considered
- *Strict PostgreSQL Querying on Every Request*: Higher latency, prone to serverless connection pooling limits and Supabase quota caps.
- *Client-side Only In-Memory Array*: Inability to persist updates across runs without redeploying code.

### Trade-Offs Accepted
- File writes (`data/hackathons.json`) require a git commit/artifact step in CI/CD, but deliver millisecond response times and offline testability.

---

## 3. Two-Tier Deduplication & Record Merging

### Context
Hackathons are frequently cross-posted across multiple platforms (e.g., posted on Devpost and listed on Devfolio, or listed on Unstop with an external registration link). Simple equality matching on URLs fails due to tracking query parameters (`utm_*`, `ref`, trailing slashes).

### Decision
- **Tier 1: Canonical URL Matching**: Strip URL query strings, tracking params, and protocol differences (`canonicalizeUrl`). If two listings share an apply URL or external website, they are treated as identical.
- **Tier 2: Name Normalization & Levenshtein / Jaro-Winkler Distance**:
  - Normalize names: lowercase, strip punctuation, remove edition numbers ("2026", "v2.0", "3rd edition").
  - Match names if similarity exceeds 85% AND start dates align within a 5-day window.
- **Merge Strategy (`mergeHackathons`)**: When duplicates are detected, prefer richer descriptions, higher prize amounts, verified tags, and aggregate platform source metadata into `alternate_sources`.

### Alternatives Considered
- *Vector Embedding Similarity (OpenAI / Gemini Embeddings)*: Requires network roundtrips, external API keys, cost per token, and non-deterministic thresholding.
- *Exact String Equality*: Misses minor title differences (e.g., "HackSphere 2026" vs "HackSphere '26").

### Trade-Offs Accepted
- String distance heuristics may require threshold tuning if two distinct hackathons with similar generic names occur at the same college on the same weekend.

---

## 4. 14-Day Source-Aware Aging-Out Policy

### Context
Hackathons that are cancelled, deleted, or concluded should not linger indefinitely on discovery feeds. However, transient scraping outages should not purge records.

### Decision
- If a source adapter is **healthy** (successfully runs without throwing an error), any existing record belonging to that source that is not observed in the current scrape and has `last_seen_at < 14 days ago` is marked `hidden = true`.
- If an adapter **fails**, its associated records are **never** aged out, preventing transient network failures from falsely hiding valid hackathons.

### Alternatives Considered
- *Hard Deletion (`DELETE FROM hackathons`)*: Destructive; loses user bookmarks, quest logs, and match histories.
- *Global Time-to-Live (TTL)*: Purges records even during API provider outages.

### Trade-Offs Accepted
- Hackathons that stop appearing on external listing sites remain visible for up to 14 days before being hidden, ensuring user stability over immediate removal.

---

## 5. Normalized Categorization: Heuristic Organizer Classification

### Context
Platforms use disparate naming conventions for organizers (e.g., Unstop labels organizations as colleges, corporate entities, or student clubs without standardization).

### Decision
- Implemented `detectOrganizerType(name)` using deterministic regex patterns:
  - `government`: Ministries, AICTE, MeitY, DST, DRDO, ISRO, NITI Aayog, Startup India (excluding colleges).
  - `college`: Universities, institutes, IITs, NITs, IIITs, BITS, campus fests.
  - `nonprofit`: Foundations, NGOs, charities, trusts.
  - `community`: Developer clubs, GDGs, IEEE chapters, ACM student chapters.
  - `company`: Private limited companies, corporations, tech firms (Google, AWS, Microsoft, Nebius).
  - `other`: Fallback for unclassified hosts.

### Alternatives Considered
- *LLM-based entity extraction on every record*: High cost, high latency, rate limits.
- *Manual tagging*: Does not scale with automated daily ingestion.

### Trade-Offs Accepted
- Pure heuristic rules may misclassify ambiguous entities (e.g., an autonomous college lab with "Technologies" in its title), but execution is synchronous and deterministic.

---

## 6. Multi-Factor Match Score Algorithm

### Context
Hackathon discovery should feel tailored rather than a flat chronological list. Users have differing skill sets, team sizes, and preferred participation modes.

### Decision
- Implemented weighted scoring formula in `lib/match-score.ts`:
  - Tag intersection overlap: +40 pts (normalized against user interests).
  - Participation mode match (Online vs In-person): +25 pts.
  - Team size suitability: +15 pts.
  - High prize pool bonus: +10 pts.
  - Freshness / Closing soon urgency: +10 pts.
  - Total normalized to 0–100 score (`match_score`).

### Alternatives Considered
- *Collaborative filtering / Matrix Factorization*: Requires large user behavioral interaction datasets that do not yet exist in early-stage products.
- *Simple chronological sorting*: Fails to surface the most relevant hackathons to individual users.

### Trade-Offs Accepted
- Rule weights are static defaults; future iterations may allow user-configurable priority weight sliders.

---

## 7. Dormancy Prevention & Server Keep-Alive Architecture

### Context
Free-tier hosting providers (e.g. Render, Koyeb) and managed databases (e.g. Supabase free tier) enforce automated sleep or pause policies:
- Supabase automatically pauses projects after 7 to 14 days of zero query/API activity.
- Free web hosts spin down containers to zero after 15 minutes of inactivity, resulting in 30-60s cold starts.

### Decision
- **Dual Keep-Alive Mechanism**:
  1. **Health API Route (`app/api/health/route.ts`)**: An endpoint that performs a lightweight `head: true` count query against the `hackathons` table in Supabase. Calling this endpoint exercises both the web application runtime and the database connection.
  2. **Automated GitHub Actions Ping Workflow (`.github/workflows/keep-alive.yml`)**: Scheduled every 3 days (`0 6 */3 * *`). It curls both the deployed web app URL (`/api/health`) and sends an authorized REST ping directly to Supabase (`/rest/v1/hackathons?select=id&limit=1`).

### Alternatives Considered
- *External 3rd-Party Monitoring Services (UptimeRobot / Cron-job.org)*: Requires creating external accounts, storing credentials in 3rd-party services, and manual configuration.
- *Relying only on the 6-hour ingestion cron*: If the ingestion cron skips Supabase because secrets aren't set in GitHub, Supabase would still pause. The dedicated keep-alive workflow ensures database activity independently.

### Trade-Offs Accepted
- A scheduled GitHub Action consumes negligible free runner minutes (~5 seconds every 3 days = <2 minutes per month out of GitHub's 2,000 free minutes).

