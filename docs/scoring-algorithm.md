# Scoring algorithm

This doc explains how quiz answers are turned into party alignment scores using the code in src/utils/scoring.ts and data from src/data/axes.json and src/data/party_positions.json.

## Inputs

- Axes: definitions and descriptions from src/data/axes.json.
- Party positions: per-axis positions in src/data/party_positions.json (range -1..1, but treated as similarity anchors; higher means closer to the positive pole described in axes).
- Questions: metadata (axis, weight, direction) from src/data/questions.json.
- Answers: user responses captured as indices into STANDARD_OPTIONS (values: -1, -0.5, 0, 0.5, 1).
- Parties: list of Party objects passed into computeScores.

## Axis poles and direction flags

- Each axis in src/data/axes.json defines its positive pole (+1) and negative pole (-1) in the description. Party position values point toward these poles: positive values lean to the positive pole; negative values lean to the negative pole; zero is neutral.
- Question direction controls how agreement maps to a pole:
  - direction omitted/"positive": agreement pushes toward the positive pole.
  - direction "negative": agreement pushes toward the negative pole, so user responses are inverted before comparison.
  - This keeps “agree” consistently meaning “toward the question’s intended pole,” not always toward +1.

## Per-question handling

1. Look up the question metadata by id.
2. Map the selected answer index to its numeric value.
3. Apply direction inversion: if question.direction === "negative", multiply the user value by -1 so agreement maps to the negative pole.
4. For the question’s axis and weight, compare the user value with each party’s axis position:
   - similarity = 1 - abs(userValue - partyPosition)
   - weightedSimilarity = similarity \* weight
5. Accumulate weightedSimilarity per party per axis, and also accumulate weight per party per axis.

## Axis aggregation

For each party and axis:

- If total weight on that axis > 0:
  - normalizedAxisScore = clamp((weightedSum / totalWeight), 0, 1)
- Keep per-axis scores for later display (axisScores field).
- Sum weighted scores and weights across axes to feed the overall alignment score.

## Overall party alignment

- alignmentScore = totalWeightedScore / totalWeight (when totalWeight > 0, else 0).
- Parties are sorted descending by alignmentScore.
- primary = top party; alternatives = next two.

## Confidence heuristic

- topScore = primary.alignmentScore
- scoreSpread = topScore - alternatives[0].alignmentScore (or topScore if no alternative)
- confidence is:
  - "low" if topScore < 0.2
  - "medium" if topScore < 0.5 OR scoreSpread < 0.1
  - otherwise "high"

## Interpretation notes

- Party position values are not clamped in scoring; only similarities are clamped via normalization per axis.
- Weights matter: axes with more/greater-weight questions influence the score more.
- Negative-direction questions flip user responses to align with the intended pole; forgetting direction would bias results.
- Axis scores in results are already normalized to 0..1 per party/axis after weighting.

## Data assumptions to keep in sync

- Every question axis exists in axes.json.
- Every party has a position for every axis in party_positions.json.
- STANDARD_OPTIONS values stay in the expected order [-1, -0.5, 0, 0.5, 1].

## How to change or tune

- Adjust party positions in src/data/party_positions.json to reflect updated stances (and keep docs/party-position-reference.md in sync).
- Adjust question weights/direction in src/data/questions.json to emphasize or invert specific signals.
- To tweak confidence behavior, edit the thresholds/spread checks near the end of computeScores in src/utils/scoring.ts.

## Quick trace of computeScores

1. Initialize per-party axis accumulators to zero.
2. Iterate answers → find question → map answer value → flip if negative direction.
3. For each party, compute similarity vs party position and accumulate weighted sums and weights per axis.
4. For each party/axis with weight > 0: normalize to 0..1; accumulate totals.
5. Compute alignmentScore per party, sort, pick primary and alternatives, compute confidence.
6. Return primary, alternatives, allScores (sorted), confidence, timestamp.
