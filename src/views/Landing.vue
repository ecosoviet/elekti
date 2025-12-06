<script setup lang="ts">
  import { Info, Lock, Vote } from "lucide-vue-next";
  import { useRouter } from "vue-router";
  import { useQuizStore } from "../stores/quizStore";

  const router = useRouter();
  const quizStore = useQuizStore();

  function startQuiz() {
    quizStore.reset();
    router.push("/quiz");
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
  }

  .landing__hero {
    text-align: center;
    margin-bottom: var(--space-3xl);
  }

  .landing__title {
    font-size: var(--font-size-4xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
    margin-bottom: var(--space-lg);
    line-height: var(--line-height-tight);
  }

  .landing__subtitle {
    font-size: var(--font-size-lg);
    color: var(--color-text-secondary);
    line-height: var(--line-height-relaxed);
    margin-bottom: var(--space-2xl);
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }

  .landing__cta {
    display: inline-flex;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-lg) var(--space-2xl);
    background: linear-gradient(
      135deg,
      var(--color-primary),
      var(--color-primary-light)
    );
    color: white;
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-semibold);
    border: none;
    border-radius: var(--radius-xl);
    cursor: pointer;
    transition: all var(--transition-base);
    box-shadow: var(--shadow-md);
  }

  .landing__cta:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
    background: linear-gradient(
      135deg,
      var(--color-primary-dark),
      var(--color-primary)
    );
  }

  .landing__privacy {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-sm);
    margin-top: var(--space-lg);
    font-size: var(--font-size-sm);
    color: var(--color-text-muted);
  }

  .landing__links {
    display: flex;
    justify-content: center;
    gap: var(--space-xl);
  }

  .landing__link {
    display: inline-flex;
    align-items: center;
    gap: var(--space-sm);
    color: var(--color-primary);
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-medium);
    text-decoration: none;
    transition: color var(--transition-fast);
  }

  .landing__link:hover {
    color: var(--color-primary-dark);
  }

  .landing__why {
    background: var(--color-surface);
    border-radius: var(--radius-lg);
    padding: var(--space-2xl);
    margin-bottom: var(--space-3xl);
    border: 1px solid var(--color-border);
  }

  .landing__why-title {
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
    text-align: center;
    margin-bottom: var(--space-md);
  }

  .landing__why-intro {
    font-size: var(--font-size-base);
    color: var(--color-text-secondary);
    text-align: center;
    margin-bottom: var(--space-xl);
    line-height: var(--line-height-relaxed);
  }

  .landing__benefits {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--space-xl);
  }

  .landing__benefit {
    text-align: center;
  }

  .landing__benefit-title {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    color: var(--color-primary);
    margin-bottom: var(--space-sm);
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

    .landing__title {
      font-size: var(--font-size-3xl);
    }

    .landing__subtitle {
      font-size: var(--font-size-base);
    }

    .landing__cta {
      padding: var(--space-md) var(--space-xl);
      font-size: var(--font-size-lg);
    }
  }
</style>
