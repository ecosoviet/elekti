<template>
  <button
    @click="$emit('select')"
    class="quiz-option"
    :class="{ 'quiz-option--selected': isSelected }"
    role="radio"
    :aria-checked="isSelected"
  >
    <span class="quiz-option__circle" />
    <span class="quiz-option__text">{{ label }}</span>
  </button>
</template>

<script setup lang="ts">
  defineProps<{
    label: string;
    isSelected: boolean;
  }>();

  defineEmits<{
    select: [];
  }>();
</script>

<style scoped>
  .quiz-option {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-lg);
    background-color: var(--color-surface);
    border: 2px solid var(--color-border);
    border-radius: var(--radius-lg);
    text-align: left;
    cursor: pointer;
    transition: all var(--transition-fast);
    width: 100%;
  }

  .quiz-option:hover {
    border-color: var(--color-primary-light);
    background-color: var(--color-surface-elevated);
    transform: translateX(4px);
  }

  .quiz-option--selected {
    border-color: var(--color-primary);
    background-color: var(--color-primary);
    color: white;
  }

  .quiz-option--selected:hover {
    border-color: var(--color-primary-dark);
    background-color: var(--color-primary-dark);
  }

  .quiz-option__circle {
    width: 24px;
    height: 24px;
    border: 2px solid currentColor;
    border-radius: var(--radius-full);
    flex-shrink: 0;
    position: relative;
  }

  .quiz-option--selected .quiz-option__circle::after {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 12px;
    height: 12px;
    background-color: currentColor;
    border-radius: var(--radius-full);
  }

  .quiz-option__text {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-medium);
  }

  @media (max-width: 640px) {
    .quiz-option {
      padding: var(--space-md);
    }

    .quiz-option__text {
      font-size: var(--font-size-base);
    }
  }
</style>
