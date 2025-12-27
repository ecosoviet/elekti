import { describe, expect, it } from "vitest";
import {
  validateAxes,
  validateDatasetConsistency,
  validateParties,
  validatePartyPositions,
  validateQuestions,
  validateTranslation,
} from "./data";

describe("Data Validators", () => {
  describe("validateQuestions", () => {
    it("should reject duplicate question IDs", () => {
      const data = {
        questions: [
          {
            id: "q1",
            textKey: "questions.q1.text",
            axis: "economic_left_right",
            weight: 1,
          },
          {
            id: "q1",
            textKey: "questions.q2.text",
            axis: "state_vs_market",
            weight: 1,
          },
        ],
      };

      const result = validateQuestions(data);
      expect(result.success).toBe(false);
      expect(
        result.errors?.some((e) => e.includes("Duplicate question id"))
      ).toBe(true);
    });

    it("should accept valid questions data", () => {
      const data = {
        questions: [
          {
            id: "q1",
            textKey: "questions.q1.text",
            axis: "economic_left_right",
            weight: 1.5,
          },
          {
            id: "q2",
            textKey: "questions.q2.text",
            axis: "state_vs_market",
            weight: 2,
            direction: "negative",
          },
        ],
      };

      const result = validateQuestions(data);
      expect(result.success).toBe(true);
    });

    it("should reject invalid question ID format", () => {
      const data = {
        questions: [
          {
            id: "invalid",
            textKey: "questions.q1.text",
            axis: "economic_left_right",
            weight: 1.5,
          },
        ],
      };

      const result = validateQuestions(data);
      expect(result.success).toBe(false);
      expect(result.errors?.[0]).toContain("Question ID");
    });

    it("should reject invalid textKey format", () => {
      const data = {
        questions: [
          {
            id: "q1",
            textKey: "invalid.format",
            axis: "economic_left_right",
            weight: 1.5,
          },
        ],
      };

      const result = validateQuestions(data);
      expect(result.success).toBe(false);
      expect(result.errors?.[0]).toContain("Text key");
    });

    it("should reject negative or zero weights", () => {
      const data = {
        questions: [
          {
            id: "q1",
            textKey: "questions.q1.text",
            axis: "economic_left_right",
            weight: -1,
          },
        ],
      };

      const result = validateQuestions(data);
      expect(result.success).toBe(false);
      expect(result.errors?.[0]).toContain("positive");
    });
  });

  describe("validateParties", () => {
    it("should accept valid parties data", () => {
      const data = [
        {
          id: "anc",
          short: "ANC",
          name: "African National Congress",
          descriptionKey: "party.anc.desc",
          ideologyKey: "party.anc.ideology",
          colour: "#008542",
          website: "https://www.anc1912.org.za/",
        },
      ];

      const result = validateParties(data);
      expect(result.success).toBe(true);
    });

    it("should reject invalid hex colour", () => {
      const data = [
        {
          id: "test",
          short: "Test",
          name: "Test Party",
          descriptionKey: "party.test.desc",
          ideologyKey: "party.test.ideology",
          colour: "red",
          website: "https://test.com/",
        },
      ];

      const result = validateParties(data);
      expect(result.success).toBe(false);
      expect(result.errors?.[0]).toContain("hex colour");
    });

    it("should reject invalid URL", () => {
      const data = [
        {
          id: "test",
          short: "Test",
          name: "Test Party",
          descriptionKey: "party.test.desc",
          ideologyKey: "party.test.ideology",
          colour: "#FF0000",
          website: "not-a-url",
        },
      ];

      const result = validateParties(data);
      expect(result.success).toBe(false);
      expect(result.errors?.[0]).toContain("URL");
    });
  });

  describe("validateAxes", () => {
    it("should accept valid axes data", () => {
      const data = {
        axes: [
          {
            id: "economic_left_right",
            name: "Economic Left ↔ Right",
            shortNameKey: "axes.economic_left_right.short",
            description: "Taxation and redistribution policies",
          },
        ],
      };

      const result = validateAxes(data);
      expect(result.success).toBe(true);
    });

    it("should reject missing required fields", () => {
      const data = {
        axes: [
          {
            id: "test",
            name: "Test Axis",
          },
        ],
      };

      const result = validateAxes(data);
      expect(result.success).toBe(false);
    });
  });

  describe("validatePartyPositions", () => {
    it("should accept valid party positions", () => {
      const data = {
        parties: {
          anc: {
            economic_left_right: 0.3,
            state_vs_market: 0.2,
          },
          da: {
            economic_left_right: -0.8,
            state_vs_market: -0.7,
          },
        },
      };

      const result = validatePartyPositions(data);
      expect(result.success).toBe(true);
    });

    it("should reject positions outside [-1, 1] range", () => {
      const data = {
        parties: {
          anc: {
            economic_left_right: 1.5,
          },
        },
      };

      const result = validatePartyPositions(data);
      expect(result.success).toBe(false);
      expect(result.errors?.[0]).toContain("<= 1");
    });

    it("should reject positions less than -1", () => {
      const data = {
        parties: {
          anc: {
            economic_left_right: -1.2,
          },
        },
      };

      const result = validatePartyPositions(data);
      expect(result.success).toBe(false);
      expect(result.errors?.[0]).toContain(">= -1");
    });
  });

  describe("validateTranslation", () => {
    it("should accept valid translation data", () => {
      const data = {
        questions: {
          q1: {
            text: "Question text",
            axis: "Economic Left Right",
          },
        },
        party: {
          visitWebsite: "Open party site",
          anc: {
            desc: "Party description",
            ideology: "Political ideology",
          },
        },
        axes: {
          economic_left_right: {
            short: "Economic",
          },
        },
      };

      const result = validateTranslation(data);
      expect(result.success).toBe(true);
    });

    it("should reject missing required translation fields", () => {
      const data = {
        questions: {},
        party: {},
      };

      const result = validateTranslation(data);
      expect(result.success).toBe(false);
    });
  });

  describe("validateDatasetConsistency", () => {
    const axes = {
      axes: [
        {
          id: "economic_left_right",
          name: "Economic Left ↔ Right",
          shortNameKey: "axes.economic_left_right.short",
          description: "Economic axis",
        },
      ],
    };

    const questions = {
      questions: [
        {
          id: "q1",
          textKey: "questions.q1.text",
          axis: "economic_left_right",
          weight: 1,
        },
      ],
    };

    const parties = [
      {
        id: "anc",
        short: "ANC",
        name: "African National Congress",
        descriptionKey: "party.anc.desc",
        ideologyKey: "party.anc.ideology",
        colour: "#008542",
        website: "https://example.com",
      },
    ];

    const partyPositions = {
      parties: {
        anc: {
          economic_left_right: 0,
        },
      },
    };

    const translations = {
      en: {
        questions: {
          q1: {
            text: "Question 1",
            axis: "Economic",
          },
        },
        party: {
          visitWebsite: "Visit",
          anc: {
            desc: "Desc",
            ideology: "Ideology",
          },
        },
        axes: {
          economic_left_right: {
            short: "Economic",
          },
        },
      },
      af: {
        questions: {
          q1: {
            text: "Vraag 1",
            axis: "Ekonomies",
          },
        },
        party: {
          visitWebsite: "Besoek",
          anc: {
            desc: "Beskrywing",
            ideology: "Ideologie",
          },
        },
        axes: {
          economic_left_right: {
            short: "Ekonomies",
          },
        },
      },
    };

    it("returns success for consistent datasets", () => {
      const result = validateDatasetConsistency({
        axes,
        questions,
        parties,
        partyPositions,
        translationsByLocale: translations,
      });

      expect(result.success).toBe(true);
    });

    it("flags missing translations or mismatched axes", () => {
      const brokenTranslations = {
        ...translations,
        af: { ...translations.af, axes: {} },
      };

      const result = validateDatasetConsistency({
        axes,
        questions,
        parties,
        partyPositions,
        translationsByLocale: brokenTranslations,
      });

      expect(result.success).toBe(false);
      expect(
        result.errors?.some((e) => e.includes("missing translation for axis"))
      ).toBe(true);
    });
  });
});
