<template>
  <div class="quiz">
    <div class="quiz__container">
      <div class="quiz__header">
        <ProgressBar :progress="quizStore.progress" />
        <p class="quiz__progress-text">
          {{
            $t("quiz.question", {
              number: quizStore.currentQuestionIndex + 1,
              total: quizStore.questions.length,
            })
          }}
        </p>
      </div>

      <div v-if="currentQuestion" class="quiz__content">
        <QuizQuestion
          :question="currentQuestion"
          :model-value="quizStore.answers[currentQuestion.id]"
          @update:model-value="handleAnswer"
        />
      </div>

      <div class="quiz__actions">
        <button
          v-if="quizStore.currentQuestionIndex > 0"
          @click="quizStore.previousQuestion()"
          class="quiz__button quiz__button--secondary"
        >
          <ChevronLeft :size="20" />
          {{ $t("quiz.back") }}
        </button>

        <button
          @click="handleSkip"
          class="quiz__button quiz__button--secondary"
        >
          {{ $t("quiz.skip") }}
          <ChevronRight :size="20" />
        </button>

        <button
          v-if="quizStore.canProceed"
          @click="handleNext"
          class="quiz__button quiz__button--primary"
        >
          {{ isLastQuestion ? $t("quiz.finish") : $t("quiz.next") }}
          <ChevronRight :size="20" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ChevronLeft, ChevronRight } from "lucide-vue-next";
  import { computed } from "vue";
  import { useRouter } from "vue-router";
  import ProgressBar from "../components/ProgressBar.vue";
  import QuizQuestion from "../components/QuizQuestion.vue";
  import { useQuizStore } from "../stores/quizStore";

  const router = useRouter();
  const quizStore = useQuizStore();

  const currentQuestion = computed(() => quizStore.currentQuestion);
  const isLastQuestion = computed(
    () => quizStore.currentQuestionIndex === quizStore.questions.length - 1
  );

  function handleAnswer(optionIndex: number) {
    if (currentQuestion.value) {
      quizStore.answerQuestion(currentQuestion.value.id, optionIndex);
    }
  }

  function handleNext() {
    if (isLastQuestion.value) {
      quizStore.completed = true;
      router.push("/results");
    } else {
      quizStore.nextQuestion();
    }
  }

  function handleSkip() {
    if (isLastQuestion.value) {
      quizStore.completed = true;
      router.push("/results");
    } else {
      quizStore.skipQuestion();
    }
  }
</script>

<style scoped>
  .quiz {
    min-height: calc(100vh - var(--header-height) - var(--footer-height));
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-lg);
  }

  .quiz__container {
    max-width: var(--max-width-md);
    width: 100%;
  }

  .quiz__header {
    margin-bottom: var(--space-xl);
  }

  .quiz__progress-text {
    text-align: center;
    margin-top: var(--space-sm);
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    font-weight: var(--font-weight-medium);
  }

  .quiz__content {
    margin-bottom: var(--space-xl);
    min-height: auto;
  }

  .quiz__actions {
    display: flex;
    gap: var(--space-md);
    justify-content: space-between;
    flex-wrap: wrap;
    position: sticky;
    bottom: 0;
    background: linear-gradient(to top, var(--color-background), transparent);
    padding: var(--space-lg) 0;
    z-index: 10;
  }
  .quiz__button {
    display: inline-flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-md) var(--space-lg);
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-medium);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all var(--transition-fast);
    border: none;
  }

  .quiz__button--primary {
    background-color: var(--color-primary);
    color: white;
    margin-left: auto;
  }

  .quiz__button--primary:hover {
    background-color: var(--color-primary-dark);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }

  .quiz__button--secondary {
    background-color: var(--color-surface);
    color: var(--color-text-primary);
    border: 1px solid var(--color-border);
  }

  .quiz__button--secondary:hover {
    background-color: var(--color-surface-elevated);
    border-color: var(--color-primary);
  }

  @media (max-width: 640px) {
    .quiz {
      padding: var(--space-lg);
    }

    .quiz__actions {
      flex-direction: column;
    }

    .quiz__button {
      width: 100%;
      justify-content: center;
    }

    .quiz__button--primary {
      order: -1;
      margin-left: 0;
    }
  }
</style>
