<template>
  <div class="quiz-question">
    <h2 class="quiz-question__text">{{ question.text }}</h2>
    <p class="quiz-question__category">{{ question.category }}</p>

    <div
      class="quiz-question__options"
      role="radiogroup"
      :aria-labelledby="question.id"
    >
      <QuizOption
        v-for="(option, index) in optionLabels"
        :key="index"
        :label="option"
        :is-selected="selectedOption === index"
        @select="selectOption(index)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from "vue";
  import { useI18n } from "vue-i18n";
  import QuizOption from "./QuizOption.vue";

  interface Question {
    id: string;
    text: string;
    category: string;
    options: string[];
  }

  const props = defineProps<{
    question: Question;
    modelValue?: number;
  }>();

  const emit = defineEmits<{
    "update:modelValue": [value: number];
  }>();

  const { t } = useI18n();
  const selectedOption = ref<number | undefined>(props.modelValue);

  const optionLabels = computed(() => [
    t("options.stronglyAgree"),
    t("options.agree"),
    t("options.neutral"),
    t("options.disagree"),
    t("options.stronglyDisagree"),
  ]);

  watch(
    () => props.modelValue,
    (newValue) => {
      selectedOption.value = newValue;
    }
  );

  function selectOption(index: number) {
    selectedOption.value = index;
    emit("update:modelValue", index);
  }
</script>

<style scoped>
  .quiz-question {
    width: 100%;
  }

  .quiz-question__text {
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
    margin-bottom: var(--space-sm);
    line-height: var(--line-height-tight);
  }

  .quiz-question__category {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: var(--space-xl);
  }

  .quiz-question__options {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  @media (max-width: 640px) {
    .quiz-question__text {
      font-size: var(--font-size-xl);
    }
  }
</style>
