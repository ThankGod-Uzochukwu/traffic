# Contributing

Thanks for taking a look at this project. It's early, so there's plenty of room to help shape it.

## Before you start

Check [TODO.md](TODO.md) to see what's already planned and what's still open. If you want to work on something that isn't listed, open an issue first so we can talk it through before you put time into it.

## Setup

```bash
npm install
npm run dev
```

Run these before opening a pull request:

```bash
npm run lint
npm run format:check
npm run build
```

## Making changes

- Keep pull requests focused on one thing. A data-pipeline fix and a UI tweak should be two separate PRs.
- If you're adding a new dependency, say why in the PR description.
- Match the tone already in the docs and UI copy: plain, direct, written like a person explaining something to another person. Not marketing language.

## Reporting a bug or gap in the data

Open an issue with what you expected, what you saw, and, if it's data related, which location or dataset it came from.
