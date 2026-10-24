/** Largest `growthRatio` accepted as linear: linear work gives about 1, quadratic work about 10. */
export const LINEAR_GROWTH_LIMIT = 3;

function timeOf(run: () => void): number {
  const start = performance.now();
  run();
  return performance.now() - start;
}

/**
 * Run time of `run(large)` against `large / small` runs of `run(small)`, which take as long when the
 * work is linear and `large / small` times less when it is quadratic. The sizes are timed alternately
 * so a loaded machine slows both alike, and the fastest sample of each discards what noise is left.
 * `large` must be a multiple of `small`.
 */
export function growthRatio(run: (size: number) => void, small: number, large: number, samples = 15): number {
  const repeats = large / small;
  const runSmallRepeatedly = () => {
    for (let i = 0; i < repeats; i++) run(small);
  };
  let fastestSmall = Number.POSITIVE_INFINITY;
  let fastestLarge = Number.POSITIVE_INFINITY;
  for (let i = 0; i < samples; i++) {
    fastestSmall = Math.min(fastestSmall, timeOf(runSmallRepeatedly));
    fastestLarge = Math.min(
      fastestLarge,
      timeOf(() => run(large)),
    );
  }
  return fastestLarge / fastestSmall;
}
