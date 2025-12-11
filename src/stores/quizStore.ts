import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";

import partiesData from "../data/parties.json";
import {
  computeScores as computeScoresUtility,
  type Party,
  type Question,
  type QuizResult,
} from "../utils/scoring";
import { decodeAndValidateAnswers } from "../validators/answers";

export const useQuizStore = defineStore("quiz", () => {
  const answers = ref<Record<string, number>>({});
  const currentQuestionIndex = ref(0);
  const completed = ref(false);

  const parties = [...(partiesData as Party[])].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  interface QuestionMetadata {
    id: string;
    textKey: string;
    axis: string;
    weight: number;
    options: Array<{ value: number; label: string }>;
  }

  function loadQuestionsFromI18n(): Question[] {
    const { t } = useI18n();

    const questionsMetadata = import.meta.glob<{
      questions: QuestionMetadata[];
    }>("../data/questions.json", {
      eager: true,
      import: "default",
    })["../data/questions.json"] as { questions: QuestionMetadata[] };

    if (!questionsMetadata?.questions) {
      throw new Error("Could not load questions from questions.json");
    }

    return questionsMetadata.questions.map((q: QuestionMetadata) => ({
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
    return computeScoresUtility(answers.value, parties);
  }

  function reset() {
    answers.value = {};
    currentQuestionIndex.value = 0;
    completed.value = false;
  }

  function encodeAnswersToUrl(): string {
    const answerArray = questions.value.map((q) => {
      const answer = answers.value[q.id];
      return answer === undefined ? "" : answer.toString();
    });
    const joined = answerArray.join(",");
    return btoa(joined);
  }

  function loadAnswersFromUrl(encoded: string): boolean {
    const questionIds = questions.value.map((q) => q.id);
    const result = decodeAndValidateAnswers(encoded, questionIds);

    if (result.success && result.answers) {
      answers.value = result.answers;
      completed.value =
        Object.keys(result.answers).length === questions.value.length;
      return true;
    }

    return false;
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
