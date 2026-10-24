# System Execution Flow & Call Graph

This document details the exact execution paths, entry points, sequence of operations, and cross-module function call graphs for BuildSeek.

---

## 1. Ingestion Pipeline Execution Flow

### Entry Point
- CLI: `npx tsx ingestion/run.ts [--fixture] [--dry-run]`
- CI/CD: `.github/workflows/ingest.yml` (triggered via daily cron or manual dispatch)

### Execution Sequence & Call Hierarchy

```mermaid
graph TD
    CLI["ingestion/run.ts (main)"] --> RunIngest["runIngestion(options)"]
    
    subgraph Initialization
        RunIngest --> LoadAdapters["Instantiate SourceAdapters<br/>(Curated, Devpost, Unstop, Devfolio, Hack2skill)"]
        RunIngest --> LoadDisk["fs.readFileSync('data/hackathons.json')<br/>or fallback to REAL_HACKATHONS"]
        RunIngest --> InitSupabase["createClient(SUPABASE_URL, SUPABASE_KEY) (optional)"]
    end

    subgraph Adapter Loop
        RunIngest --> LoopAdapter{"For each active adapter"}
        LoopAdapter --> CheckEnabled["adapter.isEnabled()"]
        LoopAdapter --> Fetch["adapter.fetchListings(useFixture) [Retry Loop: maxAttempts=2]"]
        LoopAdapter --> NormLoop{"For each raw item"}
        NormLoop --> Normalize["adapter.normalize(raw)"]
        Normalize --> DetectOrg["detectOrganizerType(name)"]
        Normalize --> CleanDates["Format ISO start/end/deadline"]
    end

    subgraph Deduplication & Merging
        RunIngest --> Dedupe["deduplicateListings(normalizedItems, existingHackathons)"]
        Dedupe --> CanonUrl["canonicalizeUrl(url)"]
        Dedupe --> NormName["normalizeName(title)"]
        Dedupe --> FindDup["findDuplicate(candidate, pool)"]
        FindDup --> JaroDist["computeSimilarity(nameA, nameB) & dateDiffDays <= 5"]
        Dedupe --> Merge["mergeHackathons(existingItem, newItem)"]
    end

    subgraph Aging & Persistence
        RunIngest --> Aging["Age Out Check: last_seen_at < 14 days on healthy sources -> hidden=true"]
        RunIngest --> SaveDisk["fs.writeFileSync('data/hackathons.json')"]
        RunIngest --> SaveDb["supabaseClient.from('hackathons').upsert(...)"]
        RunIngest --> LogRuns["supabaseClient.from('scrape_runs').insert(runLog)"]
    end
```

### Function Mapping Reference
| Module | Function | Called By | Calls | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `ingestion/run.ts` | `runIngestion` | CLI / GitHub Actions | `adapter.fetchListings`, `adapter.normalize`, `deduplicateListings`, `mergeHackathons` | Orchestrates batch scraping and sync |
| `ingestion/adapters/types.ts` | `detectOrganizerType` | Adapters (`normalize`) | Regex pattern matching | Categorizes organizer into 6 standardized types |
| `ingestion/dedupe.ts` | `deduplicateListings` | `runIngestion` | `findDuplicate`, `canonicalizeUrl`, `normalizeName` | Identifies duplicate listings across sources |
| `ingestion/dedupe.ts` | `canonicalizeUrl` | `deduplicateListings`, `findDuplicate` | `URL` parsing, param stripping | Strips tracking queries and trailing slashes |
| `ingestion/dedupe.ts` | `mergeHackathons` | `runIngestion`, `deduplicateListings` | Object spread & preference logic | Combines two matching records preserving best fields |

---

## 2. Discovery UI Page & Interaction Loop

### Entry Point
- Browser route: `/discover` (`app/discover/page.tsx`)

### Execution Sequence & Call Hierarchy

