<script setup lang="ts">
  import PartyCard from "./PartyCard.vue";

  interface Party {
    id: string;
    name: string;
    nameKey?: string;
    short: string;
    descriptionKey: string;
    ideologyKey: string;
    colour: string;
    logo?: string;
    website: string;
  }

  interface PartyScore {
    partyId: string;
    alignmentScore: number;
    party: Party;
    axisScores?: Record<string, number>;
  }

  defineProps<{
    scores: PartyScore[];
  }>();
</script>

<template>
  <div class="result-breakdown">
    <h3 class="result-breakdown__title">{{ $t("results.allParties") }}</h3>

    <div class="result-breakdown__list">
      <PartyCard
        v-for="partyScore in scores"
        :key="partyScore.partyId"
        :party="partyScore.party"
        :score="partyScore.alignmentScore"
        :axis-scores="partyScore.axisScores"
      />
    </div>
  </div>
</template>

<style scoped>
  .result-breakdown {
    width: 100%;
    background-color: var(--color-surface);
    border: 1px solid var(--color-border);
    border-left: 4px solid var(--color-secondary);
    padding: var(--space-xl);
    border-radius: 0;
    box-shadow: var(--shadow-sm);
  }

  @media (max-width: 768px) {
    .result-breakdown {
      padding: var(--space-lg);
    }
  }

  .result-breakdown__title {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
    letter-spacing: 0.05em;
    margin-bottom: var(--space-md);
  }

  .result-breakdown__list {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    margin-top: var(--space-md);
  }
</style>
