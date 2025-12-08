# Elekti – AI Guide

## Architecture & Flow

- Vue 3 SPA with Landing → Quiz → Results (+ About) routes in `src/router/index.ts` and `src/views/*`; Pinia stores (`quizStore`, `uiStore`) keep components thin.
- `quizStore` **auto-discovers questions from translation keys** (q1…qN) via `i18n`, sorted numerically and thrown immediately if missing so localization drift is caught early.
- Answers stored as `Record<questionId, optionIndex>` (0=Strongly Agree … 4=Strongly Disagree) and synced to URLs via `encodeAnswersToUrl`/`loadAnswersFromUrl`—keep indices stable.
- Scoring pulls 14 merged topic files from `src/data/scoring/index.ts` (ordered: economy-fiscal → culture-identity), weights answers, and pairs with 11 parties from `src/data/parties.json`; Results expect a fully computed `QuizResult`.
- Styling uses bespoke tokens in `src/styles/theme.css`; reuse variables instead of raw colors/spacing.

## Stores & Data Contracts

- **quizStore** owns navigation, `canProceed`, watch-based locale reloads; push quiz logic here, not views. Questions are **auto-discovered from translation keys**, so no hardcoded array—just ensure all 4 locale files have matching `qN` keys.
- **uiStore** is the single gate to language persistence (en/af/xh/zu via `setLang`); bypassing it leaves stale `i18n` state and skips `localStorage`.
- **scoring.ts** uses `qId` string field to lookup questions (not numeric parsing), normalizes per-party scores against question-level maxima, surfaces top 3 categories when `normalizedScore ≥ 0.15`, tags confidence (low/medium/high) based on score gaps. Returns `QuizResult` with primary/alternatives/allScores.

## Content & Party Updates

- **Adding questions**: Edit all 4 locale files (`src/data/translations/{en,af,xh,zu}.json`) with matching `qN` keys (e.g., `q34`), then add scoring rows (weight + 11 party scores) in appropriate topical JSON under `src/data/scoring/`. Each scoring question needs both `id` (numeric) and `qId` (string) fields. Store auto-discovers and sorts questions numerically—no manual ID array updates.
- **New parties**: Add to `parties.json` (id/name/short/descriptionKey/colour/logo), add `party.{id}.desc` translations, create per-question score columns in all 14 topical scoring files—`computeScores` silently ignores unrecognized ids.
- **Component contracts**: `QuizQuestion`/`QuizOption` render `quizStore.questions` output; `PartyCard` consumes `Party` objects from `parties.json`; keep shapes stable.

## Build, Test, Lint

- `npm run dev` – Rolldown-powered Vite with FontaineTransform + manual chunks (`vite.config.ts`); avoid plugins that conflict.
- `npm run build` – Runs `vue-tsc --build` before bundling; fix type errors first or build aborts.
- `npm run test` / `npm run test:ui` – Vitest in `happy-dom`; Pinia specs require `setActivePinia(createPinia())` (see `src/stores/*.test.ts` for pattern).
- `npm run lint` – Chains `oxlint` → ESLint (cached, autofix); `npm run format` applies Prettier with organize-imports + package.json sorting.

## Debugging Signals

- **Locale mismatches**: `Question qN not found` errors from `loadQuestionsFromI18n`; reproduce by toggling `uiStore.lang`. Ensure all 4 locale files have identical `questions.qN` keys.
- **All-zero scores**: Party id mismatch between scoring JSONs and `parties.json`, or question missing non-zero option scores.
- **Build warnings**: vue-i18n's `IMPORT_IS_UNDEFINED` auto-filtered in `vite.config.ts`; treat other Rollup warnings as regressions.
