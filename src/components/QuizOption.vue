<script setup lang="ts">
  defineProps<{
    label: string;
    isSelected: boolean;
    disabled?: boolean;
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
    :disabled="disabled"
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
    border-radius: 0;
    position: relative;
    text-align: left;
    cursor: pointer;
    transition: all var(--transition-base);
    width: 100%;
    min-height: 52px;
    font-size: var(--font-size-base);
  }

  @media (max-width: 640px) {
    .quiz-option {
      padding: var(--space-sm) var(--space-md);
      min-height: 48px;
      font-size: var(--font-size-sm);
      gap: var(--space-sm);
    }
  }

  .quiz-option:hover {
    border-color: var(--color-secondary);
    background-color: var(--color-surface-elevated);
    box-shadow: var(--shadow-md);
    transform: translateY(-1px);
  }

  .quiz-option--selected {
    border-color: var(--color-primary-dark);
    background: linear-gradient(
      115deg,
      var(--color-primary),
      color-mix(in srgb, var(--color-secondary) 30%, var(--color-primary))
    );
    color: white;
    box-shadow: var(--shadow-lg);
  }

  .quiz-option--selected:hover {
    border-color: var(--color-secondary-dark);
    background: linear-gradient(
      115deg,
      var(--color-primary-dark),
      color-mix(
        in srgb,
        var(--color-secondary-dark) 45%,
        var(--color-primary-dark)
      )
    );
    box-shadow: var(--shadow-xl);
  }

  .quiz-option__circle {
    width: 18px;
    height: 18px;
    border: 3px solid currentColor;
    flex-shrink: 0;
    position: relative;
    transition: all var(--transition-fast);
  }

  @media (max-width: 640px) {
    .quiz-option__circle {
      width: 18px;
      height: 18px;
      border-width: 2px;
    }
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
    width: 10px;
    height: 10px;
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
    letter-spacing: 0.01em;
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
