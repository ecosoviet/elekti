<template>
  <div class="party-card" :style="{ borderLeftColor: party.colour }">
    <div class="party-card__header">
      <h3 class="party-card__name">{{ party.name }}</h3>
      <span
        class="party-card__short"
        :style="{ backgroundColor: party.colour }"
      >
        {{ party.short }}
      </span>
    </div>

    <p class="party-card__description">
      {{ $t(party.descriptionKey) }}
    </p>

    <a
      v-if="party.website"
      :href="party.website"
      target="_blank"
      rel="noopener noreferrer"
      class="party-card__website"
      :style="{ color: party.colour, borderColor: party.colour }"
    >
      Visit Website
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        <polyline points="15 3 21 3 21 9" />
        <line x1="10" y1="14" x2="21" y2="3" />
      </svg>
    </a>

    <div v-if="score !== undefined" class="party-card__score">
      <div class="party-card__score-bar">
        <div
          class="party-card__score-fill"
          :style="{ width: `${score * 100}%`, backgroundColor: party.colour }"
        />
      </div>
      <span class="party-card__score-text">{{ Math.round(score * 100) }}%</span>
    </div>
  </div>
</template>

<script setup lang="ts">
  interface Party {
    id: string;
    name: string;
    short: string;
    descriptionKey: string;
    colour: string;
    logo?: string;
    website?: string;
  }

  defineProps<{
    party: Party;
    score?: number;
  }>();
</script>

<style scoped>
  .party-card {
    background-color: var(--color-surface-elevated);
    border: 1px solid var(--color-border);
    border-left: 4px solid var(--color-primary);
    border-radius: var(--radius-md);
    padding: var(--space-lg);
    transition: all var(--transition-base);
  }

  .party-card:hover {
    box-shadow: var(--shadow-md);
  }

  .party-card__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-md);
    margin-bottom: var(--space-md);
  }

  .party-card__name {
    margin: 0;
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
  }

  .party-card__short {
    display: inline-block;
    padding: var(--space-xs) var(--space-sm);
    background-color: var(--color-primary);
    color: white;
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-bold);
    border-radius: var(--radius-sm);
    white-space: nowrap;
  }

  .party-card__description {
    margin: 0;
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
    line-height: var(--line-height-relaxed);
  }

  .party-card__website {
    display: inline-flex;
    align-items: center;
    gap: var(--space-xs);
    margin-top: var(--space-md);
    padding: var(--space-xs) var(--space-md);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    text-decoration: none;
    border: 1px solid;
    border-radius: var(--radius-sm);
    transition: all var(--transition-fast);
    background-color: transparent;
  }

  .party-card__website:hover {
    background-color: color-mix(in srgb, currentColor 15%, transparent);
  }

  .party-card__website svg {
    transition: opacity var(--transition-fast);
  }

  .party-card__website:hover svg {
    opacity: 0.8;
  }

  .party-card__score {
    margin-top: var(--space-md);
    display: flex;
    align-items: center;
    gap: var(--space-md);
  }

  .party-card__score-bar {
    flex: 1;
    height: 12px;
    background-color: var(--color-border-light);
    border-radius: var(--radius-full);
    overflow: hidden;
  }

  .party-card__score-fill {
    height: 100%;
    background-color: var(--color-primary);
    border-radius: var(--radius-full);
    transition: width var(--transition-base);
  }

  .party-card__score-text {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    min-width: 48px;
    text-align: right;
  }
</style>
