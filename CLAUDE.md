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

**Known constraint:** as of this planning session, `data.cityofnewyork.us` returned HTTP 403 to every request from this sandbox's egress IP (confirmed with `curl -v`). General internet access, for example `api.github.com`, worked fine from the same sandbox, so this is host-specific, not a network-wide block. ETL/fetch scripts must be run and verified from an environment with unblocked access (the user's own machine, CI, or the deploy target). Do not treat a 403 here as proof the API is down or the URL is wrong. Re-test from wherever the script actually runs.

## Tech stack

- **Framework:** Next.js (TypeScript, App Router). Node and React with built-in API routes, no separate backend process needed.
- **Styling:** Tailwind CSS v4.
- **Icons:** lucide-react (real icon set, not emoji or placeholders).
- **Animation:** Framer Motion, used with restraint (entrance fades/slides, hover states), not as decoration for its own sake.
- **Map:** MapLibre GL JS with OSM/CARTO basemap tiles. No API key required, so any open-source contributor can run the project without a paid map signup.
- **Charts:** to be decided in Phase 4 (candidates: Observable Plot, Recharts, visx).
- **Data layer:** ETL scripts fetch and normalize the two datasets into precomputed aggregate JSON (by location, year, hour). Prefer static-at-build data over a live database, to keep the open-source deploy simple and free to run.

## Conventions

- TypeScript strict mode. No implicit `any`.
- Keep ETL (fetching and aggregation) separate from presentation (React components). ETL lives in `/scripts` or `/etl`, and outputs plain JSON consumed by the app.
- Comment only on non-obvious reasoning (dataset quirks, schema mismatches between the two datasets), not on what the code does.
- Don't add abstractions, error handling, or config beyond what the current phase needs.
- **Writing style, everywhere (UI copy, docs, commit messages, comments):** write in plain human terms, like one person explaining something to another. No em dashes, use commas, periods, or parentheses instead. Avoid AI-marketing language ("unlock," "leverage," "seamless," "robust," "cutting-edge," "delve"). Say what's true plainly, including admitting when something is a placeholder or not built yet.

## Running things

```bash
npm install
npm run dev            # local dev server at http://localhost:3000
npm run build           # production build
npm run lint            # eslint
npm run format           # prettier, writes changes
npm run format:check    # prettier, check only
```

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
