import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";

import partiesData from "../data/parties.json";
import { i18n } from "../i18n";
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
    const locale = i18n.global.locale.value as string;
    const allMessages = i18n.global.messages.value as unknown as Record<
      string,
      Record<string, unknown>
    >;
    const messages = allMessages[locale];
    const questionsData = (messages?.questions ?? {}) as Record<
      string,
      { text: string; category: string }
    >;
    const questionIds = [
      "q1",
      "q2",
      "q3",
      "q4",
      "q5",
      "q6",
      "q7",
      "q8",
      "q9",
      "q10",
      "q11",
      "q12",
      "q13",
      "q14",
      "q15",
      "q16",
      "q17",
      "q18",
      "q19",
      "q20",
      "q21",
      "q22",
      "q23",
      "q24",
      "q25",
      "q26",
      "q27",
      "q28",
      "q29",
      "q30",
      "q31",
      "q32",
      "q33",
      "q34",
      "q35",
      "q36",
      "q37",
      "q38",
      "q39",
      "q40",
    ];

    return questionIds.map((id) => {
      const qData = questionsData[id];
      if (!qData) {
        throw new Error(`Question ${id} not found in locale ${locale}`);
      }
      return {
        id,
        text: qData.text,
        category: qData.category,
        options: [
          "Strongly Agree",
          "Agree",
          "Neutral",
          "Disagree",
          "Strongly Disagree",
        ],
      };
    });
  }

  const questions = ref<Question[]>(loadQuestionsFromI18n());

  watch(
    () => i18n.global.locale.value,
    () => {
      questions.value = loadQuestionsFromI18n();
    }
  );

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
