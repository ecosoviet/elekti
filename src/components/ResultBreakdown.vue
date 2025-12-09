<script setup lang="ts">
  import PartyCard from "./PartyCard.vue";

  interface Party {
    id: string;
    name: string;
    nameKey?: string;
    short: string;
    descriptionKey: string;
    colour: string;
    logo?: string;
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
  }

  .result-breakdown__title {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
    margin-bottom: var(--space-lg);
  }

  .result-breakdown__list {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }
</style>
