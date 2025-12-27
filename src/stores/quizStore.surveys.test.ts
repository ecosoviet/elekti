import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useQuizStore } from "./quizStore";
import { useUiStore } from "./uiStore";

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

describe("quizStore surveys", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("loads quick survey (12 questions)", () => {
    const quiz = useQuizStore();
    const ui = useUiStore();
    ui.setMode("quick");
    quiz.loadSurvey("quick");
    expect(quiz.mode).toBe("quick");
    expect(quiz.questions.length).toBe(12);
  });

  it("loads balanced survey (24 questions)", () => {
    const quiz = useQuizStore();
    quiz.loadSurvey("balanced");
    expect(quiz.mode).toBe("balanced");
    expect(quiz.questions.length).toBe(24);
  });

  it("encodes/decodes with custom question order from URL", () => {
    const quiz = useQuizStore();
    const ids = ["q1", "q2", "q3", "q4"];
    quiz.loadSurvey("full", ids);
    quiz.answerQuestion("q1", 0);
    quiz.answerQuestion("q3", 2);
    const enc = quiz.encodeAnswersToUrl();
    quiz.loadSurvey("full", ids);
    const result = quiz.loadAnswersFromUrl(enc, ids);
    expect(result.success).toBe(true);
    expect(quiz.answers["q1"]).toBe(0);
    expect(quiz.answers["q2"]).toBeUndefined();
    expect(quiz.answers["q3"]).toBe(2);
    expect(Object.keys(quiz.answers).length).toBe(2);
  });
});
