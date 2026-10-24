import { DataTable } from "@msqd/lydia/Components/DataTable";
import type { HttpBody } from "@msqd/lydia/Models/Http/body";
import type { DetailedTransaction, HttpMessage, Transaction } from "./types";

/**
 * What the domain types promise consumers, checked by the compiler (`pnpm types`).
 *
 * Both are closed: reading a field they do not declare is an error, so a typo is caught and
 * the model can grow without that growth being a break.
 */
declare const transaction: Transaction;
declare const detailed: DetailedTransaction;

// @ts-expect-error `unknownField` is not on Transaction
transaction.unknownField;

// @ts-expect-error `unknownField` is not on DetailedTransaction
detailed.unknownField;

transaction.statusCode satisfies number;

/** A body is the captured document or text, never `any`. */
declare const message: HttpMessage;
message.body satisfies HttpBody | undefined;
// @ts-expect-error a body is not assumed to be a string
message.body.toUpperCase();

/** A closed row type still fits the table. */
export const table = <DataTable<Transaction> rows={[]} types={{ url: { label: "URL" } }} columns={["url"]} />;
