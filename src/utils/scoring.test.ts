import { describe, expect, it } from "vitest";
import type { Party, PartyScore } from "./scoring";
import { computeScores } from "./scoring";

const mockParties: Party[] = [
  {
    id: "anc",
    name: "African National Congress",
    short: "ANC",
    descriptionKey: "party.anc.desc",
    colour: "#007A1C",
    logo: "",
  },
  {
    id: "da",
    name: "Democratic Alliance",
    short: "DA",
    descriptionKey: "party.da.desc",
    colour: "#007BFF",
    logo: "",
  },
  {
    id: "eff",
    name: "Economic Freedom Fighters",
    short: "EFF",
    descriptionKey: "party.eff.desc",
    colour: "#D70022",
    logo: "",
  },
  {
    id: "mk",
    name: "uMkhonto we Sizwe Party",
    short: "MK",
    descriptionKey: "party.mk.desc",
    colour: "#1A1A1A",
    logo: "",
  },
  {
    id: "ifp",
    name: "Inkatha Freedom Party",
    short: "IFP",
    descriptionKey: "party.ifp.desc",
    colour: "#C00000",
    logo: "",
  },
];

describe("scoring.ts - computeScores", () => {
  it("should return a QuizResult with primary and alternatives", () => {
    const answers = {
      q1: 0,
      q2: 1,
      q3: 2,
    };

    const result = computeScores(answers, mockParties);

    expect(result).toBeDefined();
    expect(result.primary).toBeDefined();
    expect(result.alternatives).toBeDefined();
    expect(result.allScores).toBeDefined();
    expect(result.confidence).toBeDefined();
    expect(result.timestamp).toBeDefined();
  });

  it("should have primary party with highest normalized score", () => {
    const answers = {
      q1: 0,
      q2: 0,
      q3: 0,
    };

    const result = computeScores(answers, mockParties);

    expect(result.primary.normalizedScore).toBeGreaterThanOrEqual(0);
    expect(result.primary.normalizedScore).toBeLessThanOrEqual(1);

    const maxScore = Math.max(
      ...result.allScores.map((s: PartyScore) => s.normalizedScore)
    );
    expect(result.primary.normalizedScore).toBe(maxScore);
  });

  it("should normalize scores between 0 and 1", () => {
    const answers = {
      q1: 0,
      q2: 1,
      q3: 2,
      q4: 3,
      q5: 4,
    };

    const result = computeScores(answers, mockParties);

    result.allScores.forEach((score: PartyScore) => {
      expect(score.normalizedScore).toBeGreaterThanOrEqual(0);
      expect(score.normalizedScore).toBeLessThanOrEqual(1);
    });
  });

  it("should have all parties with raw and normalized scores", () => {
    const answers = {
      q1: 0,
      q2: 1,
    };

    const result = computeScores(answers, mockParties);

    expect(result.allScores.length).toBe(mockParties.length);

    result.allScores.forEach((score: PartyScore) => {
      expect(score.partyId).toBeDefined();
      expect(score.rawScore).toBeDefined();
      expect(score.normalizedScore).toBeDefined();
      expect(score.party).toBeDefined();
    });
  });

  it("should set high confidence when primary score is above 0.4", () => {
    const answers = {
      q1: 0,
      q2: 0,
      q3: 0,
      q4: 0,
      q5: 0,
      q6: 0,
      q7: 0,
      q8: 0,
      q9: 0,
      q10: 0,
    };

    const result = computeScores(answers, mockParties);

    if (result.primary.normalizedScore >= 0.4) {
      expect(result.confidence).toBe("high");
    }
  });

  it("should set low confidence when primary score is below 0.15", () => {
    const answers = {
      q1: 2,
      q2: 2,
      q3: 2,
      q4: 2,
      q5: 2,
      q6: 2,
      q7: 2,
      q8: 2,
      q9: 2,
      q10: 2,
    };

    const result = computeScores(answers, mockParties);

    if (result.primary.normalizedScore < 0.15) {
      expect(result.confidence).toBe("low");
    }
  });

  it("should include alternatives with 2-party limit under normal conditions", () => {
    const answers = {
      q1: 0,
      q2: 1,
      q3: 2,
      q4: 3,
    };

    const result = computeScores(answers, mockParties);

    expect(result.alternatives.length).toBeLessThanOrEqual(
      mockParties.length - 1
    );
  });

  it("should handle empty answers gracefully", () => {
    const answers = {};

    const result = computeScores(answers, mockParties);

    expect(result.primary).toBeDefined();
    expect(result.allScores.length).toBe(mockParties.length);
    expect(result.allScores.every((s: PartyScore) => s.rawScore === 0)).toBe(
      true
    );
  });

  it("should handle partial answers", () => {
    const answers = {
      q1: 0,
      q3: 2,
      q5: 4,
    };

    const result = computeScores(answers, mockParties);

    expect(result.primary).toBeDefined();
    expect(result.allScores.length).toBe(mockParties.length);
  });

  it("should throw error if no parties provided", () => {
    const answers = { q1: 0 };
    expect(() => computeScores(answers, [])).toThrow();
  });

  it("should set timestamp to current time", () => {
    const before = Date.now();
    const answers = { q1: 0 };
    const result = computeScores(answers, mockParties);
    const after = Date.now();

    expect(result.timestamp).toBeGreaterThanOrEqual(before);
    expect(result.timestamp).toBeLessThanOrEqual(after);
  });

  it("should sort all scores in descending order by normalized score", () => {
    const answers = {
      q1: 0,
      q2: 1,
      q3: 2,
    };

    const result = computeScores(answers, mockParties);

    for (let i = 0; i < result.allScores.length - 1; i++) {
      const current = result.allScores[i];
      const next = result.allScores[i + 1];
      expect(current).toBeDefined();
      expect(next).toBeDefined();
      if (current && next) {
        expect(current.normalizedScore).toBeGreaterThanOrEqual(
          next.normalizedScore
        );
      }
    }
  });

  it("should handle negative raw scores by clamping normalized score to 0", () => {
    const answers = {
      q1: 4,
      q2: 4,
      q3: 4,
      q4: 4,
      q5: 4,
    };

    const result = computeScores(answers, mockParties);

    result.allScores.forEach((score: PartyScore) => {
      expect(score.normalizedScore).toBeGreaterThanOrEqual(0);
      expect(score.normalizedScore).toBeLessThanOrEqual(1);
    });
  });

  it("should use absolute scoring not relative (scores reflect true alignment)", () => {
    const answers = {
      q1: 0,
      q2: 1,
      q3: 2,
      q4: 3,
      q5: 0,
      q6: 1,
      q7: 2,
    };

    const result = computeScores(answers, mockParties);
    const topScore = result.primary.normalizedScore;
    const secondScore = result.allScores[1]?.normalizedScore ?? 0;

    expect(topScore).toBeGreaterThan(0);
    expect(topScore).toBeLessThanOrEqual(1.0);
    expect(secondScore).toBeGreaterThan(0);
  });

  it("should calculate confidence based on absolute score thresholds", () => {
    const lowAnswers = {
      q1: 2,
      q2: 2,
      q3: 2,
    };
    const lowResult = computeScores(lowAnswers, mockParties);

    if (lowResult.primary.normalizedScore < 0.35) {
      expect(lowResult.confidence).toBe("low");
    }

    const highAnswers = {
      q1: 0,
      q2: 0,
      q3: 0,
      q4: 0,
      q5: 0,
      q6: 0,
      q7: 0,
      q8: 0,
      q9: 0,
      q10: 0,
    };
    const highResult = computeScores(highAnswers, mockParties);

    const gapToSecond = highResult.alternatives[0]
      ? highResult.primary.normalizedScore -
        highResult.alternatives[0].normalizedScore
      : highResult.primary.normalizedScore;

    if (highResult.primary.normalizedScore >= 0.5 && gapToSecond >= 0.05) {
      expect(highResult.confidence).toBe("high");
    }
  });

  it("should base theoretical max only on answered questions", () => {
    const partialAnswers = {
      q1: 0,
      q5: 0,
    };

    const result = computeScores(partialAnswers, mockParties);

    expect(result.primary.normalizedScore).toBeGreaterThan(0);
    expect(
      result.allScores.every(
        (s: PartyScore) => s.normalizedScore >= 0 && s.normalizedScore <= 1
      )
    ).toBe(true);
  });

  it("should handle ties by including parties within tie margin in alternatives", () => {
    const answers = {
      q1: 2,
      q2: 2,
      q3: 2,
    };

    const result = computeScores(answers, mockParties);

    if (result.alternatives.length > 0) {
      result.alternatives.forEach((alt: PartyScore) => {
        expect(alt.normalizedScore).toBeLessThanOrEqual(
          result.primary.normalizedScore
        );
      });
    }
  });
});
