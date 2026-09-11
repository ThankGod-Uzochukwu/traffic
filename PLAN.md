# PLAN.md

Build plan for NYC Traffic Watch. Phases are mostly sequential but can overlap once data is flowing. See [TODO.md](TODO.md) for the checklist version of this plan, and [CLAUDE.md](CLAUDE.md) for stack and convention context.

## Goal

Turn NYC DOT traffic volume data (2000 to present) into an interactive dashboard that shows:

1. Where and how often traffic is actually monitored: a coverage map and frequency breakdown.
2. Which locations' real peak and off-peak hours deviate from the citywide expected rush-hour pattern (roughly 7 to 9am and 4 to 7pm), and by how much.

**Audience:** general public and open-source contributors. Portfolio-quality polish, not production-hardened (no auth, no multi-tenant concerns, no SLA).

## Phase 0: Project setup (done)

- [x] Initialize Next.js + TypeScript app, with Tailwind CSS v4 and ESLint.
- [x] Add Prettier, wired into ESLint.
- [x] Add lucide-react (icons) and Framer Motion (animation).
- [x] Build an initial homepage shell: header, hero, insight cards, footer, all animated.
- [x] Add MIT LICENSE, README, CONTRIBUTING.md.
- [x] `git init` and first commit.
- [ ] Confirm actual network access to `data.cityofnewyork.us` from the real dev machine (it was blocked in the planning sandbox, must be reverified before Phase 1's fetch scripts are trusted to work outside it).

## Phase 1: Data ingestion (ETL) (done)

- Fetch scripts for both datasets (`btm5-ppia`, `7ym2-wayt`) with pagination and optional Socrata app-token support: `scripts/etl/fetch-historical.ts`, `scripts/etl/fetch-automated.ts`.
- Normalized schemas into one shape (`src/lib/types.ts: NormalizedCount`), documented the real field names in `scripts/etl/raw-types.ts`.
- Raw pulls cache to `data/raw/*.raw.json` (gitignored).
- Location matching (`scripts/analysis/match-locations.ts`): by segment id first, falling back to street plus cross streets plus direction when segment id is missing, which is common in the historical dataset. This is a heuristic, documented as such in the code, and it can misfire on ambiguous street names.
- Since `data.cityofnewyork.us` stayed unreachable from this sandbox, added `scripts/etl/generate-sample-data.ts`, a synthetic data generator matching both datasets' real schemas exactly, so the rest of the pipeline could be built and tested against realistic data. It is clearly labeled as synthetic in the code and in its output file's metadata, and the app surfaces a banner whenever it is looking at sample data instead of a real pipeline run.

**Known limitation:** the historical dataset does not include coordinates. Locations that only ever appear in the historical dataset (no matching automated segment id) have no lat/long and cannot be placed on the map. They are still counted in the coverage statistics. A real fix would join `Segment ID` against a street centerline dataset (for example NYC's LION dataset) to resolve coordinates, which is out of scope for this build.

## Phase 2: Analysis (done)

- Monitoring frequency classification (`scripts/analysis/coverage.ts`): continuous, annual, sparse, or stale, based on count days, distinct years active, and how recent the most recent count is.
- Citywide expected rush hour and per-location deviation scoring (`scripts/analysis/deviation.ts`): the expected morning and evening peak hours are computed from the busiest hour in a typical commute window across all locations, not hardcoded, and each location gets a 0 to 1 score for how far its actual peak hour is from the nearer of those two.
- `scripts/build-data.ts` orchestrates normalize, match, and analyze, and writes the aggregates.

## Phase 3: Data layer (done)

- Static JSON under `public/data/locations.json` and `public/data/summary.json`, read server side in `src/lib/data.ts`. No API routes or database: the data volume is small enough once aggregated, and static files keep the open source deploy free to run.

## Phase 4: Frontend dashboard (done)

- Map view (MapLibre GL, `src/components/dashboard/MapView.tsx`): locations colored by coverage class, sized by how off pattern their rush hour is, click for detail.
- Detail panel (`src/components/dashboard/LocationPanel.tsx`) with an hourly profile chart against the citywide expected peaks.
- Charts are a small hand-built SVG bar chart component (`src/components/dashboard/HourlyChart.tsx`) rather than a charting library, to keep the bundle light and the styling fully under control.
- Summary stats and a legend that pairs color with text and icons, not color alone, for accessibility.
- A sample-data banner shown whenever `summary.json` reports synthetic data.

## Phase 5: Polish, docs, deploy

- [x] README covers setup, ETL usage, and data attribution.
- [x] Tests for normalization, matching, coverage classification, and deviation scoring (Vitest).
- [x] Deploy target: Vercel. `.github/workflows/cd.yml` builds and deploys `main` automatically, but only once `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` are set as repo secrets. It checks for them first and skips cleanly if they're missing, rather than failing. Setting those secrets, and having a Vercel account to get them from, is left for the project owner (documented in README.md).

## Phase 6: Open-source readiness (done)

- CONTRIBUTING.md, CODE_OF_CONDUCT.md, issue templates.
- CI (GitHub Actions): lint, typecheck, test, build on every push and PR.

## Open questions / risks

- The location-matching heuristic (segment id, or street plus cross streets as a fallback) can misfire on ambiguous names. Worth revisiting once real data is in, by checking how many locations the fallback path actually creates versus how many should have matched.
- NYC Open Data API rate limits without an app token may slow full historical ingestion. Get a free token early if a real `etl:fetch` run is slow.
- The sandbox network block on `data.cityofnewyork.us` must be re-verified from wherever ETL actually runs. Don't assume it's fixed just because a different host worked.
- The historical dataset's lack of coordinates (see Phase 1) means part of the "once a year" story is undercounted on the map specifically, even though it is fully counted in the stats.
