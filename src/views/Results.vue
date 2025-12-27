<script setup lang="ts">
  import { AlertCircle, Copy, RotateCcw, Trophy } from "lucide-vue-next";
  import { computed, onMounted, ref } from "vue";
  import { useI18n } from "vue-i18n";
  import { useRouter } from "vue-router";
  import PartyCard from "../components/PartyCard.vue";
  import ResultBreakdown from "../components/ResultBreakdown.vue";
  import { useQuizStore } from "../stores/quizStore";
  import { isSurveyMode, type SurveyMode } from "../stores/uiStore";
  import type { PartyScore, QuizResult } from "../types";
  import { URL_PARAMS } from "../utils/constants";

  const router = useRouter();
  const quizStore = useQuizStore();
  const { t } = useI18n();
  const result = ref<QuizResult | undefined>(undefined);
  const copied = ref(false);
  const error = ref<string | undefined>(undefined);

  const modeLabel = computed(() => t(`landing.modes.${quizStore.mode}.title`));

  const otherScores = computed<PartyScore[]>(() => {
    const currentResult = result.value;
    if (!currentResult) {
      return [];
    }
    const excludeIds = new Set<string>([
      currentResult.primary.partyId,
      ...currentResult.alternatives.map((a) => a.partyId),
    ]);
    return currentResult.allScores.filter((s) => !excludeIds.has(s.partyId));
  });

  onMounted(() => {
    try {
      const urlParameters = new URLSearchParams(globalThis.location.search);
      const encodedAnswers = urlParameters.get(URL_PARAMS.RESULTS);
      const modeParam = urlParameters.get(URL_PARAMS.MODE);
      const qParam = urlParameters.get(URL_PARAMS.QUESTIONS);

      if (encodedAnswers) {
        if (modeParam) {
          const ids = qParam ? qParam.split(",").filter(Boolean) : undefined;
          const m: SurveyMode = isSurveyMode(modeParam)
            ? (modeParam as SurveyMode)
            : "full";
          quizStore.loadSurvey(m, ids);
        }
        const idsForDecode = qParam
          ? qParam.split(",").filter(Boolean)
          : undefined;
        const loaded = quizStore.loadAnswersFromUrl(
          encodedAnswers,
          idsForDecode
        );
        if (loaded.success) {
          result.value = quizStore.computeScores();
          return;
        } else {
          error.value =
            loaded.error ||
            "Invalid or corrupted results URL. Please retake the quiz.";
          return;
        }
      }

      if (quizStore.completed && Object.keys(quizStore.answers).length > 0) {
        result.value = quizStore.computeScores();
        const encoded = quizStore.encodeAnswersToUrl();
        const ids = quizStore.questions.map((q) => q.id).join(",");
        const m = quizStore.mode;
        const queryParams = {
          [URL_PARAMS.RESULTS]: encoded,
          [URL_PARAMS.MODE]: m,
          [URL_PARAMS.QUESTIONS]: ids,
        };

        const testUrl = new URLSearchParams(queryParams).toString();
        const fullUrl = `${globalThis.location.origin}/results?${testUrl}`;

        if (fullUrl.length <= URL_PARAMS.MAX_URL_LENGTH) {
          router.replace({ query: queryParams });
        } else {
          console.warn(
            "Generated URL exceeds safe length, skipping URL update"
          );
        }
      } else {
        error.value = "No quiz data found. Please take the quiz first.";
      }
    } catch (error_) {
      console.error("Error loading results:", error_);
      error.value = "An error occurred loading your results. Please try again.";
    }
  });

  function copyResults() {
    if (!result.value) {
      return;
    }

    try {
      const encoded = quizStore.encodeAnswersToUrl();
      const ids = quizStore.questions.map((q) => q.id).join(",");
      const m = quizStore.mode;
      const shareUrl = `${globalThis.location.origin}/results?${URL_PARAMS.RESULTS}=${encoded}&${URL_PARAMS.MODE}=${m}&${URL_PARAMS.QUESTIONS}=${encodeURIComponent(ids)}`;

      if (shareUrl.length > URL_PARAMS.MAX_URL_LENGTH) {
        console.warn("Share URL exceeds safe length");
      }

      const confidenceLabel = t(
        `results.confidence.${result.value.confidence}`
      );

      const text = `My Elekti Results:
  Primary Match: ${result.value.primary.party.name} (${(result.value.primary.alignmentScore * 100).toFixed(1)}%) — ${confidenceLabel}
  Alternatives: ${result.value.alternatives
    .map(
      (a: PartyScore) =>
        `${a.party.name} (${(a.alignmentScore * 100).toFixed(1)}%) — ${confidenceLabel}`
    )
    .join(", ")}

  View my results: ${shareUrl}`;

      navigator.clipboard.writeText(text).then(
        () => {
          copied.value = true;
          setTimeout(() => {
            copied.value = false;
          }, 2000);
        },
        (error_) => {
          console.error("Failed to copy results:", error_);
        }
      );
    } catch (error_) {
      console.error("Error creating share URL:", error_);
    }
  }

  function retakeQuiz() {
    quizStore.reset();
    router.push("/quiz");
  }

  function goToQuiz() {
    router.push("/quiz");
  }
