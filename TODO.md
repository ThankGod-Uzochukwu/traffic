# TODO.md

Live task tracker for NYC Traffic Watch. Check items off as completed, and keep this in sync with [PLAN.md](PLAN.md).

## Phase 0: Setup

- [x] Scaffold Next.js + TypeScript app, with Tailwind CSS v4
- [x] ESLint + Prettier, wired together
- [x] Add lucide-react and Framer Motion
- [x] Build the initial homepage shell (header, hero, insight cards, footer) with animation
- [x] MIT LICENSE
- [x] README
- [x] CONTRIBUTING.md
- [x] `git init`, initial commit
- [ ] Verify `data.cityofnewyork.us` is reachable from the actual dev environment (it was blocked in the planning sandbox, confirm before relying on live fetches)
- [ ] Optional: register a free Socrata app token for higher API rate limits

## Phase 1: Data ingestion

- [x] Fetch script for `btm5-ppia` (Traffic Volume Counts Historical), with pagination (`scripts/etl/fetch-historical.ts`, needs to be run from a machine that can reach the API)
- [x] Fetch script for `7ym2-wayt` (Automated Traffic Volume Counts), with pagination (`scripts/etl/fetch-automated.ts`, same caveat)
- [x] Document both datasets' actual field schemas (`scripts/etl/raw-types.ts`)
- [x] Define a unified location schema (borough, street/segment, lat/long) (`src/lib/types.ts`)
- [x] Define the location-matching/dedup strategy across the two datasets (segment id first, street and cross streets as a fallback, see `scripts/analysis/match-locations.ts`)
- [x] Local raw-data cache (`data/raw`, gitignored)
- [x] Synthetic sample data generator so the pipeline works without live API access (`scripts/etl/generate-sample-data.ts`), matching the real schemas

## Phase 2: Analysis

- [x] Compute per-location monitoring frequency (count-days/years) and classify it (continuous, annual, sparse, stale) (`scripts/analysis/coverage.ts`)
- [x] Compute the citywide expected rush-hour window from aggregate data (`scripts/analysis/deviation.ts`)
- [x] Compute per-location actual peak/trough hours and a deviation score vs. the citywide norm
- [x] Export the aggregates as JSON for the frontend (`scripts/build-data.ts` writes `public/data/locations.json` and `public/data/summary.json`)

## Phase 3: Data layer

- [x] Decide static JSON vs. API-route data serving: static JSON under `public/data`, read server side with `src/lib/data.ts`, no API routes or database needed
- [x] Data: locations plus coverage classification
- [x] Data: per-location hourly time series
- [x] Data: deviation scores

## Phase 4: Frontend dashboard

- [x] Map view (MapLibre GL) with coverage/deviation styling
- [x] Location detail panel with an hourly profile chart
- [x] Summary/insights view (headline findings, citywide stats)
- [x] Responsive and accessible styling pass
- [x] Sample data banner so it is always clear when the dashboard is showing synthetic fixture data instead of a real pipeline run

## Phase 5: Polish, docs, deploy

- [x] README: setup, ETL usage, data attribution
- [ ] Choose and configure a deploy target (Vercel or GitHub Pages): left for the project owner, since deploying requires an account this session does not have
- [x] Tests: ETL normalization, matching, coverage classification, deviation-score calculation

## Phase 6: Open-source readiness

- [x] CONTRIBUTING.md finalized
- [x] Issue templates
- [x] GitHub Actions CI (lint, typecheck, test, build)
- [x] CODE_OF_CONDUCT.md

## Backlog / nice to have

- [ ] Time-range slider (view coverage/deviation by year)
- [ ] Borough-level rollup stats
- [ ] Export or share a location's chart
