# La 12 Digital — Code Quality & Architecture Analysis

> Generated: 2026-07-25
> Scope: `la-12-digital` (Frontend) + `scrapper-promiedos` (Backend Scraper)

---

## Project Summaries

### la-12-digital (Frontend)
- **Stack:** React 18, TypeScript, Vite, TailwindCSS 3, Supabase JS, Cloudflare Workers
- **Architecture:** SPA deployed to Cloudflare Workers Assets with a thin Express-like Worker proxy (`worker.js`). Data flows: Components → Hooks → Service Layer → Supabase DB / Worker-proxied APIs (YouTube, NewsData, Render scraper).
- **Size:** ~170 source files across components (24 subdirs), services (9 files), hooks (16 files), utils (6 files). Separated design system in `design-system/` with tokens, component specs, and usage guidelines.
- **Key dependencies:** react-router-dom v7, lucide-react, exceljs, sonner (toast), driver.js (onboarding tours).

### scrapper-promiedos (Backend Scraper)
- **Stack:** Node.js, Express 5, TypeScript, Supabase JS (service_role), node-cron, cheerio, axios
- **Architecture:** Express server that scrapes Promiedos.com.ar (a Next.js site) via its `__NEXT_DATA__` hydration JSON, parses and normalizes the data, syncs to a shared Supabase database, and exposes a REST API that mirrors the old LiveScore API contract for the frontend.
- **Size:** 8 core source files in `src/` (server.ts, sync.ts, parsers/promiedosParser.ts, types.ts, config/env.ts, config/supabase.ts, api/app.ts), plus 24 scratch/debug scripts.
- **Key dependencies:** axios, cheerio, node-cron, dotenv.

---

## What's Working Well

### 1. Cloudflare Worker (`worker.js`)
Excellent rate limiting per endpoint, proper CORS with origin allowlist (not wildcard), security headers (CSP, HSTS, COOP, Referrer-Policy), URL path sanitization with `SAFE_LIVESCORE_PATH` regex, query parameter allowlisting to prevent parameter injection. Production-quality infrastructure code.

### 2. Design System (`design-system/`)
Well-structured token files for colors, typography, spacing, shadows, z-indices, breakpoints, and grid. The Tailwind config properly imports these tokens via the `@design-system/*` path alias, creating a clean abstraction layer. Component specs and usage guidelines exist alongside tokens.

### 3. CSV/XLSX Parser (`useFileParser.ts`)
RFC 4180-compliant CSV parsing with proper handling of BOM characters, quoted fields with embedded commas/newlines, and Excel serial date conversion. Robust edge-case handling for a non-trivial parsing problem.

### 4. GitHub Actions CI
- `deploy.yml`: Push-to-main triggers Cloudflare deploy with proper secret injection
- `scrape.yml`: Weekly CRON (Monday 9am ART) + manual dispatch, wakes Render, triggers sync, verifies via Supabase, creates GitHub issue on failure
- `security.yml`: CodeQL analysis, Gitleaks secret scanning, npm audit
- `sync.yml` (scraper repo): Every 6h scheduled sync with failure notification

### 5. API Key Security
The frontend never exposes API keys to the browser. All external API calls (YouTube, NewsData, scraper) go through the Cloudflare Worker proxy, which injects keys server-side. Open-Meteo (weather) is the only exception because it's free and CORS-friendly.

### 6. Attendance Tracking System
The `useMatchAttendance` and `useMatchImport` hooks implement a well-designed match history feature. It caches match data before inserting attendance with proper referential integrity checks, fuzzy matching on rival names, and Supabase RLS ensuring users only access their own records.

### 7. Multi-Layer Scraping Redundancy
Four independent sync paths:
- node-cron inside Express (while Render is awake)
- GitHub Actions scheduled (`sync.yml` every 6h)
- API-triggered (`POST /api/sync`)
- Manual CLI (`npm run sync`)

