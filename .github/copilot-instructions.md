# Copilot Instructions for Elekti

## Project Overview

- **Elekti** is a Vue 3 + Pinia SPA for matching South African voters to parties via a weighted, axis-based scoring system.
- All quiz content and UI text are strictly localized (English/Afrikaans) and managed via translation files.
- Scoring is deterministic, axis-based, and normalized per party; results are shareable via URL encoding.

## Architecture & Key Files

- Views: Route-level components in `src/views/` (Landing, Quiz, Results, About)
- State Management: Pinia stores in `src/stores/` (`quizStore`, `uiStore`)
- Data:
  - `src/data/questions.json`: Question metadata (id, axis, weight, textKey) for 50 questions
  - `src/data/axes.json`: 12 axes definitions
  - `src/data/parties.json`: Party metadata
  - `src/data/party_positions.json`: Party stances per axis (16 parties × 12 axes)
  - `src/data/translations/{en,af}.json`: Localized UI and question text
- Scoring: `src/utils/scoring.ts` (core logic), tested in `scoring.test.ts`
- Constants: `src/utils/constants.ts` defines `STANDARD_OPTIONS` (answer values -1 to +1)
- Components: Quiz UI in `src/components/` (QuizQuestion, PartyCard, etc.)

## Developer Workflows

