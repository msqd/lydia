import { describe, expect, it } from "vitest";
import { LINEAR_GROWTH_LIMIT, growthRatio } from "./linearTime.test-utils";

const spin = (iterations: number): number => {
  let total = 0;
  for (let i = 0; i < iterations; i++) total += i;
  return total;
};

describe("growthRatio", () => {
  it("stays under the limit for linear work", () => {
    expect(growthRatio((size) => spin(size * 10), 10_000, 100_000)).toBeLessThan(LINEAR_GROWTH_LIMIT);
  });

  it("goes over the limit for quadratic work", () => {
    expect(growthRatio((size) => spin(size * size), 300, 3_000)).toBeGreaterThan(LINEAR_GROWTH_LIMIT);
  });
});
