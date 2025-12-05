import scoringData from "../data/scoring.json";

export interface Party {
  id: string;
  name: string;
  short: string;
  descriptionKey: string;
  colour: string;
  logo: string;
}

export interface Question {
  id: string;
  text: string;
  category: string;
  options: string[];
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
    ATM: "atm",
    PF: "pf",
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

  const scoringQuestions = scoringData.questions;

  Object.entries(answers).forEach(([questionId, optionIndex]) => {
    const qNum = parseInt(questionId.substring(1));
    const scoringQuestion = scoringQuestions.find((q) => q.id === qNum);

    if (scoringQuestion && scoringQuestion.options[optionIndex]) {
      const scores = scoringQuestion.options[optionIndex].scores;

      Object.entries(scores).forEach(([partyKey, score]) => {
        const partyId = mapPartyKey(partyKey);
        if (rawScores[partyId] !== undefined) {
          rawScores[partyId] += score as number;
        }
      });
    }
  });

  const scoreValues = Object.values(rawScores);
  const minScore = Math.min(...scoreValues);
  const maxScore = Math.max(...scoreValues);
  const range = maxScore - minScore;

  const normalizedScores: Record<string, number> = {};
  if (range === 0) {
    Object.keys(rawScores).forEach((partyId) => {
      normalizedScores[partyId] = 0.5;
    });
  } else {
    Object.entries(rawScores).forEach(([partyId, score]) => {
      normalizedScores[partyId] = (score - minScore) / range;
    });
  }

  const partyScores: PartyScore[] = parties.map((party) => {
    const rawScore = rawScores[party.id];
    const normalizedScore = normalizedScores[party.id];
    return {
      partyId: party.id,
      rawScore: rawScore !== undefined ? rawScore : 0,
      normalizedScore: normalizedScore !== undefined ? normalizedScore : 0,
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

    if (
      Math.abs(score.normalizedScore - primary.normalizedScore) >= tieMargin
    ) {
      alternatives.push(score);
      if (alternatives.length >= 2) {
        break;
      }
    } else {
      alternatives.push(score);
    }
  }

  let confidence: "high" | "medium" | "low" = "high";
  if (primary.normalizedScore < 0.15) {
    confidence = "low";
  } else if (
    primary.normalizedScore < 0.4 ||
    (alternatives.length > 0 &&
      alternatives[0] &&
      Math.abs(primary.normalizedScore - alternatives[0].normalizedScore) <
        tieMargin * 2)
  ) {
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