This is resilient architecture for a free-tier backend that goes to sleep.

---

## CRITICAL Findings

### [C1] `any` type abuse in service layer — no type safety on all data access
**Severity: CRITICAL**
**Files:** `footballApiService.ts:36,75,110,160,199,282`, `youtubeService.ts:102,132`, `weather.ts:178`

Every Supabase query result is mapped with `(m: any)`, `(f: any)`, or `(p: any)`, losing all TypeScript type safety. A schema change in Supabase or a structure change in Promiedos' JSON will silently produce corrupted data or runtime errors that TypeScript cannot catch.

```typescript
// footballApiService.ts:36
return dbMatches.map((m: any) => { ... });  // ❌ no type
return dbFixtures.map((f: any) => { ... }); // ❌ no type
```

**Fix:** `npx supabase gen types typescript --linked` and replace all `any` casts with generated database types.

---

### [C2] Race condition: two independent sync mutex flags
**Severity: CRITICAL**
**Files:** `scrapper-promiedos/src/server.ts:10`, `scrapper-promiedos/src/api/app.ts:10`

Two separate `syncInFlight` flags exist that do NOT check each other:
- `syncInFlight` in `server.ts` guards cron-triggered syncs
- `apiSyncInFlight` in `app.ts` guards API-triggered syncs

A cron sync and an API sync can run concurrently, potentially corrupting data. The `syncLeague()` function performs a destructive `DELETE` followed by `INSERT` on the standings table. Two concurrent syncs would interleave these operations, causing data loss.

**Fix:** Use a single shared mutex exported from `sync.ts`. Consider using a database-level advisory lock via `pg_try_advisory_lock()` for cross-process safety.

---

### [C3] Standings reconstruction logic duplicated in 3 places
**Severity: CRITICAL**
**Files:** 
- `footballApiHelpers.ts::reconstructStages()` (lines 29-101) — frontend
- `scrapper-promiedos/src/sync.ts::syncLeague()` — scraper sync path
- `scrapper-promiedos/src/api/app.ts::/api/competitions/table.json` (lines 157-209) — scraper API path

Three separate implementations of the same `stagesMap` building logic. If the zone/stage structure changes in Promiedos' data, you must update 3 places. The API endpoint in `app.ts` also has its own `formatDateComponents()` helper (lines 96-112) instead of using `parseArgentineDateToUTC()` from the parser.

**Fix:** Extract the shared logic into a single function in the scraper's parser module. Export it so the API endpoint reuses it. The frontend's `reconstructStages()` is slightly different (it maps team logos) so consider making the core logic shared and adding the logo mapping as a post-processing step.

---

## HIGH Severity

### [H1] No exponential backoff or retry on scraper HTTP calls
**Severity: HIGH**
**File:** `scrapper-promiedos/src/sync.ts:25,98,169,218,412`

The `delay()` function uses fixed/random delays (1-5s) but there's no retry logic or exponential backoff. If Promiedos rate-limits (HTTP 429), every sync call fails immediately. The `fullSync` path in `syncLeague()` iterates over all historical rounds with `try/catch` per round but silently skips failed rounds without tracking them for retry. A single network hiccup means that round is never synced.

**Fix:** Replace `delay()` with a proper `retryWithBackoff(fn, { maxRetries: 3, baseDelayMs: 1000 })` utility. Track failed round keys for retry.

---

### [H2] DELETE + INSERT on standings without transaction or validation
**Severity: HIGH**
**File:** `scrapper-promiedos/src/sync.ts:46-54`

```typescript
// Delete all standings for this competition
await supabase.from('ls_standings').delete().eq('competition_id', competitionId);
// Insert new ones
await supabase.from('ls_standings').insert(standings);
```

If the INSERT fails after the DELETE succeeds, the standings table is empty. There is no validation checking whether:
- The number of rows matches expectations (120 teams for Liga Profesional, 32 for group stages)
- Match scores are plausible (no 800-0)
- Dates fall within a valid range (not year 1970 or year 2099)

