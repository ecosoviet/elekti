# Copilot Instructions for Elekti

## Project Overview

- **Elekti** is a Vue 3 + Pinia SPA for matching South African voters to parties via a weighted, axis-based scoring system.
- All quiz content and UI text are strictly localized (English/Afrikaans) and managed via translation files.
- Scoring is deterministic, axis-based, and normalized per party; results are shareable via URL encoding.

## Architecture & Key Files

- **Views**: Route-level components in `src/views/` (Landing, Quiz, Results, About).
- **State Management**: Pinia stores in `src/stores/` (`quizStore`, `uiStore`).
- **Data**:
  - `src/data/questions.json`: Question metadata (id, axis, weight, textKey).
  - `src/data/axes.json`: 14 axes definitions.
  - `src/data/parties.json`: Party metadata.
  - `src/data/party_positions.json`: Party stances per axis.
  - `src/data/translations/{en,af}.json`: Localized UI and question text.
- **Scoring**: `src/utils/scoring.ts` (core logic), tested in `scoring.test.ts`.
- **Components**: Quiz UI in `src/components/` (QuizQuestion, PartyCard, etc.).

## Developer Workflows

- **Install & Run**:
  - `npm install`
  - `npm run dev` (local server at http://localhost:5173)
- **Build**: `npm run build` (type errors fail build)
- **Test**: `npm run test` (Vitest, happy-dom)
- **Lint/Format**: `npm run lint` (oxlint + ESLint), `npm run format` (Prettier)
- **Preview**: `npm run preview` (production build)

## Content & Localization

- **Add Question**:
  1. Add to both `en.json` and `af.json` under `questions`.
  2. Add metadata to `questions.json` (id, textKey, axis, weight, options).
  3. Update `party_positions.json` for all parties on the axis.
  4. Run tests to verify.
- **Remove/Modify Question**: Update translation files and `questions.json`; keep question `id` stable.
- **Localization**: All UI and quiz text must exist in both translation files. Locale switching uses `uiStore.setLang()` and persists to localStorage.

## Patterns & Conventions

- **TypeScript strictness**: All code must pass type checks; build fails otherwise.
- **Pinia**: Centralised state, hydrated in `main.ts`.
- **vue-i18n**: Fallback locale is `en`; all keys must be present in new locales.
- **Scoring**: Axis-based, not direct text matching. See `scoring.ts` for algorithm.
- **Tests**: Stores and scoring logic are unit tested; use fixtures/mocks for i18n and data.
- **Comments**: Do not add comments to code unless specifically requested.
- **Language**: Use British English spelling and grammar throughout code and documentation.

## CI/CD

- **GitHub Actions**: See `.github/workflows/node.js.yml` for Node-based CI.
- **Contributing**: Keep lint, tests, and type checks passing before PRs.

## Examples

- Adding a question: update both translation files, `questions.json`, and `party_positions.json`.
- Scoring: `computeScores()` in `scoring.ts` aligns user answers to party positions via axes.

---

For unclear patterns or missing details, ask maintainers for clarification or review recent PRs/issues.
