<script setup lang="ts">
  interface Party {
    id: string;
    name: string;
    nameKey?: string;
    short: string;
    descriptionKey: string;
    colour: string;
    logo?: string;
    website?: string;
  }

  interface PolicyAlignment {
    axis: string;
    axisName: string;
    shortNameKey: string;
    score: number;
  }

  defineProps<{
    party: Party;
    score?: number;
    topAxes?: PolicyAlignment[];
  }>();
</script>

<template>
  <div class="party-card" :style="{ '--party-colour': party.colour }">
    <div class="party-card__header">
      <h3 class="party-card__name">
        {{ party.nameKey ? $t(party.nameKey) : party.name }}
      </h3>
      <span class="party-card__short">
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
          :style="{ width: `${Math.max(0, score * 100)}%` }"
        />
      </div>
      <span class="party-card__score-text">{{ Math.round(score * 100) }}%</span>
    </div>

    <div v-if="topAxes && topAxes.length > 0" class="party-card__policies">
      <div class="party-card__policies-tags">
        <span
          v-for="axis in topAxes"
          :key="axis.axis"
          class="party-card__policy-tag"
          :title="`${axis.axisName}: ${Math.round(axis.score * 100)}% alignment`"
        >
          {{ $t(axis.shortNameKey) }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .party-card {
    background-color: var(--color-surface-elevated);
    border: 1px solid var(--color-border);
    border-left: 4px solid var(--party-colour);
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
    background-color: var(--party-colour);
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
    color: var(--party-colour);
    border: 1px solid var(--party-colour);
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
    background-color: var(--party-colour);
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

  .party-card__policies {
    margin-top: var(--space-md);
    padding-top: var(--space-sm);
    display: flex;
    align-items: flex-start;
    gap: var(--space-sm);
    flex-wrap: wrap;
  }

  .party-card__policies-tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-xs);
    flex: 1;
    justify-content: flex-start;
  }

  .party-card__policy-tag {
    display: inline-block;
    padding: 4px 10px;
    background-color: var(--party-colour);
    color: white;
    border-radius: var(--radius-sm);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-medium);
    cursor: help;
    transition: opacity var(--transition-fast);
    line-height: 1.3;
    white-space: nowrap;
  }

  .party-card__policy-tag:hover {
    opacity: 0.85;
  }
</style>