**Fix:** Use UPSERT instead of DELETE+INSERT on a unique key like `(competition_id, rank, team_id)`, or wrap in a Supabase Edge Function transaction. Add post-sync validation queries.

---

### [H3] No React.memo or Error Boundary — performance and crash resilience
**Severity: HIGH**
**Files:** `App.tsx:21-59`, `TablaPosiciones.tsx:25-295`, `ProximosPartidos.tsx:16-89`, `Noticias.tsx:38-117`

Every major page component re-renders entirely on any state change in `AppInner`. `DashboardPage`, `ProximosPartidos`, `Noticias`, and `TablaPosiciones` are not wrapped in `React.memo`. The `Noticias` component renders all child cards in a map with `key={noticia.id}` but `NoticiaCard` is not memoized. `useVideosByCategory` lacks `useMemo` on its return value.

Additionally, there is no React Error Boundary anywhere. If any component throws during render, the entire SPA crashes to a white screen.

**Fix:** Wrap page-level components in `React.memo`. Add `useMemo`/`useCallback` in heavy hooks. Add an `<ErrorBoundary>` component around the route tree.

---

### [H4] All news items hardcoded as category `'partido'`
**Severity: HIGH**
**File:** `apifootball.ts:251`

```typescript
categoria: 'partido' as const,  // ignores actual category
```

The `Noticia` type defines `categoria: 'mercado' | 'informe' | 'partido' | 'seleccion'` but the code forces every news item to `'partido'` regardless of its actual category. Category filtering in the UI is non-functional.

**Fix:** Map the actual category from the news aggregator response, or parse it from the article content/source.

---

### [H5] Sequential venue fetching with per-match delay — ~47 seconds for Boca fixtures
**Severity: HIGH**
**File:** `scrapper-promiedos/src/sync.ts:166-218`

When syncing Boca fixtures, each match page is fetched sequentially with a 1-second delay to extract the venue name. For 47 matches (18 upcoming + 29 past), this is ~47 seconds of network round trips. These fetches are independent and could be parallelized.

**Fix:** Use `Promise.all` with a concurrency limiter (e.g., `p-limit` with concurrency of 5) to reduce total time to ~10 seconds while still respecting rate limits.

---

### [H6] Promiedos team logo URLs hardcoded with magic path
**Severity: HIGH**
**Files:** `footballApiHelpers.ts:23-26`, `scrapper-promiedos/src/api/app.ts:115-118`

