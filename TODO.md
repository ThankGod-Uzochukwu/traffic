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

- [ ] Fetch script for `btm5-ppia` (Traffic Volume Counts Historical), with pagination
- [ ] Fetch script for `7ym2-wayt` (Automated Traffic Volume Counts), with pagination
- [ ] Inspect and document both datasets' actual field schemas
- [ ] Define a unified location schema (borough, street/segment, lat/long)
- [ ] Define the location-matching/dedup strategy across the two datasets
- [ ] Local raw-data cache, to avoid re-fetching during iteration

## Phase 2: Analysis

- [ ] Compute per-location monitoring frequency (count-days/years) and classify it (continuous, annual, sparse, stale)
- [ ] Compute the citywide expected rush-hour window from aggregate data
- [ ] Compute per-location actual peak/trough hours and a deviation score vs. the citywide norm
- [ ] Export the aggregates as JSON for the frontend

## Phase 3: Data layer

- [ ] Decide static JSON vs. API-route data serving
- [ ] Implement the chosen approach
- [ ] Data: locations plus coverage classification
- [ ] Data: per-location hourly time series
- [ ] Data: deviation scores

## Phase 4: Frontend dashboard

- [ ] Map view (MapLibre GL) with coverage/deviation styling
- [ ] Location detail panel with an hourly profile chart
- [ ] Summary/insights view (headline findings, citywide stats)
- [ ] Responsive and accessible styling pass

## Phase 5: Polish, docs, deploy

- [ ] README: setup, screenshots, data attribution
- [ ] Choose and configure a deploy target (Vercel or GitHub Pages)
- [ ] Tests: ETL normalization, deviation-score calculation
- [ ] Deploy

## Phase 6: Open-source readiness

- [ ] CONTRIBUTING.md finalized
- [ ] Issue templates
- [ ] GitHub Actions CI (lint, typecheck, test)

## Backlog / nice to have

- [ ] Time-range slider (view coverage/deviation by year)
- [ ] Borough-level rollup stats
- [ ] Export or share a location's chart
