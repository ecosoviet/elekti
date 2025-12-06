<script setup lang="ts">
  import PartyCard from "./PartyCard.vue";

  interface Party {
    id: string;
    name: string;
    short: string;
    descriptionKey: string;
    colour: string;
    logo?: string;
  }

  interface PolicyAlignment {
    questionId: string;
    questionText: string;
    category: string;
    score: number;
  }

  interface PartyScore {
    partyId: string;
    rawScore: number;
    normalizedScore: number;
    party: Party;
    topPolicies?: PolicyAlignment[];
    topDisagreements?: PolicyAlignment[];
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
        :score="partyScore.normalizedScore"
        :policies="partyScore.topPolicies"
        :disagreements="partyScore.topDisagreements"
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