```typescript
return `https://api.promiedos.com.ar/images/team/${promiedosId}/1`;
```

The `/1` suffix is a Promiedos CDN parameter. If Promiedos changes their CDN structure, every team logo breaks. The `TEAM_ID_MAP` (`footballApiHelpers.ts:13-16`) only has 2 mappings (`934→igg`, `451→igg`), so most teams fall through to using their LiveScore ID as the Promiedos ID, which produces broken logo URLs.

**Fix:** Extract the full logo URL from Promiedos' data during scraping (it's in the team object) and store it in `ls_standings` and `ls_fixtures`. This eliminates the need for the ID mapping and URL construction entirely.

---

### [H7] Scraper test file and 24 debug scripts in repo
**Severity: HIGH**
**File:** `scrapper-promiedos/test_scraper.ts`, `scrapper-promiedos/scratch/`

`test_scraper.ts` imports from `./src/parsers/promiedosParser` and runs real HTTP calls against Promiedos. It has no test framework and no assertions. The `scratch/` directory has 24 debug scripts with raw API keys, database queries, and data dumps. Several have `.js` extension (not TypeScript).

**Fix:** Move `scratch/` to `.gitignore`. Convert `test_scraper.ts` to a proper Vitest test file with mocked HTTP calls.

---

## MEDIUM Severity

### [M1] Spanish/English naming inconsistency
**Severity: MEDIUM**
**Scope:** Both projects, pervasive

Mixed naming conventions throughout:
- Component names: `ProximosPartidos`, `UltimosPartidos`, `TablaPosiciones` (Spanish)
- Props/types: `ProximoPartido`, `Noticia`, `Partido` (Spanish)
- But also: `MatchResult`, `StandingRow`, `Fixture`, `HeadToHead` (English)
- Hook return values: `estado` (Spanish) but `retry` (English)
- Mixed function name: `mapFixtureToProximoPartido` (English verb + Spanish noun)
- Comments alternate between Spanish and English file by file

**Fix:** Choose one language for the public API (types, function names, props) and stick to it. Spanish is fine for the domain (Boca Juniors, Argentine football) but be consistent.

---

### [M2] Missing input validation on scraper API endpoints
**Severity: MEDIUM**
**File:** `scrapper-promiedos/src/api/app.ts:122-378`

API endpoints accept raw query parameters without validation:
- `comp_id = Number(compIdStr)` — `Number()` returns `NaN` for non-numeric strings
- `teamId = req.query.team` — no format validation
- No pagination on any endpoint — `/api/matches/history.json` could return unbounded results
- No max limit enforcement

**Fix:** Add query parameter validation middleware (e.g., `zod` schemas) and enforce pagination defaults/maximums.

---

### [M3] localStorage cache has no periodic cleanup
**Severity: MEDIUM**
**File:** `utils/cache.ts:42-44,142`

`clearExpiredCache()` only runs at import time. The `getCachedData` function removes individual expired keys on access, but keys that are never accessed again (e.g., `SQUAD` with 24h TTL) remain in localStorage permanently. Over time, this accumulates stale data.

**Fix:** Add a lightweight periodic cleanup on page visibility change or set an upper bound on total cache size. Use `localStorage.length` check.

---

### [M4] Cheerio-based parsing is fragile — depends on Next.js internals
**Severity: MEDIUM**
**File:** `scrapper-promiedos/src/parsers/promiedosParser.ts:40-47`

```typescript
const nextDataHtml = $('script#__NEXT_DATA__').html();
```

The scraper relies on finding the `__NEXT_DATA__` script tag. This will break if Promiedos:
1. Upgrades to a Next.js version that changes the hydration format
2. Switches from Next.js to another framework (e.g., Remix, Astro)
3. Adds a Content Security Policy that blocks inline scripts or changes the ID

**Fix:** Add a version detection step. Log the Next.js version from the hydration payload. Implement a secondary scraping method (e.g., parsing visible DOM tables) as a fallback.

---

### [M5] Duplicate `AsyncState` type definitions
**Severity: MEDIUM**
**Files:** `hooks/useAsyncData.ts:3-6`, `types/attendance.ts:51`

Two incompatible definitions:
- `useAsyncData.ts`: discriminated union `{ status, data, error }`
- `attendance.ts`: string union `"loading" | "error" | "ok"`

These represent the same concept (async operation state) but are not interchangeable.

**Fix:** Consolidate into one shared type exported from `hooks/useAsyncData.ts`.

---

### [M6] Competition IDs as magic numbers across both projects
**Severity: MEDIUM**
**Scope:** 12+ occurrences across frontend and scraper

```typescript
// footbolApiService.ts
const COMPETITION = '23';
const LIBERTADORES_COMPETITION = '329';

// sync.ts
await syncLeague(23, 'liga-profesional', 'hc', fullSync);
await syncLeague(329, 'libertadores', 'bac', fullSync);
await syncLeague(11, 'conmebol-sudamericana', 'dij', fullSync);

