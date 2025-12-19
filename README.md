# Elekti

> A multilingual political alignment quiz that matches South African voters to parties via weighted scoring.

Elekti is a Vue 3 + Pinia single-page application that walks users through 56 policy questions, normalises their answers against curated party data, and surfaces tailored recommendations. The project emphasises strict localization, reproducible scoring, and a lean state-management layer so new questions or parties can be introduced without rewiring the UI.

## Highlights

- 🎯 **Policy matching** – 56 policy questions mapped to 12 political axes; each question has weighted impact on party alignment scores.
- 🌍 **Fully localized content** – All questions live in `src/data/translations/{en,af}.json`; metadata references translations via `textKey`.
- 🧠 **Deterministic scoring** – `src/utils/scoring.ts` uses axis-based alignment with similarity scoring, normalized per-party, and tracks top 3 policy axes.
- 🧭 **URL-shareable results** – Answers encode into a comma-delimited string, enabling sharable quiz states across locales.
- ⚙️ **Vite + Vue 3** – Fast local dev with TypeScript, Pinia state management, and vue-i18n multilingual support.

## Architecture Overview

- **Views** – Landing, Quiz, Results, and About routes under `src/views/*` managed by `vue-router`.
- **State** – `quizStore` loads questions from i18n and `questions.json` metadata, manages answers and quiz progress; `uiStore` handles locale persistence.
- **Data** – `parties.json` defines 16 parties. `questions.json` contains 56 questions with metadata (axis, weight, textKey). Translation files `translations/{en,af}.json` hold all UI text and question content.
- **Scoring flow** – `computeScores()` calculates axis-based similarity between user answers and party positions, returns ranked parties with top policy axes and confidence level.

