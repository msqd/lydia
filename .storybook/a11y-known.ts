/**
 * The axe violations lydia's stories had when axe first ran over them, by
 * story and by rule. All burned down: every rule gates every story.
 *
 * A violation that cannot be fixed at once goes here, by story title, story
 * name and rule, never as a rule switched off in `preview.ts`.
 * `a11y-known.test.tsx` fails on an entry naming a story that does not exist.
 */
export const knownViolations: Record<string, Record<string, string[]>> = {};
