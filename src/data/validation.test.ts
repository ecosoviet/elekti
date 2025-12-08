import { describe, expect, it } from "vitest";
import axes from "./axes.json";
import parties from "./parties.json";
import partyPositions from "./party_positions.json";
import questions from "./questions.json";
import af from "./translations/af.json";
import en from "./translations/en.json";

describe("Data Validation", () => {
  describe("Questions Data", () => {
    it("should have questions array", () => {
      expect(Array.isArray(questions.questions)).toBe(true);
      expect(questions.questions.length).toBeGreaterThan(0);
    });

    it("should have unique question IDs", () => {
      const ids = questions.questions.map((q) => q.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have valid text keys that match translation pattern", () => {
      for (const q of questions.questions) {
        expect(q.textKey).toMatch(/^questions\.[qQ]\d+\.text$/);
      }
    });

    it("should reference existing axes", () => {
      const axisIds = new Set(axes.axes.map((a) => a.id));
      for (const q of questions.questions) {
        expect(axisIds.has(q.axis)).toBe(true);
      }
    });

    it("should have valid weights", () => {
      for (const q of questions.questions) {
        expect(typeof q.weight).toBe("number");
        expect(q.weight).toBeGreaterThan(0);
      }
    });

    it("should have valid options with numeric values", () => {
      for (const q of questions.questions) {
        expect(Array.isArray(q.options)).toBe(true);
        expect(q.options.length).toBeGreaterThan(0);

        for (const opt of q.options) {
          expect(typeof opt.value).toBe("number");
          expect(opt.value).toBeGreaterThanOrEqual(-1);
          expect(opt.value).toBeLessThanOrEqual(1);
          expect(typeof opt.label).toBe("string");
        }
      }
    });

    it("should have all question text keys in both translations", () => {
      for (const q of questions.questions) {
        const enPath = q.textKey;
        const afPath = q.textKey;

        expect(en.questions).toBeDefined();
        expect(af.questions).toBeDefined();

        const enQuestion = getNestedValue(en, enPath);
        const afQuestion = getNestedValue(af, afPath);

        expect(enQuestion).toBeDefined();
        expect(afQuestion).toBeDefined();
      }
    });
  });

  describe("Axes Data", () => {
    it("should have axes array", () => {
      expect(Array.isArray(axes.axes)).toBe(true);
      expect(axes.axes.length).toBeGreaterThan(0);
    });

    it("should have unique axis IDs", () => {
      const ids = axes.axes.map((a) => a.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have required properties", () => {
      for (const a of axes.axes) {
        expect(a.id).toBeDefined();
        expect(typeof a.id).toBe("string");
        expect(a.name).toBeDefined();
        expect(typeof a.name).toBe("string");
        expect(a.shortNameKey).toBeDefined();
        expect(a.description).toBeDefined();
      }
    });

    it("should have valid translation keys", () => {
      for (const a of axes.axes) {
        expect(a.shortNameKey).toMatch(/^axes\.[a-z_]+\.short$/);
      }
    });

    it("should have all axis shortNames in both translations", () => {
      for (const a of axes.axes) {
        const enValue = getNestedValue(en, a.shortNameKey);
        const afValue = getNestedValue(af, a.shortNameKey);

        expect(enValue).toBeDefined();
        expect(afValue).toBeDefined();
      }
    });
  });

  describe("Parties Data", () => {
    it("should have parties array", () => {
      expect(Array.isArray(parties)).toBe(true);
      expect(parties.length).toBeGreaterThan(0);
    });

    it("should have unique party IDs", () => {
      const ids = parties.map((p) => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have required properties", () => {
      for (const p of parties) {
        expect(p.id).toBeDefined();
        expect(typeof p.id).toBe("string");
        expect(p.short).toBeDefined();
        expect(p.name).toBeDefined();
        expect(p.descriptionKey).toBeDefined();
        expect(p.colour).toBeDefined();
        expect(p.website).toBeDefined();
      }
    });

    it("should have valid colour hex codes", () => {
      for (const p of parties) {
        expect(p.colour).toMatch(/^#[0-9A-F]{6}$/i);
      }
    });

    it("should have valid website URLs", () => {
      for (const p of parties) {
        expect(p.website).toMatch(/^https?:\/\//);
      }
    });

    it("should have all party descriptions in both translations", () => {
      for (const p of parties) {
        const enValue = getNestedValue(en, p.descriptionKey);
        const afValue = getNestedValue(af, p.descriptionKey);

        expect(enValue).toBeDefined();
        expect(afValue).toBeDefined();
      }
    });
  });

  describe("Party Positions Data", () => {
    it("should have parties object", () => {
      expect(typeof partyPositions.parties).toBe("object");
      expect(Object.keys(partyPositions.parties).length).toBeGreaterThan(0);
    });

    it("should have positions for all parties", () => {
      const partyIds = new Set(parties.map((p) => p.id));
      for (const partyId of Object.keys(partyPositions.parties)) {
        expect(partyIds.has(partyId)).toBe(true);
      }
    });

    it("should have all parties from parties.json in positions", () => {
      for (const p of parties) {
        expect(partyPositions.parties).toHaveProperty(p.id);
      }
    });

    it("should have valid position values", () => {
      for (const positions of Object.values(partyPositions.parties)) {
        for (const value of Object.values(positions)) {
          expect(typeof value).toBe("number");
          expect(value).toBeGreaterThanOrEqual(-1);
          expect(value).toBeLessThanOrEqual(1);
        }
      }
    });

    it("should reference existing axes", () => {
      const axisIds = new Set(axes.axes.map((a) => a.id));
      for (const positions of Object.values(partyPositions.parties)) {
        for (const axisId of Object.keys(positions)) {
          expect(axisIds.has(axisId)).toBe(true);
        }
      }
    });

    it("should have same axes for all parties", () => {
      const partyPositionsList = Object.values(partyPositions.parties);
      if (partyPositionsList.length > 0) {
        const firstParty = partyPositionsList[0];
        if (firstParty) {
          const firstPartyAxes = Object.keys(firstParty).toSorted();

          for (const positions of partyPositionsList) {
            const partyAxes = Object.keys(positions).toSorted();
            expect(partyAxes).toEqual(firstPartyAxes);
          }
        }
      }
    });
  });

  describe("Translation Completeness", () => {
    it("should have same top-level keys in both translations", () => {
      const enKeys = Object.keys(en).toSorted();
      const afKeys = Object.keys(af).toSorted();
      expect(enKeys).toEqual(afKeys);
    });

    it("should have same number of questions in both translations", () => {
      const enQuestions = Object.keys(en.questions || {});
      const afQuestions = Object.keys(af.questions || {});
      expect(enQuestions.length).toBe(afQuestions.length);
    });

    it("should have at least some content in all supported locales", () => {
      expect(Object.keys(en).length).toBeGreaterThan(0);
      expect(Object.keys(af).length).toBeGreaterThan(0);
    });
  });

  describe("Data Consistency", () => {
    it("should have no orphaned questions without axes", () => {
      const axisIds = new Set(axes.axes.map((a) => a.id));
      const questionAxes = new Set(questions.questions.map((q) => q.axis));

      for (const axis of questionAxes) {
        expect(axisIds.has(axis)).toBe(true);
      }
    });

    it("should have no orphaned party positions", () => {
      const partyIds = new Set(parties.map((p) => p.id));

      for (const partyId of Object.keys(partyPositions.parties)) {
        expect(partyIds.has(partyId)).toBe(true);
      }
    });
  });
});

function getNestedValue(
  object: Record<string, unknown>,
  path: string
): unknown {
  const keys = path.split(".");
  let current: Record<string, unknown> | unknown = object;

  for (const key of keys) {
    if (current == undefined || typeof current !== "object") {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }

  return current;
}