// apifootball.ts
const COMPETITION_NAMES: Record<number, string> = {
  23: 'Liga Profesional',
  329: 'Copa Libertadores',
  14: 'Copa Argentina',
  11: 'Copa Sudamericana',
};
```

`23`, `329`, `11`, `14` appear in 12+ places. Adding a new competition requires updating multiple files.

**Fix:** Create a shared constants/enum file. If both projects can't share code, at minimum use named constants consistently within each project.

---

### [M7] Business logic embedded in component files
**Severity: MEDIUM**
**Files:** `UltimosPartidos.tsx:9-25`, `TablaPosiciones.tsx:13-23`, `ModoNormal.tsx` (before fix)

Domain logic like `getResultado()` (match outcome from Boca's perspective), `getAnualRankClass()` (color-coding by rank), and inline skeleton components duplicate patterns that should live in dedicated hooks or utility modules.

**Fix:** Move `getResultado` and `getRival` to `footballApiHelpers.ts`. Move rank classification to a dedicated utility. Inline skeleton components should reference `ui/Skeleton`.

---

### [M8] Magic numbers in API page sizes
**Severity: MEDIUM**
**File:** `apifootball.ts:163-164`

```typescript
const [ligaFixtures, libFixtures] = await Promise.all([
    getLastFixtures(10),   // magic number
    getLibertadoresLastFixtures(10),  // magic number
]);
```

`10`, `20`, `24`, `25` are sprinkled throughout as page sizes and limits. Changing a display limit requires finding every occurrence.

**Fix:** Define `PAGE_SIZES` or `DISPLAY_LIMITS` constants at the top of the file.

---

## LOW Severity

### [L1] Route `/plantel` is a dead placeholder
**Severity: LOW**
**File:** `App.tsx:101`

The route `/plantel` renders the same `DashboardPage` component as `/`. This was never implemented.

---

### [L2] Fallback API key visible in source
**Severity: LOW**
**File:** `vite.config.ts:30`

```typescript
const apiKey = env.VITE_RENDER_API_KEY ?? "tu-token-secreto-inventado-por-ti-ej-boca1234";
```

While clearly a placeholder, it's visible in source control. Prefer `undefined` or an empty string as fallback.

---

### [L3] `require.main === module` may fail with ts-node
**Severity: LOW**
**File:** `scrapper-promiedos/src/sync.ts:507`

The scraper uses this pattern to detect CLI execution. With TypeScript + `ts-node-dev --transpile-only`, this is fragile across Node versions.

---

### [L4] Hardcoded colors in standings rank classification
**Severity: LOW**
**File:** `TablaPosiciones.tsx:14-22`

```typescript
const exactClasses: Record<number, string> = {
  1: 'border-l-2 border-l-[#0CF737] ...',
  2: 'border-l-2 border-l-[#F5CB25] ...',
};
```

These colors don't reference the design system tokens. A color palette change requires finding hardcoded values in components instead of updating tokens.

---

### [L5] `.env.example` disparity between projects
**Severity: LOW**
**Files:** `.env.example` (frontend, 49 lines) vs `scrapper-promiedos/.env.example`

The frontend documents all 15+ env vars with descriptions. The scraper documents only 5 with minimal comments.

---

### [L6] Scraper `fullSync` historical rounds — no progress tracking
**Severity: LOW**
**File:** `scrapper-promiedos/src/sync.ts:75-100`

When `fullSync` is true, the scraper iterates over all historical rounds with individual try/catch per round, but there's no counter or progress log showing "Round 5/30 completed". This makes it hard to estimate remaining time.

---

## Architecture Assessment

### Data Flow

**Frontend:** Follows a mostly clean pattern: `Component → Hook → Service → Cache/DB`. However, some hooks bypass the service layer and call Supabase directly (`useAuth.ts`, `useMatchAttendance.ts`), creating two different data access patterns that should be unified.

**Backend:** The `cron → sync → Supabase → API → frontend` chain is well-designed, but the duplicated standings logic in `sync.ts` vs `app.ts` weakens this architecture.

### Abstraction Layers

| Layer | Frontend | Backend |
|---|---|---|
| **Presentation** | Good — components are focused on rendering | N/A (API-only) |
| **Business Logic** | Mixed — some in services, some in components | Good — parser layer is cleanly separated |
| **Data Access** | Fragile — all `any` types, two patterns (direct vs service) | Good — Supabase client is centralized |
| **Infrastructure** | Excellent — Worker proxy, CI/CD, security headers | Adequate — mutex issue, no transactions |

### Sizing

| Metric | Frontend | Backend |
|---|---|---|
| Total source files | ~120 | 8 core + 24 scratch |
| Largest file | `worker.js` (685 lines) | `sync.ts` (512 lines) |
| Files with `any` | 8 | 4 |
| Files with `as` casts | 12 | 6 |
| Spanish identifiers | ~60% of component names | ~20% |
| Hardcoded competition IDs | 12 occurrences | 8 occurrences |

---

## Business / Feature Opportunities

| Opportunity | Description | Effort |
|---|---|---|
| **Push notifications** | User has auth already. Add match-day notifications for goals, results, lineups via Web Push API + service worker | Medium |
| **Match polls / predictions** | Before each match, fans vote on result. Pure engagement driver with zero external dependency | Low |
| **Idols section expansion** | Data already exists in `/data/idols.ts`. Add interactive cards with stats, bio, video highlights | Low |
| **Live match chat** | Supabase Realtime during matches. Fans chatting about the game live | Medium |
| **Embeddable widget** | Other Boca fan sites could embed the "next match" or "standings" widget via iframe/script tag | Medium |
| **PWA (installable app)** | Service worker exists. Add manifest + offline caching strategy for installable experience | Low |
| **Sponsorship / monetization** | With traffic, add sponsor slots (jersey shops, travel agencies for away games, etc.) | Low |
| **Official data source migration** | Promiedos scraping is fragile long-term. If AFA/CONMEBOL offers an official API, migrate to reduce breakage risk | High |

---

## Top 10 Action Items (sorted by impact/effort)

| # | Severity | Project | Action | Effort |
|---|---|---|---|---|
| 1 | CRITICAL | Both | **Generate Supabase types** (`npx supabase gen types`) and replace all `any` casts in data access layers | Low |
| 2 | CRITICAL | Scraper | **Unify sync mutex** — single shared flag or DB advisory lock to prevent concurrent syncs | Low |
| 3 | CRITICAL | Both | **De-duplicate standings reconstruction** — extract shared logic into one function | Medium |
| 4 | HIGH | Scraper | **Add retry with exponential backoff** to all Promiedos HTTP calls | Low |
| 5 | HIGH | Scraper | **Replace DELETE+INSERT with UPSERT** on standings to prevent empty-table corruption | Medium |
| 6 | HIGH | Frontend | **Wrap pages in `React.memo`** and add `ErrorBoundary` around route tree | Low |
| 7 | HIGH | Scraper | **Parallelize venue fetching** with concurrency limit (p-limit or Promise pool) | Low |
| 8 | MEDIUM | Both | **Extract competition IDs into shared enum/constants** — eliminate 20 magic numbers | Low |
| 9 | MEDIUM | Frontend | **Fix news category mapping** — stop hardcoding `'partido'` for all articles | Low |
| 10 | MEDIUM | Scraper | **Clean up `scratch/`** — gitignore debug scripts, convert `test_scraper.ts` to proper tests | Low |

---

## Summary by Project

### scrapper-promiedos — Top 5 Issues
1. Dual mutex race condition (C2)
2. Duplicated standings logic (C3)
3. No retry/backoff (H1)
4. DELETE+INSERT without transaction (H2)
5. Sequential venue fetching (H5)

### la-12-digital — Top 5 Issues
1. `any` type abuse (C1)
2. No React.memo or ErrorBoundary (H3)
3. News categories hardcoded (H4)
4. Team logo URLs fragile (H6)
5. Competition IDs as magic numbers (M6)
