# Elekti

> A multilingual political alignment quiz that matches South African voters to parties via weighted scoring.

Elekti is a Vue 3 + Pinia single-page application that walks users through 50 policy questions, normalises their answers against curated party data, and surfaces tailored recommendations. The project emphasises strict localization, reproducible scoring, and a lean state-management layer so new questions or parties can be introduced without rewiring the UI.

## Highlights

- 🎯 **Policy matching** – 50 policy questions mapped to 12 political axes; each question has weighted impact on party alignment scores.
- 🌍 **Fully localized content** – All questions live in `src/data/translations/{en,af}.json`; metadata references translations via `textKey`.
- 🧠 **Deterministic scoring** – `src/utils/scoring.ts` uses axis-based alignment with similarity scoring, normalized per-party, and tracks top 3 policy axes.
- 🧭 **URL-shareable results** – Answers encode into a comma-delimited string, enabling sharable quiz states across locales.
- ⚙️ **Vite + Vue 3** – Fast local dev with TypeScript, Pinia state management, and vue-i18n multilingual support.

## Architecture Overview

- **Views** – Landing, Quiz, Results, and About routes under `src/views/*` managed by `vue-router`.
- **State** – `quizStore` loads questions from i18n and `questions.json` metadata, manages answers and quiz progress; `uiStore` handles locale persistence.
- **Data** – `parties.json` defines 16 parties. `questions.json` contains 50 questions with metadata (axis, weight, textKey). Translation files `translations/{en,af}.json` hold all UI text and question content.
- **Scoring flow** – `computeScores()` calculates axis-based similarity between user answers and party positions, returns ranked parties with top policy axes and confidence level.

