# Elekti

> A multilingual political alignment quiz that matches South African voters to parties via weighted scoring.

Elekti is a Vue 3 + Pinia single-page application that walks users through 41 policy questions, normalizes their answers against curated party data, and surfaces tailored recommendations. The project emphasizes strict localization, reproducible scoring, and a lean state-management layer so new questions or parties can be introduced without rewiring the UI.

## Highlights

- 🎯 **Policy matching** – 41 policy questions mapped to 14 political axes; each question has weighted impact on party alignment scores.
- 🌍 **Fully localized content** – All questions live in `src/data/translations/{en,af}.json`; metadata references translations via `textKey`.
- 🧠 **Deterministic scoring** – `src/utils/scoring.ts` uses axis-based alignment with similarity scoring, normalized per-party, and tracks top 3 policy axes.
- 🧭 **URL-shareable results** – Answers encode into a comma-delimited string, enabling sharable quiz states across locales.
- ⚙️ **Vite + Vue 3** – Fast local dev with TypeScript, Pinia state management, and vue-i18n multilingual support.

## Architecture Overview

- **Views** – Landing, Quiz, Results, and About routes under `src/views/*` managed by `vue-router`.
- **State** – `quizStore` loads questions from i18n and `questions.json` metadata, manages answers and quiz progress; `uiStore` handles locale persistence.
- **Data** – `parties.json` defines 11 parties; `questions.json` contains 41 questions with metadata (axis, weight, textKey); `translations/{en,af}.json` hold all UI text and question content.
- **Scoring flow** – `computeScores()` calculates axis-based similarity between user answers and party positions, returns ranked parties with top policy axes and confidence level.

```
src/
├── components/          # QuizQuestion, PartyCard, ResultBreakdown, etc.
├── data/
│   ├── axes.json        # 14 political axis definitions
│   ├── parties.json     # 11 party metadata (names, colors, descriptions)
│   ├── party_positions.json  # Party positions on each axis
│   ├── questions.json   # 41 questions with textKey refs, axis, weight
│   └── translations/
│       ├── en.json      # English UI + question text
│       └── af.json      # Afrikaans UI + question text
├── stores/              # Pinia stores (quiz + ui) and unit tests
├── utils/               # scoring logic + tests
└── views/               # Route-level components
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

### Adding a New Question

1. **Add to both translation files** – Edit `src/data/translations/en.json` and `src/data/translations/af.json` under the `questions` object:

   ```json
   "q42": {
     "text": "Your question text here (in English or Afrikaans)",
     "axis": "economic_left_right"
   }
   ```

   **Add the same key with localized text to both en.json and af.json.**

2. **Add question metadata** – Append to `src/data/questions.json`:

   ```json
   {
     "id": "q42",
     "textKey": "questions.q42.text",
     "axis": "economic_left_right",
     "weight": 1.5,
     "options": [
       { "value": 1, "label": "Strongly agree" },
       { "value": 0.5, "label": "Agree" },
       { "value": 0, "label": "Neutral" },
       { "value": -0.5, "label": "Disagree" },
       { "value": -1, "label": "Strongly disagree" }
     ]
   }
   ```

   The `axis` must match one of the 14 defined axes in `src/data/axes.json`. Question IDs should be sequential (next available is q42).

3. **Add party positions** – Update `src/data/party_positions.json` to include position scores for all 11 parties on the relevant axis(es):

   ```json
   "parties": {
     "anc": { "economic_left_right": 0.3, ... },
     "da": { "economic_left_right": -0.65, ... },
     ...
   }
   ```

4. **Verify** – Run `npm run test` to ensure no type errors; the quiz store auto-loads from translations.

### Removing a Question

1. Delete the question key from both `en.json` and `af.json` translation files.
2. Remove the question object from `src/data/questions.json`.
3. Done—no other files need updates. Question IDs remain stable.

### Modifying a Question

- **Text** – Update in both translation files (`en.json` and `af.json`) under `questions.q[N].text`.
- **Axis/Weight** – Edit `src/data/questions.json`; axis determines which party positions affect scoring, weight scales the contribution.
- **Party positions** – Modify `src/data/party_positions.json` if stance should change.
- **Do not change** – The question `id` (e.g., `q42`); this is the stable identifier.

## Scoring Engine

The axis-based alignment system replaces naive text matching:

- **Axes** – 14 political dimensions from `axes.json`
- **Questions** – 41 questions, each mapped to one axis with a weight (1.0–2.0)
- **Party positions** – Each party's stance on all axes (range: -1 to +1)
- **Similarity scoring** – For each axis: `1 - abs(user_answer - party_position)` weighted by question weight
- **Top axes** – Show the 3 strongest alignment axes in results
- **Confidence** – `high` / `medium` / `low` based on score spread

Translation files contain all UI and question text. Locale switching persists to `localStorage` and resets the quiz.

## Testing

- Run tests with `npm run test` or `npm run test:ui`.
- Tests cover scoring logic, stores, router, i18n setup, and data validation.
- Vitest uses `happy-dom` environment.

## Tooling

- **TypeScript** – Full type coverage; build fails on type errors.
- **Linting** – `oxlint` + ESLint with autofix.
- **Bundler** – Rolldown-powered Vite for fast builds.
- **i18n** – Fallback locale is `en`; all locales must provide complete translations.

## Contributing

1. Fork + branch from `main`.
2. Keep lint, tests, and type checks green:
   ```sh
   npm run lint && npm run test && npm run build
   ```
3. When adding questions:
   - Add to **both** `en.json` and `af.json` translation files.
   - Add metadata to `questions.json` (with matching `id` and `textKey`).
   - Update `party_positions.json` if adding or modifying axis mappings.
   - Run tests to verify no type errors.

---

Have improvement ideas, new policy questions, or issues with party alignment? Open an issue or start a discussion so we can expand and refine Elekti.
