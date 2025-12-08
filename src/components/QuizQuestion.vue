<script setup lang="ts">
  import { computed, ref, watch } from "vue";
  import { useI18n } from "vue-i18n";
  import QuizOption from "./QuizOption.vue";

  interface Question {
    id: string;
    text: string;
    axis: string;
    weight: number;
    options: Array<{ value: number; label: string }>;
  }

  const properties = defineProps<{
    question: Question;
    modelValue?: number;
    disabled?: boolean;
  }>();

  const emit = defineEmits<{
    "update:modelValue": [value: number];
  }>();

  const { t } = useI18n();
  const selectedOption = ref<number | undefined>(properties.modelValue);

  const optionLabels = computed(() => [
    t("options.stronglyAgree"),
    t("options.agree"),
    t("options.neutral"),
    t("options.disagree"),
    t("options.stronglyDisagree"),
  ]);

  watch(
    () => properties.modelValue,
    (newValue) => {
      selectedOption.value = newValue;
    }
  );

  function selectOption(index: number) {
    if (properties.disabled) {
      return;
    }
    selectedOption.value = index;
    emit("update:modelValue", index);
  }
</script>

<template>
  <div class="quiz-question">
    <h2 class="quiz-question__text">{{ question.text }}</h2>

    <div
      class="quiz-question__options"
      role="radiogroup"
      :aria-labelledby="question.id"
      :class="{ 'quiz-question__options--disabled': disabled }"
    >
      <QuizOption
        v-for="(option, index) in optionLabels"
        :key="index"
        :label="option"
        :is-selected="selectedOption === index"
        :disabled="disabled"
        @select="selectOption(index)"
      />
    </div>
  </div>
</template>

<style scoped>
  .quiz-question {
    width: 100%;
  }

  .quiz-question__text {
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
    margin-bottom: var(--space-lg);
    line-height: var(--line-height-snug);
    height: 6em;
    overflow-y: auto;
    display: flex;
    align-items: center;
    animation: fadeInUp 0.5s ease-out;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .quiz-question__options {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    animation: fadeInUp 0.5s ease-out 0.1s both;
  }

  .quiz-question__options--disabled {
    pointer-events: none;
    opacity: 0.6;
  }

  @media (max-width: 640px) {
    .quiz-question__text {
      font-size: var(--font-size-xl);
    }

    .quiz-question__options {
      gap: var(--space-md);
    }
  }
</style>