- Install & Run:
  - `npm install`
  - `npm run dev` (local server at http://localhost:5173)
- Build: `npm run build` (type errors fail build)
- Test: `npm run test` (Vitest, happy-dom)
- Lint/Format: `npm run lint` (oxlint + ESLint), `npm run format` (Prettier)
- Preview: `npm run preview` (production build)

## Content & Localization

- Add Question:
  1. Add to both `en.json` and `af.json` under `questions`
  2. Add metadata to `questions.json` (id, textKey, axis, weight)
  3. Update `party_positions.json` for all 16 parties on the axis
  4. Run tests to verify
- Remove/Modify Question: Update translation files and `questions.json`; keep question `id` stable
- Localization: All UI and quiz text must exist in both translation files. Locale switching uses `uiStore.setLang()` and persists to localStorage

## Patterns & Conventions

- TypeScript strictness: All code must pass type checks; build fails otherwise
- Pinia: Centralised state, hydrated in `main.ts`
- vue-i18n: Fallback locale is `en`; all keys must be present in new locales
- Scoring: Axis-based, not direct text matching. See `scoring.ts` for algorithm
- Question Direction: Questions measure toward either the positive or negative direction of an axis. Use `direction: "negative"` in `questions.json` when a question is phrased from the opposing viewpoint (e.g., right-wing framing on a left-wing axis). Omit or use `direction: "positive"` for standard phrasing.
- Axis Direction: Each axis has a defined positive (+1) and negative (-1) direction. The scoring algorithm inverts user answers to negative-direction questions so they're always compared to party positions on the same scale.
- Tests: Stores and scoring logic are unit tested; use fixtures/mocks for i18n and data
- Comments: Do not add comments to code unless specifically requested
- Language: Use British English spelling and grammar throughout code and documentation

## Answer Options & Numeric Values

User answers map to numeric values via `STANDARD_OPTIONS` in `src/utils/constants.ts`:

| Option            | Value |
| ----------------- | ----- |
| Strongly Agree    | +1.0  |
| Agree             | +0.5  |
| Neutral           | 0.0   |
| Disagree          | -0.5  |
| Strongly Disagree | -1.0  |

These values are compared against party positions (also in the -1 to +1 range) after reverse scoring is applied. The scoring algorithm calculates similarity as `1 - abs(userValue - partyPosition)`, so identical positions yield 1.0 (perfect match) and maximally opposite positions yield 0.0 (no match).

## Parties Included

The quiz includes 16 South African political parties:

1. ANC - African National Congress (centre-left, governing party)
2. DA - Democratic Alliance (centre-right, liberal)
3. EFF - Economic Freedom Fighters (far-left, radical)
4. IFP - Inkatha Freedom Party (centre, Zulu-focused, conservative)
5. MK - uMkhonto we Sizwe Party (left, Zuma-led)
6. PA - Patriotic Alliance (right, nationalist)
7. VF+ - Freedom Front Plus (right, Afrikaner-focused, conservative)
8. ActionSA - ActionSA (centre-right, anti-corruption)
9. ACDP - African Christian Democratic Party (centre-right, Christian conservative)
10. UFC - Unite for Change (centrist)
11. UDM - United Democratic Movement (centre-left, pro-institution)
12. SACP - South African Communist Party (far-left, socialist)
13. ATM - African Transformation Movement (centre-right, Christian democratic)
14. Al Jama-ah - Al Jama-ah (Islamic democratic, socially conservative)
15. NCC - National Coloured Congress (centrist, Coloured community representation)
16. PAC - Pan Africanist Congress of Azania (left-wing, Black nationalist, African socialist)

All party metadata (names, descriptions, colours) are in `src/data/parties.json`. Party positions on all 12 axes are in `src/data/party_positions.json`.

## Scoring & Question Directionality

### Axis Directions

Each axis has a defined positive and negative direction:

| Axis ID                        | Positive (+1)                     | Negative (-1)                   |
| ------------------------------ | --------------------------------- | ------------------------------- |
| `economic_left_right`          | Left (redistribution, high tax)   | Right (low tax, market-led)     |
| `state_vs_market`              | State control, public ownership   | Market/privatisation            |
| `land_and_ownership`           | Expropriation, communal rights    | Private property rights         |
| `labour_rights`                | Strong unions, worker protection  | Labour flexibility              |
| `law_order_vs_liberty`         | Civil liberties, protest rights   | Law & order, policing           |
| `democratic_institutions`      | Strong oversight, anti-corruption | Executive flexibility           |
| `environment_energy`           | Climate action, green transition  | Pragmatic energy mix            |
| `social_progressivism`         | LGBTQ+ rights, gender equality    | Traditional/conservative values |
| `global_vs_local`              | Free trade, open borders          | Protectionist, nationalist      |
| `transformation_vs_continuity` | Radical transformation            | Incremental reform              |
| `urban_development`            | Public transit, dense walkability | Car-friendly, sprawl            |
| `equity_and_inclusion`         | Strong BEE/affirmative action     | Meritocratic/colour-blind       |

### Question Direction & Axis Alignment

Questions can be phrased from two perspectives:

1. **Positive direction** (`direction: "positive"` or omitted)
   - Question statement aligns with the positive axis direction
   - "Strongly agree" (user value +1) maps to +1 on the axis
   - Example: Q1 "The government should raise taxes..." (left-wing framing on economic_left_right)
   - User: Strongly agree (+1) → Directly aligns with economic_left_right positive direction

2. **Negative direction** (`direction: "negative"`)
   - Question statement aligns with the negative axis direction
   - User's answer is inverted before scoring
   - Example: Q2 "Fiscal discipline and reducing public debt should be prioritised" (right-wing framing on economic_left_right)
   - User: Strongly agree (value +1) → Inverted to -1 → Aligns with economic_left_right negative direction

### Questions Measuring Negative Axis Direction

The following 10 questions are phrased from the negative direction of their axis:

- **q2**: "Fiscal discipline and reducing public debt should be prioritised" (right-wing framing on economic_left_right)
- **q9**: "Government should support SMEs with tax breaks and deregulation" (market framing on state_vs_market)
- **q11**: "Private companies should generate and sell electricity" (market framing on state_vs_market)
- **q19**: "Labour market flexibility (easier hiring/firing) will increase investment" (anti-union framing on labour_rights)
- **q21**: "Police should be given stronger powers" (law & order framing on law_order_vs_liberty)
- **q24**: "Disruptive protests should face stronger legal limits" (law & order framing on law_order_vs_liberty)
- **q38**: "Trade policy should protect local industries through tariffs" (protectionist framing on global_vs_local)
- **q39**: "South Africa should adopt stricter immigration policies" (protectionist framing on global_vs_local)
- **q40**: "Regulate employment of undocumented foreign nationals" (protectionist framing on global_vs_local)
- **q43**: "Apartheid legacy addressed through incremental reforms rather than systemic overhauls" (continuity framing on transformation_vs_continuity)

These questions have `"direction": "negative"` in `questions.json`.

### Validating Party Positions

When reviewing or adjusting party positions in `party_positions.json`, think about **how someone aligned with that party would answer the questions on each axis**:

1. Read all questions for a given axis (check `questions.json` to find which questions map to which axis)
2. For each question, consider: Would a typical supporter of this party agree or disagree?
3. **Factor in question direction** – if `direction: "negative"`, the algorithm inverts the user's answer before comparison:
   - User "Strongly agrees" (+1) to a negative-direction question → becomes -1 for axis comparison
   - User "Strongly disagrees" (-1) to a negative-direction question → becomes +1 for axis comparison
4. Calculate the average stance across all questions on that axis
5. The party's position should reflect this average

#### Example 1: ANC on `democratic_institutions` (no negative direction questions)

Questions: q25, q26, q27, q28, q29, q30 (all direction: positive or omitted)

- q25: "Local government should be professionally staffed... even if this limits political appointments" → ANC supporters likely **disagree** (prefer cadre deployment)
- q27: "Corruption prosecutions should be fast and aggressive" → ANC supporters likely **disagree** (slow/selective approach)
- q30: "Leaders who undermine judiciary should face consequences" → ANC supporters likely **disagree** (Zuma era tolerated this)

Since all questions use positive direction (or omitted), disagreement = negative values on the axis.

**Conclusion:** Position should be **negative (-0.5)**, reflecting weak institutional support.

#### Example 2: MK on `law_order_vs_liberty` (with negative direction questions)

Questions: q21 (NEGATIVE), q22, q23, q24 (NEGATIVE)

Axis: Positive (+1) = civil liberties; Negative (-1) = law & order

How MK supporters would answer:

- **q21 (police powers, NEGATIVE)**: Would **agree** with stronger police powers
  - User answer: +1 → Algorithm inverts to -1 → Party scores -1 (pro-law-and-order)
- **q22 (protest rights)**: Would **disagree** (Zuma suppressed dissent)
  - User answer: -0.5 → Not inverted → Party scores -0.5 (anti-liberty)
- **q23 (privacy laws)**: Would **disagree** (Zuma expanded surveillance)
  - User answer: -0.5 → Not inverted → Party scores -0.5 (anti-liberty)
- **q24 (limit protests, NEGATIVE)**: Would **agree** (restrict disruption)
  - User answer: +1 → Algorithm inverts to -1 → Party scores -1 (pro-law-and-order)

**Average:** (-1 + -0.5 + -0.5 + -1) / 4 = **-0.75**

**Conclusion:** Position should be around **-0.6**, reflecting authoritarianism and pro-law-and-order stance.

#### Example 3: PAC on `law_order_vs_liberty` (with negative direction questions)

Questions: q21 (NEGATIVE), q22, q23, q24 (NEGATIVE)

How PAC supporters would answer:

- **q21 (police powers, NEGATIVE)**: Would **disagree** (anti-police brutality)
  - User answer: -0.5 → Algorithm inverts to +0.5 → Party scores +0.5 (pro-liberty)
- **q22 (protest rights)**: Would **strongly agree** (revolutionary, pro-activism)
  - User answer: +1 → Not inverted → Party scores +1 (pro-liberty)
- **q23 (privacy laws)**: Would **agree** (against surveillance)
  - User answer: +0.5 → Not inverted → Party scores +0.5 (pro-liberty)
- **q24 (limit protests, NEGATIVE)**: Would **strongly disagree** (pro-protest)
  - User answer: -1 → Algorithm inverts to +1 → Party scores +1 (pro-liberty)

**Average:** (+0.5 + 1 + 0.5 + 1) / 4 = **+0.75**

**Conclusion:** Position should be around **+0.4**, reflecting civil liberties and pro-protest stance.

### Adding New Questions

When adding a question, determine its axis and direction:

1. **Decide the axis** – Choose from the 12 defined axes above
2. **Decide the direction** – Will "Strongly agree" align with the positive (+1) or negative (-1) direction of the axis?
3. **Set direction accordingly** in `questions.json`:
   - Positive direction framing → omit `direction` field or set `"direction": "positive"`
   - Negative direction framing → set `"direction": "negative"`

Example: Adding a question about renewable energy transition

- Axis: `environment_energy` (positive = climate action, negative = pragmatic energy)
- Question: "South Africa should rapidly transition to 100% renewable energy" (climate action framing)
- Answer: Agreeing = +1 direction → omit `direction` field

Example: Adding a question about business deregulation

- Axis: `state_vs_market` (positive = state control, negative = market/private)
- Question: "Businesses should face lighter regulatory burdens to boost competitiveness" (market framing)
- Answer: Agreeing = -1 direction → set `"direction": "negative"`
