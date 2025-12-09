import axesData from "../data/axes.json";
import partyPositionsData from "../data/party_positions.json";
import questionsData from "../data/questions.json";
import { STANDARD_OPTIONS } from "./constants";

export interface Party {
  id: string;
  name: string;
  nameKey?: string;
  short: string;
  descriptionKey: string;
  colour: string;
  logo?: string;
}

export interface Question {
  id: string;
  text: string;
  axis: string;
  weight: number;
  options: Array<{ value: number; label: string }>;
}

interface QuestionMetadata {
  id: string;
  textKey: string;
  axis: string;
  weight: number;
}

export interface Axis {
  id: string;
  name: string;
  shortNameKey: string;
  description: string;
}

export interface PolicyAlignment {
  axis: string;
  axisName: string;
  shortNameKey: string;
  score: number;
}

export interface PartyScore {
  partyId: string;
  alignmentScore: number;
  party: Party;
  axisScores?: Record<string, number>;
}

export interface QuizResult {
  primary: PartyScore;
  alternatives: PartyScore[];
  allScores: PartyScore[];
  confidence: "high" | "medium" | "low";
  timestamp: number;
}

export function computeScores(
  answers: Record<string, number>,
  parties: Party[]
): QuizResult {
  const axes = (axesData as { axes: Axis[] }).axes;
  const partyPositions = (
    partyPositionsData as { parties: Record<string, Record<string, number>> }
  ).parties;
  const questionsMetadata = (questionsData as { questions: QuestionMetadata[] })
    .questions;

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
    const question = questionsMetadata.find((q) => q.id === questionId);
    if (!question) continue;

    const userValue = STANDARD_OPTIONS[optionIndex]?.value;
    if (userValue === undefined) continue;

    const axis = question.axis;
    const weight = question.weight;

    for (const party of parties) {
      const partyPositionValue = partyPositions[party.id]?.[axis];
      if (partyPositionValue === undefined) continue;

      const similarity = 1 - Math.abs(userValue - partyPositionValue);

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

  if (topScore < 0.2) {
    confidence = "low";
  } else if (topScore < 0.5 || scoreSpread < 0.1) {
    confidence = "medium";
  }

  return {
    primary,
    alternatives,
    allScores: partyScores,
    confidence,
    timestamp: Date.now(),
  };
}
