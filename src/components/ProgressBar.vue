<script setup lang="ts">
  defineProps<{
    progress: number;
  }>();
</script>

<template>
  <div class="progress-bar">
    <div
      class="progress-bar__track"
      role="progressbar"
      :aria-valuenow="progress"
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <div class="progress-bar__fill" :style="{ width: `${progress}%` }" />
    </div>
    <div v-if="$slots.default" class="progress-bar__label">
      <slot />
    </div>
  </div>
</template>

<style scoped>
  .progress-bar {
    width: 100%;
  }

  .progress-bar__track {
    width: 100%;
    height: 6px;
    background: repeating-linear-gradient(
      135deg,
      color-mix(in srgb, var(--color-border-light) 90%, transparent),
      color-mix(in srgb, var(--color-border-light) 90%, transparent) 12px,
      color-mix(in srgb, var(--color-border) 90%, transparent) 12px,
      color-mix(in srgb, var(--color-border) 90%, transparent) 18px
    );
    border-radius: 0;
    overflow: hidden;
    margin-bottom: var(--space-md);
  }

  .progress-bar__fill {
    height: 100%;
    background: linear-gradient(
      90deg,
      var(--color-primary),
      color-mix(in srgb, var(--color-secondary) 30%, var(--color-primary))
    );
    transition: width var(--transition-base);
    border-radius: 0;
  }

  .progress-bar__label {
    font-size: var(--font-size-sm);
    color: var(--color-text-primary);
    font-weight: var(--font-weight-semibold);
    text-align: center;
    letter-spacing: 0.03em;
  }
</style>
