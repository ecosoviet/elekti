<script setup lang="ts">
  import LanguageSelector from "./components/LanguageSelector.vue";
</script>

<template>
  <div id="app">
    <header class="app-header">
      <div class="app-header__container">
        <router-link to="/" class="app-header__brand">
          <h1 class="app-header__title">{{ $t("app.title") }}</h1>
          <p class="app-header__tagline">{{ $t("app.tagline") }}</p>
        </router-link>

        <LanguageSelector />
      </div>
    </header>

    <main class="app-main">
      <router-view />
    </main>

    <footer class="app-footer">
      <div class="app-footer__container">
        <nav class="app-footer__nav">
          <router-link to="/about">{{ $t("footer.about") }}</router-link>
          <router-link to="/about">{{ $t("footer.privacy") }}</router-link>
        </nav>
        <p class="app-footer__copyright">
          Elekti is released under the
          <a
            href="https://creativecommons.org/publicdomain/zero/1.0/legalcode.en"
            target="_blank"
            rel="noopener noreferrer"
            >CC0 1.0 Universal Public Domain Dedication</a
          >
        </p>
      </div>
    </footer>
  </div>
</template>

<style>
  #app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .app-header {
    height: var(--header-height);
    border-bottom: 2px solid var(--color-border);
    background: linear-gradient(
      90deg,
      var(--color-surface) 0%,
      color-mix(in srgb, var(--color-primary) 12%, var(--color-surface)) 100%
    );
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .app-header__container {
    max-width: var(--max-width-xl);
    margin: 0 auto;
    padding: 0 var(--space-lg);
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .app-header__brand {
    text-decoration: none;
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .app-header__title {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-primary);
    margin: 0;
    line-height: 1;
    letter-spacing: -0.02em;
  }

  .app-header__tagline {
    font-size: var(--font-size-xs);
    color: var(--color-text-secondary);
    margin: 0;
    text-transform: none;
  }

  .app-main {
    flex: 1;
  }

  .app-footer {
    min-height: var(--footer-height);
    border-top: 2px solid var(--color-border);
    background-color: var(--color-surface);
    padding: var(--space-xl) 0;
  }

  .app-footer__container {
    max-width: var(--max-width-xl);
    margin: 0 auto;
    padding: 0 var(--space-lg);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-md);
  }

  .app-footer__nav {
    display: flex;
    gap: var(--space-lg);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .app-footer__nav a {
    color: var(--color-text-secondary);
    font-size: var(--font-size-xs);
    text-decoration: none;
    padding-bottom: 2px;
    border-bottom: 2px solid transparent;
    transition:
      color var(--transition-fast),
      border-color var(--transition-fast);
  }

  .app-footer__nav a:hover {
    color: var(--color-secondary);
    border-color: var(--color-secondary);
  }

  .app-footer__copyright {
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
    margin: 0;
    text-align: center;
  }

  .app-footer__copyright a {
    color: var(--color-text-secondary);
    text-decoration: none;
    transition: color var(--transition-fast);
  }

  .app-footer__copyright a:hover {
    color: var(--color-secondary);
    text-decoration: underline;
  }

  @media (max-width: 640px) {
    .app-header__container {
      padding: 0 var(--space-md);
      border-left-width: 3px;
    }

    .app-header__title {
      font-size: var(--font-size-lg);
    }

    .app-footer__nav {
      gap: var(--space-md);
    }
  }
</style>
