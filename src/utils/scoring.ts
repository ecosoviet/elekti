import scoringData from "../data/scoring";

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
  category: string;
  options: string[];
}

interface ScoringOption {
  option: string;
  scores: Record<string, number>;
}

interface ScoringQuestion {
  id: number;
  qId: string;
  text: string;
  category: string;
  weight: number;
  options: ScoringOption[];
}

export interface PolicyAlignment {
  questionId: string;
  questionText: string;
  category: string;
  score: number;
}

export interface PartyScore {
  partyId: string;
  rawScore: number;
  normalizedScore: number;
  party: Party;
  topPolicies?: PolicyAlignment[];
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
  const rawScores: Record<string, number> = {};
  const categoryScores: Record<string, Record<string, number[]>> = {};

  parties.forEach((party) => {
    rawScores[party.id] = 0;
    categoryScores[party.id] = {};
  });

  const scoringQuestions = scoringData as unknown as ScoringQuestion[];

  Object.entries(answers).forEach(([questionId, optionIndex]) => {
    const scoringQuestion = scoringQuestions.find((q) => q.qId === questionId);

    if (scoringQuestion && scoringQuestion.options[optionIndex]) {
      const scores = scoringQuestion.options[optionIndex].scores;
      const weight = scoringQuestion.weight;

      Object.entries(scores).forEach(([partyId, score]) => {
        if (rawScores[partyId] !== undefined) {
          rawScores[partyId] += (score as number) * weight;

          const category = scoringQuestion.category;
          const partyCategories = categoryScores[partyId];
          if (partyCategories) {
            if (!partyCategories[category]) {
              partyCategories[category] = [];
            }
            partyCategories[category].push(score as number);
          }
        }
      });
    }
  });

  const partyMaxScores: Record<string, number> = {};
  parties.forEach((party) => {
    partyMaxScores[party.id] = 0;
  });

  Object.keys(answers).forEach((questionId) => {
    const scoringQuestion = scoringQuestions.find((q) => q.qId === questionId);
    const optionIndex = answers[questionId];

    if (scoringQuestion && optionIndex !== undefined) {
      const selectedOption = scoringQuestion.options[optionIndex];
      const hasScores =
        selectedOption &&
        Object.values(selectedOption.scores).some((s) => s !== 0);

      if (hasScores) {
        parties.forEach((party) => {
          const maxScoreForParty = Math.max(
            ...scoringQuestion.options.map((opt) => opt.scores[party.id] || 0)
          );
          if (maxScoreForParty > 0) {
            partyMaxScores[party.id] =
              (partyMaxScores[party.id] || 0) +
              maxScoreForParty * scoringQuestion.weight;
          }
        });
      }
    }
  });

  const partyScores: PartyScore[] = parties.map((party) => {
    const rawScore = rawScores[party.id];
    const maxScore = partyMaxScores[party.id] || 0;

    let normalizedScore =
      maxScore > 0 ? (rawScore !== undefined ? rawScore / maxScore : 0) : 0;
    normalizedScore = Math.max(0, Math.min(1, normalizedScore));

    const categoryAverages: Array<{ category: string; avgScore: number }> = [];
    const partyCategoryScores = categoryScores[party.id];
    if (partyCategoryScores) {
      Object.entries(partyCategoryScores).forEach(([category, scores]) => {
        const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
        categoryAverages.push({ category, avgScore });
      });
    }

    const topPolicies =
      normalizedScore >= 0.15
        ? categoryAverages
            .filter((c) => c.avgScore >= 0.5)
            .sort((a, b) => b.avgScore - a.avgScore)
            .slice(0, 3)
            .map((c) => ({
              questionId: "",
              questionText: "",
              category: c.category,
              score: c.avgScore,
            }))
        : [];

    return {
      partyId: party.id,
      rawScore: rawScore !== undefined ? rawScore : 0,
      normalizedScore,
      party,
      topPolicies,
    };
  });

  partyScores.sort((a, b) => {
    if (Math.abs(b.normalizedScore - a.normalizedScore) > 0.0001) {
      return b.normalizedScore - a.normalizedScore;
    }
    return b.rawScore - a.rawScore;
  });

  const primary = partyScores[0];
  if (!primary) {
    throw new Error("No party scores available");
  }

  const alternatives: PartyScore[] = [];

  for (let i = 1; i < partyScores.length; i++) {
    const score = partyScores[i];
    if (!score) {
      continue;
    }

    if (alternatives.length >= 2) {
      break;
    }

    alternatives.push(score);
  }

  let confidence: "high" | "medium" | "low" = "high";

  const gapToSecond =
    alternatives.length > 0 && alternatives[0]
      ? primary.normalizedScore - alternatives[0].normalizedScore
      : primary.normalizedScore;

  if (primary.normalizedScore < 0.5) {
    confidence = "low";
  } else if (primary.normalizedScore < 0.7 && gapToSecond < 0.1) {
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
