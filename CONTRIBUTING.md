# Contributing

Thanks for taking a look at this project. It's early, so there's plenty of room to help shape it. By taking part you're expected to follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## Before you start

Check [TODO.md](TODO.md) to see what's already planned and what's still open. If you want to work on something that isn't listed, open an issue first so we can talk it through before you put time into it.

## Setup

```bash
npm install
npm run etl:sample   # generates synthetic data so the app has something to show
npm run etl:build    # turns that raw data into what the app actually reads
npm run dev
```

If you have access to `data.cityofnewyork.us` (it's been unreachable from every environment tried so far, sandbox, dev machine, and browser, so this was never actually verified end to end), you can pull real data instead:

```bash
npm run etl:fetch    # real Socrata pulls, can take a while
npm run etl:build
```

If `data.cityofnewyork.us` stays unreachable for you too, there's a fallback for the automated dataset specifically: download a copy from wherever else it's mirrored (for example Kaggle) and import it:

```bash
npm run etl:import-automated-csv -- path/to/downloaded.csv
npm run etl:build
```

Run these before opening a pull request:

```bash
npm run lint
npm run format:check
npm run typecheck
npm test
npm run build
```

## Making changes

- Keep pull requests focused on one thing. A data-pipeline fix and a UI tweak should be two separate PRs.
- If you're adding a new dependency, say why in the PR description.
- Match the tone already in the docs and UI copy: plain, direct, written like a person explaining something to another person. Not marketing language, and no em dashes.
- If you touch the ETL or analysis code (`scripts/`), add or update a test. That code is the point of the project, it should stay trustworthy.

## Reporting a bug or gap in the data

Open an issue with what you expected, what you saw, and, if it's data related, which location or dataset it came from, and whether the dashboard was showing sample or real data at the time.
