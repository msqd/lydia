import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  calculateAggregateTpdexScore,
  calculateTpdexScore,
  getTpdexRating,
  getTpdexTextClassName,
  tpdexScale,
} from "./Tpdex";

describe("tpdexCalculator", () => {
  describe("calculateTpdexScore", () => {
    it("returns 100 for very fast response times", () => {
      expect(calculateTpdexScore(0)).toBe(100);
      expect(calculateTpdexScore(10)).toBe(99);
      expect(calculateTpdexScore(50)).toBe(96);
    });

    it("returns expected scores for various response times", () => {
      // Test some key points based on the algorithm
      expect(calculateTpdexScore(100)).toBe(93); // ~A threshold
      expect(calculateTpdexScore(200)).toBe(86);
      expect(calculateTpdexScore(500)).toBe(69);
      expect(calculateTpdexScore(1000)).toBe(49);
      expect(calculateTpdexScore(1328)).toBe(40); // Transition point in algorithm
      expect(calculateTpdexScore(2000)).toBe(31);
      expect(calculateTpdexScore(5000)).toBe(12);
    });

    it("handles edge cases", () => {
      expect(calculateTpdexScore(-100)).toBe(100); // Negative time should give max score
      expect(calculateTpdexScore(10000)).toBe(0); // Very slow should give 0
    });

    describe("Python algorithm equivalence tests", () => {
      // These test cases were generated using the exact Python implementation
      // to verify perfect matching between Python int() and JavaScript Math.trunc()

      it("matches Python results for polynomial branch (n < 1328)", () => {
        // Python: _tpdex(1) * 100 = 99.928
        expect(calculateTpdexScore(1)).toBe(99);

        // Python: _tpdex(25) * 100 = 98.194
        expect(calculateTpdexScore(25)).toBe(98);

        // Python: _tpdex(100) * 100 = 93.052
        expect(calculateTpdexScore(100)).toBe(93);

        // Python: _tpdex(250) * 100 = 83.428125
        expect(calculateTpdexScore(250)).toBe(83);

        // Python: _tpdex(500) * 100 = 69.625
        expect(calculateTpdexScore(500)).toBe(69);

        // Python: _tpdex(750) * 100 = 58.309375
        expect(calculateTpdexScore(750)).toBe(58);

        // Python: _tpdex(1000) * 100 = 49.8
        expect(calculateTpdexScore(1000)).toBe(49);

        // Python: _tpdex(1200) * 100 = 43.9968
        expect(calculateTpdexScore(1200)).toBe(43);

        // Python: _tpdex(1327) * 100 = 40.061...
        expect(calculateTpdexScore(1327)).toBe(40);
      });

      it("matches Python results for logarithmic branch (n >= 1328)", () => {
        // Python: _tpdex(1328) * 100 = 40.047...
        expect(calculateTpdexScore(1328)).toBe(40);

        // Python: _tpdex(1500) * 100 = 37.23...
        expect(calculateTpdexScore(1500)).toBe(37);

        // Python: _tpdex(2000) * 100 = 31.91...
        expect(calculateTpdexScore(2000)).toBe(31);

        // Python: _tpdex(3000) * 100 = 23.345145
        expect(calculateTpdexScore(3000)).toBe(23);

        // Python: _tpdex(5000) * 100 = 12.758739...
        expect(calculateTpdexScore(5000)).toBe(12);

        // Python: _tpdex(7500) * 100 = 4.328369...
        expect(calculateTpdexScore(7500)).toBe(4);

        // Python: _tpdex(10000) * 100 = 0 (max clamps to 0)
        expect(calculateTpdexScore(10000)).toBe(0);

        // Python: _tpdex(15000) * 100 = 0.42...
        expect(calculateTpdexScore(15000)).toBe(0);

        // Python: _tpdex(20000) * 100 = 0 (max clamps to 0)
        expect(calculateTpdexScore(20000)).toBe(0);
      });

      it("verifies transition point exactly matches Python", () => {
        // At n = 1328, both branches should give very similar results
        const score1327 = calculateTpdexScore(1327);
        const score1328 = calculateTpdexScore(1328);

        // Should be close but 1328 uses logarithmic branch
        expect(score1327).toBe(40);
        expect(score1328).toBe(40);
        expect(Math.abs(score1327 - score1328)).toBeLessThanOrEqual(1);
      });

      it("verifies truncation behavior matches Python int()", () => {
        // Test cases where fractional part matters for truncation
        // These values were specifically chosen to test truncation vs floor differences

        // Case where JavaScript Math.floor would differ from Math.trunc for negative results
        // (though our algorithm shouldn't produce negative intermediate results)
        expect(calculateTpdexScore(0)).toBe(100);

        // Cases with fractional parts to verify truncation
        expect(calculateTpdexScore(75)).toBe(94); // Should truncate, not round
        expect(calculateTpdexScore(125)).toBe(91); // Should truncate, not round
        expect(calculateTpdexScore(175)).toBe(88); // Should truncate, not round
      });

      it("matches Python boundary conditions", () => {
        // Test values right around key thresholds to ensure exact matching
        expect(calculateTpdexScore(0)).toBe(100);
        expect(calculateTpdexScore(1)).toBe(99);
        expect(calculateTpdexScore(1326)).toBe(40);
        expect(calculateTpdexScore(1327)).toBe(40);
        expect(calculateTpdexScore(1328)).toBe(40);
        expect(calculateTpdexScore(1329)).toBe(40);
      });
    });
  });

  describe("getTpdexRating", () => {
    it("returns correct rating for different scores", () => {
      expect(getTpdexRating(99)).toMatchObject({ label: "A++", className: "bg-tpdex-a-plus-plus" });
      expect(getTpdexRating(98)).toMatchObject({ label: "A++", className: "bg-tpdex-a-plus-plus" });
      expect(getTpdexRating(97)).toMatchObject({ label: "A+", className: "bg-tpdex-a-plus" });
      expect(getTpdexRating(96)).toMatchObject({ label: "A+", className: "bg-tpdex-a-plus" });
      expect(getTpdexRating(94)).toMatchObject({ label: "A", className: "bg-tpdex-a" });
      expect(getTpdexRating(93)).toMatchObject({ label: "A", className: "bg-tpdex-a" });
      expect(getTpdexRating(85)).toMatchObject({ label: "B", className: "bg-tpdex-b" });
      expect(getTpdexRating(83)).toMatchObject({ label: "B", className: "bg-tpdex-b" });
      expect(getTpdexRating(70)).toMatchObject({ label: "C", className: "bg-tpdex-c" });
      expect(getTpdexRating(69)).toMatchObject({ label: "C", className: "bg-tpdex-c" });
      expect(getTpdexRating(50)).toMatchObject({ label: "D", className: "bg-tpdex-d" });
      expect(getTpdexRating(49)).toMatchObject({ label: "D", className: "bg-tpdex-d" });
      expect(getTpdexRating(32)).toMatchObject({ label: "E", className: "bg-tpdex-e" });
      expect(getTpdexRating(31)).toMatchObject({ label: "E", className: "bg-tpdex-e" });
      expect(getTpdexRating(18)).toMatchObject({ label: "F", className: "bg-tpdex-f" });
      expect(getTpdexRating(17)).toMatchObject({ label: "F", className: "bg-tpdex-f" });
      expect(getTpdexRating(16)).toMatchObject({ label: "G", className: "bg-tpdex-g" });
      expect(getTpdexRating(0)).toMatchObject({ label: "G", className: "bg-tpdex-g" });
    });

    it("includes all expected properties in rating", () => {
      const rating = getTpdexRating(95);
      expect(rating).toHaveProperty("label");
      expect(rating).toHaveProperty("className");
      expect(rating).toHaveProperty("token");
    });

    it("handles edge cases", () => {
      expect(getTpdexRating(100)).toMatchObject({ label: "A++" });
      expect(getTpdexRating(-1)).toMatchObject({ label: "G" }); // Should return lowest rating
    });
  });

  describe("calculateAggregateTpdexScore", () => {
    it("returns 0 for empty array", () => {
      expect(calculateAggregateTpdexScore([])).toBe(0);
    });

    it("calculates correct average score for multiple times", () => {
      // All fast times (should average close to 100)
      const fastTimes = [10, 20, 30, 40, 50];
      const fastAvg = calculateAggregateTpdexScore(fastTimes);
      expect(fastAvg).toBeGreaterThan(95);
      expect(fastAvg).toBeLessThanOrEqual(100);
    });

    it("calculates correct average for mixed times", () => {
      const mixedTimes = [
        50, // ~96
        100, // ~93
        500, // ~69
        1000, // ~49
      ];
      const avgScore = calculateAggregateTpdexScore(mixedTimes);
      // Average should be around (96 + 93 + 69 + 49) / 4 = 76.75, truncated to 76
      expect(avgScore).toBe(76);
    });

    it("handles single value arrays", () => {
      expect(calculateAggregateTpdexScore([100])).toBe(93);
      expect(calculateAggregateTpdexScore([1000])).toBe(49);
    });

    it("handles arrays with very slow response times", () => {
      const slowTimes = [5000, 10000, 15000];
      expect(calculateAggregateTpdexScore(slowTimes)).toBeLessThan(5);
    });

    it("uses truncation for aggregate calculation like Python", () => {
      // Test specific cases where truncation vs floor matters
      const responseTimes = [75, 125, 175]; // Should give scores: 94, 91, 88
      // Average: (94 + 91 + 88) / 3 = 273 / 3 = 91
      expect(calculateAggregateTpdexScore(responseTimes)).toBe(91);

      // Another case with fractional average
      const responseTimes2 = [100, 200, 300]; // Should give scores: 93, 86, 80
      // Average: (93 + 86 + 80) / 3 = 259 / 3 = 86.333..., truncated to 86
      expect(calculateAggregateTpdexScore(responseTimes2)).toBe(86);
    });

    it("verifies aggregate matches Python behavior exactly", () => {
      // Test case where individual scores are calculated correctly
      // and then averaged with truncation
      const testTimes = [50, 100, 500, 1000, 2000];
      // Individual scores: 96, 93, 69, 49, 31
      // Sum: 338, Average: 338/5 = 67.6, truncated: 67
      expect(calculateAggregateTpdexScore(testTimes)).toBe(67);
    });
  });

  describe("tpdexScale", () => {
    it("has correct number of ratings", () => {
      expect(tpdexScale).toHaveLength(9);
    });

    it("has thresholds in descending order", () => {
      const thresholds = tpdexScale.filter((r) => r.threshold !== undefined).map((r) => r.threshold!);

      for (let i = 1; i < thresholds.length; i++) {
        expect(thresholds[i]).toBeLessThan(thresholds[i - 1]);
      }
    });

    it("last rating has no threshold", () => {
      expect(tpdexScale[tpdexScale.length - 1].threshold).toBeUndefined();
    });

    describe("colour token", () => {
      const css = readFileSync(resolve(__dirname, "../theme.css"), "utf-8");

      it("gives every rating its own theme token", () => {
        const tokens = tpdexScale.map((rating) => rating.token);

        expect(new Set(tokens).size).toBe(tpdexScale.length);
        for (const token of tokens) expect(token).toMatch(/^--color-tpdex-[a-z-]+$/);
      });

      it("declares every token in the theme, with a value", () => {
        for (const { token } of tpdexScale) expect(css).toMatch(new RegExp(`${token}:\\s*oklch\\(`));
      });

      it("derives the fill class from the token, so the badge and the chart cannot drift apart", () => {
        for (const { token, className } of tpdexScale) {
          expect(className).toBe(token.replace("--color-", "bg-"));
        }
      });

      it("keeps the theme static, so tokens read at runtime are not dropped as unused", () => {
        expect(css).toMatch(/@theme static\s*\{/);
      });
    });
  });

  describe("getTpdexTextClassName", () => {
    it("draws a rating without a text colour in the dark label", () => {
      const rating = { label: "A", className: "bg-tpdex-a", token: "--color-tpdex-a" };

      expect(getTpdexTextClassName(rating)).toBe("text-gray-950");
    });

    it("keeps a rating's own text colour", () => {
      expect(getTpdexTextClassName(getTpdexRating(0))).toBe("text-white");
    });
  });
});
