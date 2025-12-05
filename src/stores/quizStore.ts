import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";

import partiesData from "../data/parties.json";
import scoringData from "../data/scoring.json";
import { i18n } from "../i18n";

interface Party {
  id: string;
  name: string;
  short: string;
  descriptionKey: string;
  colour: string;
  logo: string;
}

interface Question {
  id: string;
  text: string;
  category: string;
  options: string[];
}

interface PartyScore {
  partyId: string;
  rawScore: number;
  normalizedScore: number;
  party: Party;
}

interface QuizResult {
  primary: PartyScore;
  alternatives: PartyScore[];
  allScores: PartyScore[];
  confidence: "high" | "medium" | "low";
  timestamp: number;
}

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
    console.log("Loaded messages for locale", locale, messages);
    const questionsData = (messages?.questions ?? {}) as Record<
      string,
      { text: string; category: string }
    >;
    console.log("Loaded questionsData:", questionsData);
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
    const rawScores: Record<string, number> = {};
    parties.forEach((party) => {
      rawScores[party.id] = 0;
    });

    const scoringQuestions = scoringData.questions;

    Object.entries(answers.value).forEach(([questionId, optionIndex]) => {
      const qNum = parseInt(questionId.substring(1));
      const scoringQuestion = scoringQuestions.find((q) => q.id === qNum);

      if (scoringQuestion && scoringQuestion.options[optionIndex]) {
        const scores = scoringQuestion.options[optionIndex].scores;

        Object.entries(scores).forEach(([partyKey, score]) => {
          const partyId = mapPartyKey(partyKey);
          if (rawScores[partyId] !== undefined) {
            rawScores[partyId] += score as number;
          }
        });
      }
    });

    const scoreValues = Object.values(rawScores);
    const minScore = Math.min(...scoreValues);
    const maxScore = Math.max(...scoreValues);
    const range = maxScore - minScore;

    const normalizedScores: Record<string, number> = {};
    if (range === 0) {
      Object.keys(rawScores).forEach((partyId) => {
        normalizedScores[partyId] = 0.5;
      });
    } else {
      Object.entries(rawScores).forEach(([partyId, score]) => {
        normalizedScores[partyId] = (score - minScore) / range;
      });
    }

    const partyScores: PartyScore[] = parties.map((party) => {
      const rawScore = rawScores[party.id];
      const normalizedScore = normalizedScores[party.id];
      return {
        partyId: party.id,
        rawScore: rawScore !== undefined ? rawScore : 0,
        normalizedScore: normalizedScore !== undefined ? normalizedScore : 0,
        party,
      };
    });

    partyScores.sort((a, b) => b.normalizedScore - a.normalizedScore);

    const primary = partyScores[0];
    if (!primary) {
      throw new Error("No party scores available");
    }

    const tieMargin = 0.02;

    const alternatives: PartyScore[] = [];
    for (let i = 1; i < partyScores.length; i++) {
      const score = partyScores[i];
      if (!score) {
        continue;
      }

      if (
        Math.abs(score.normalizedScore - primary.normalizedScore) >= tieMargin
      ) {
        alternatives.push(score);
        if (alternatives.length >= 2) {
          break;
        }
      } else {
        alternatives.push(score);
      }
    }

    let confidence: "high" | "medium" | "low" = "high";
    if (primary.normalizedScore < 0.15) {
      confidence = "low";
    } else if (
      primary.normalizedScore < 0.4 ||
      (alternatives.length > 0 &&
        alternatives[0] &&
        Math.abs(primary.normalizedScore - alternatives[0].normalizedScore) <
          tieMargin * 2)
    ) {
      confidence = "medium";
    }

    const result: QuizResult = {
      primary,
      alternatives,
      allScores: partyScores,
      confidence,
      timestamp: Date.now(),
    };

    return result;
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

function mapPartyKey(key: string): string {
  const mapping: Record<string, string> = {
    ANC: "anc",
    DA: "da",
    EFF: "eff",
    IFP: "ifp",
    MKP: "mk",
    PA: "pa",
    "VF+": "vfplus",
    ActionSA: "actionsa",
    ACDP: "acdp",
    UFC: "ufc",
    SACP: "sacp",
  };

  return mapping[key] || key.toLowerCase();
}
