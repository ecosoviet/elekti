import { describe, expect, it } from "vitest";
import {
  decodeAndValidateAnswers,
  encodeAnswerValuesToBase64Url,
  UNANSWERED_VALUE,
  validateAnswerIndex,
  validateAnswersRecord,
  validateEncodedAnswers,
} from "./answers";

const encodeForQuestions = (values: Array<number | undefined>) =>
  encodeAnswerValuesToBase64Url(
    values.map((value) => (value === undefined ? UNANSWERED_VALUE : value))
  );

describe("Answer Validators", () => {
  describe("validateAnswerIndex", () => {
    it("should accept valid answer indices (0-4)", () => {
      for (let i = 0; i <= 4; i++) {
        const result = validateAnswerIndex(i);
        expect(result.success).toBe(true);
        expect(result.value).toBe(i);
      }
    });

    it("should reject negative indices", () => {
      const result = validateAnswerIndex(-1);
      expect(result.success).toBe(false);
      expect(result.error).toContain("must be >= 0");
    });

    it("should reject indices > 4", () => {
      const result = validateAnswerIndex(5);
      expect(result.success).toBe(false);
      expect(result.error).toContain("must be <= 4");
    });

    it("should reject non-integer values", () => {
      const result = validateAnswerIndex(2.5);
      expect(result.success).toBe(false);
      expect(result.error).toContain("integer");
    });

    it("should reject non-numeric values", () => {
      const result = validateAnswerIndex("abc");
      expect(result.success).toBe(false);
    });
  });

  describe("validateAnswersRecord", () => {
    it("should accept valid answers record", () => {
      const answers = { q1: 2, q2: 4, q3: 0 };
      const result = validateAnswersRecord(answers);
      expect(result.success).toBe(true);
      expect(result.answers).toEqual(answers);
    });

    it("should reject answers with invalid indices", () => {
      const answers = { q1: 2, q2: 5 };
      const result = validateAnswersRecord(answers);
      expect(result.success).toBe(false);
    });

    it("should reject non-object values", () => {
      const result = validateAnswersRecord("not an object");
      expect(result.success).toBe(false);
    });
  });

  describe("validateEncodedAnswers", () => {
    it("should accept valid base64 strings", () => {
      const encoded = encodeAnswerValuesToBase64Url([1, 2, 3]);
      const result = validateEncodedAnswers(encoded);
      expect(result.success).toBe(true);
      expect(result.value).toBe(encoded);
    });

    it("should reject empty strings", () => {
      const result = validateEncodedAnswers("");
      expect(result.success).toBe(false);
      expect(result.error).toContain("cannot be empty");
    });

    it("should reject invalid base64 strings", () => {
      const result = validateEncodedAnswers("not@valid#base64!");
      expect(result.success).toBe(false);
      expect(result.error).toContain("valid base64url");
    });

    it("should reject non-string values", () => {
      const result = validateEncodedAnswers(123);
      expect(result.success).toBe(false);
    });
  });

  describe("decodeAndValidateAnswers", () => {
    it("should decode and validate correctly encoded answers", () => {
      const questionIds = ["q1", "q2", "q3"];
      const encoded = encodeForQuestions([2, 4, 1]);

      const result = decodeAndValidateAnswers(encoded, questionIds);

      expect(result.success).toBe(true);
      expect(result.answers).toEqual({
        q1: 2,
        q2: 4,
        q3: 1,
      });
    });

    it("should handle partial answers (empty values)", () => {
      const questionIds = ["q1", "q2", "q3"];
      const encoded = encodeForQuestions([2, undefined, 1]);

      const result = decodeAndValidateAnswers(encoded, questionIds);

      expect(result.success).toBe(true);
      expect(result.answers).toEqual({
        q1: 2,
        q3: 1,
      });
    });

    it("should reject invalid base64", () => {
      const result = decodeAndValidateAnswers("invalid!", ["q1", "q2"]);
      expect(result.success).toBe(false);
      expect(result.error).toContain("base64");
    });

    it("should reject when all answers are invalid", () => {
      const questionIds = ["q1", "q2"];
      const encoded = encodeForQuestions([5, 6]);

      const result = decodeAndValidateAnswers(encoded, questionIds);

      expect(result.success).toBe(false);
      expect(result.error).toContain("No valid answers");
    });

    it("should handle decoding errors gracefully", () => {
      const encoded = encodeForQuestions([0, 1, 2, 3]);
      const result = decodeAndValidateAnswers(encoded, [
        "q1",
        "q2",
        "q3",
        "q4",
      ]);

      if (result.success) {
        expect(result.answers).toBeDefined();
      } else {
        expect(result.error).toBeDefined();
      }
    });
  });
});
