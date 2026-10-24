import type { HttpBody } from "@msqd/lydia/Models/Http/body";
import type { HttpHeader } from "@msqd/lydia/Models/Http/headers";

/**
 * HTTP content types for request/response bodies
 */
export type ContentType = "json" | "xml" | "text" | "html" | "image" | "binary";

/**
 * Base transaction model representing an HTTP API transaction
 */
export interface Transaction {
  id: string;
  url: string;
  method: string;
  status: "Successful" | "Pending" | "Failed";
  statusCode: number;
  timestamp: string;
  responseTime: number;
  client: string;
  apiName?: string;
  /**
   * Arbitrary key/value annotations. HARP populates these from `x-harp-*` request
   * headers, so both halves carry meaning and the value must not be discarded.
   */
  tags?: Record<string, string>;
  userAgent?: string;
  remoteAddress?: string;
  cached?: boolean;
  cacheStatus?: "hit" | "miss" | "stale" | "bypass";
  /**
   * TPDEX performance score, 0-100. Absent while a transaction is still running,
   * since there is nothing to score yet. Never substitute a value for absence: a
   * fabricated score is indistinguishable from a measured one. When absent and a
   * score is needed, derive it with `calculateTpdexScore(responseTime)`.
   */
  tpdex?: number;
}

/**
 * Flags such as "favorite" are deliberately absent from this model. They are per-user
 * state, not transaction data: HARP keys them by (user, transaction, flag) in a separate
 * table and mutates them through their own endpoint. A transaction payload cannot carry
 * them, so they cannot be read from or filtered on one.
 */

/**
 * HTTP message (request or response) with headers and body
 */
export interface HttpMessage {
  headers: HttpHeader[];
  body?: HttpBody;
  contentType?: ContentType;
  size?: number;
}

/**
 * Detailed transaction model with HTTP request and response details
 */
export interface DetailedTransaction extends Transaction {
  request: HttpMessage;
  response: HttpMessage;
}

/**
 * Client types for filtering
 */
export type ClientType = "Mobile App" | "Website" | "Admin Dashboard" | "External API" | "Backend Service";

/**
 * Filter options for transactions
 */
export interface TransactionFilters {
  status?: "Successful" | "Pending" | "Failed" | "All";
  method?: string;
  client?: string;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  datePeriod?: {
    today: boolean;
    thisWeek: boolean;
    thisMonth: boolean;
  };
  search?: string;
}
