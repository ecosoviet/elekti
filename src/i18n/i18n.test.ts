import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || undefined,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
  writable: true,
});

describe("i18n", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
    Object.defineProperty(navigator, "language", {
      configurable: true,
      value: "en-US",
    });
    setActivePinia(createPinia());
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("getInitialLocale", () => {
    it("should return locale from localStorage if valid", async () => {
      localStorage.setItem("lang", "af");
      const { i18n } = await import("./i18n");
      expect(i18n.global.locale.value).toBe("af");
    });

    it("should return English as default if localStorage has invalid locale", async () => {
      localStorage.setItem("lang", "de");
      const { i18n } = await import("./i18n");
      expect(i18n.global.locale.value).toBe("en");
    });

    it("should detect browser language if no localStorage value", async () => {
      Object.defineProperty(navigator, "language", {
        configurable: true,
        value: "af-ZA",
      });
      const { i18n } = await import("./i18n");
      expect(i18n.global.locale.value).toBe("af");
    });

    it("should fallback to English if browser language is not supported", async () => {
      Object.defineProperty(navigator, "language", {
        configurable: true,
        value: "de-DE",
      });
      const { i18n } = await import("./i18n");
      expect(i18n.global.locale.value).toBe("en");
    });

    it("should default to English if navigator.language is undefined", async () => {
      Object.defineProperty(navigator, "language", {
        configurable: true,
        value: "",
      });
      const { i18n } = await import("./i18n");
      expect(i18n.global.locale.value).toBe("en");
    });

    it("should detect Zulu browser language", async () => {
      Object.defineProperty(navigator, "language", {
        configurable: true,
        value: "zu-ZA",
      });
      const { i18n } = await import("./i18n");
      expect(i18n.global.locale.value).toBe("zu");
    });

    it("should accept stored Zulu locale from localStorage", async () => {
      localStorage.setItem("lang", "zu");
      const { i18n } = await import("./i18n");
      expect(i18n.global.locale.value).toBe("zu");
    });
  });

  describe("availableLocales", () => {
    it("should export availableLocales array", async () => {
      const { availableLocales } = await import("./i18n");
      expect(Array.isArray(availableLocales)).toBe(true);
    });

    it("should include English locale", async () => {
      const { availableLocales } = await import("./i18n");
      expect(availableLocales).toContainEqual({ code: "en", name: "English" });
    });

    it("should include Afrikaans locale", async () => {
      const { availableLocales } = await import("./i18n");
      expect(availableLocales).toContainEqual({
        code: "af",
        name: "Afrikaans",
      });
    });

    it("should include Zulu locale", async () => {
      const { availableLocales } = await import("./i18n");
      expect(availableLocales).toContainEqual({
        code: "zu",
        name: "Zulu",
      });
    });

    it("should have exactly 3 available locales", async () => {
      const { availableLocales } = await import("./i18n");
      expect(availableLocales).toHaveLength(3);
    });
  });

  describe("messages", () => {
    it("should have English, Afrikaans, and Zulu messages", async () => {
      const { i18n } = await import("./i18n");
      expect(i18n.global.messages.value).toHaveProperty("en");
      expect(i18n.global.messages.value).toHaveProperty("af");
      expect(i18n.global.messages.value).toHaveProperty("zu");
    });

    it("should have fallback locale set to English", async () => {
      const { i18n } = await import("./i18n");
      expect(i18n.global.fallbackLocale.value).toBe("en");
    });

    it("should have legacy mode disabled", async () => {
      const { i18n } = await import("./i18n");
      expect(i18n.mode).toBe("composition");
    });

    it("should have consistent structure across all locales", async () => {
      const { i18n } = await import("./i18n");
      const messages = i18n.global.messages.value as Record<
        string,
        Record<string, unknown>
      >;
      const enKeys = Object.keys(messages.en || {});
      const afKeys = Object.keys(messages.af || {});
      const zuKeys = Object.keys(messages.zu || {});

      expect(afKeys.toSorted()).toEqual(enKeys.toSorted());
      expect(zuKeys.toSorted()).toEqual(enKeys.toSorted());
    });

    it("should have required message sections in all locales", async () => {
      const { i18n } = await import("./i18n");
      const messages = i18n.global.messages.value as Record<
        string,
        Record<string, unknown>
      >;
      const requiredSections = [
        "app",
        "nav",
        "landing",
        "quiz",
        "results",
        "about",
        "party",
        "axes",
        "options",
        "questions",
        "languages",
        "footer",
        "disclaimer",
      ];

      for (const locale of ["en", "af", "zu"]) {
        for (const section of requiredSections) {
          expect(messages[locale]).toHaveProperty(section);
        }
      }
    });

    it("should have all 50 questions in each locale", async () => {
      const { i18n } = await import("./i18n");
      const messages = i18n.global.messages.value as Record<string, unknown>;

      for (const locale of ["en", "af", "zu"]) {
        const questions =
          ((messages[locale] as Record<string, unknown>)?.questions as Record<
            string,
            unknown
          >) || {};
        const questionKeys = Object.keys(questions);

        expect(questionKeys).toHaveLength(50);
        expect(questionKeys).toContain("q1");
        expect(questionKeys).toContain("q50");
      }
    });
  });

  describe("uiStore integration", () => {
    beforeEach(() => {
      setActivePinia(createPinia());
    });
    it("should update localStorage when setLang is called", async () => {
      const { useUiStore } = await import("../stores/uiStore");
      const store = useUiStore();

      store.setLang("af");
      expect(localStorage.getItem("lang")).toBe("af");

      store.setLang("zu");
      expect(localStorage.getItem("lang")).toBe("zu");
    });

    it("should update i18n locale when setLang is called", async () => {
      const { i18n } = await import("./i18n");
      const { useUiStore } = await import("../stores/uiStore");
      const store = useUiStore();

      store.setLang("zu");
      expect(i18n.global.locale.value).toBe("zu");

      store.setLang("af");
      expect(i18n.global.locale.value).toBe("af");
    });

    it("should keep lang ref in sync with i18n locale", async () => {
      const { useUiStore } = await import("../stores/uiStore");
      const store = useUiStore();

      store.setLang("en");
      expect(store.lang).toBe("en");

      store.setLang("zu");
      expect(store.lang).toBe("zu");
    });
  });
});
