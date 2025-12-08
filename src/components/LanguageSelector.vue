<script setup lang="ts">
  import { ChevronDown, Globe } from "lucide-vue-next";
  import { computed, ref } from "vue";
  import { useI18n } from "vue-i18n";
  import { availableLocales } from "../i18n";
  import { useUiStore } from "../stores/uiStore";

  const { locale } = useI18n();
  const uiStore = useUiStore();
  const isOpen = ref(false);

  const sortedLocales = computed(() => {
    return [...availableLocales].sort((a, b) => a.name.localeCompare(b.name));
  });

  const currentLocale = computed(() => locale.value);
  const currentLocaleName = computed(() => {
    const found = availableLocales.find((l) => l.code === currentLocale.value);
    return found?.name || "English";
  });

  function toggleDropdown() {
    isOpen.value = !isOpen.value;
  }

  function selectLanguage(code: string) {
    uiStore.setLang(code as "en" | "af");
    isOpen.value = false;
  }
</script>

<template>
  <div class="language-selector">
    <button
      @click="toggleDropdown"
      class="language-selector__button"
      :aria-expanded="isOpen"
      aria-haspopup="listbox"
    >
      <Globe :size="20" />
      <span>{{ currentLocaleName }}</span>
      <ChevronDown :size="16" />
    </button>

    <div v-if="isOpen" class="language-selector__dropdown" role="listbox">
      <button
        v-for="locale in sortedLocales"
        :key="locale.code"
        @click="selectLanguage(locale.code)"
        class="language-selector__option"
        :class="{
          'language-selector__option--active': locale.code === currentLocale,
        }"
        role="option"
        :aria-selected="locale.code === currentLocale"
      >
        {{ locale.name }}
      </button>
    </div>
  </div>
</template>

<style scoped>
  .language-selector {
    position: relative;
  }

  .language-selector__button {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-sm) var(--space-md);
    background-color: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    color: var(--color-text-primary);
    font-size: var(--font-size-sm);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .language-selector__button:hover {
    background-color: var(--color-surface-elevated);
    border-color: var(--color-primary);
  }

  .language-selector__dropdown {
    position: absolute;
    top: calc(100% + var(--space-xs));
    right: 0;
    min-width: 160px;
    background-color: var(--color-surface-elevated);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    z-index: 100;
    overflow: hidden;
  }

  .language-selector__option {
    display: block;
    width: 100%;
    padding: var(--space-sm) var(--space-md);
    text-align: left;
    background: none;
    border: none;
    color: var(--color-text-primary);
    font-size: var(--font-size-sm);
    cursor: pointer;
    transition: background-color var(--transition-fast);
  }

  .language-selector__option:hover {
    background-color: var(--color-surface);
  }

  .language-selector__option--active {
    background-color: var(--color-primary);
    color: white;
  }

  .language-selector__option--active:hover {
    background-color: var(--color-primary-dark);
  }
</style>
