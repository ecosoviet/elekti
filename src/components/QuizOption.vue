<script setup lang="ts">
  defineProps<{
    label: string;
    isSelected: boolean;
  }>();

  defineEmits<{
    select: [];
  }>();
</script>

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

<style scoped>
  .quiz-option {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-md) var(--space-lg);
    background-color: var(--color-surface);
    border: 2px solid var(--color-border);
    border-radius: var(--radius-lg);
    text-align: left;
    cursor: pointer;
    transition: all var(--transition-base);
    width: 100%;
    min-height: 52px;
    font-size: var(--font-size-base);
  }

  .quiz-option:hover {
    border-color: var(--color-primary-light);
    background-color: var(--color-surface-elevated);
    box-shadow: var(--shadow-md);
    transform: scale(1.02);
  }

  .quiz-option--selected {
    border-color: var(--color-primary);
    background-color: var(--color-primary);
    color: white;
    box-shadow: 0 8px 16px rgba(26, 115, 232, 0.25);
  }

  .quiz-option--selected:hover {
    border-color: var(--color-primary-dark);
    background-color: var(--color-primary-dark);
    box-shadow: 0 8px 20px rgba(26, 115, 232, 0.35);
  }

  .quiz-option__circle {
    width: 22px;
    height: 22px;
    border: 2.5px solid currentColor;
    border-radius: var(--radius-full);
    flex-shrink: 0;
    position: relative;
    transition: all var(--transition-fast);
  }

  .quiz-option:hover .quiz-option__circle {
    transform: scale(1.15);
  }

  .quiz-option--selected .quiz-option__circle::after {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0);
    width: 11px;
    height: 11px;
    background-color: currentColor;
    border-radius: var(--radius-full);
    animation: scaleIn 0.3s ease-out forwards;
  }

  @keyframes scaleIn {
    to {
      transform: translate(-50%, -50%) scale(1);
    }
  }

  .quiz-option__text {
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-medium);
    flex: 1;
  }

  @media (max-width: 640px) {
    .quiz-option {
      padding: var(--space-md) var(--space-lg);
      min-height: 56px;
    }

    .quiz-option__circle {
      width: 24px;
      height: 24px;
      border-width: 2px;
    }

    .quiz-option__text {
      font-size: var(--font-size-base);
    }
  }
</style>
