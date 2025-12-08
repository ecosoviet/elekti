import { describe, expect, it } from "vitest";
import router from "./index";

describe("Router", () => {
  describe("routes", () => {
    it("should have landing route at root path", () => {
      const landingRoute = router.getRoutes().find((r) => r.name === "landing");
      expect(landingRoute).toBeDefined();
      expect(landingRoute?.path).toBe("/");
      expect(landingRoute?.components?.default).toBeDefined();
    });

    it("should have quiz route at /quiz", () => {
      const quizRoute = router.getRoutes().find((r) => r.name === "quiz");
      expect(quizRoute).toBeDefined();
      expect(quizRoute?.path).toBe("/quiz");
      expect(quizRoute?.components?.default).toBeDefined();
    });

    it("should have results route at /results", () => {
      const resultsRoute = router.getRoutes().find((r) => r.name === "results");
      expect(resultsRoute).toBeDefined();
      expect(resultsRoute?.path).toBe("/results");
      expect(resultsRoute?.components?.default).toBeDefined();
    });

    it("should have about route at /about", () => {
      const aboutRoute = router.getRoutes().find((r) => r.name === "about");
      expect(aboutRoute).toBeDefined();
      expect(aboutRoute?.path).toBe("/about");
      expect(aboutRoute?.components?.default).toBeDefined();
    });

    it("should have exactly 4 routes", () => {
      const routes = router.getRoutes();
      expect(routes).toHaveLength(4);
    });
  });

  describe("route names", () => {
    it("should have unique route names", () => {
      const routes = router.getRoutes();
      const names = routes.map((r) => r.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(names.length);
    });

    it("should have correct route name mappings", () => {
      const routeNames = new Map(
        router.getRoutes().map((r) => [r.name, r.path])
      );
      expect(routeNames.get("landing")).toBe("/");
      expect(routeNames.get("quiz")).toBe("/quiz");
      expect(routeNames.get("results")).toBe("/results");
      expect(routeNames.get("about")).toBe("/about");
    });
  });

  describe("history mode", () => {
    it("should use web history mode", () => {
      expect(router.options.history).toBeDefined();
    });
  });
});