```mermaid
graph TD
    User["User loads /discover"] --> Page["app/discover/page.tsx (Server Component)"]
    Page --> ParseParams["parseSearchParamsToFilters(searchParams)"]
    Page --> QueryDb["getHackathons(filterOptions)"]
    
    subgraph Data Layer
        QueryDb --> LoadData["loadHackathonData()"]
        LoadData --> DiskRead["fs.readFileSync('data/hackathons.json') / REAL_HACKATHONS"]
        QueryDb --> FilterFunc["filterHackathons(data, filterOptions)"]
        FilterFunc --> StatusCalc["computeHackathonStatus(start, end, deadline)"]
        FilterFunc --> TagFilter["Array.some(t => h.tags.includes(t))"]
        FilterFunc --> PrizeFilter["h.prize_total >= prize_min"]
        FilterFunc --> SortFunc["sortHackathons(results, sortKey)"]
    end

    Page --> ClientWrapper["components/sidequest/discovery-state.tsx"]
    ClientWrapper --> FiltersUI["components/sidequest/discovery-filters.tsx"]
    ClientWrapper --> CardList{"Render results"}
    CardList --> HackathonCard["components/sidequest/hackathon-card.tsx"]
    HackathonCard --> MatchBadge["lib/match-score.ts: computeMatchScore(hackathon, profile)"]
    HackathonCard --> StatusBadge["components/sidequest/status-badge.tsx"]
    HackathonCard --> CardClick["Select Hackathon -> open Detail Modal"]
    CardList --> HackathonDetail["components/sidequest/hackathon-detail.tsx"]
    HackathonDetail --> CalendarExport["lib/ics.ts: generateIcsCalendar(hackathon)"]
```

### Function Mapping Reference
| Module | Function | Called By | Calls | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `app/discover/page.tsx` | `DiscoverPage` | Next.js Router | `parseSearchParamsToFilters`, `getHackathons` | Server renders initial hackathon discovery catalog |
| `lib/filters.ts` | `parseSearchParamsToFilters` | `DiscoverPage`, API handlers | `searchParams` parsing | Converts URL search parameters into strongly-typed `HackathonFilterOptions` |
| `lib/db/hackathons.ts` | `getHackathons` | `DiscoverPage` | `loadHackathonData`, `filterHackathons`, `sortHackathons` | Queries dataset with pagination, filters, and sort orders |
| `lib/match-score.ts` | `computeMatchScore` | `HackathonCard`, `HackathonDetail` | Scoring weight rules | Computes 0-100% personalized relevance score |
| `lib/ics.ts` | `generateIcsCalendar` | `HackathonDetail` | Date formatters, ICS string builder | Generates RFC 5545 `.ics` event file for 1-click calendar sync |

---

## 3. ICS Calendar Export Flow

### Entry Point
- User clicks "Add to Calendar (.ics)" button in `components/sidequest/hackathon-detail.tsx`.

### Sequence & Execution
1. `HackathonDetail` invokes `generateIcsCalendar(hackathon)`.
2. `lib/ics.ts` parses `registration_deadline`, `start_date`, and `end_date`.
3. Creates two distinct VEVENT calendar blocks:
   - **Deadline Alert Event**: Triggered on `registration_deadline` with alarm reminder.
   - **Hackathon Run Event**: Spanning `start_date` to `end_date` with event description, venue/URL, and rules.
4. Generates an RFC 5545 compliant string payload (`BEGIN:VCALENDAR...END:VCALENDAR`).
5. `HackathonDetail` creates an in-memory `Blob([icsContent], { type: 'text/calendar;charset=utf-8' })`.
6. Generates a temporary object URL via `URL.createObjectURL(blob)`, sets download filename `${slug}.ics`, triggers synthetic link click, and revokes URL.

---

## 4. Health Check & Keep-Alive Flow

### Entry Point
- External Ping: `GET /api/health`
- Scheduled Cron: `.github/workflows/keep-alive.yml` (every 3 days at 06:00 UTC)

### Sequence & Execution

```mermaid
graph TD
    Cron[".github/workflows/keep-alive.yml (Cron 0 6 */3 * *)"] --> PingApp["curl ${APP_URL}/api/health"]
    PingApp --> HealthRoute["app/api/health/route.ts: GET()"]
    
    HealthRoute --> CheckConfig["isSupabaseConfigured()"]
    CheckConfig -- Yes --> GetClient["getSupabaseClient()"]
    GetClient --> QueryDb["supabase.from('hackathons').select('id', { count: 'exact', head: true })"]
    QueryDb --> ReturnOk["Return 200 { status: 'ok', supabase: 'connected' }"]
    CheckConfig -- No --> ReturnLocal["Return 200 { status: 'ok', supabase: 'not_configured' }"]

    Cron --> PingSupabase["curl ${SUPABASE_URL}/rest/v1/hackathons?select=id&limit=1"]
    PingSupabase --> ResetTimer["Postgres processes query -> Resets 7-14 day dormancy timer"]
```

### Function Mapping Reference
| Module | Function | Called By | Calls | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `app/api/health/route.ts` | `GET` | External monitor / HTTP client | `isSupabaseConfigured`, `getSupabaseClient` | Exercises app container and Supabase connection |
| `.github/workflows/keep-alive.yml` | `keep-alive job` | GitHub Actions scheduler | `curl /api/health`, `curl /rest/v1/...` | Automatically prevents Supabase project pauses |

