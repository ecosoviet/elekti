import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useUiStore } from "./uiStore";

vi.mock("../i18n", () => ({
  i18n: {
    global: {
      locale: {
        value: "en",
      },
    },
  },
}));

const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
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

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("uiStore", () => {
  beforeEach(async () => {
    setActivePinia(createPinia());
    localStorage.clear();
    const { i18n } = await import("../i18n");
    i18n.global.locale.value = "en";
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("initialization", () => {
    it("should initialize with default language", () => {
      const store = useUiStore();
      expect(store.lang).toBe("en");
    });

    it("should have setLang method", () => {
      const store = useUiStore();
      expect(typeof store.setLang).toBe("function");
    });
  });

  describe("language selection", () => {
    it("should set language to English", () => {
      const store = useUiStore();
      store.setLang("en");
      expect(store.lang).toBe("en");
    });

    it("should set language to Afrikaans", () => {
      const store = useUiStore();
      store.setLang("af");
      expect(store.lang).toBe("af");
    });

    it("should set language to Zulu", () => {
      const store = useUiStore();
      store.setLang("zu");
      expect(store.lang).toBe("zu");
    });

    it("should set language to Xhosa", () => {
      const store = useUiStore();
      store.setLang("xh");
      expect(store.lang).toBe("xh");
    });

    it("should set language to Setswana", () => {
      const store = useUiStore();
      store.setLang("tn");
      expect(store.lang).toBe("tn");
    });

    it("should allow switching between languages", () => {
      const store = useUiStore();

      store.setLang("en");
      expect(store.lang).toBe("en");

      store.setLang("af");
      expect(store.lang).toBe("af");

      store.setLang("zu");
      expect(store.lang).toBe("zu");

      store.setLang("en");
      expect(store.lang).toBe("en");
    });
  });

  describe("i18n integration", () => {
    it("should update i18n locale when setting language", async () => {
      const store = useUiStore();
      const { i18n } = await import("../i18n");

      store.setLang("af");

      expect(i18n.global.locale.value).toBe("af");
    });

    it("should update i18n locale for all supported languages", async () => {
      const store = useUiStore();
      const { i18n } = await import("../i18n");
      const languages: Array<"en" | "af" | "zu" | "xh" | "tn"> = [
        "en",
        "af",
        "zu",
        "xh",
        "tn",
      ];

      languages.forEach((lang) => {
        store.setLang(lang);
        expect(i18n.global.locale.value).toBe(lang);
      });
    });
  });

  describe("localStorage persistence", () => {
    it("should save language selection to localStorage", () => {
      const store = useUiStore();
      store.setLang("af");

      expect(localStorage.getItem("lang")).toBe("af");
    });

    it("should persist all language options to localStorage", () => {
      const store = useUiStore();
      const languages: Array<"en" | "af" | "zu" | "xh" | "tn"> = [
        "en",
        "af",
        "zu",
        "xh",
        "tn",
      ];

      languages.forEach((lang) => {
        store.setLang(lang);
        expect(localStorage.getItem("lang")).toBe(lang);
      });
    });

    it("should update localStorage when language changes", () => {
      const store = useUiStore();

      store.setLang("en");
      expect(localStorage.getItem("lang")).toBe("en");

      store.setLang("zu");
      expect(localStorage.getItem("lang")).toBe("zu");

      store.setLang("xh");
      expect(localStorage.getItem("lang")).toBe("xh");
    });
  });

  describe("state reactivity", () => {
    it("should be reactive to language changes", () => {
      const store = useUiStore();

      expect(store.lang).toBe("en");

      store.setLang("af");
      expect(store.lang).toBe("af");

      store.setLang("zu");
      expect(store.lang).toBe("zu");
    });

    it("should maintain language state across operations", () => {
      const store = useUiStore();

      store.setLang("af");
      expect(store.lang).toBe("af");

      expect(store.lang).toBe("af");
    });
  });

  describe("locale type validation", () => {
    it("should accept all valid locale types", () => {
      const store = useUiStore();
      const validLocales: Array<"en" | "af" | "zu" | "xh" | "tn"> = [
        "en",
        "af",
        "zu",
        "xh",
        "tn",
      ];

      validLocales.forEach((locale) => {
        expect(() => {
          store.setLang(locale);
        }).not.toThrow();
        expect(store.lang).toBe(locale);
      });
    });
  });

  describe("multiple store instances", () => {
    it("should share state across store instances", () => {
      const store1 = useUiStore();
      const store2 = useUiStore();

      store1.setLang("af");
      expect(store2.lang).toBe("af");
    });

    it("should sync language changes across instances", () => {
      const store1 = useUiStore();
      const store2 = useUiStore();

      store1.setLang("zu");
      expect(store1.lang).toBe("zu");
      expect(store2.lang).toBe("zu");

      store2.setLang("xh");
      expect(store1.lang).toBe("xh");
      expect(store2.lang).toBe("xh");
    });

    it("should sync localStorage across instances", () => {
      const store1 = useUiStore();
      const store2 = useUiStore();

      store1.setLang("tn");
      expect(localStorage.getItem("lang")).toBe("tn");
      expect(store2.lang).toBe("tn");
    });
  });
});
