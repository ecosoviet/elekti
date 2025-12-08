import { defineStore } from "pinia";
import { ref } from "vue";
import { i18n } from "../i18n/i18n";

type Locale = "en" | "af";

export const useUiStore = defineStore("ui", () => {
  const lang = ref<Locale>(i18n.global.locale.value as Locale);

  function setLang(langCode: Locale) {
    lang.value = langCode;
    i18n.global.locale.value = langCode;
    localStorage.setItem("lang", langCode);
  }

  return {
    lang,
    setLang,
  };
});
