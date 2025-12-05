<template>
  <div class="results">
    <div class="results__container">
      <h1 class="results__title">{{ $t("results.title") }}</h1>

      <div v-if="result" class="results__content">
        <section class="results__section results__section--primary">
          <div class="results__pills">
            <div class="results__badge">
              <Trophy :size="20" />
              <span>{{ $t("results.primaryMatch") }}</span>
            </div>

            <div
              class="results__confidence"
              :class="`results__confidence--${result.confidence}`"
            >
              {{ $t(`results.confidence.${result.confidence}`) }}
            </div>
          </div>

          <PartyCard
            :party="result.primary.party"
            :score="result.primary.normalizedScore"
          />
        </section>

        <section v-if="result.alternatives.length > 0" class="results__section">
          <h2 class="results__section-title">
            {{ $t("results.alternativeMatch") }}
          </h2>

          <div class="results__alternatives">
            <PartyCard
              v-for="alt in result.alternatives.slice(0, 2)"
              :key="alt.partyId"
              :party="alt.party"
              :score="alt.normalizedScore"
            />
          </div>
        </section>

        <section class="results__section">
          <ResultBreakdown :scores="result.allScores" />
        </section>

        <div class="results__actions">
          <button
            @click="copyResults"
            class="results__button results__button--secondary"
          >
            <Copy :size="20" />
            {{
              copied ? $t("results.resultsCopied") : $t("results.copyResults")
            }}
          </button>

          <button
            @click="retakeQuiz"
            class="results__button results__button--primary"
          >
            <RotateCcw :size="20" />
            {{ $t("results.retakeQuiz") }}
          </button>
        </div>
      </div>

      <div v-else class="results__empty">
        <AlertCircle :size="48" />
        <p>No results available. Please take the quiz first.</p>
        <button
          @click="goToQuiz"
          class="results__button results__button--primary"
        >
          Start Quiz
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { AlertCircle, Copy, RotateCcw, Trophy } from "lucide-vue-next";
  import { onMounted, ref } from "vue";
  import { useRouter } from "vue-router";
  import PartyCard from "../components/PartyCard.vue";
  import ResultBreakdown from "../components/ResultBreakdown.vue";
  import { useQuizStore } from "../stores/quizStore";

  interface Party {
    id: string;
    name: string;
    short: string;
    descriptionKey: string;
    colour: string;
    logo?: string;
    website?: string;
  }

  interface PartyScore {
    partyId: string;
    rawScore: number;
    normalizedScore: number;
    party: Party;
  }

  interface QuizResult {
    primary: PartyScore;
    alternatives: PartyScore[];
    allScores: PartyScore[];
    confidence: "high" | "medium" | "low";
    timestamp: number;
  }

  const router = useRouter();
  const quizStore = useQuizStore();
  const result = ref<QuizResult | null>(null);
  const copied = ref(false);

  onMounted(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const encodedAnswers = urlParams.get("r");

    if (encodedAnswers) {
      const loaded = quizStore.loadAnswersFromUrl(encodedAnswers);
      if (loaded) {
        result.value = quizStore.computeScores();
        return;
      }
    }

    if (quizStore.completed && Object.keys(quizStore.answers).length > 0) {
      result.value = quizStore.computeScores();
      const encoded = quizStore.encodeAnswersToUrl();
      router.replace({ query: { r: encoded } });
    }
  });

  function copyResults() {
    if (!result.value) {
      return;
    }

    const encoded = quizStore.encodeAnswersToUrl();
    const shareUrl = `${window.location.origin}/results?r=${encoded}`;

    const text = `My Elekti Results:
Primary Match: ${result.value.primary.party.name} (${Math.round(result.value.primary.normalizedScore * 100)}%)
Alternatives: ${result.value.alternatives.map((a: PartyScore) => `${a.party.name} (${Math.round(a.normalizedScore * 100)}%)`).join(", ")}

View my results: ${shareUrl}`;

    navigator.clipboard.writeText(text).then(() => {
      copied.value = true;
      setTimeout(() => {
        copied.value = false;
      }, 2000);
    });
  }

  function retakeQuiz() {
    quizStore.reset();
    router.push("/quiz");
  }

  function goToQuiz() {
    router.push("/quiz");
  }
