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

interface ScoringData {
  questions: ScoringQuestion[];
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

function mapPartyKey(key: string): string {
  const mapping: Record<string, string> = {
    ANC: "anc",
    DA: "da",
    EFF: "eff",
    IFP: "ifp",
    MKP: "mk",
    PA: "pa",
    "VF+": "vfplus",
    ActionSA: "actionsa",
    ACDP: "acdp",
    UFC: "ufc",
    SACP: "sacp",
    UDM: "udm",
    "Al Jama-ah": "aljamah",
    COPE: "cope",
  };

  return mapping[key] || key.toLowerCase();
}

export function computeScores(
  answers: Record<string, number>,
  parties: Party[]
): QuizResult {
  const rawScores: Record<string, number> = {};
  parties.forEach((party) => {
    rawScores[party.id] = 0;
  });

  const scoringQuestions = (scoringData as ScoringData).questions;

  Object.entries(answers).forEach(([questionId, optionIndex]) => {
    const qNum = parseInt(questionId.substring(1));
    const scoringQuestion = scoringQuestions.find((q) => q.id === qNum);

    if (scoringQuestion && scoringQuestion.options[optionIndex]) {
      const scores = scoringQuestion.options[optionIndex].scores;
      const weight = scoringQuestion.weight;

      Object.entries(scores).forEach(([partyKey, score]) => {
        const partyId = mapPartyKey(partyKey);
        if (rawScores[partyId] !== undefined) {
          rawScores[partyId] += (score as number) * weight;
        }
      });
    }
  });

  let theoreticalMax = 0;

  Object.keys(answers).forEach((questionId) => {
    const qNum = parseInt(questionId.substring(1));
    const scoringQuestion = scoringQuestions.find((q) => q.id === qNum);

    if (scoringQuestion) {
      const maxScoreForQuestion = Math.max(
        ...scoringQuestion.options.flatMap((opt) => Object.values(opt.scores))
      );
      theoreticalMax += maxScoreForQuestion * scoringQuestion.weight;
    }
  });

  const partyScores: PartyScore[] = parties.map((party) => {
    const rawScore = rawScores[party.id];
    let normalizedScore =
      theoreticalMax > 0
        ? rawScore !== undefined
          ? rawScore / theoreticalMax
          : 0
        : 0;
    normalizedScore = Math.max(0, Math.min(1, normalizedScore));

    return {
      partyId: party.id,
      rawScore: rawScore !== undefined ? rawScore : 0,
      normalizedScore,
      party,
    };
  });

  partyScores.sort((a, b) => b.normalizedScore - a.normalizedScore);

  const primary = partyScores[0];
  if (!primary) {
    throw new Error("No party scores available");
  }

  const tieMargin = 0.02;
  const alternatives: PartyScore[] = [];

  for (let i = 1; i < partyScores.length; i++) {
    const score = partyScores[i];
    if (!score) {
      continue;
    }

    if (alternatives.length >= 2) {
      break;
    }

    if (Math.abs(score.normalizedScore - primary.normalizedScore) < tieMargin) {
      alternatives.push(score);
    } else {
      alternatives.push(score);
    }
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
