# Math Facts Quiz

A spaced repetition app for practicing multiplication and division facts (1-10), based on Singapore math fact families.

## How It Works

Facts are organized into **fact families** (e.g. {3, 5, 15}) and quizzed in six formats:

- `3 × 5 = ?`, `5 × 3 = ?`
- `3 × ? = 15`, `? × 5 = 15`
- `15 ÷ 3 = ?`, `15 ÷ 5 = ?`

Square families (e.g. {4, 4, 16}) collapse to 3 unique formats.

The app uses the **SM-2 spaced repetition algorithm** to schedule reviews, prioritizing overdue items and introducing a configurable number of new items per session.

## Prerequisites

- [Bun](https://bun.sh) (v1.0+)

## Setup

```sh
bun install
```

## Scripts

| Command | Description |
|---------|-------------|
| `bun test` | Run all tests |
| `bun run lint` | Lint and format check (Biome) |
| `bun run format` | Auto-fix lint and format issues |
| `bun run build:web` | Bundle the web app |
| `bun run serve:web` | Build and serve the web app at `http://localhost:3000` |
| `bun run typecheck` | Type-check with TypeScript |

## Web App

```sh
bun run serve:web
```

Open http://localhost:3000 in your browser. The app has three views:

- **Quiz** -- answer multiplication and division questions
- **Settings** -- select which tables (1-10) to practice, toggle question formats, set new items per session
- **Stats** -- see items due today, learning vs. mature counts

Progress is saved in `localStorage` and persists across page reloads.

## Architecture

Hexagonal / ports & adapters:

```
src/
  domain/           # Pure logic, no dependencies on UI or storage
    fact-family.ts        # FactFamily type & helpers
    quiz-format.ts        # 6 quiz format variants
    quiz-item.ts          # QuizItem rendering & applicable formats
    review-record.ts      # SM-2 review state
    user-config.ts        # User preferences
    fact-family-generator.ts  # Generate & deduplicate families
    sm2.ts                # Pure SM-2 algorithm
    review-service.ts     # Process reviews, compute next date
    quiz-engine.ts        # Select next item (pure function)
    quiz-session.ts       # Orchestrator
    ports.ts              # StoragePort interface
  infrastructure/   # Concrete storage implementations
    in-memory-storage.ts      # Map-based (used by tests)
    local-storage-adapter.ts  # localStorage (used by web app)
  web/              # Vanilla JS + Pico CSS presentation
    index.html
    app.ts / quiz-view.ts / config-view.ts / stats-view.ts
```

## Testing

All domain and infrastructure logic is tested with Bun's test runner:

```sh
bun test
```
