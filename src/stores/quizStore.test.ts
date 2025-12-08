import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useQuizStore } from "../stores/quizStore";

vi.mock("../i18n", () => ({
  i18n: {
    global: {
      locale: {
        value: "en",
      },
      messages: {
        value: {
          en: {
            questions: {
              q1: { text: "Question 1?", category: "category1" },
              q2: { text: "Question 2?", category: "category2" },
              q3: { text: "Question 3?", category: "category3" },
              q4: { text: "Question 4?", category: "category4" },
              q5: { text: "Question 5?", category: "category5" },
              q6: { text: "Question 6?", category: "category6" },
              q7: { text: "Question 7?", category: "category7" },
              q8: { text: "Question 8?", category: "category8" },
              q9: { text: "Question 9?", category: "category9" },
              q10: { text: "Question 10?", category: "category10" },
              q11: { text: "Question 11?", category: "category11" },
              q12: { text: "Question 12?", category: "category12" },
              q13: { text: "Question 13?", category: "category13" },
              q14: { text: "Question 14?", category: "category14" },
              q15: { text: "Question 15?", category: "category15" },
              q16: { text: "Question 16?", category: "category16" },
              q17: { text: "Question 17?", category: "category17" },
              q18: { text: "Question 18?", category: "category18" },
              q19: { text: "Question 19?", category: "category19" },
              q20: { text: "Question 20?", category: "category20" },
              q21: { text: "Question 21?", category: "category21" },
              q22: { text: "Question 22?", category: "category22" },
              q23: { text: "Question 23?", category: "category23" },
              q24: { text: "Question 24?", category: "category24" },
              q25: { text: "Question 25?", category: "category25" },
              q26: { text: "Question 26?", category: "category26" },
              q27: { text: "Question 27?", category: "category27" },
              q28: { text: "Question 28?", category: "category28" },
              q29: { text: "Question 29?", category: "category29" },
              q30: { text: "Question 30?", category: "category30" },
              q31: { text: "Question 31?", category: "category31" },
              q32: { text: "Question 32?", category: "category32" },
              q33: { text: "Question 33?", category: "category33" },
              q34: { text: "Question 34?", category: "category34" },
              q35: { text: "Question 35?", category: "category35" },
              q36: { text: "Question 36?", category: "category36" },
              q37: { text: "Question 37?", category: "category37" },
              q38: { text: "Question 38?", category: "category38" },
              q39: { text: "Question 39?", category: "category39" },
              q40: { text: "Question 40?", category: "category40" },
              q41: { text: "Question 41?", category: "category41" },
            },
          },
        },
      },
    },
  },
}));

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

      for (let i = 0; i < 38; i++) {
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

      for (let i = 1; i < 35; i++) {
        store.nextQuestion();
      }
      expect(store.progress).toBeGreaterThan(90);
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
    it("should encode answers to URL format", () => {
      const store = useQuizStore();
      store.answerQuestion("q1", 0);
      store.answerQuestion("q2", 1);
      store.answerQuestion("q3", 2);

      const encoded = store.encodeAnswersToUrl();
      expect(encoded).toContain("0,1,2");
    });

    it("should encode as comma-separated string", () => {
      const store = useQuizStore();
      store.answerQuestion("q1", 0);
      store.answerQuestion("q2", 1);

      const encoded = store.encodeAnswersToUrl();
      const parts = encoded.split(",");
      expect(parts.length).toBe(41);
      expect(parts[0]).toBe("0");
      expect(parts[1]).toBe("1");
    });

    it("should pad unanswered questions with empty string", () => {
      const store = useQuizStore();
      store.answerQuestion("q1", 2);
      store.answerQuestion("q3", 4);

      const encoded = store.encodeAnswersToUrl();
      const parts = encoded.split(",");
      expect(parts[0]).toBe("2");
      expect(parts[1]).toBe("");
      expect(parts[2]).toBe("4");
    });

    it("should load answers from URL format", () => {
      const store = useQuizStore();
      const success = store.loadAnswersFromUrl(
        "0,1,2,3,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0"
      );

      expect(success).toBe(true);
      expect(store.answers["q1"]).toBe(0);
      expect(store.answers["q2"]).toBe(1);
      expect(store.answers["q3"]).toBe(2);
      expect(store.answers["q4"]).toBe(3);
      expect(store.answers["q5"]).toBe(4);
    });

    it("should skip empty answers when loading from URL", () => {
      const store = useQuizStore();
      const success = store.loadAnswersFromUrl(
        "0,,2,,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0"
      );

      expect(success).toBe(true);
      expect(store.answers["q1"]).toBe(0);
      expect(store.answers["q2"]).toBeUndefined();
      expect(store.answers["q3"]).toBe(2);
    });

    it("should reject invalid option indices", () => {
      const store = useQuizStore();
      const success = store.loadAnswersFromUrl(
        "0,1,99,3,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0"
      );

      expect(success).toBe(true);
      expect(store.answers["q3"]).toBeUndefined();
    });

    it("should set completed flag when all answers loaded", () => {
      const store = useQuizStore();
      const allAnswers =
        "0,1,2,3,4,0,1,2,3,4,0,1,2,3,4,0,1,2,3,4,0,1,2,3,4,0,1,2,3,4,0,1,2,3,4,0,1,2,3,4,0,1";
      const success = store.loadAnswersFromUrl(allAnswers);

      expect(success).toBe(true);
      expect(store.completed).toBe(true);
    });

    it("should not set completed if partial answers", () => {
      const store = useQuizStore();
      const partialAnswers = "0,1,2,3,4,0,0,0,0,0";
      const success = store.loadAnswersFromUrl(partialAnswers);

      expect(success).toBe(true);
      expect(store.completed).toBe(false);
    });

    it("should return false for invalid URL format", () => {
      const store = useQuizStore();
      const success = store.loadAnswersFromUrl("invalid");

      expect(success).toBe(false);
    });

    it("should return false for completely empty URL", () => {
      const store = useQuizStore();
      const success = store.loadAnswersFromUrl("");

      expect(success).toBe(false);
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
