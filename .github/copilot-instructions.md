# Elekti – AI Guide

## System Snapshot

- SPA: Landing → Quiz → Results (+ About) driven by Vue 3 + Pinia + vue-router (`src/views/*`).
- Questions live exclusively in i18n translations (`src/data/translations/*.json`); `quizStore` enumerates ids `q1…q40` and throws if a locale is missing a key.
- Answers are `Record<questionId, optionIndex>` with option indices 0-4 (Strongly Agree → Strongly Disagree); sharing uses comma-separated encoding (`encodeAnswersToUrl`).
- `computeScores` consumes answers, `src/data/scoring.json`, and party metadata (`src/data/parties.json`) to normalize scores and surface top policies.
- UI state (locale) sits in `uiStore`; changing languages reloads questions and persists the code to `localStorage`.
- Styling is bespoke CSS variables in `src/styles/theme.css`; no utility framework, so reuse spacing/colour tokens.

## Critical Files & Flows

- `src/stores/quizStore.ts`: orchestrates navigation, answer storage, locale watchers, and guards like `canProceed`.
- `src/utils/scoring.ts`: performs weighted scoring, max-score normalization, and confidence classification (gap to runner-up + min thresholds).
- `src/router/index.ts` + `src/views/*.vue`: define the Landing → Quiz → Results flow; Results expect a fully computed `QuizResult`.
- `src/components/*`: `QuizQuestion` and `QuizOption` expect `options` arrays in the store shape; `PartyCard` consumes `Party` objects directly from `parties.json`.
- `vite.config.ts`: Rolldown-powered Vite build with manual chunks and Fontaine font metrics; respect the existing `@` alias when importing.

## Workflows

- `npm run dev` for local work; matches Rolldown setup, so avoid mixing with vanilla Vite plugins.
- `npm run build` runs `vue-tsc --build` before bundling—fix type errors before expecting artifacts.
- `npm run lint` executes `oxlint` (correctness, autofix) then ESLint with cache; keep both clean before PRs.
- `npm run test` / `npm run test:ui` hit Vitest configured for `happy-dom` (`vitest.config.ts`); Pinia specs require `setActivePinia(createPinia())`.
- `npm run format` runs Prettier with organize-imports and package.json sorting; rely on it when touching JSON or import-heavy files.

## Patterns & Conventions

- All stateful logic lives in Pinia stores; components stay lean and call store actions/computed refs via `<script setup>`.
- When adding questions, update every locale translation, extend the `questionIds` array, and append scoring rows (weights + per-party scores) in lockstep.
- Party additions require `src/data/parties.json`, scoring entries for each question, and new translation strings (`party.{id}.desc`).
- Keep option ordering consistent—scoring assumes index 0 aligns with “Strongly Agree”. Mixing option orders per question will corrupt normalization.
- For locale persistence, always go through `uiStore.setLang`; setting `i18n.global.locale` directly will skip storage + watchers.
- Do not introduce new code comments unless a file already contains them and the change explicitly requires parity.

## Debugging Tips

- Issues with missing text usually mean the active locale lacks `questions.qN`—reproduce by switching `uiStore.lang` and watching the thrown error in `loadQuestionsFromI18n`.
- If scoring outputs zeros, confirm party ids in `scoring.json` exactly match those in `parties.json`; normalization silently skips unknown ids.
- Build-time warnings about `vue-i18n` imports are filtered in `vite.config.ts`; any other Rollup warnings should be treated as regressions.
