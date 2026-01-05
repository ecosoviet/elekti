import type {
  Axis,
  AxisContribution,
  AxisCoverage,
  Party,
  PartyScore,
  QuestionMetadata,
  QuizResult,
} from "../types";
import { SCORING, STANDARD_OPTIONS } from "./constants";
import { getAxes, getPartyPositions, getQuestions } from "./dataLoader";

export type {
  Axis,
  AxisContribution,
  AxisCoverage,
  Party,
  PartyScore,
  Question,
  QuizResult,
} from "../types";

type ScoringData = {
  axes: Axis[];
  partyPositions: Record<string, Record<string, number>>;
  questionsMetadata: QuestionMetadata[];
  questionById: Map<string, QuestionMetadata>;
};

let cachedScoringData: ScoringData | undefined;

function getScoringData(): ScoringData {
  if (cachedScoringData) {
    return cachedScoringData;
  }

  const axes = getAxes();
  const partyPositions = getPartyPositions();
  const questionsMetadata = getQuestions();
  const questionById = new Map(
    questionsMetadata.map((question) => [question.id, question])
  );

  cachedScoringData = { axes, partyPositions, questionsMetadata, questionById };
  return cachedScoringData;
}

export function computeScores(
  answers: Record<string, number>,
  parties: Party[]
): QuizResult {
  const { axes, partyPositions, questionsMetadata, questionById } =
    getScoringData();

  const axisScoresPerParty: Record<string, Record<string, number>> = {};
  const axisWeightsPerParty: Record<string, Record<string, number>> = {};

  for (const party of parties) {
    axisScoresPerParty[party.id] = {};
    axisWeightsPerParty[party.id] = {};

    for (const axis of axes) {
      axisScoresPerParty[party.id]![axis.id] = 0;
      axisWeightsPerParty[party.id]![axis.id] = 0;
    }
  }

  for (const [questionId, optionIndex] of Object.entries(answers)) {
    const question = questionById.get(questionId);
    if (!question) continue;

    let userValue = STANDARD_OPTIONS[optionIndex]?.value;
    if (userValue === undefined) continue;

    if (question.direction === "negative") {
      userValue = -userValue;
    }

    const axis = question.axis;
    const weight = question.weight;

    for (const party of parties) {
      const partyPositionValue = partyPositions[party.id]?.[axis];
      if (partyPositionValue === undefined) continue;

      const similarityRaw = 1 - Math.abs(userValue - partyPositionValue);
      const similarity = Math.max(0, similarityRaw);

      const weightedScore = similarity * weight;

      const partyAxisScores = axisScoresPerParty[party.id];
      const partyAxisWeights = axisWeightsPerParty[party.id];

      if (partyAxisScores && partyAxisScores[axis] !== undefined) {
        partyAxisScores[axis] += weightedScore;
      }
      if (partyAxisWeights && partyAxisWeights[axis] !== undefined) {
        partyAxisWeights[axis] += weight;
      }
    }
  }

  const partyScores: PartyScore[] = parties.map((party) => {
    const normalizedAxisScores: Record<string, number> = {};
    let totalWeightedScore = 0;
    let totalWeight = 0;

    for (const axis of axes) {
      const weightedSum = axisScoresPerParty[party.id]?.[axis.id];
      const totalWeight_ = axisWeightsPerParty[party.id]?.[axis.id];

      if (
        weightedSum !== undefined &&
        totalWeight_ !== undefined &&
        totalWeight_ > 0
      ) {
        const normalizedScore = weightedSum / totalWeight_;
        normalizedAxisScores[axis.id] = Math.max(
          0,
          Math.min(1, normalizedScore)
        );
        totalWeightedScore += weightedSum;
        totalWeight += totalWeight_;
      }
    }

    const alignmentScore =
      totalWeight > 0 ? totalWeightedScore / totalWeight : 0;

    return {
      partyId: party.id,
      alignmentScore,
      party,
      axisScores: normalizedAxisScores,
    };
  });

  partyScores.sort((a, b) => b.alignmentScore - a.alignmentScore);

  const primary = partyScores[0];
  if (!primary) {
    throw new Error("No party scores available");
  }

  const alternatives = partyScores.slice(1, 3);

  let confidence: "high" | "medium" | "low" = "high";

  const topScore = primary.alignmentScore;
  const scoreSpread =
    alternatives.length > 0 && alternatives[0]
      ? topScore - alternatives[0].alignmentScore
      : topScore;

  if (topScore < SCORING.LOW_CONFIDENCE_THRESHOLD) {
    confidence = "low";
  } else if (
    topScore < SCORING.MEDIUM_CONFIDENCE_THRESHOLD ||
    scoreSpread < SCORING.SPREAD_THRESHOLD
  ) {
    confidence = "medium";
  }

  const answerRate = Object.keys(answers).length / questionsMetadata.length;
  if (answerRate < 0.2 && confidence === "high") {
    confidence = "medium";
  }

  const topAxes = getTopContributingAxes(primary, axes, axisWeightsPerParty);
  const answeredAxes = getAxisCoverage(answers, questionsMetadata, axes);

  return {
    primary,
    alternatives,
    allScores: partyScores,
    confidence,
    timestamp: Date.now(),
    topAxes,
    answeredAxes,
  };
}

function getTopContributingAxes(
  primaryScore: PartyScore,
  axes: Axis[],
  axisWeightsPerParty: Record<string, Record<string, number>>
): AxisContribution[] {
  const contributions: AxisContribution[] = [];

  for (const axis of axes) {
    const score = primaryScore.axisScores?.[axis.id];
    const weight = axisWeightsPerParty[primaryScore.partyId]?.[axis.id];

    if (score !== undefined && weight !== undefined && weight > 0) {
      contributions.push({
        axisId: axis.id,
        score,
        weight,
      });
    }
  }

  contributions.sort((a, b) => b.weight - a.weight);
  return contributions.slice(0, 3);
}

function getAxisCoverage(
  answers: Record<string, number>,
  questionsMetadata: QuestionMetadata[],
  axes: Axis[]
): AxisCoverage[] {
  const coverage: Record<string, { answered: number; total: number }> = {};

  for (const axis of axes) {
    coverage[axis.id] = { answered: 0, total: 0 };
  }

  for (const question of questionsMetadata) {
    const axis = question.axis;
    if (coverage[axis]) {
      coverage[axis]!.total++;
      if (answers[question.id] !== undefined) {
        coverage[axis]!.answered++;
      }
    }
  }

  return axes.map((axis) => ({
    axisId: axis.id,
    questionsAnswered: coverage[axis.id]?.answered ?? 0,
    totalQuestions: coverage[axis.id]?.total ?? 0,
  }));
}
