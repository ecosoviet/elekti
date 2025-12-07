# Elekti

> A multilingual political alignment quiz that matches South African voters to parties via weighted scoring.

Elekti is a Vue 3 + Pinia single-page application that walks users through 40 policy questions, normalizes their answers against curated party data, and surfaces tailored recommendations. The project emphasizes strict localization, reproducible scoring, and a lean state-management layer so new questions or parties can be introduced without rewiring the UI.

## Highlights

- 🎯 **Policy matching** – Option indices map directly to scoring weights defined in `src/data/scoring.json`.
- 🌍 **Fully localized content** – All copy (including questions) lives in `src/data/translations/*.json`; the quiz store throws if a locale is missing data.
- 🧠 **Deterministic scoring** – `src/utils/scoring.ts` normalizes per-party scores, tracks category confidence, and exposes top policies.
- 🧭 **URL-shareable results** – Answers encode into a comma-delimited string, enabling sharable quiz states.
- ⚙️ **Rolldown-powered Vite** – Fast local dev with manual chunks and Fontaine font metrics.

## Architecture Overview

- **Views** – Landing, Quiz, Results, and About routes under `src/views/*` managed by `vue-router`.
- **State** – `quizStore` handles answers, progress, sharing, and locale-triggered refreshes; `uiStore` persists the selected locale to `localStorage`.
- **Data** – `parties.json` holds metadata; `scoring.json` links question ids → party scores; translations carry question text + categories.
- **Scoring flow** – Answers feed into `computeScores`, which calculates raw + normalized scores, sorts parties, and determines confidence (`high|medium|low`).

```
src/
├── components/         # QuizQuestion, QuizOption, PartyCard, etc.
├── data/               # parties.json, scoring.json, translations
├── stores/             # Pinia stores (quiz + ui) and unit tests
├── utils/              # scoring logic + tests
└── views/              # Route-level components
```

## Getting Started

Prerequisites: Node >= 22.21.1 and npm.

```sh
npm install
npm run dev
```

Visit `http://localhost:5173` (default Vite port).

## Key Scripts

| Command                            | Description                                                |
| ---------------------------------- | ---------------------------------------------------------- |
| `npm run dev`                      | Start the Rolldown-powered Vite dev server.                |
| `npm run build`                    | Runs `vue-tsc --build` then bundles. Fails on type errors. |
| `npm run preview`                  | Preview the production build locally.                      |
| `npm run test` / `npm run test:ui` | Vitest in happy-dom mode; UI variant opens the inspector.  |
| `npm run lint`                     | Executes `oxlint` then ESLint with cache + autofix.        |
| `npm run format`                   | Prettier with organize-imports + package.json sorting.     |

## Content & Localization Workflow

1. **Questions** – Add `questions.qN` entries (text + category) to every translation file; keep the 0-4 option order consistent.
2. **Store** – Append the new `qN` to `questionIds` inside `quizStore.ts`.
3. **Scoring** – Extend `scoring.json` with the question id, weight, option descriptors, and per-party scores.
4. **Parties** – Update `parties.json`, translation strings (`party.{id}.desc`), and scoring rows for each question; ensure ids match exactly.

Switching locales via `uiStore.setLang` reloads the quiz and persists the language code. Skipping this helper bypasses the watcher and leaves stale state.

## Testing & QA

- Stores require `setActivePinia(createPinia())` in unit tests (`src/stores/*.test.ts`).
- Scoring tests use lightweight party fixtures (`src/utils/scoring.test.ts`).
- Vitest uses `happy-dom`; browser-only APIs may need shims/mocks.

## Tooling Notes

- `vite.config.ts` manually splits vendor chunks and filters noisy vue-i18n warnings—treat new Rollup warnings as regressions.
- CSS lives in `src/styles/theme.css` with bespoke variables; reuse existing tokens instead of introducing ad-hoc values.

## Contributing

1. Fork + branch from `main`.
2. Keep lint, tests, and type checks green (`npm run lint && npm run test && npm run build`).
3. Update translations/scoring/parties synchronously when adding content.

---

Have improvement ideas or new policy questions? Open an issue or start a discussion so we can expand Elekti’s reach.
