# Architecture

## Layers and the dependency rule

```
features / components   (React UI)
        |
      store             (Zustand: state + actions)
        |
  core        api       (pure logic)   (persistence)
        \      /
   config, lib, types
```

- UI imports the store, hooks and shared components. UI never touches `localStorage`, `fetch`
  or XP math directly.
- `core/` is plain TypeScript with no React and no browser APIs, so it is easy to test.
- Lower layers never import upper ones (`core` must not import from `features` or `store`).

## State management

One store (`store/useAppStore.ts`) built from slices in `store/slices/`:

| Slice        | Owns                                                            |
| ------------ | --------------------------------------------------------------- |
| navigation   | active tab, current track and exercise                          |
| progress     | user profile, XP, streaks, solved exercises, badges             |
| forum        | posts, comments, upvotes, accepted answers                      |
| sandbox      | sandbox code per language, selected language                    |
| notification | streak modal, badge and level-up pop-ups                        |
| hydration    | whether saved data has loaded, and any load error               |

Read with selectors so a screen only re-renders for what it uses:

```tsx
const user = useAppStore((s) => s.user);
const { activeTab, setActiveTab } = useAppStore(
  useShallow((s) => ({ activeTab: s.activeTab, setActiveTab: s.setActiveTab })),
);
```

Actions contain orchestration (call core, update state, show pop-ups). Calculations live in
`core/` (`rewards.ts`, `progress.ts`, `leaderboard.ts`).

## Persistence

`store/persistence.ts` runs once at startup (`initializeStore()` in `main.tsx`):

1. **Hydrate:** load user, sandbox and forum data through the repositories. Each load is
   independent; one failure does not block the others.
2. **Persist:** subscribe to the store and save changed parts after a short debounce, and
   immediately on `pagehide`.
3. A part that failed to load is never written back, so a temporary error cannot erase saved data.

## API layer

`api/repositories/types.ts` defines what the store needs (`load`/`save` for user, sandbox, forum).
Two implementations exist: `local.ts` (localStorage, default) and `remote.ts` (HTTP).
`api/httpClient.ts` adds timeouts, cancellation and typed errors (`HttpError`, `AppError` with
codes `NETWORK`, `TIMEOUT`, ...). Routes are listed in `api/endpoints.ts`.

### Switching to a backend

1. Build endpoints `GET/PUT /users/me`, `/users/me/sandbox`, `/forum/posts` (a 404 on GET means
   "nothing saved yet").
2. Set `VITE_API_BASE_URL` and `VITE_ENABLE_REMOTE_API=true`.
3. Add authentication in `httpClient.ts` (e.g. a token header). No UI code changes.

Keep API keys on the server. Anything prefixed `VITE_` is public.

## Error handling

- `components/common/ErrorBoundary` isolates a crashing screen and resets on tab change.
- `lib/storage.ts` never throws: corrupt or blocked storage falls back to defaults and is logged.
- `lib/clipboard.ts` handles denied clipboard access.
- `main.tsx` logs unhandled errors and promise rejections through `lib/logger.ts`.
- Failed saves are logged, not swallowed; load failures show a banner in the app.

## Language tests

`features/test/` has two sections per language:

- **MCQs** (`McqSection` + `useMcqQuiz`): questions live in `data/mcq.ts` (answer order is
  shuffled deterministically). Scoring, XP and result merging are pure functions in `core/quiz.ts`.
  XP is paid only for beating your previous best, so retries cannot be farmed. Best scores are
  stored on the user profile (`user.mcqResults`).
- **Coding** (`CodingSection`): lists the language's existing exercises and opens them in the
  workspace. The overall grade weighs both sections equally (`overallPercent`).

To add questions, append to the language's array in `data/mcq.ts` using the `q(...)` helper.

## Editor suggestions

`core/autocomplete.ts` is the engine (no React): it finds the word at the cursor, mutes itself
inside strings and comments, and ranks language words, snippets and identifiers already in the
file. `data/completions.ts` holds the word lists per language (SQL also offers the in-memory
tables and columns). `hooks/useAutocomplete.ts` connects it to a `<textarea>`, and
`components/editor/SuggestionBar.tsx` shows the chips (tap on touch screens; Tab or Arrow+Enter
on a keyboard; Esc hides).

## Conventions

- Components: `PascalCase.tsx`. Everything else: `camelCase.ts`. Hooks start with `use`.
- Imports: `./x` inside the same folder, `@/...` from anywhere else. No `../`.
- Data modules are named after their content (`courses`, `badges`, `forum`, `leaderboard`).
- Magic numbers and storage keys go in `config/constants.ts`.

## Known follow-ups

- Large screens (`CodingWorkspace`, `CommunityForumView`) still mix handlers with JSX; extract
  hooks (`useExerciseRunner`, `useForumFilters`) next.
- `strict` mode is off; enabling it will surface typing gaps (`any` in the code runner).
- No automated tests are committed yet. `core/` (including `quiz.ts` and `autocomplete.ts`) and
  `store/` are the best place to start.
