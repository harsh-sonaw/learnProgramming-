# DevPulse

Interactive coding academy: lessons and exercises in Python, JavaScript, TypeScript, Go and SQL,
per-language tests (MCQs and coding), a live test runner with automatic code suggestions,
streaks and XP, leaderboards, a community forum and a code sandbox.
Everything runs in the browser; progress is saved locally (or through an API, see below).

## Quick start

```bash
npm install
cp .env.example .env     # optional: defaults work without it
npm run dev              # http://localhost:3000
```

| Script            | What it does                                   |
| ----------------- | ---------------------------------------------- |
| `npm run dev`     | Dev server with hot reload                     |
| `npm run build`   | Production bundle in `dist/`                   |
| `npm run preview` | Serve the production bundle locally            |
| `npm run lint`    | Type-check (`tsc --noEmit`, flags unused code) |

To deploy, upload the contents of `dist/` to any static host.

## Project layout

```
src/
  app/          App shell: tab -> screen map, error boundary, loading state
  features/     One folder per screen (tracks, test, workspace, daily, sandbox,
                leaderboard, community, profile, streak, notifications)
  components/   Shared UI: layout/ (Navbar), common/ (ErrorBoundary, LanguageIcon),
                editor/ (SuggestionBar)
  store/        Zustand store: one slice per concern + persistence
  core/         Pure business logic, no React: XP/levels/streaks, rewards,
                leaderboard, and execution/ (code runner, Python compiler/runtime)
  api/          HTTP client + repositories (local or remote persistence)
  data/         Static content: courses, challenges, badges, forum/leaderboard seeds
  config/       env.ts (typed env vars), constants.ts (storage keys, XP rules)
  lib/          logger, errors, safe localStorage, clipboard, confetti
  hooks/        Reusable hooks
  types/        Shared TypeScript types
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for how the pieces fit together.

## Configuration

All settings live in `.env` (see `.env.example`). The app runs with none of them set.

## Common tasks

- **Add an exercise or course:** edit `src/data/courses.ts`.
- **Add MCQ questions:** edit `src/data/mcq.ts`.
- **Add editor suggestions:** edit `src/data/completions.ts`.
- **Add a screen:** create `src/features/<name>/<Name>View.tsx`, add the tab to `NavigationTab`
  in `src/types/index.ts`, then register it in `VIEWS` in `src/app/App.tsx`.
- **Change an XP rule:** `src/config/constants.ts` (amounts) or `src/core/` (logic).
- **Save progress on a server:** see "Switching to a backend" in the architecture doc.