</script>

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

            <div class="results__mode">
              {{ modeLabel }}
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
            :score="result.primary.alignmentScore"
            :axis-scores="result.primary.axisScores"
          />

          <button
            @click="copyResults"
            class="results__button results__button--secondary results__button--share-card"
          >
            <Copy :size="20" />
            {{
              copied ? $t("results.resultsCopied") : $t("results.copyResults")
            }}
          </button>
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
              :score="alt.alignmentScore"
              :axis-scores="alt.axisScores"
            />
          </div>
        </section>

        <section class="results__section">
          <ResultBreakdown :scores="otherScores" />
        </section>

        <div class="results__actions">
          <button
            @click="retakeQuiz"
            class="results__button results__button--primary"
          >
            <RotateCcw :size="20" />
            {{ $t("results.retakeQuiz") }}
          </button>
        </div>
      </div>

      <div v-else-if="error" class="results__error">
        <AlertCircle :size="48" />
        <p>{{ error }}</p>
        <button
          @click="goToQuiz"
          class="results__button results__button--primary"
        >
          Start Quiz
        </button>
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
    letter-spacing: -0.02em;
  }

  .results__section {
    margin-bottom: var(--space-3xl);
  }

  .results__section--primary {
    padding: var(--space-lg);
    background: var(--color-surface-elevated);
    border-radius: var(--radius-md);
    border: 3px solid var(--color-secondary);
    margin-bottom: var(--space-3xl);
    box-shadow: var(--shadow-lg);
    position: relative;
  }

  .results__section--primary :deep(.party-card) {
    margin-top: var(--space-md);
    margin-bottom: 0;
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
      color-mix(in srgb, var(--color-secondary) 25%, var(--color-primary))
    );
    color: white;
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-bold);
    border-radius: 0;
    box-shadow: var(--shadow-md);
    letter-spacing: 0.025em;
    text-transform: uppercase;
    height: 40px;
    border: 2px solid var(--color-primary-dark);
  }

  .results__button--share-card {
    display: flex;
    width: 100%;
    justify-content: center;
    margin-top: var(--space-lg);
  }

  .results__confidence {
    padding: var(--space-sm) var(--space-lg);
    border-radius: 0;
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-bold);
    display: inline-flex;
    align-items: center;
    letter-spacing: 0.04em;
    box-shadow: var(--shadow-md);
    transition: box-shadow var(--transition-fast);
    height: 40px;
    text-transform: uppercase;
  }

  .results__confidence:hover {
    box-shadow: var(--shadow-lg);
  }

  .results__mode {
    padding: var(--space-sm) var(--space-lg);
    border-radius: 0;
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-semibold);
    display: inline-flex;
    align-items: center;
    letter-spacing: 0.02em;
    box-shadow: var(--shadow-sm);
    height: 40px;
    background: var(--color-surface);
    border: 2px solid var(--color-border);
    color: var(--color-text-secondary);
  }

  .results__confidence--high {
    background: linear-gradient(
      135deg,
      var(--color-primary),
      color-mix(in srgb, var(--color-secondary) 25%, var(--color-primary))
    );
    color: white;
  }

  .results__confidence--medium {
    background: linear-gradient(
      135deg,
      var(--color-accent),
      color-mix(in srgb, var(--color-secondary) 20%, var(--color-accent))
    );
    color: var(--color-text-primary);
  }

  .results__confidence--low {
    background: linear-gradient(
      135deg,
      var(--color-signal-brick),
      color-mix(
        in srgb,
        var(--color-secondary-dark) 35%,
        var(--color-signal-brick)
      )
    );
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
    letter-spacing: 0.015em;
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
    border-radius: 0;
    cursor: pointer;
    transition: all var(--transition-fast);
    border: none;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .results__button--primary {
    background: linear-gradient(
      120deg,
      var(--color-primary),
      color-mix(in srgb, var(--color-secondary) 25%, var(--color-primary))
    );
    color: white;
    border: 2px solid var(--color-primary-dark);
  }

  .results__button--primary:hover {
    background: linear-gradient(
      120deg,
      var(--color-primary-dark),
      color-mix(
        in srgb,
        var(--color-secondary-dark) 35%,
        var(--color-primary-dark)
      )
    );
    box-shadow: var(--shadow-lg);
  }

  .results__button--secondary {
    background-color: var(--color-surface);
    color: var(--color-text-primary);
    border: 2px solid var(--color-border);
  }

  .results__button--secondary:hover {
    background-color: var(--color-surface-elevated);
    border-color: var(--color-secondary);
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

  .results__error {
    text-align: center;
    padding: var(--space-3xl);
    background-color: var(--color-surface);
    border: 2px solid var(--color-error, #ef4444);
    border-radius: 0;
  }

  .results__error p {
    font-size: var(--font-size-lg);
    color: var(--color-error, #ef4444);
    margin: var(--space-xl) 0;
    font-weight: var(--font-weight-medium);
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
