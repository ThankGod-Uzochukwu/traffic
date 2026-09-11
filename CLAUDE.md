# CLAUDE.md

Guidance for Claude Code (and human contributors) working in this repository.

## Project

**NYC Traffic Watch** is an open-source web dashboard built from NYC DOT traffic volume data (2000 to present). It surfaces two findings:

1. **Monitoring coverage gaps.** Some locations are counted continuously (automated recorders), others just once a year.
2. **Off-pattern peak/off-peak hours.** Locations whose actual busiest and quietest hours diverge from the citywide "expected" rush-hour norm.

The premise: uneven monitoring coverage means uneven awareness, which can translate into uneven service (signal timing, emergency response planning, etc.) for under-monitored areas.

See [PLAN.md](PLAN.md) for the phased build plan and [TODO.md](TODO.md) for the live task list. Keep all three in sync. Update TODO.md as tasks complete, and update PLAN.md if scope or approach changes in a real way.

## Data sources (NYC Open Data / Socrata)

| Dataset                            | Socrata ID  | Coverage                | Notes                                                                                                                                                           |
| ---------------------------------- | ----------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Traffic Volume Counts (Historical) | `btm5-ppia` | roughly 2000 to 2013    | Manual/periodic counts. Many locations counted only once, for a roughly two-week window per year. This is the dataset behind the "counted once a year" finding. |
| Automated Traffic Volume Counts    | `7ym2-wayt` | roughly 2011 to present | Continuous automated recorder (ATR) counts, hourly. Denser coverage for a smaller set of locations. This is the "monitored more closely" side of the contrast.  |

Access via the Socrata REST API: `https://data.cityofnewyork.us/resource/<dataset-id>.json`, paginated with `$limit`/`$offset` (add `$$app_token` for higher rate limits; register a free Socrata app token before heavy use).

**Known constraint:** `data.cityofnewyork.us` returned HTTP 403 to every request from this sandbox's egress IP (confirmed with `curl -v`), and separately, the project owner confirmed the same URL fails even loading directly in their own browser, on their own network. That rules out this being sandbox-specific or a User-Agent/header issue (a normal browser hitting a bare `403 Forbidden` nginx page, with `X-Socrata-RequestId` present, means Socrata's own edge is rejecting the connection before it reaches the API). This looks like either an IP or region level block on Socrata's side, or a network path issue between the project owner and AWS us-east-1 (where `data.cityofnewyork.us` resolves), not something fixable in this codebase. If you hit this again, try from a different network or a VPN before assuming the fetch scripts are broken. `scripts/etl/socrata-client.ts` sends a normal browser `User-Agent` and includes a response body preview in its error for exactly this kind of diagnosis.

## Tech stack

- **Framework:** Next.js (TypeScript, App Router). Node and React with built-in API routes, no separate backend process needed.
- **Styling:** Tailwind CSS v4.
- **Icons:** lucide-react (real icon set, not emoji or placeholders).
- **Animation:** Framer Motion, used with restraint (entrance fades/slides, hover states), not as decoration for its own sake.
- **Map:** MapLibre GL JS with CARTO basemap tiles (positron for light, dark matter for dark). No API key required, so any open-source contributor can run the project without a paid map signup.
- **Charts:** a small hand built SVG bar chart component (`src/components/dashboard/HourlyChart.tsx`), not a charting library. Decided in Phase 4 to keep the bundle light and the styling fully under control for a single, simple chart type.
- **Data layer:** ETL scripts (`scripts/etl`, `scripts/analysis`, `scripts/build-data.ts`) fetch, normalize, match, and analyze the two datasets into precomputed JSON under `public/data`. Read server side by `src/lib/data.ts`. No API routes or database, to keep the open-source deploy simple and free to run.
- **Testing:** Vitest, for the ETL and analysis logic specifically (`scripts/**/*.test.ts`). That code is the actual point of the project and the part most worth trusting.

## Conventions

- TypeScript strict mode. No implicit `any`.
- Keep ETL (fetching and aggregation) separate from presentation (React components). ETL and analysis live in `/scripts`, and output plain JSON under `public/data` consumed by the app.
- Comment only on non-obvious reasoning (dataset quirks, schema mismatches between the two datasets), not on what the code does.
- Don't add abstractions, error handling, or config beyond what the current phase needs.
- **Writing style, everywhere (UI copy, docs, commit messages, comments):** write in plain human terms, like one person explaining something to another. No em dashes, ever, in code, docs, comments, commit messages, or UI copy. Use commas, periods, or parentheses instead. Avoid AI-marketing language ("unlock," "leverage," "seamless," "robust," "cutting-edge," "delve"). Say what's true plainly, including admitting when something is a placeholder or not built yet.

## Location matching

Locations are matched across the two datasets primarily by segment id (`scripts/analysis/match-locations.ts`). When segment id is missing, which is common in the historical dataset, it falls back to a key built from street name, cross streets, and direction. That fallback is a heuristic: two different real world references to the same corner will not match if they're worded differently. Documented as an open risk in PLAN.md.

The historical dataset does not include coordinates at all. A location that only ever shows up there (no matching automated segment id) has no lat/long, is not plotted on the map, but is still counted in the coverage stats. Resolving that for real would mean joining segment id against a street centerline dataset (for example NYC's LION dataset), which is out of scope for this build.

## Sample data

Since `data.cityofnewyork.us` is unreachable from the sandbox this project was built in, `scripts/etl/generate-sample-data.ts` produces synthetic data matching both real dataset schemas exactly, so the pipeline and dashboard can be built, tested, and demoed honestly. It's deterministic (seeded random), clearly labeled `synthetic: true` in the raw file metadata, and that flag flows through `scripts/build-data.ts` into `summary.json` as `meta.sample`, which is what the dashboard reads to show its sample data banner. Never remove that banner logic without actually wiring up real data first.

## CI and CD

`.github/workflows/ci.yml` runs on every push and pull request: lint, format check, typecheck, test, a fresh `etl:sample` plus `etl:build` to prove the pipeline still works, then a build.

`.github/workflows/cd.yml` runs on every push to `main`. It builds with whatever is already committed in `public/data` (it does not regenerate sample data, so a real pipeline run stays deployed once one is committed) and deploys to Vercel. It checks for `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` as repo secrets first, and skips cleanly instead of failing when they are not set, so forking this repo does not leave a broken workflow. Setting those secrets up is documented in README.md and is left for whoever owns the deploy target, since it needs a Vercel account.

## Running things

```bash
npm install
npm run etl:sample      # generate synthetic sample data
npm run etl:fetch        # or: pull real data (needs network access to data.cityofnewyork.us)
npm run etl:build       # turn raw data into what the app reads
npm run dev              # local dev server at http://localhost:3000
npm run build            # production build
npm run lint              # eslint
npm run format             # prettier, writes changes
npm run format:check      # prettier, check only
npm run typecheck          # tsc --noEmit
npm test                    # vitest
```

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