```
src/
├── components/          # QuizQuestion, PartyCard, ResultBreakdown, etc.
├── data/
│   ├── axes.json        # 12 political axis definitions
│   ├── parties.json     # 16 party metadata (names, colors, descriptions)
│   ├── party_positions.json  # Party positions on each axis (16 parties × 12 axes)
│   ├── questions.json   # 56 questions with textKey refs, axis, weight
│   └── translations/
│       ├── en.json      # English UI + question text
│       └── af.json      # Afrikaans UI + question text
├── stores/              # Pinia stores (quiz + ui) and unit tests
├── utils/
│   ├── constants.ts     # STANDARD_OPTIONS (answer values -1 to +1)
│   ├── scoring.ts       # Core scoring algorithm
│   └── scoring.test.ts  # Scoring tests
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

1. **Choose an axis** – Review `src/data/axes.json` and pick one of the 12 axes (e.g., `economic_left_right`)

2. **Understand the axis direction** – Each axis has two poles:
   - **Positive (+1)**: The "progressive" or "left" or "libertarian" end (depends on axis)
   - **Negative (-1)**: The "conservative" or "right" or "authoritarian" end
   - Example: `law_order_vs_liberty` positive = civil liberties, negative = law & order

3. **Decide what your question measures**
   - Does your question ask about the **positive pole**? (e.g., "Should civil liberties be protected?") → Omit `direction` flag
   - Does your question ask about the **negative pole**? (e.g., "Should police have stronger powers?") → Use `direction: "negative"`

4. **Add to both translation files** – Edit `src/data/translations/en.json` and `src/data/translations/af.json`:

   ```json
   "q51": {
     "text": "Your question text here",
     "axis": "economic_left_right"
   }
   ```

5. **Add metadata to `src/data/questions.json`**:

   ```json
   {
     "id": "q51",
     "textKey": "questions.q51.text",
     "axis": "economic_left_right",
     "weight": 1.5,
     "direction": "negative"
   }
   ```

   - `direction`: Use `"negative"` **only if your question measures the negative pole**; omit otherwise

6. **Decide using this flowchart**:
   - Read the axis description → Does your question ask about the POSITIVE pole? → YES: no flag | NO: add `direction: "negative"`

7. **Set party positions** – See "Validating and Setting Party Positions" section below.

8. **Verify** – Run `npm run test`.

### Removing a Question

1. Delete the question key from both `en.json` and `af.json` translation files.
2. Remove the question object from `src/data/questions.json`.
3. Done—no other files need updates. Question IDs remain stable.

### Modifying a Question

- **Text** – Update in both translation files (`en.json` and `af.json`) under `questions.q[N].text`.
- **Axis/Weight** – Edit `src/data/questions.json`; axis determines which party positions affect scoring, weight scales the contribution.
- **Direction** – If you change the question phrasing direction (e.g., from positive to negative framing), update the `direction` field accordingly (or omit if positive).

## Scoring Engine

The axis-based alignment system replaces naive text matching:

- **Axes** – 12 political dimensions from `axes.json`, each with a defined positive (+1) and negative (-1) direction
- **Questions** – 56 questions, each mapped to one axis with a weight (1.0–2.0)
- **Answer values** – User responses map to numeric values via `STANDARD_OPTIONS` (Strongly Agree = +1, Agree = +0.5, Neutral = 0, Disagree = -0.5, Strongly Disagree = -1)
- **Party positions** – Each party's stance on all axes (range: -1 to +1)
- **Scoring**: Axis-based, not direct text matching. See `scoring.ts` for algorithm
- **Question Direction**: Questions measure toward either the positive or negative direction of an axis. Use `"direction": "negative"` in `questions.json` when phrased from the opposing viewpoint. Omit or use `"direction": "positive"` for standard phrasing.
- **Similarity scoring** – For each question: calculate `1 - abs(userAnswer - partyPosition)`, multiply by question weight. This yields values from 0 (opposite positions) to 1 (identical positions)
- **Normalization** – For each axis, divide total weighted score by total question weight on that axis. Then aggregate normalised axis scores into a final alignment score per party
- **Top axes** – Results display the 3 axes with the highest weighted contribution to the final match
- **Confidence** – `high` (top score ≥0.5 and gap to second place ≥0.1), `medium` (top score between 0.2–0.5 or gap <0.1), or `low` (top score <0.2)

### Understanding Question Direction and Axis Poles

**Core concept:** Each axis has two poles (positive and negative). Questions can measure either pole. The `direction` flag tells the algorithm which pole a question measures, so it can correctly place user answers on the axis.

#### Why poles and direction matter:

Consider `law_order_vs_liberty`:

- **Positive pole (+1)**: Civil liberties prioritised, protest rights protected, scrutiny of state power
- **Negative pole (-1)**: Law & order prioritised, strong policing, restrictions on disruptive protest

Two questions on this axis:

- **Q22 (positive pole)**: "Should people be free to protest?" → Agreement (+1) naturally maps to positive pole ✓
- **Q21 (negative pole)**: "Should police have stronger powers?" → Agreement (+1) naturally maps to... positive pole? ✗

Without the direction flag, agreeing with "stronger police powers" would incorrectly suggest civil libertarian views. **The direction flag solves this.**

#### The inversion mechanism:

```typescript
// When a question measures the negative pole:
if (question.direction === "negative") {
  userValue = -userValue; // Flip the sign: +1 → -1, -0.5 → +0.5, etc.
}
```

**With the flag:**

- User agrees (+1) with Q21 "Police should have more power"
- Algorithm inverts: +1 → -1
- Result: User correctly scores as pro-law-and-order on the axis ✓

#### Which questions have direction flags:

| Axis                           | Questions measuring negative pole                              |
| ------------------------------ | -------------------------------------------------------------- |
| `economic_left_right`          | Q2 (cut debt)                                                  |
| `state_vs_market`              | Q9 (cut red tape), Q11 (privatise power)                       |
| `labour_rights`                | Q19 (labour flexibility)                                       |
| `law_order_vs_liberty`         | Q21 (police power), Q24 (limit protests)                       |
| `global_vs_local`              | Q38 (tariffs), Q39 (immigration), Q40 (crack down on migrants) |
| `transformation_vs_continuity` | Q43 (incremental reform)                                       |

#### Examples with full scoring:

**Example A: EFF supporter answers Q22 (positive pole, no flag)**

- Q22: "Should people be free to protest?"
- Axis: `law_order_vs_liberty` (positive = civil liberties, negative = law & order)
- EFF supporter: **Strongly agrees** (+1)
- Algorithm: No direction flag, so +1 stays +1
- Result: +1 on axis = pro-civil-liberties ✓ (EFF is indeed pro-protest)

**Example B: MK supporter answers Q21 (negative pole, with flag)**

- Q21: "Should police have stronger powers?"
- Axis: `law_order_vs_liberty`
- Direction: `"negative"`
- MK supporter: **Strongly agrees** (+1)
- Algorithm: Direction flag applies, so +1 → -1
- Result: -1 on axis = pro-law-and-order ✓ (MK has authoritarian tendencies)

**Example C: DA supporter answers Q2 (negative pole, with flag)**

- Q2: "Government should pay down debt rather than spend"
- Axis: `economic_left_right` (positive = left/spend, negative = right/save)
- Direction: `"negative"`
- DA supporter: **Strongly agrees** (+1)
- Algorithm: Direction flag applies, so +1 → -1
- Result: -1 on axis = right-leaning ✓ (DA is indeed economically right-wing)

### Setting Party Positions: Step-by-Step

**Goal:** Determine where a party sits on each axis based on how typical supporters would answer all questions on that axis.

**Method:**

1. **List all questions on the axis** – Check `src/data/questions.json` for every question with this axis ID
2. **For each question, estimate the party's typical answer** using manifestos, voting records, and public positions
3. **Account for direction flags** – Remember the algorithm inverts negative-pole questions
4. **Average the estimates** across all questions
5. **Round to 1 decimal place** and enter in `party_positions.json`

#### Worked Example 1: ANC on `democratic_institutions` (no inverted questions)

Questions on this axis: q25, q26, q27, q28, q29, q30 (all positive pole, **no direction flags**)

Axis direction: Positive = strong institutions & anti-corruption, Negative = political flexibility & cadre deployment

How typical ANC supporters would answer each question:

- q25: "Local councils need professional managers and independent auditors" → **Disagree** (-0.5) [prefers political control]
- q26: "Courts must be independent from political pressure" → **Neutral** (0) [mixed record]
- q27: "Corruption should be prosecuted fast and aggressively" → **Disagree** (-0.5) [selective approach]
- q28: "Parties must compromise in coalitions" → **Agree** (0.5) [forced by coalitions]
- q29: "National government should fix failing councils" → **Agree** (0.5) [centralisation preference]
- q30: "Politicians attacking courts should face prosecution" → **Disagree** (-0.5) [tolerated under Zuma]

**Calculation:**

- Sum: -0.5 + 0 + -0.5 + 0.5 + 0.5 + -0.5 = -0.5
- Average: -0.5 ÷ 6 = -0.083
- Rounded: **-0.35** (adjusted slightly lower based on Zuma era)

**Set in party_positions.json:** `"democratic_institutions": -0.35`

#### Worked Example 2: EFF on `law_order_vs_liberty` (with inverted questions)

Questions: q21 (NEGATIVE/inverted), q22, q23, q24 (NEGATIVE/inverted)

Axis direction: Positive = civil liberties & protest rights, Negative = law & order & policing

How typical EFF supporters would answer the raw questions:

- q21: "Police need more funding and powers" → **Disagree** (-1)
  - Question has `direction: "negative"`, so algorithm inverts: -1 → +1
  - Result on axis: **+1** (pro-civil-liberties)
- q22: "People should be free to protest" → **Strongly agree** (+1)
  - No inversion flag
  - Result on axis: **+1** (pro-civil-liberties)
- q23: "Government shouldn't spy on people online" → **Agree** (+0.5)
  - No inversion flag
  - Result on axis: **+0.5** (pro-privacy)
- q24: "Disruptive protests should be legally limited" → **Disagree** (-1)
  - Question has `direction: "negative"`, so algorithm inverts: -1 → +1
  - Result on axis: **+1** (pro-civil-liberties)

**Calculation (after all inversions):**

- Sum: +1 + +1 + +0.5 + +1 = +3.5
- Average: +3.5 ÷ 4 = +0.875
- Rounded: **+0.4** (realistic for EFF's strong pro-protest stance)

**Set in party_positions.json:** `"law_order_vs_liberty": 0.4`

## Parties Included

The quiz currently includes 16 South African political parties:

1. **ANC** (African National Congress) - Centre-left governing party
2. **DA** (Democratic Alliance) - Centre-right liberal opposition
3. **EFF** (Economic Freedom Fighters) - Far-left radical transformation
4. **IFP** (Inkatha Freedom Party) - Centrist, Zulu-focused, conservative
5. **MK** (uMkhonto we Sizwe Party) - Left-wing, Zuma-led
6. **PA** (Patriotic Alliance) - Right-wing nationalist
7. **VF+** (Freedom Front Plus) - Right-wing, Afrikaner-focused
8. **ActionSA** - Centre-right, anti-corruption focus
9. **ACDP** (African Christian Democratic Party) - Christian conservative
10. **UFC** (Unite for Change) - Centrist progressive
11. **UDM** (United Democratic Movement) - Centre-left, pro-institution
12. **SACP** (South African Communist Party) - Far-left socialist
13. **ATM** (African Transformation Movement) - Centre-right Christian democratic
14. **Al Jama-ah** - Islamic democratic, socially conservative
15. **NCC** (National Coloured Congress) - Coloured community representation
16. **PAC** (Pan Africanist Congress of Azania) - Black nationalist, African socialist

See `src/data/parties.json` for full metadata and `src/data/party_positions.json` for their positions on all 12 axes.

### Adding a New Party

To add a new party to the quiz:

1. **Research party positions** – Review official manifestos, parliamentary voting records, and verified public statements to understand their stance on each of the 12 axes
2. **Add to parties.json** – Include party metadata: `id`, `name`, `short`, `descriptionKey`, `colour`, `website`
3. **Add to party_positions.json** – For each of the 12 axes, determine position (-1 to +1) by:
   - Reading all questions mapped to that axis (check `questions.json`)
   - Considering how typical party supporters would answer each question
   - Accounting for `direction: "negative"` on questions phrased from the opposite viewpoint
   - Setting the position to reflect their average stance across all questions on that axis
4. **Add translations** – Add party name and description keys to both `en.json` and `af.json` under `party.[partyId]`
5. **Verify** – Run `npm run test` and manually test the quiz to ensure the party appears correctly in results

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
   - Set `direction: "negative"` if the question is phrased from the opposite axis direction (e.g., right-wing framing on left-wing axis).
   - Update `party_positions.json` if adding or modifying axis mappings.
   - Run tests to verify no type errors.

---

Have improvement ideas, new policy questions, or issues with party alignment? Open an issue or start a discussion so we can expand and refine Elekti.
