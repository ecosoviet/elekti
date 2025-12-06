import scoringData from "../data/scoring.json";

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
  text: string;
  category: string;
  weight: number;
  options: ScoringOption[];
}

export interface PartyScore {
  partyId: string;
  rawScore: number;
  normalizedScore: number;
  party: Party;
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
  parties.forEach((party) => {
    rawScores[party.id] = 0;
  });

  const scoringQuestions = scoringData as unknown as ScoringQuestion[];

  Object.entries(answers).forEach(([questionId, optionIndex]) => {
    const qNum = parseInt(questionId.substring(1));
    const scoringQuestion = scoringQuestions.find((q) => q.id === qNum);

    if (scoringQuestion && scoringQuestion.options[optionIndex]) {
      const scores = scoringQuestion.options[optionIndex].scores;
      const weight = scoringQuestion.weight;

      Object.entries(scores).forEach(([partyId, score]) => {
        if (rawScores[partyId] !== undefined) {
          rawScores[partyId] += (score as number) * weight;
        }
      });
    }
  });

  const partyMaxScores: Record<string, number> = {};
  parties.forEach((party) => {
    partyMaxScores[party.id] = 0;
  });

  Object.keys(answers).forEach((questionId) => {
    const qNum = parseInt(questionId.substring(1));
    const scoringQuestion = scoringQuestions.find((q) => q.id === qNum);
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

    return {
      partyId: party.id,
      rawScore: rawScore !== undefined ? rawScore : 0,
      normalizedScore,
      party,
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

  if (primary.normalizedScore < 0.35) {
    confidence = "low";
  } else if (gapToSecond < 0.05 || primary.normalizedScore < 0.5) {
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