```
src/
├── components/          # QuizQuestion, PartyCard, ResultBreakdown, etc.
├── data/
│   ├── axes.json        # 12 political axis definitions
│   ├── parties.json     # 16 party metadata (names, colors, descriptions)
│   ├── party_positions.json  # Party positions on each axis (16 parties × 12 axes)
│   ├── questions.json   # 50 questions with textKey refs, axis, weight
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

1. **Determine axis and directionality**
   - Choose one of the 12 axes from `src/data/axes.json`
   - Decide if the question is phrased positively (aligns with +1 direction) or negatively (aligns with -1 direction)
   - If negatively phrased, you'll need `"direction": "negative"`

2. **Add to both translation files** – Edit `src/data/translations/en.json` and `src/data/translations/af.json` under the `questions` object:

   ```json
   "q51": {
     "text": "Your question text here (positively or negatively framed)",
     "axis": "economic_left_right"
   }
   ```

   **Add the same key with localized text to both en.json and af.json.**

3. **Add question metadata** – Append to `src/data/questions.json`:

   ```json
   {
     "id": "q51",
     "textKey": "questions.q51.text",
     "axis": "economic_left_right",
     "weight": 1.5
   }
   ```

   Key fields:
   - `id`: Unique question identifier
   - `textKey`: Reference to translation file key (format: `questions.q[N].text`)
   - `axis`: Must match one of the 12 axes in `axes.json`
   - `weight`: Importance (typically 1.0–2.0)
   - `direction`: Optional. Use `"negative"` if phrased toward the -1 direction; omit or use `"positive"` otherwise

   **When should you use `direction: "negative"`?**
   - If the question is phrased from a right-wing perspective on an economic/market axis → `"negative"`
   - If the question asks about protectionism on the global_vs_local axis → `"negative"`
   - If the question asks about law & order on the law_order_vs_liberty axis → `"negative"`
   - If the question asks about incremental reform on the transformation_vs_continuity axis → `"negative"`
   - Otherwise → omit the field

4. **Add party positions** – Update `src/data/party_positions.json` to include position scores for all 12 parties on the relevant axis(es):

   ```json
   "parties": {
     "anc": { "economic_left_right": 0.3, ... },
     "da": { "economic_left_right": -0.65, ... },
     ...
   }
   ```

   Use values in range [-1, 1] representing party stance on the axis.

5. **Verify** – Run `npm run test` to ensure no type errors; the quiz store auto-loads from translations.

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
- **Questions** – 50 questions, each mapped to one axis with a weight (1.0–2.0)
- **Answer values** – User responses map to numeric values via `STANDARD_OPTIONS` (Strongly Agree = +1, Agree = +0.5, Neutral = 0, Disagree = -0.5, Strongly Disagree = -1)
- **Party positions** – Each party's stance on all axes (range: -1 to +1)
- **Scoring**: Axis-based, not direct text matching. See `scoring.ts` for algorithm
- **Question Direction**: Questions measure toward either the positive or negative direction of an axis. Use `"direction": "negative"` in `questions.json` when phrased from the opposing viewpoint. Omit or use `"direction": "positive"` for standard phrasing.
- **Similarity scoring** – For each question: calculate `1 - abs(userAnswer - partyPosition)`, multiply by question weight. This yields values from 0 (opposite positions) to 1 (identical positions)
- **Normalization** – For each axis, divide total weighted score by total question weight on that axis. Then aggregate normalised axis scores into a final alignment score per party
- **Top axes** – Results display the 3 axes with the highest weighted contribution to the final match
- **Confidence** – `high` (top score ≥0.5 and gap to second place ≥0.1), `medium` (top score between 0.2–0.5 or gap <0.1), or `low` (top score <0.2)

### Understanding Question Direction

Each axis has a defined direction:

| Axis                           | Positive (+1)          | Negative (-1)             |
| ------------------------------ | ---------------------- | ------------------------- |
| `economic_left_right`          | Left (redistribution)  | Right (low tax)           |
| `state_vs_market`              | State control          | Market/privatisation      |
| `labour_rights`                | Strong unions          | Labour flexibility        |
| `law_order_vs_liberty`         | Civil liberties        | Law & order               |
| `global_vs_local`              | Globalist/free trade   | Protectionist/nationalist |
| `transformation_vs_continuity` | Radical transformation | Incremental reform        |

**Positive direction questions** (standard phrasing):

- Q1: "The government should raise taxes..." (left-wing framing) → agree = +1
- Q5: "Healthcare should be publicly funded..." (left-wing framing) → agree = +1

**Negative direction questions** (`direction: "negative"`):

- Q2: "Fiscal discipline and reducing public debt should be prioritised" (right-wing framing) → agree inverts to -1
- Q11: "Private companies should generate and sell electricity" (market framing) → agree inverts to -1
- Q19: "Labour market flexibility (easier hiring/firing) will increase investment" (anti-union framing) → agree inverts to -1
- Q21: "Police should be given stronger powers" (law & order framing) → agree inverts to -1
- Q24: "Disruptive protests should face stronger legal limits" (law & order framing) → agree inverts to -1
- Q43: "The apartheid-era legacy should be addressed through incremental reforms rather than sweeping systemic overhauls" (continuity framing) → agree inverts to -1

**When `direction: "negative"`, the algorithm inverts the user's answer:**

```typescript
if (question.direction === "negative") {
  userValue = -userValue;
}
```

This ensures a communist answering "Strongly disagree" to "Police should have stronger powers" correctly scores as +1 (pro-liberty, aligned with law_order_vs_liberty positive direction), not -1.

### Validating Party Positions

When reviewing party positions in `party_positions.json`, think about how typical supporters of that party would answer the questions on each axis. **Always account for reverse scoring** when axes contain reverse-scored questions.

**Example 1: Validating ANC on `democratic_institutions` (no reverse scoring)**

1. Find all questions on this axis (q25–30 in `questions.json`)
2. Consider how ANC supporters would likely answer:
   - q25: "Local government should be professionally staffed... even if this limits political appointments" → Likely **disagree** (supports cadre deployment)
   - q27: "Corruption prosecutions should be fast and aggressive" → Likely **disagree** or neutral (slow/selective approach)
   - q30: "Leaders who undermine judiciary should face consequences" → Likely **disagree** (tolerated under Zuma era)
3. Check `direction` for each question – these all omit it (positive direction), so disagreement = negative values on the axis
4. Conclusion: Party position should be **negative** (around -0.5), reflecting weak institutional support

**Example 2: Validating MK on `law_order_vs_liberty` (with negative direction questions)**

Questions: q21 (NEGATIVE), q22, q23, q24 (NEGATIVE)

Axis direction: Positive = civil liberties, Negative = law & order

How MK supporters would answer:

- q21 (police powers, NEGATIVE): **Agree** (+1) → Algorithm inverts to -1 → Results in -1 (pro-law-and-order)
- q22 (protest rights): **Disagree** (-0.5) → Not inverted → Results in -0.5 (anti-liberty)
- q23 (privacy laws): **Disagree** (-0.5) → Not inverted → Results in -0.5 (anti-liberty)
- q24 (limit protests, NEGATIVE): **Agree** (+1) → Algorithm inverts to -1 → Results in -1 (pro-law-and-order)

Average: (-1 + -0.5 + -0.5 + -1) / 4 = -0.75

Conclusion: Position should be around **-0.6** to reflect Zuma-era authoritarianism and pro-law-and-order stance.

This approach ensures party positions accurately reflect how their base would respond to the quiz, not just abstract policy statements. When in doubt, review official party manifestos and parliamentary voting records.

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
