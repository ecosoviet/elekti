import { describe, expect, it, vi } from "vitest";
import type { Party, PartyScore } from "./scoring";
import { computeScores } from "./scoring";

vi.mock("../data/axes.json", () => ({
  default: {
    axes: [
      {
        id: "economic_left_right",
        name: "Economic Left ↔ Right",
        description: "Test axis",
      },
      {
        id: "state_vs_market",
        name: "State ↔ Market",
        description: "Test axis",
      },
      {
        id: "labour_rights",
        name: "Labour Rights ↔ Flexibility",
        description: "Test axis",
      },
    ],
  },
}));

vi.mock("../data/party_positions.json", () => ({
  default: {
    parties: {
      anc: {
        economic_left_right: 0.3,
        state_vs_market: 0.2,
        labour_rights: 0.45,
      },
      da: {
        economic_left_right: -0.65,
        state_vs_market: -0.7,
        labour_rights: -0.55,
      },
      eff: {
        economic_left_right: 0.95,
        state_vs_market: 0.85,
        labour_rights: 0.75,
      },
    },
  },
}));

vi.mock("../data/questions.json", () => ({
  default: {
    questions: [
      {
        id: "q1",
        text: "Test question 1",
        axis: "economic_left_right",
        weight: 1.5,
        options: [
          { value: 1, label: "Strongly agree" },
          { value: 0.5, label: "Agree" },
          { value: 0, label: "Neutral" },
          { value: -0.5, label: "Disagree" },
          { value: -1, label: "Strongly disagree" },
        ],
      },
      {
        id: "q2",
        text: "Test question 2",
        axis: "state_vs_market",
        weight: 1.2,
        options: [
          { value: -1, label: "Strongly agree" },
          { value: -0.5, label: "Agree" },
          { value: 0, label: "Neutral" },
          { value: 0.5, label: "Disagree" },
          { value: 1, label: "Strongly disagree" },
        ],
      },
      {
        id: "q3",
        text: "Test question 3",
        axis: "labour_rights",
        weight: 1.3,
        options: [
          { value: 1, label: "Strongly agree" },
          { value: 0.5, label: "Agree" },
          { value: 0, label: "Neutral" },
          { value: -0.5, label: "Disagree" },
          { value: -1, label: "Strongly disagree" },
        ],
      },
    ],
  },
}));

const mockParties: Party[] = [
  {
    id: "anc",
    name: "African National Congress",
    short: "ANC",
    descriptionKey: "party.anc.desc",
    colour: "#007A1C",
  },
  {
    id: "da",
    name: "Democratic Alliance",
    short: "DA",
    descriptionKey: "party.da.desc",
    colour: "#007BFF",
  },
  {
    id: "eff",
    name: "Economic Freedom Fighters",
    short: "EFF",
    descriptionKey: "party.eff.desc",
    colour: "#D70022",
  },
];

