import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";

import partiesData from "../data/parties.json";
import {
  computeScores as computeScoresUtil,
  type Party,
  type Question,
  type QuizResult,
} from "../utils/scoring";

export const useQuizStore = defineStore("quiz", () => {
  const answers = ref<Record<string, number>>({});
  const currentQuestionIndex = ref(0);
  const completed = ref(false);

  const parties = partiesData as Party[];

  function loadQuestionsFromI18n(): Question[] {
    const { t } = useI18n();

    const questionsMetadata = import.meta.glob<{
      questions: Array<{
        id: string;
        textKey: string;
        axis: string;
        weight: number;
        options: Array<{ value: number; label: string }>;
      }>;
    }>("../data/questions.json", {
      eager: true,
      import: "default",
    })["../data/questions.json"] as any;

    if (!questionsMetadata?.questions) {
      throw new Error("Could not load questions from questions.json");
    }

    return questionsMetadata.questions.map((q: any) => ({
      ...q,
      text: t(q.textKey),
    }));
  }

  const questions = ref<Question[]>(loadQuestionsFromI18n());

  const currentQuestion = computed(
    () => questions.value[currentQuestionIndex.value]
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
    return computeScoresUtil(answers.value, parties);
  }

  function reset() {
    answers.value = {};
    currentQuestionIndex.value = 0;
    completed.value = false;
  }

  function encodeAnswersToUrl(): string {
    const answerArray = questions.value.map((q) => {
      const answer = answers.value[q.id];
      return answer !== undefined ? answer.toString() : "";
    });
    return answerArray.join(",");
  }

  function loadAnswersFromUrl(encoded: string): boolean {
    try {
      const parts = encoded.split(",");
      const newAnswers: Record<string, number> = {};
      let hasValidAnswers = false;

      questions.value.forEach((q, index) => {
        const value = parts[index];
        if (value && value !== "") {
          const numValue = parseInt(value);
          if (!isNaN(numValue) && numValue >= 0 && numValue <= 4) {
            newAnswers[q.id] = numValue;
            hasValidAnswers = true;
          }
        }
      });

      if (hasValidAnswers) {
        answers.value = newAnswers;
        completed.value =
          Object.keys(newAnswers).length === questions.value.length;
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  return {
    answers,
    currentQuestionIndex,
    completed,
    currentQuestion,
    progress,
    answeredCount,
    canProceed,
    questions,
    parties,
    answerQuestion,
    nextQuestion,
    previousQuestion,
    skipQuestion,
    computeScores,
    reset,
    encodeAnswersToUrl,
    loadAnswersFromUrl,
  };
});
