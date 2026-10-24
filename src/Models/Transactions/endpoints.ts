import { splitRequestTarget } from "@msqd/lydia/Models/Http/requestTarget";
import type { Transaction } from "./types";

/** Name under which transactions without an `apiName` are grouped. */
export const UNKNOWN_API = "unknown-api";

export type EndpointNodeType = "api" | "folder" | "endpoint";

/** A node of the endpoint tree: an API, then the path segments below it. */
export interface Selection {
  type: EndpointNodeType;
  apiName: string;
  segments: string[];
}

const SCHEME_AND_HOST = /^[a-z][a-z0-9+.-]*:\/\/[^/]*/i;

export function apiOf(transaction: Transaction): string {
  return transaction.apiName || UNKNOWN_API;
}

/** Path segments of the request target: no query, no scheme or host. Never throws. */
export function segmentsOf(transaction: Transaction): string[] {
  const { path } = splitRequestTarget(transaction.url);
  return path.replace(SCHEME_AND_HOST, "").split("/").filter(Boolean);
}

/** Whether the transaction sits at or below the selected node, by whole segments. */
export function isUnder(transaction: Transaction, selection: Pick<Selection, "apiName" | "segments">): boolean {
  if (apiOf(transaction) !== selection.apiName) return false;
  const segments = segmentsOf(transaction);
  return selection.segments.every((segment, index) => segments[index] === segment);
}
