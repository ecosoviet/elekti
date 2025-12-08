import axesData from "../data/axes.json";
import partyPositionsData from "../data/party_positions.json";
import questionsData from "../data/questions.json";

export interface Party {
  id: string;
  name: string;
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

export interface Axis {
  id: string;
  name: string;
  description: string;
}

export interface PolicyAlignment {
  axis: string;
  axisName: string;
  score: number;
}

export interface PartyScore {
  partyId: string;
  alignmentScore: number;
  party: Party;
  axisScores?: Record<string, number>;
  topAxes?: PolicyAlignment[];
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
  const questions = (questionsData as { questions: Question[] }).questions;

  const axisScoresPerParty: Record<string, Record<string, number>> = {};
  const axisWeightsPerParty: Record<string, Record<string, number>> = {};

  parties.forEach((party) => {
    axisScoresPerParty[party.id] = {};
    axisWeightsPerParty[party.id] = {};

    axes.forEach((axis) => {
      axisScoresPerParty[party.id][axis.id] = 0;
      axisWeightsPerParty[party.id][axis.id] = 0;
    });
  });

  Object.entries(answers).forEach(([questionId, optionIndex]) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question) return;

    const userValue = question.options[optionIndex]?.value;
    if (userValue === undefined) return;

    const axis = question.axis;
    const weight = question.weight;

    parties.forEach((party) => {
      const partyPositionValue = partyPositions[party.id]?.[axis];
      if (partyPositionValue === undefined) return;

      const similarity = 1 - Math.abs(userValue - partyPositionValue);

      const weightedScore = similarity * weight;

      axisScoresPerParty[party.id][axis] += weightedScore;
      axisWeightsPerParty[party.id][axis] += weight;
    });
  });

  const partyScores: PartyScore[] = parties.map((party) => {
    const normalizedAxisScores: Record<string, number> = {};
    let totalWeightedScore = 0;
    let totalWeight = 0;

    axes.forEach((axis) => {
      const weightedSum = axisScoresPerParty[party.id][axis.id];
      const totalWeight_ = axisWeightsPerParty[party.id][axis.id];

      if (totalWeight_ > 0) {
        normalizedAxisScores[axis.id] = weightedSum / totalWeight_;
        totalWeightedScore += weightedSum;
        totalWeight += totalWeight_;
      }
    });

    const alignmentScore =
      totalWeight > 0 ? totalWeightedScore / totalWeight : 0;

    const topAxes = axes
      .map((axis) => ({
        axis: axis.id,
        axisName: axis.name,
        score: normalizedAxisScores[axis.id] ?? 0,
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    return {
      partyId: party.id,
      alignmentScore,
      party,
      axisScores: normalizedAxisScores,
      topAxes: topAxes.length > 0 ? topAxes : undefined,
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
    alternatives.length > 0
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
