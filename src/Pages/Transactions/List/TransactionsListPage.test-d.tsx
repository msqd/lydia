import { TransactionsListPage } from "./TransactionsListPage";

/**
 * `filtersOpen` and `onFiltersOpenChange` go together: a controlled sidebar
 * that cannot report its toggle would leave the button dead.
 *
 * Checked by `pnpm types`; an unused `@ts-expect-error` is itself an error.
 */

const onFiltersOpenChange = () => undefined;

export const accepted = (
  <>
    <TransactionsListPage transactions={[]} />
    <TransactionsListPage transactions={[]} onFiltersOpenChange={onFiltersOpenChange} />
    <TransactionsListPage transactions={[]} filtersOpen={true} onFiltersOpenChange={onFiltersOpenChange} />
  </>
);

// @ts-expect-error `filtersOpen` without `onFiltersOpenChange` leaves the toggle dead
export const rejected = <TransactionsListPage transactions={[]} filtersOpen={true} />;