</script>

<style scoped>
  .results {
    min-height: calc(100vh - var(--header-height) - var(--footer-height));
    padding: var(--space-xl);
  }

  .results__container {
    max-width: var(--max-width-md);
    margin: 0 auto;
  }

  .results__title {
    text-align: center;
    font-size: var(--font-size-4xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
    margin-bottom: var(--space-2xl);
  }

  .results__section {
    margin-bottom: var(--space-3xl);
  }

  .results__section--primary {
    padding: var(--space-2xl);
    background: var(--color-surface-elevated);
    border-radius: var(--radius-xl);
    border: 2px solid var(--color-primary);
    margin-bottom: var(--space-3xl);
    box-shadow: var(--shadow-lg);
  }

  .results__section--primary :deep(.party-card) {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-left-width: 4px;
    padding: var(--space-xl);
    margin-top: var(--space-xl);
  }

  .results__pills {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    flex-wrap: wrap;
    margin-bottom: var(--space-lg);
  }

  .results__badge {
    display: inline-flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-sm) var(--space-lg);
    background: linear-gradient(
      135deg,
      var(--color-primary),
      var(--color-primary-light)
    );
    color: white;
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-bold);
    border-radius: var(--radius-full);
    box-shadow: 0 4px 12px rgba(0, 122, 77, 0.3);
    letter-spacing: 0.025em;
    text-transform: uppercase;
    height: 40px;
  }

  .results__confidence {
    padding: var(--space-sm) var(--space-lg);
    border-radius: var(--radius-full);
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-bold);
    display: inline-flex;
    align-items: center;
    letter-spacing: 0.025em;
    box-shadow: var(--shadow-md);
    transition: box-shadow var(--transition-fast);
    height: 40px;
  }

  .results__confidence:hover {
    box-shadow: var(--shadow-lg);
  }

  .results__confidence--high {
    background: linear-gradient(135deg, #28a745, #34ce57);
    color: white;
  }

  .results__confidence--medium {
    background: linear-gradient(135deg, #ffc107, #ffcd38);
    color: #664d00;
  }

  .results__confidence--low {
    background: linear-gradient(135deg, #dc3545, #e74c5c);
    color: white;
  }

  .results__section-title {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
    margin-bottom: var(--space-xl);
  }

  .results__alternatives {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
  }

  .results__actions {
    display: flex;
    gap: var(--space-md);
    justify-content: center;
    flex-wrap: wrap;
    margin-top: var(--space-2xl);
  }

  .results__button {
    display: inline-flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-md) var(--space-xl);
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-medium);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all var(--transition-fast);
    border: none;
  }

  .results__button--primary {
    background-color: var(--color-primary);
    color: white;
  }

  .results__button--primary:hover {
    background-color: var(--color-primary-dark);
    box-shadow: var(--shadow-md);
  }

  .results__button--secondary {
    background-color: var(--color-surface);
    color: var(--color-text-primary);
    border: 1px solid var(--color-border);
  }

  .results__button--secondary:hover {
    background-color: var(--color-surface-elevated);
    border-color: var(--color-primary);
  }

  .results__empty {
    text-align: center;
    padding: var(--space-3xl);
  }

  .results__empty p {
    font-size: var(--font-size-lg);
    color: var(--color-text-secondary);
    margin: var(--space-xl) 0;
  }

  @media (max-width: 640px) {
    .results {
      padding: var(--space-lg);
    }

    .results__title {
      font-size: var(--font-size-3xl);
    }

    .results__actions {
      flex-direction: column;
    }

    .results__button {
      width: 100%;
      justify-content: center;
    }
  }
</style>
