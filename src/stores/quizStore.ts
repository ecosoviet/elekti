import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import { i18n } from "../i18n/i18n";

import partiesData from "../data/parties.json";
import surveysData from "../data/surveys.json";
import type { Party, Question, QuestionMetadata, QuizResult } from "../types";
import { STANDARD_OPTIONS } from "../utils/constants";
import { computeScores as computeScoresUtility } from "../utils/scoring";
import {
  decodeAndValidateAnswers,
  encodeAnswerValuesToBase64Url,
  UNANSWERED_VALUE,
} from "../validators/answers";
import { useUiStore, type SurveyMode } from "./uiStore";

export interface LoadAnswersResult {
  success: boolean;
  restoredCount?: number;
  completed?: boolean;
  error?: string;
}

export const useQuizStore = defineStore("quiz", () => {
  const answers = ref<Record<string, number>>({});
  const currentQuestionIndex = ref(0);
  const completed = ref(false);
  const ui = useUiStore();
  const mode = ref<SurveyMode>(ui.mode);
  const selectedQuestionIds = ref<string[]>([]);

  const parties = (partiesData as Party[]).toSorted((a, b) =>
    a.name.localeCompare(b.name)
  );

  const tGlobal = i18n.global.t as unknown as (key: string) => string;
  function translate(key: string): string {
    return tGlobal(key);
  }

  function loadQuestionsFromI18n(ids?: string[]): Question[] {
    const questionsMetadata = import.meta.glob<{
      questions: QuestionMetadata[];
    }>("../data/questions.json", {
      eager: true,
      import: "default",
    })["../data/questions.json"] as { questions: QuestionMetadata[] };

    if (!questionsMetadata?.questions) {
      throw new Error("Could not load questions from questions.json");
    }

    const base = questionsMetadata.questions;
    const filtered =
      ids && ids.length > 0
        ? ids
            .map((id) => base.find((q) => q.id === id))
            .filter((q): q is QuestionMetadata => !!q)
        : base;

    return filtered.map((q: QuestionMetadata) => ({
      ...q,
      text: translate(q.textKey),
      textKey: q.textKey,
      options: STANDARD_OPTIONS,
    }));
  }

  function loadSurvey(newMode: SurveyMode, questionIdsOverride?: string[]) {
    mode.value = newMode;
    ui.setMode(newMode);
    const surveyLists = (
      surveysData as unknown as { surveys: Record<string, string[]> }
    ).surveys;
    const ids =
      questionIdsOverride && questionIdsOverride.length > 0
        ? questionIdsOverride
        : surveyLists?.[newMode] || [];

    const q = loadQuestionsFromI18n(ids.length > 0 ? ids : undefined);
    selectedQuestionIds.value = q.map((qq) => qq.id);
    questions.value = q;
    reset();
  }

  const questions = ref<Question[]>([]);
  loadSurvey(mode.value);

  const currentQuestion = computed(
    () => questions.value[currentQuestionIndex.value]
  );
  const upcomingQuestion = computed(
    () => questions.value[currentQuestionIndex.value + 1]
  );
  const progress = computed(
    () => (currentQuestionIndex.value / questions.value.length) * 100
  );
  const answeredCount = computed(() => Object.keys(answers.value).length);
  const canProceed = computed(() => {
    const q = currentQuestion.value;
    return q ? answers.value[q.id] !== undefined : false;
  });

  function answerQuestion(questionId: string, optionIndex: number) {
    answers.value[questionId] = optionIndex;
  }

  function nextQuestion() {
    if (currentQuestionIndex.value < questions.value.length - 1) {
      currentQuestionIndex.value++;
    } else {
      completed.value = true;
    }
  }

  function previousQuestion() {
    if (currentQuestionIndex.value > 0) {
      currentQuestionIndex.value--;
    }
  }

  function skipQuestion() {
    nextQuestion();
  }

  function computeScores(): QuizResult {
    return computeScoresUtility(answers.value, parties);
  }

  function reset() {
    answers.value = {};
    currentQuestionIndex.value = 0;
    completed.value = false;
  }

  function encodeAnswersToUrl(): string {
    const values = questions.value.map((q) => {
      const answer = answers.value[q.id];
      return answer === undefined ? UNANSWERED_VALUE : answer;
    });

    return encodeAnswerValuesToBase64Url(values);
  }

  function loadAnswersFromUrl(
    encoded: string,
    questionIdsParam?: string[]
  ): LoadAnswersResult {
    if (!encoded) {
      return { success: false, error: "No encoded answers provided" };
    }

    try {
      const questionIds =
        questionIdsParam && questionIdsParam.length > 0
          ? questionIdsParam
          : questions.value.map((q) => q.id);

      const availableQuestionIds = new Set(questions.value.map((q) => q.id));
      const invalidQuestionIds = questionIds.filter(
        (id) => !availableQuestionIds.has(id)
      );

      if (invalidQuestionIds.length > 0) {
        return {
          success: false,
          error: `Question ids not present in current survey: ${invalidQuestionIds.join(", ")}`,
        };
      }

      if (questionIds.length === 0) {
        return { success: false, error: "No questions available to decode" };
      }

      const result = decodeAndValidateAnswers(encoded, questionIds);

      if (!result.success || !result.answers) {
        return {
          success: false,
          error: result.error || "Encoded answers could not be decoded",
        };
      }

      const allowedIds = new Set(questionIds);
      const filtered = Object.fromEntries(
        Object.entries(result.answers).filter(([id]) => allowedIds.has(id))
      );

      const restoredCount = Object.keys(filtered).length;

      if (restoredCount === 0) {
        return {
          success: false,
          error: "No valid answers found for the provided questions",
        };
      }

      answers.value = filtered;
      completed.value = restoredCount === allowedIds.size;

      return {
        success: true,
        restoredCount,
        completed: completed.value,
      };
    } catch {
      return { success: false, error: "Failed to load encoded answers" };
    }
  }

  watch(
    () => currentQuestionIndex.value,
    () => {
      const upcoming = upcomingQuestion.value;
      if (upcoming?.textKey) {
        translate(upcoming.textKey);
      }
    },
    { immediate: true }
  );

  return {
    answers,
    currentQuestionIndex,
    completed,
    mode,
    currentQuestion,
    progress,
    answeredCount,
    canProceed,
    questions,
    upcomingQuestion,
    selectedQuestionIds,
    parties,
    answerQuestion,
    nextQuestion,
    previousQuestion,
    skipQuestion,
    computeScores,
    reset,
    encodeAnswersToUrl,
    loadAnswersFromUrl,
    loadSurvey,
    getQuestions: () => questions.value,
    setCompleted: (value: boolean) => {
      completed.value = value;
    },
  };
});
