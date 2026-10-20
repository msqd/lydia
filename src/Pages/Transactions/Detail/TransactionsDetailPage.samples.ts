import { sampleTransactions } from "@msqd/lydia/Models/Transactions/transactions.samples";
import type { ContentType, DetailedTransaction, Transaction } from "@msqd/lydia/Models/Transactions/types";

/**
 * Sample detailed transactions for stories, tests and the demo app. Presentation components take
 * their data as props; this fixture (and the basic→detailed helper) is the mock a consumer would
 * otherwise fetch, kept out of the component. Excluded from the build and the published exports.
 */

/** Build a full DetailedTransaction from a basic one by synthesizing request/response. */
export const toDetailedTransaction = (transaction: Transaction): DetailedTransaction => ({
  ...transaction,
  request: {
    headers: [
      { name: "Content-Type", value: "application/json" },
      { name: "Authorization", value: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
      { name: "User-Agent", value: transaction.userAgent || "Unknown" },
      { name: "X-Request-ID", value: `req-${transaction.id}` },
      { name: "Accept", value: "application/json" },
      { name: "X-Forwarded-For", value: transaction.remoteAddress || "unknown" },
    ],
    body: {
      request: "sample request body",
      transactionId: transaction.id,
    },
    contentType: "json" as ContentType,
    size: 156,
  },
  response: {
    headers: [
      { name: "Content-Type", value: "application/json" },
      { name: "Server", value: "nginx/1.20.1" },
      { name: "X-Response-Time", value: `${transaction.responseTime}ms` },
      { name: "Cache-Control", value: "no-cache" },
      { name: "Date", value: new Date(transaction.timestamp).toUTCString() },
      { name: "X-Request-ID", value: `req-${transaction.id}` },
    ],
    body: {
      id: transaction.id,
      status: transaction.status,
      method: transaction.method,
      url: transaction.url,
      timestamp: transaction.timestamp,
    },
    contentType: "json" as ContentType,
    size: 245,
  },
});

/** All sample transactions in their detailed form. */
export const sampleDetailedTransactions: DetailedTransaction[] = sampleTransactions.map(toDetailedTransaction);

/** A single sample detailed transaction (the first sample). */
export const sampleDetailedTransaction: DetailedTransaction =
  sampleDetailedTransactions.find((t) => t.id === "tx001") ?? sampleDetailedTransactions[0];
