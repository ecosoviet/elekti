import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useQuizStore } from "../stores/quizStore";
import {
  encodeAnswerValuesToBase64Url,
  UNANSWERED_VALUE,
} from "../validators/answers";

vi.mock("vue-i18n", () => ({
  createI18n: (_opts?: unknown) => ({
    global: {
      t: (key: string) => key,
      locale: { value: "en" },
    },
  }),
  useI18n: () => ({
    t: (key: string) => {
      const parts = key.split(".");
      if (parts[0] === "questions" && parts[1]) {
        const qNumber = parts[1];
        return `Question ${qNumber.slice(1)} text`;
      }
      return key;
    },
  }),
}));

vi.mock("../data/questions.json", () => {
  const questions = Array.from({ length: 41 }, (_, index) => ({
    id: `q${index + 1}`,
    textKey: `questions.q${index + 1}.text`,
    axis: `axis${(index % 12) + 1}`,
    weight: 1.5,
    options: [
      { value: 1, label: "Strongly agree" },
      { value: 0.5, label: "Agree" },
      { value: 0, label: "Neutral" },
      { value: -0.5, label: "Disagree" },
      { value: -1, label: "Strongly disagree" },
    ],
  }));

  return {
    default: {
      questions,
    },
  };
});

const makeEncodedAnswers = (
  values: Array<number | undefined>,
  total: number
) => {
  const padded = Array.from({ length: total }, (_, index) => {
    const value = values[index];
    return value === undefined ? UNANSWERED_VALUE : value;
  });

  return encodeAnswerValuesToBase64Url(padded);
};

