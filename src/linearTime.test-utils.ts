/** Largest `growthRatio` accepted as linear: linear work gives about 1, quadratic work about 10. */
export const LINEAR_GROWTH_LIMIT = 3;

/** CPU time of the process spent in `run`. */
function cpuTimeOf(run: () => void): number {
  const start = process.cpuUsage();
  run();
  const { user, system } = process.cpuUsage(start);
  return user + system;
}

/**
 * Run time of `run(large)` against `large / small` runs of `run(small)`, which take as long when the
 * work is linear and `large / small` times less when it is quadratic. The sizes are timed alternately
 * and the fastest sample of each discards what noise is left. Samples are CPU time, so a loaded machine
 * that preempts the process does not inflate them.
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
    fastestSmall = Math.min(fastestSmall, cpuTimeOf(runSmallRepeatedly));
    fastestLarge = Math.min(
      fastestLarge,
      cpuTimeOf(() => run(large)),
    );
  }
  return fastestLarge / fastestSmall;
}
