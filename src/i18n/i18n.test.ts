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

    it("should have exactly 2 available locales", async () => {
      const { availableLocales } = await import("./i18n");
      expect(availableLocales).toHaveLength(2);
    });
  });

  describe("messages", () => {
    it("should have English and Afrikaans messages", async () => {
      const { i18n } = await import("./i18n");
      expect(i18n.global.messages.value).toHaveProperty("en");
      expect(i18n.global.messages.value).toHaveProperty("af");
    });

    it("should have fallback locale set to English", async () => {
      const { i18n } = await import("./i18n");
      expect(i18n.global.fallbackLocale.value).toBe("en");
    });

    it("should have legacy mode disabled", async () => {
      const { i18n } = await import("./i18n");
      expect(i18n.mode).toBe("composition");
    });
  });
});
