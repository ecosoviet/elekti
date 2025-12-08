# Elekti AI Agent Instructions

## Project Overview

Elekti is a multilingual political alignment quiz for South African voters built with Vue 3 + Pinia + TypeScript. The app matches users to 11 political parties via weighted scoring, with all content localized in 4 languages (en, af, xh, zu). The architecture prioritizes deterministic scoring, locale-driven content discovery, and shareable results via URL encoding.

## Critical Architecture

### Data-Driven Question System

Questions are **auto-discovered** from translation files, not hardcoded:

- `src/stores/quizStore.ts` scans `i18n.global.messages.value[locale].questions` for keys matching `/^q\d+$/`
- Questions are sorted numerically (q1, q2, ..., q42)
- Throws if a question key exists in one locale but not another
- Locale changes trigger `loadQuestionsFromI18n()` via a watcher

**Implication**: Adding/removing questions requires updating ALL 4 translation files (`src/data/translations/*.json`) AND the corresponding scoring file in `src/data/scoring/*.json`.

### Scoring Architecture

1. **Scoring data** lives in category-specific JSON files (`src/data/scoring/*.json`)
2. **Index aggregation** at `src/data/scoring/index.ts` concatenates all scoring arrays
3. **Score computation** (`src/utils/scoring.ts`) performs:
   - Weighted raw score calculation per party
   - Normalization against theoretical max score (not fixed scale)
   - Category-level average scoring for "top policies"
   - Confidence classification (high/medium/low) based on score spread

Party IDs are hardcoded: `anc`, `da`, `eff`, `ifp`, `mk`, `pa`, `vfplus`, `actionsa`, `acdp`, `ufc`, `sacp`. All scoring questions MUST include scores for all 11 parties.

### State Management

- **quizStore**: Quiz state, answers (Record<string, number>), progress, URL encoding/decoding
- **uiStore**: Locale persistence to localStorage only
- Both use Pinia setup stores (composition API style)
- No shared state between stores—locale changes are observed via `i18n.global.locale.value` watchers

## Content & Localization Workflow

### Adding a Question

1. Add to ALL 4 translation files (`en.json`, `af.json`, `xh.json`, `zu.json`):

   ```json
   "q43": {
     "text": "Your question text",
     "category": "economy & fiscal"
   }
   ```

2. Add to the appropriate category file in `src/data/scoring/`:

   ```json
   {
     "qId": "q43",
     "text": "Your question text",
     "category": "economy & fiscal",
     "weight": 1.5,
     "options": [
       { "option": "Strongly agree", "scores": { "anc": 0.5, "da": -0.3, ...(all 11 parties) } },
       { "option": "Agree", "scores": { ... } },
       { "option": "Neutral", "scores": { ... } },
       { "option": "Disagree", "scores": { ... } },
       { "option": "Strongly disagree", "scores": { ... } }
     ]
   }
   ```

3. No code changes needed—question auto-discovered by `quizStore`

### Removing a Question

Delete from all 4 translation files AND the scoring file. No other changes required.

## Build & Tooling

- **Vite with Rolldown**: Uses `vite: "npm:rolldown-vite@latest"` for fast builds
- **Lint workflow**: `npm run lint` runs oxlint (fast) then ESLint (with cache + autofix)
- **Format**: Prettier with organize-imports + package.json sorting
- **Test**: Vitest in happy-dom mode; stores and utils have full test coverage
- **Type-check**: `vue-tsc --build` must pass before build succeeds

### Manual Chunk Configuration

`vite.config.ts` splits vendor libs (vue, vue-router, pinia, vue-i18n) into separate chunks to optimize caching. Touch this if adding heavy dependencies.

## Testing Patterns

- Use `vi.mock("../i18n")` to mock the i18n instance with test questions
- Pinia stores require `setActivePinia(createPinia())` in `beforeEach`
- Test files colocated with implementation: `*.test.ts` alongside `*.ts`
- See `src/stores/quizStore.test.ts` for comprehensive store testing examples

## Key Conventions

- **Option indices**: Always 0-4 for [Strongly Agree, Agree, Neutral, Disagree, Strongly Disagree]
- **Party IDs**: Must match keys in `src/data/parties.json` exactly
- **Translation keys**: Follow `q<number>` pattern strictly
- **Scoring weights**: Default to 1.0; increase for "flagship" policy questions
- **Category names**: Must match exactly between translations and scoring data
- **Comments**: Never add code comments unless explicitly requested—code should be self-documenting

## Common Pitfalls

- Forgetting to update all 4 locale files when adding/modifying questions
- Missing a party in scoring data (will cause undefined scores)
- Changing question IDs breaks URL-encoded answer sharing
- ESLint ignores JSON files—manually validate scoring data structure
