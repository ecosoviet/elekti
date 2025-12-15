<script setup lang="ts">
  import { Info, Lock, Vote } from "lucide-vue-next";
  import { useRouter } from "vue-router";
  import { useQuizStore } from "../stores/quizStore";

  const router = useRouter();
  const quizStore = useQuizStore();

  const isDev = import.meta.env.DEV;

  function startQuiz() {
    quizStore.reset();
    router.push("/quiz");
  }

  function devFillRandomAnswers() {
    quizStore.reset();
    const questions = quizStore.getQuestions();
    const optionCount = 5;
    for (const question of questions) {
      const randomOption = Math.floor(Math.random() * optionCount);
      quizStore.answerQuestion(question.id, randomOption);
    }

    quizStore.setCompleted(true);
    router.push("/results");
  }
</script>

<template>
  <div class="landing">
    <div class="landing__container">
      <div class="landing__hero">
        <h1 class="landing__title">{{ $t("landing.title") }}</h1>
        <p class="landing__subtitle">{{ $t("landing.subtitle") }}</p>

        <button @click="startQuiz" class="landing__cta">
          <Vote :size="24" />
          {{ $t("landing.startButton") }}
        </button>

        <button
          v-if="isDev"
          @click="devFillRandomAnswers"
          class="landing__dev-button"
        >
          🔧 DEV: Fill Random & Results
        </button>

        <p class="landing__privacy">
          <Lock :size="16" />
          {{ $t("landing.privacy") }}
        </p>
      </div>

      <div class="landing__why">
        <h2 class="landing__why-title">{{ $t("landing.howItHelps.title") }}</h2>
        <p class="landing__why-intro">{{ $t("landing.howItHelps.intro") }}</p>

        <div class="landing__benefits">
          <div class="landing__benefit">
            <h3 class="landing__benefit-title">
              {{ $t("landing.howItHelps.benefit1.title") }}
            </h3>
            <p class="landing__benefit-text">
              {{ $t("landing.howItHelps.benefit1.text") }}
            </p>
          </div>

          <div class="landing__benefit">
            <h3 class="landing__benefit-title">
              {{ $t("landing.howItHelps.benefit2.title") }}
            </h3>
            <p class="landing__benefit-text">
              {{ $t("landing.howItHelps.benefit2.text") }}
            </p>
          </div>

          <div class="landing__benefit">
            <h3 class="landing__benefit-title">
              {{ $t("landing.howItHelps.benefit3.title") }}
            </h3>
            <p class="landing__benefit-text">
              {{ $t("landing.howItHelps.benefit3.text") }}
            </p>
          </div>

          <div class="landing__benefit">
            <h3 class="landing__benefit-title">
              {{ $t("landing.howItHelps.benefit4.title") }}
            </h3>
            <p class="landing__benefit-text">
              {{ $t("landing.howItHelps.benefit4.text") }}
            </p>
          </div>
        </div>
      </div>

      <div class="landing__disclaimer">
        <h3 class="landing__disclaimer-title">{{ $t("disclaimer.title") }}</h3>
        <p class="landing__disclaimer-text">
          {{ $t("disclaimer.educational") }}
        </p>
        <p class="landing__disclaimer-text landing__disclaimer-text--warning">
          {{ $t("disclaimer.alpha") }}
        </p>
        <p class="landing__disclaimer-text">{{ $t("disclaimer.research") }}</p>
      </div>

      <div class="landing__links">
        <router-link to="/about" class="landing__link">
          <Info :size="20" />
          {{ $t("landing.aboutLink") }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .landing {
    min-height: calc(100vh - var(--header-height) - var(--footer-height));
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-xl);
  }

  .landing__container {
    max-width: var(--max-width-md);
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: var(--space-2xl);
  }

  .landing__hero {
    text-align: left;
    padding: var(--space-2xl);
    background: var(--color-surface-elevated);
    border: 2px solid var(--color-border);
    box-shadow: var(--shadow-lg);
    position: relative;
    overflow: hidden;
  }

  .landing__hero::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      transparent 60%,
      color-mix(in srgb, var(--color-secondary) 14%, transparent) 100%
    );
    pointer-events: none;
    mix-blend-mode: multiply;
  }

  .landing__title {
    font-size: var(--font-size-4xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
    margin-bottom: var(--space-md);
    line-height: var(--line-height-tight);
    letter-spacing: -0.025em;
  }

  .landing__subtitle {
    font-size: var(--font-size-lg);
    color: var(--color-text-secondary);
    line-height: var(--line-height-relaxed);
    margin-bottom: var(--space-xl);
    max-width: 620px;
  }

  .landing__cta {
    display: inline-flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-md) var(--space-xl);
    background: linear-gradient(
      120deg,
      var(--color-primary),
      color-mix(in srgb, var(--color-secondary) 35%, var(--color-primary))
    );
    color: white;
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    border: 2px solid var(--color-primary-dark);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all var(--transition-base);
    box-shadow: var(--shadow-md);
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }

  .landing__cta:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
    background: linear-gradient(
      120deg,
      var(--color-primary-dark),
      color-mix(
        in srgb,
        var(--color-secondary-dark) 45%,
        var(--color-primary-dark)
      )
    );
  }

  .landing__dev-button {
    display: block;
    margin: var(--space-lg) 0 0;
    padding: var(--space-xs) var(--space-sm);
    background-color: var(--color-surface);
    color: var(--color-text-secondary);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-medium);
    border: 1px dashed var(--color-border);
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .landing__dev-button:hover {
    color: var(--color-secondary);
    border-color: var(--color-secondary);
  }

  .landing__privacy {
    display: inline-flex;
    align-items: center;
    gap: var(--space-sm);
    margin-top: var(--space-md);
    font-size: var(--font-size-sm);
    color: var(--color-text-muted);
    letter-spacing: 0.01em;
  }

  .landing__disclaimer {
    background: var(--color-surface);
    border-radius: var(--radius-md);
    padding: var(--space-xl);
    margin-bottom: var(--space-md);
    border: 2px solid var(--color-border);
    box-shadow: var(--shadow-sm);
  }

  .landing__disclaimer-title {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-secondary);
    margin-bottom: var(--space-lg);
    text-align: left;
    letter-spacing: 0.015em;
  }

  .landing__disclaimer-text {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    line-height: var(--line-height-relaxed);
    margin-bottom: var(--space-sm);
  }

  .landing__disclaimer-text:last-child {
    margin-bottom: 0;
  }

  .landing__disclaimer-text--warning {
    padding: var(--space-md);
    background-color: color-mix(
      in srgb,
      var(--color-secondary) 12%,
      transparent
    );
    color: var(--color-text-primary);
    border-radius: 0;
    border-left: 6px solid var(--color-secondary-dark);
    font-weight: var(--font-weight-semibold);
  }

  @media (prefers-color-scheme: dark) {
    .landing__disclaimer-text--warning {
      background-color: color-mix(
        in srgb,
        var(--color-secondary) 20%,
        transparent
      );
      color: var(--color-text-primary);
      border-left-color: var(--color-accent-light);
    }
  }

  .landing__links {
    display: flex;
    justify-content: flex-start;
    gap: var(--space-lg);
  }

  .landing__link {
    display: inline-flex;
    align-items: center;
    gap: var(--space-xs);
    color: var(--color-secondary);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-semibold);
    text-decoration: none;
    padding-bottom: 2px;
    border-bottom: 2px solid currentColor;
    transition:
      color var(--transition-fast),
      border-color var(--transition-fast);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .landing__link:hover {
    color: var(--color-secondary-dark);
    border-color: var(--color-secondary-dark);
  }

  .landing__why {
    background: var(--color-surface);
    border-radius: var(--radius-md);
    padding: var(--space-2xl);
    margin-bottom: var(--space-md);
    border: 2px solid var(--color-border);
    box-shadow: var(--shadow-sm);
  }

  .landing__why-title {
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
    text-align: left;
    margin-bottom: var(--space-sm);
  }

  .landing__why-intro {
    font-size: var(--font-size-base);
    color: var(--color-text-secondary);
    text-align: left;
    margin-bottom: var(--space-xl);
    line-height: var(--line-height-relaxed);
  }

  .landing__benefits {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: var(--space-lg);
  }

  .landing__benefit {
    text-align: left;
    padding: var(--space-lg);
    border: 1px solid var(--color-border);
    background-color: var(--color-background);
    position: relative;
  }

  .landing__benefit::before {
    content: "";
    position: absolute;
    inset: 0;
    border-left: 6px solid var(--color-accent);
    opacity: 0.7;
    pointer-events: none;
  }

  .landing__benefit-title {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    color: var(--color-primary);
    margin-bottom: var(--space-xs);
  }

  .landing__benefit-text {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    line-height: var(--line-height-relaxed);
  }

  @media (max-width: 640px) {
    .landing {
      padding: var(--space-lg);
    }

    .landing__hero {
      padding: var(--space-xl);
    }

    .landing__title {
      font-size: var(--font-size-3xl);
    }

    .landing__subtitle {
      font-size: var(--font-size-base);
    }

    .landing__cta {
      padding: var(--space-md) var(--space-lg);
      font-size: var(--font-size-base);
    }
  }
</style>
