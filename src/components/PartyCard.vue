<script setup lang="ts">
  import axesData from "@/data/axes.json";
  import { ChevronDown } from "lucide-vue-next";
  import { computed, ref } from "vue";
  import { useI18n } from "vue-i18n";

  interface Axis {
    id: string;
    name: string;
    shortNameKey: string;
    description: string;
  }

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

  const props = defineProps<{
    party: Party;
    score?: number;
    topAxes?: PolicyAlignment[];
    axisScores?: Record<string, number>;
  }>();

  const { t } = useI18n();
  const expanded = ref(false);

  const axes = computed(() => (axesData as { axes: Axis[] }).axes);

  const allAxisScores = computed(() => {
    if (!props.axisScores) return [];

    return axes.value
      .map((axis) => {
        const rawScore = props.axisScores![axis.id] ?? 0;
        return {
          ...axis,
          score: Math.max(0, rawScore),
          percentage: Math.max(0, Math.round(rawScore * 100)),
        };
      })
      .toSorted((a, b) => b.score - a.score);
  });

  const getAxisColor = (percentage: number): string => {
    if (percentage >= 75) return "#10b981"; // Green - strong alignment
    if (percentage >= 50) return "#f59e0b"; // Amber - moderate alignment
    if (percentage >= 25) return "#ef4444"; // Red - weak alignment
    return "#6b7280"; // Gray - very weak alignment
  };
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
      <span class="party-card__score-text"
        >{{ Math.max(0, Math.round(score * 100)) }}%</span
      >
    </div>

    <button
      v-if="axisScores && allAxisScores.length > 0"
      class="party-card__expand-button"
      :class="{ 'party-card__expand-button--expanded': expanded }"
      @click="expanded = !expanded"
      :aria-expanded="expanded"
    >
      <ChevronDown :size="18" />
      <span>{{ $t(expanded ? "results.hideAxes" : "results.showAxes") }}</span>
    </button>

    <div v-if="expanded && axisScores" class="party-card__axis-breakdown">
      <div class="party-card__axis-list">
        <div
          v-for="axis in allAxisScores"
          :key="axis.id"
          class="party-card__axis-item"
        >
          <div class="party-card__axis-header">
            <span class="party-card__axis-name">{{
              $t(axis.shortNameKey)
            }}</span>
            <span class="party-card__axis-score">{{ axis.percentage }}%</span>
          </div>
          <div class="party-card__axis-bar">
            <div
              class="party-card__axis-fill"
              :style="{
                width: `${Math.max(0, axis.percentage)}%`,
                backgroundColor: getAxisColor(axis.percentage),
              }"
            />
          </div>
        </div>
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

  .party-card__expand-button {
    margin-top: var(--space-md);
    padding: var(--space-sm) var(--space-md);
    background-color: transparent;
    border: 1px solid var(--color-border-light);
    border-radius: var(--radius-sm);
    color: var(--color-text-primary);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    transition: all var(--transition-fast);
  }

  .party-card__expand-button:hover {
    background-color: color-mix(in srgb, var(--party-colour) 10%, transparent);
    border-color: var(--party-colour);
  }

  .party-card__expand-button svg {
    transition: transform var(--transition-fast);
  }

  .party-card__expand-button--expanded svg {
    transform: rotate(180deg);
  }

  .party-card__axis-breakdown {
    margin-top: var(--space-md);
    padding-top: var(--space-md);
    border-top: 1px solid var(--color-border-light);
    animation: slideDown var(--transition-base);
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .party-card__axis-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .party-card__axis-item {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .party-card__axis-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .party-card__axis-name {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
  }

  .party-card__axis-score {
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
  }

  .party-card__axis-bar {
    height: 8px;
    background-color: var(--color-border-light);
    border-radius: var(--radius-full);
    overflow: hidden;
  }

  .party-card__axis-fill {
    height: 100%;
    border-radius: var(--radius-full);
    transition:
      width var(--transition-base),
      background-color var(--transition-base);
  }

  /* Color scale based on alignment strength */
  .party-card__axis-item:nth-child(1) .party-card__axis-fill,
  .party-card__axis-item:nth-child(2) .party-card__axis-fill,
  .party-card__axis-item:nth-child(3) .party-card__axis-fill,
  .party-card__axis-item:nth-child(4) .party-card__axis-fill,
  .party-card__axis-item:nth-child(5) .party-card__axis-fill,
  .party-card__axis-item:nth-child(6) .party-card__axis-fill,
  .party-card__axis-item:nth-child(7) .party-card__axis-fill,
  .party-card__axis-item:nth-child(8) .party-card__axis-fill,
  .party-card__axis-item:nth-child(9) .party-card__axis-fill,
  .party-card__axis-item:nth-child(10) .party-card__axis-fill,
  .party-card__axis-item:nth-child(11) .party-card__axis-fill,
  .party-card__axis-item:nth-child(12) .party-card__axis-fill {
    /* Color determined by inline style based on percentage */
  }
</style>
