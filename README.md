# NYC Traffic Watch

New York City has been counting traffic since 2000. Some streets get checked by an automated counter every single day. Others get checked once, for a couple of weeks, and then not again for a long while.

This project maps that gap and looks at what it means for rush hour in the places that get the least attention. Two questions drive it:

1. Which areas are monitored closely, and which are barely checked at all?
2. Which areas have a real rush hour that doesn't match the citywide "normal" one (roughly 7 to 9am and 4 to 7pm)?

Less monitoring can mean slower fixes: signal timing, signage, emergency routing, all depend on someone actually having current data for that street.

## Status

Early build. The homepage and the app shell are up. The real data pipeline, the map, and the charts are still being built. See [TODO.md](TODO.md) for the task list and [PLAN.md](PLAN.md) for the full build plan.

## Data

The data comes from two NYC Open Data / NYC DOT datasets:

- [Traffic Volume Counts (Historical)](https://data.cityofnewyork.us/Transportation/Traffic-Volume-Counts-Historical-/btm5-ppia), which goes back to around 2000 and covers most locations with a single count per year.
- [Automated Traffic Volume Counts](https://data.cityofnewyork.us/Transportation/Automated-Traffic-Volume-Counts/7ym2-wayt), which covers a smaller set of locations with continuous automated counters.

## Getting started

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

Other commands:

```bash
npm run build         # production build
npm run lint           # eslint
npm run format          # prettier, writes changes
npm run format:check   # prettier, check only
```

## Stack

Next.js, TypeScript, and Tailwind CSS for the app. Lucide for icons, Framer Motion for animation. See [CLAUDE.md](CLAUDE.md) for the full rundown, including the exact datasets and known quirks in the data.

## Contributing

Pull requests are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT, see [LICENSE](LICENSE).
