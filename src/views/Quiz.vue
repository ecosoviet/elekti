<script setup lang="ts">
  import { ChevronLeft, ChevronRight } from "lucide-vue-next";
  import { computed, ref } from "vue";
  import { useRouter } from "vue-router";
  import ProgressBar from "../components/ProgressBar.vue";
  import QuizQuestion from "../components/QuizQuestion.vue";
  import { useQuizStore } from "../stores/quizStore";

  const router = useRouter();
  const quizStore = useQuizStore();
  const isTransitioning = ref(false);

  const currentQuestion = computed(() => quizStore.currentQuestion);
  const isLastQuestion = computed(
    () => quizStore.currentQuestionIndex === quizStore.questions.length - 1
  );

  function handleAnswer(optionIndex: number) {
    if (currentQuestion.value) {
      quizStore.answerQuestion(currentQuestion.value.id, optionIndex);
      isTransitioning.value = true;
      setTimeout(() => {
        if (isLastQuestion.value) {
          handleFinish();
        } else {
          quizStore.nextQuestion();
          setTimeout(() => {
            isTransitioning.value = false;
          }, 50);
        }
      }, 300);
    }
  }

  function handleNext() {
    if (isLastQuestion.value) {
      handleFinish();
    } else {
      quizStore.nextQuestion();
    }
  }

  function handleFinish() {
    quizStore.completed = true;
    router.push("/results");
  }
</script>

<template>
  <div class="quiz">
    <div class="quiz__wrapper">
      <div class="quiz__container">
        <div class="quiz__header">
          <ProgressBar :progress="quizStore.progress">
            {{
              $t("quiz.question", {
                number: quizStore.currentQuestionIndex + 1,
                total: quizStore.questions.length,
              })
            }}
          </ProgressBar>
        </div>

        <div
          v-if="currentQuestion"
          class="quiz__content"
          :class="{ 'quiz__content--transitioning': isTransitioning }"
        >
          <QuizQuestion
            :question="currentQuestion"
            :model-value="quizStore.answers[currentQuestion.id]"
            @update:model-value="handleAnswer"
          />
        </div>
      </div>

      <div class="quiz__navigation">
        <button
          v-if="quizStore.currentQuestionIndex > 0"
          @click="quizStore.previousQuestion()"
          class="quiz__nav-button quiz__nav-button--back"
          :title="$t('quiz.back')"
        >
          <ChevronLeft :size="24" />
        </button>

        <button
          v-if="quizStore.currentQuestionIndex < quizStore.questions.length - 1"
          @click="handleNext"
          class="quiz__nav-button quiz__nav-button--next"
          :title="$t('quiz.next')"
        >
          <ChevronRight :size="24" />
        </button>
        <button
          v-else
          @click="handleFinish"
          class="quiz__nav-button quiz__nav-button--finish"
          :title="$t('quiz.finish')"
        >
          <ChevronRight :size="24" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .quiz {
    min-height: calc(100vh - var(--header-height) - var(--footer-height));
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-lg);
  }

  .quiz__wrapper {
    display: flex;
    align-items: center;
    gap: var(--space-xl);
    width: 100%;
    max-width: 900px;
  }

  .quiz__container {
    flex: 1;
    max-width: 700px;
    width: 100%;
  }

  .quiz__header {
    margin-bottom: var(--space-lg);
  }

  .quiz__content {
    margin-bottom: var(--space-xl);
    min-height: auto;
    animation: fadeIn 0.4s ease-out;
    transition: opacity 0.25s ease-out;
  }

  .quiz__content--transitioning {
    opacity: 0;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .quiz__navigation {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
    align-items: center;
    justify-content: center;
  }

  .quiz__nav-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 64px;
    border-radius: 50%;
    border: 2px solid var(--color-border);
    background-color: var(--color-surface);
    color: var(--color-text-primary);
    cursor: pointer;
    transition: all var(--transition-base);
    box-shadow: var(--shadow-md);
  }

  .quiz__nav-button--next,
  .quiz__nav-button--finish {
    background-color: var(--color-success);
    color: white;
    border-color: var(--color-success);
    box-shadow: 0 8px 16px rgba(52, 168, 83, 0.3);
  }

  .quiz__nav-button--next:hover,
  .quiz__nav-button--finish:hover {
    background-color: #2d8a47;
    border-color: #2d8a47;
    transform: translateY(-2px);
    box-shadow: 0 12px 24px rgba(52, 168, 83, 0.4);
  }

  .quiz__nav-button--back {
    border-color: var(--color-border);
  }

  .quiz__nav-button--back:hover {
    background-color: var(--color-surface-elevated);
    border-color: var(--color-primary);
    transform: translateY(-2px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  }

  @media (max-width: 768px) {
    .quiz {
      padding: var(--space-lg) var(--space-md);
    }

    .quiz__wrapper {
      flex-direction: column;
      gap: var(--space-xl);
      max-width: none;
    }

    .quiz__container {
      max-width: none;
    }

    .quiz__navigation {
      flex-direction: row;
      width: 100%;
      justify-content: center;
      gap: var(--space-md);
      align-items: center;
    }

    .quiz__nav-button {
      width: 56px;
      height: 56px;
    }

    .quiz__nav-button--back {
      order: -1;
      opacity: 0.6;
    }

    .quiz__nav-button--back:hover {
      opacity: 1;
    }
  }
</style>
