import { createI18n } from "vue-i18n";
import af from "./data/translations/af.json";
import en from "./data/translations/en.json";
import xh from "./data/translations/xh.json";
import zu from "./data/translations/zu.json";

function getInitialLocale(): string {
  const stored = localStorage.getItem("lang");
  if (stored && ["en", "af", "xh", "zu"].includes(stored)) {
    return stored;
  }

  const browserLangArray = navigator.language.toLowerCase().split("-");
  const browserLang = browserLangArray[0] || "en";
  const supported = ["en", "af", "xh", "zu"];

  return supported.includes(browserLang) ? browserLang : "en";
}

export const i18n = createI18n({
  legacy: false,
  locale: getInitialLocale(),
  fallbackLocale: "en",
  messages: {
    en,
    af,
    xh,
    zu,
  },
});

export const availableLocales = [
  { code: "en", name: "English" },
  { code: "af", name: "Afrikaans" },
  { code: "xh", name: "isiXhosa" },
  { code: "zu", name: "isiZulu" },
];