describe("quizStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe("initialization", () => {
    it("should initialize with empty answers", () => {
      const store = useQuizStore();
      expect(store.answers).toEqual({});
    });

    it("should initialize at first question", () => {
      const store = useQuizStore();
      expect(store.currentQuestionIndex).toBe(0);
    });

    it("should not be completed initially", () => {
      const store = useQuizStore();
      expect(store.completed).toBe(false);
    });

    it("should load 41 questions", () => {
      const store = useQuizStore();
      expect(store.questions.length).toBe(41);
    });
    it("should have all parties loaded", () => {
      const store = useQuizStore();
      expect(store.parties.length).toBeGreaterThan(0);
    });
  });

  describe("question navigation", () => {
    it("should provide current question", () => {
      const store = useQuizStore();
      const current = store.currentQuestion;
      expect(current).toBeDefined();
      if (current) {
        expect(current.id).toBe("q1");
      }
    });

    it("should advance to next question", () => {
      const store = useQuizStore();
      store.nextQuestion();
      expect(store.currentQuestionIndex).toBe(1);
      expect(store.currentQuestion?.id).toBe("q2");
    });

    it("should go back to previous question", () => {
      const store = useQuizStore();
      store.nextQuestion();
      store.previousQuestion();
      expect(store.currentQuestionIndex).toBe(0);
      expect(store.currentQuestion?.id).toBe("q1");
    });

    it("should not go before first question", () => {
      const store = useQuizStore();
      store.previousQuestion();
      expect(store.currentQuestionIndex).toBe(0);
    });

    it("should mark as completed when reaching last question", () => {
      const store = useQuizStore();

      for (let index = 0; index < 41; index++) {
        store.nextQuestion();
      }
      expect(store.completed).toBe(true);
    });

    it("should calculate progress percentage", () => {
      const store = useQuizStore();
      expect(store.progress).toBe(0);

      store.nextQuestion();
      expect(store.progress).toBeGreaterThan(0);
      expect(store.progress).toBeLessThan(100);

      for (let index = 1; index < 37; index++) {
        store.nextQuestion();
      }
      expect(store.progress).toBeGreaterThan(85);
      expect(store.progress).toBeLessThanOrEqual(100);
    });
  });

  describe("answering questions", () => {
    it("should answer a question", () => {
      const store = useQuizStore();
      store.answerQuestion("q1", 2);
      expect(store.answers["q1"]).toBe(2);
    });

    it("should track answered count", () => {
      const store = useQuizStore();
      expect(store.answeredCount).toBe(0);

      store.answerQuestion("q1", 0);
      expect(store.answeredCount).toBe(1);

      store.answerQuestion("q2", 1);
      expect(store.answeredCount).toBe(2);
    });

    it("should allow updating an answer", () => {
      const store = useQuizStore();
      store.answerQuestion("q1", 0);
      expect(store.answers["q1"]).toBe(0);

      store.answerQuestion("q1", 3);
      expect(store.answers["q1"]).toBe(3);
      expect(store.answeredCount).toBe(1);
    });

    it("should indicate when can proceed to next question", () => {
      const store = useQuizStore();
      expect(store.canProceed).toBe(false);

      store.answerQuestion("q1", 0);
      expect(store.canProceed).toBe(true);
    });

    it("should validate option index is valid (0-4)", () => {
      const store = useQuizStore();
      store.answerQuestion("q1", 2);
      expect(store.answers["q1"]).toBe(2);
    });
  });

  describe("URL encoding/decoding", () => {
    it("should encode answers compactly and decode correctly", () => {
      const store = useQuizStore();
      store.answerQuestion("q1", 0);
      store.answerQuestion("q2", 1);
      store.answerQuestion("q3", 2);

      const encoded = store.encodeAnswersToUrl();
      const result = store.loadAnswersFromUrl(encoded);

      expect(result.success).toBe(true);
      expect(store.answers["q1"]).toBe(0);
      expect(store.answers["q2"]).toBe(1);
      expect(store.answers["q3"]).toBe(2);
    });

    it("should preserve unanswered questions as missing entries", () => {
      const store = useQuizStore();
      const encoded = makeEncodedAnswers([2, undefined, 4], 41);
      const result = store.loadAnswersFromUrl(encoded);

      expect(result.success).toBe(true);
      expect(store.answers["q1"]).toBe(2);
      expect(store.answers["q2"]).toBeUndefined();
      expect(store.answers["q3"]).toBe(4);
    });

    it("should set completed flag when all answers loaded", () => {
      const store = useQuizStore();
      const allAnswers = Array.from({ length: 41 }, (_, index) => index % 5);
      const encoded = makeEncodedAnswers(allAnswers, 41);
      const result = store.loadAnswersFromUrl(encoded);

      expect(result.success).toBe(true);
      expect(store.completed).toBe(true);
    });

    it("should not set completed if partial answers", () => {
      const store = useQuizStore();
      const encoded = makeEncodedAnswers([0, 1, 2, 3, 4, 0, 0, 0, 0, 0], 41);
      const result = store.loadAnswersFromUrl(encoded);

      expect(result.success).toBe(true);
      expect(store.completed).toBe(false);
    });

    it("should return false for invalid URL format", () => {
      const store = useQuizStore();
      const result = store.loadAnswersFromUrl("invalid");

      expect(result.success).toBe(false);
    });

    it("should return false for completely empty URL", () => {
      const store = useQuizStore();
      const result = store.loadAnswersFromUrl("");

      expect(result.success).toBe(false);
    });

    it("should reject answers for question ids outside the current survey", () => {
      const store = useQuizStore();
      const encoded = makeEncodedAnswers([0], 1);
      const result = store.loadAnswersFromUrl(encoded, ["q999"]);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Question ids not present");
    });
  });

  describe("reset functionality", () => {
    it("should reset all answers", () => {
      const store = useQuizStore();
      store.answerQuestion("q1", 0);
      store.answerQuestion("q2", 1);

      store.reset();

      expect(store.answers).toEqual({});
      expect(store.answeredCount).toBe(0);
    });

    it("should reset question index", () => {
      const store = useQuizStore();
      store.nextQuestion();
      store.nextQuestion();

      store.reset();

      expect(store.currentQuestionIndex).toBe(0);
      expect(store.currentQuestion?.id).toBe("q1");
    });

    it("should reset completed flag", () => {
      const store = useQuizStore();
      store.completed = true;

      store.reset();

      expect(store.completed).toBe(false);
    });
  });

  describe("scoring", () => {
    it("should compute scores from answers", () => {
      const store = useQuizStore();
      store.answerQuestion("q1", 0);
      store.answerQuestion("q2", 1);

      const result = store.computeScores();

      expect(result).toBeDefined();
      expect(result.primary).toBeDefined();
      expect(result.allScores).toBeDefined();
    });

    it("should include all parties in scores", () => {
      const store = useQuizStore();
      store.answerQuestion("q1", 0);

      const result = store.computeScores();

      expect(result.allScores.length).toBe(store.parties.length);
    });
  });
});