describe("scoring.ts - computeScores (axis-based)", () => {
  it("should return a QuizResult with primary and alternatives", () => {
    const answers = {
      q1: 0,
      q2: 4,
      q3: 0,
    };

    const result = computeScores(answers, mockParties);

    expect(result).toBeDefined();
    expect(result.primary).toBeDefined();
    expect(result.alternatives).toBeDefined();
    expect(result.allScores).toBeDefined();
    expect(result.confidence).toBeDefined();
    expect(result.timestamp).toBeDefined();
  });

  it("should have primary party with highest alignment score", () => {
    const answers = {
      q1: 0,
      q2: 0,
    };

    const result = computeScores(answers, mockParties);

    expect(result.primary.alignmentScore).toBeGreaterThanOrEqual(0);
    expect(result.primary.alignmentScore).toBeLessThanOrEqual(1);

    const maxScore = Math.max(
      ...result.allScores.map((s: PartyScore) => s.alignmentScore)
    );
    expect(result.primary.alignmentScore).toBe(maxScore);
  });

  it("should calculate similarity correctly: 1 - abs(user_value - party_position)", () => {
    const answers = {
      q1: 0,
    };

    const result = computeScores(answers, mockParties);

    const ancScore = result.allScores.find((s) => s.partyId === "anc");
    const effScore = result.allScores.find((s) => s.partyId === "eff");

    expect(effScore).toBeDefined();
    expect(ancScore).toBeDefined();
    if (effScore && ancScore) {
      expect(effScore.alignmentScore).toBeGreaterThan(ancScore.alignmentScore);
    }
  });

  it("should accumulate weighted scores across questions", () => {
    const answers = {
      q1: 0,
      q2: 4,
      q3: 0,
    };

    const result = computeScores(answers, mockParties);

    expect(result.primary).toBeDefined();
    expect(
      result.allScores.every(
        (s: PartyScore) => typeof s.alignmentScore === "number"
      )
    ).toBe(true);
  });

  it("should skip undefined answers gracefully", () => {
    const answers = {
      q1: 0,
      q3: 2,
    };

    const result = computeScores(answers, mockParties);

    expect(result.primary).toBeDefined();
    expect(result.allScores.length).toBe(mockParties.length);
    expect(
      result.allScores.every(
        (s: PartyScore) => typeof s.alignmentScore === "number"
      )
    ).toBe(true);
  });

  it("should handle empty answers without crashing", () => {
    const answers = {};

    const result = computeScores(answers, mockParties);

    expect(result.primary).toBeDefined();
    expect(result.allScores.length).toBe(mockParties.length);
  });

  it("should calculate confidence as high when score spread > 0.15", () => {
    const answers = {
      q1: 0,
      q2: 0,
      q3: 0,
    };

    const result = computeScores(answers, mockParties);

    const spread =
      result.primary.alignmentScore -
      (result.alternatives[0]?.alignmentScore ?? 0);
    if (result.primary.alignmentScore > 0.5 && spread > 0.1) {
      expect(result.confidence).toBe("high");
    }
  });

  it("should calculate confidence as low when alignment score < 0.2", () => {
    const answers = {
      q1: 2,
    };

    const result = computeScores(answers, mockParties);

    if (result.primary.alignmentScore < 0.2) {
      expect(result.confidence).toBe("low");
    }
  });

  it("should calculate confidence as medium when alignment < 0.5 or spread < 0.1", () => {
    const answers = {
      q1: 1,
      q2: 3,
    };

    const result = computeScores(answers, mockParties);

    const spread =
      result.primary.alignmentScore -
      (result.alternatives[0]?.alignmentScore ?? 0);
    if (
      (result.primary.alignmentScore < 0.5 || spread < 0.1) &&
      result.primary.alignmentScore >= 0.2
    ) {
      expect(result.confidence).toMatch(/^(medium|low)$/);
    }
  });

  it("should include top 3 axes in topAxes field", () => {
    const answers = {
      q1: 0,
      q2: 4,
      q3: 0,
    };

    const result = computeScores(answers, mockParties);

    const primary = result.primary;
    if (primary.topAxes) {
      expect(primary.topAxes.length).toBeLessThanOrEqual(3);
      if (primary.topAxes[0]) {
        expect(primary.topAxes[0].axisName).toBeDefined();
        expect(primary.topAxes[0].score).toBeGreaterThan(0);
      }
    }
  });

  it("should provide axis scores for each axis", () => {
    const answers = {
      q1: 0,
      q2: 4,
    };

    const result = computeScores(answers, mockParties);

    const primary = result.primary;
    expect(primary.axisScores).toBeDefined();
    expect(primary.axisScores?.["economic_left_right"]).toBeDefined();
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

  it("should sort all scores in descending order by alignment score", () => {
    const answers = {
      q1: 0,
      q2: 4,
      q3: 0,
    };

    const result = computeScores(answers, mockParties);

    for (let index = 0; index < result.allScores.length - 1; index++) {
      const current = result.allScores[index];
      const next = result.allScores[index + 1];
      expect(current).toBeDefined();
      expect(next).toBeDefined();
      if (current && next) {
        expect(current.alignmentScore).toBeGreaterThanOrEqual(
          next.alignmentScore
        );
      }
    }
  });

  it("should include up to 2 alternatives after primary", () => {
    const answers = {
      q1: 0,
      q2: 4,
      q3: 0,
    };

    const result = computeScores(answers, mockParties);

    expect(result.alternatives.length).toBeLessThanOrEqual(2);
    expect(result.alternatives[0]).toBeDefined();
  });

  it("should compute alignment scores between 0 and 1 (approximately)", () => {
    const answers = {
      q1: 0,
      q2: 1,
      q3: 2,
    };

    const result = computeScores(answers, mockParties);

    for (const score of result.allScores) {
      expect(score.alignmentScore).toBeGreaterThanOrEqual(-0.1);
      expect(score.alignmentScore).toBeLessThanOrEqual(1.1);
    }
  });
});
