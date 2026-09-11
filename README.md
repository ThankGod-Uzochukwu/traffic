# NYC Traffic Watch

New York City has been counting traffic since 2000. Some streets get checked by an automated counter every single day. Others get checked once, for a couple of weeks, and then not again for a long while.

This project maps that gap and looks at what it means for rush hour in the places that get the least attention. Two questions drive it:

1. Which areas are monitored closely, and which are barely checked at all?
2. Which areas have a real rush hour that doesn't match the citywide "normal" one (roughly 7 to 9am and 4 to 7pm)?

Less monitoring can mean slower fixes: signal timing, signage, emergency routing, all depend on someone actually having current data for that street.

## Status

The pipeline (fetch, normalize, match, analyze) and the dashboard are both built and working. The dashboard is currently running on synthetic sample data, not real NYC counts, because `data.cityofnewyork.us` was unreachable from the environment this was built in. See [Data](#data) below for how to swap in the real thing. See [TODO.md](TODO.md) for the detailed task list and [PLAN.md](PLAN.md) for the full build plan.

## Data

The data comes from two NYC Open Data / NYC DOT datasets:

- [Traffic Volume Counts (Historical)](https://data.cityofnewyork.us/Transportation/Traffic-Volume-Counts-Historical-/btm5-ppia), which goes back to around 2000 and covers most locations with a single count per year, and does not include coordinates.
- [Automated Traffic Volume Counts](https://data.cityofnewyork.us/Transportation/Automated-Traffic-Volume-Counts/7ym2-wayt), which covers a smaller set of locations with continuous automated counters, and does include coordinates.

Turning that into what the dashboard reads is a pipeline with a few options for where the raw data comes from:

```bash
# Option A: synthetic data, matches the real schemas, works anywhere
npm run etl:sample

# Option B: the real thing, needs a machine that can reach data.cityofnewyork.us
npm run etl:fetch

# Option C: import a manually downloaded copy of the automated dataset,
# for example the Kaggle mirror at kaggle.com/datasets/aadimator/nyc-automated-traffic-volume-counts,
# useful if data.cityofnewyork.us is unreachable but you can get the file another way
npm run etl:import-automated-csv -- path/to/downloaded.csv

# Whichever combination you used above, this turns the raw pull into
# what the app actually reads
npm run etl:build
```

`etl:build` writes `public/data/locations.json` and `public/data/summary.json`. The two datasets are tracked separately, `summary.json.meta.historicalSource` and `automatedSource` are each `"real"`, `"synthetic"`, or `"missing"`, so it's possible to have real automated data and still-synthetic historical data at the same time. The dashboard shows a banner that says exactly which is which whenever either one isn't real.

## Getting started

```bash
npm install
npm run etl:sample
npm run etl:build
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) for the homepage, or [http://localhost:3000/dashboard](http://localhost:3000/dashboard) for the map.

Other commands:

```bash
npm run build           # production build
npm run lint             # eslint
npm run format            # prettier, writes changes
npm run format:check     # prettier, check only
npm run typecheck        # tsc --noEmit
npm test                  # vitest
```

## Deploying

There are two GitHub Actions workflows in `.github/workflows`:

- `ci.yml` runs on every push and pull request: lint, format check, typecheck, tests, and a build.
- `cd.yml` deploys `main` to Vercel on every push, but only once the repo has the Vercel secrets set. Without them it skips itself instead of failing, so forking this repo won't leave you with a red X on every commit.

To turn deploys on: create a project on [Vercel](https://vercel.com), then add three repo secrets under Settings, Secrets and variables, Actions:

- `VERCEL_TOKEN`, from your Vercel account settings
- `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID`, both found in the `.vercel/project.json` file that `vercel link` creates if you link the project locally once

After that, a push to `main` builds and deploys automatically.

## Stack

Next.js, TypeScript, and Tailwind CSS for the app. Lucide for icons, Framer Motion for animation, MapLibre GL for the map (free basemap tiles, no API key needed). Charts are a small hand built SVG component rather than a charting library. See [CLAUDE.md](CLAUDE.md) for the full rundown, including the exact datasets, the location matching heuristic, and known quirks in the data.

## Contributing

Pull requests are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) and the [Code of Conduct](CODE_OF_CONDUCT.md).

## License

MIT, see [LICENSE](LICENSE).
