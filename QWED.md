# Qwen Instructions for Elekti (AI Agents)

## What This App Is

- Vue 3 + TypeScript SPA with Pinia, vue-router, and vue-i18n.
- Data-driven quiz: 50 questions → 12 policy axes → party alignment.
- Deterministic, axis-based scoring; URL-shareable state; strict type checks.

## Architecture & Data Flow

- Views: `src/views/{Landing,Quiz,Results,About}.vue` via router.
- State: `src/stores/quizStore.ts` (answers, progress, URL encode/decode), `src/stores/uiStore.ts` (locale persistence).
- Data: `src/data/{questions.json,axes.json,parties.json,party_positions.json}` and translations in `src/data/translations/{en,af,zu}.json`.
- i18n: `src/i18n/i18n.ts` loads `en/af/zu`, fallback `en`; `availableLocales` currently exposes `en`/`af` in the selector (Zulu is present but hidden).
- Scoring: `src/utils/scoring.ts` reads JSON data and computes similarity per axis, normalised per party; constants in `src/utils/constants.ts`.
- Validation: Zod schemas in `src/schemas/*` with helpers in `src/validators/*` (questions, parties, axes, party positions, translations, answers).

## Scoring Model (essential rules)

- Answer values from `STANDARD_OPTIONS`: [-1, -0.5, 0, 0.5, 1].
- For questions with `direction: "negative"`, invert user value before comparing.
- Similarity per question: `1 - abs(userValue - partyPosition)`; aggregate with `weight`.
- Axis normalisation clamps to [0,1]; final party score is weighted average across axes.
- Confidence: high/medium/low based on top score and spread (see `computeScores`).

## Critical Workflows

- Install/run (Node >= 22.21.1):
  - `npm install`
  - `npm run dev` (Vite on http://localhost:5173)
- Build (fails on type errors):
  - `npm run build` (runs `vue-tsc --build` then bundles)
- Test (Vitest + happy-dom):
  - `npm run test` or `npm run test:ui`
- Lint/format:
  - `npm run lint` (oxlint → ESLint)
  - `npm run format` (Prettier + organize-imports + package.json sorting)

## Making Content Changes (do all of these)

- Add/modify question:
  - Translations: `src/data/translations/en.json` AND `af.json` (Zulu optional for now).
  - Metadata: append in `src/data/questions.json` with `id`, `textKey`, `axis`, `weight`, and optional `direction: "negative"`.
  - Party positions: ensure `src/data/party_positions.json` covers the axis for all parties where relevant.
  - Validate: run `npm run test` (see `src/validators/data.test.ts` and `answers.test.ts`).

## URL State & Sharing

- `quizStore.encodeAnswersToUrl()` base64-encodes a comma-delimited list of answer indices (empty for unanswered).
- `quizStore.loadAnswersFromUrl()` decodes + validates via Zod (`schemas/answers.ts`), allowing deep-linking of quiz state across locales.

## Conventions & Patterns

- Translations: all UI/question text lives in translations; questions reference text via `textKey` and are localised at runtime (`import.meta.glob` in `quizStore`).
- Axis directionality: define negative-direction questions with `direction: "negative"` to ensure inversion logic applies.
- Type safety: keep schemas in sync with data files; prefer Zod-validated loaders for new data.
- Style/testing: British English in text; unit tests exist for i18n, stores, router, validators, and scoring.

## Pointers to Key Files

- Scoring: `src/utils/scoring.ts` (algorithm), `src/utils/scoring.test.ts`.
- Stores: `src/stores/quizStore.ts`, `src/stores/uiStore.ts`.
- Schemas/validators: `src/schemas/*`, `src/validators/*` (+ `*.test.ts`).
- Data: `src/data/*.json`; translations under `src/data/translations/*`.
