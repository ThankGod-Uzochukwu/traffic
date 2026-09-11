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
- [ ] Confirm actual network access to `data.cityofnewyork.us` from the real dev machine (it was blocked in the planning sandbox, must be reverified before Phase 1 work is trusted).

## Phase 1: Data ingestion (ETL)

- Fetch scripts for both datasets (`btm5-ppia`, `7ym2-wayt`) with pagination and optional Socrata app-token support.
- Normalize schemas: unify location identifiers (borough, street/segment, lat/long), date/hour fields, and vehicle-count fields. The two datasets don't share an identical schema.
- Cache raw pulls locally (JSON files or SQLite) so iteration doesn't repeatedly hit the API.
- Decide and document how a "location" is matched and deduplicated across the two datasets (segment ID vs. lat/long proximity).

## Phase 2: Analysis

- **Monitoring frequency per location:** count distinct count-days and years per location across both datasets, then classify into buckets (continuous/ATR, annual, sparse/once, stale/no recent data).
- **Rush-hour deviation:** for locations with enough hourly data, compute the actual peak and trough hours, compare against the citywide-aggregate expected rush-hour window, and compute a deviation score.
- Output both as precomputed JSON aggregates keyed by location. No heavy computation in the browser.

## Phase 3: Data layer / API

- Next.js API routes, or static JSON under `/public/data`, exposing: the locations list, per-location time series, coverage classification, and deviation score.
- Decide static-at-build vs. on-demand-with-cache based on the actual data volume from Phase 1.

## Phase 4: Frontend dashboard

- Map view (MapLibre GL): color and size locations by monitoring frequency and/or deviation score, click for location detail.
- Detail panel: hourly volume profile for a selected location vs. the citywide expected curve.
- Summary/insights view: callouts for the two headline findings, plus citywide stats.
- Responsive layout, accessible color choices (not solely red/green).

## Phase 5: Polish, docs, deploy

- README with screenshots, setup instructions, and data attribution (NYC DOT / NYC Open Data).
- Deploy target: Vercel (fits Next.js) or GitHub Pages if the data layer ends up fully static. Decide once Phase 3 is settled.
- Tests: ETL normalization logic, deviation-score calculation.

## Phase 6: Open-source readiness

- Finalize CONTRIBUTING.md, optional CODE_OF_CONDUCT.md, issue templates.
- CI (GitHub Actions): lint, typecheck, test on every PR.

## Open questions / risks

- The two-dataset schema mismatch may need a documented location-matching heuristic. Flag early if match quality looks unreliable.
- NYC Open Data API rate limits without an app token may slow full historical ingestion. Get a free token early if Phase 1 is slow.
- The sandbox network block on `data.cityofnewyork.us` must be re-verified from wherever ETL actually runs. Don't assume it's fixed just because a different host worked.
