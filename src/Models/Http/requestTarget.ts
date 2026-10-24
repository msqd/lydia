/**
 * Split a captured request target at its first `?`, without parsing it.
 *
 * A captured target is attacker-controlled and may not be a valid URL, so nothing here can throw and
 * nothing is normalised: `path` and `query` are the bytes that crossed the wire. `query` keeps its
 * leading `?`, and is empty when the target has none.
 */
export function splitRequestTarget(raw: string): { path: string; query: string } {
  const queryStart = raw.indexOf("?");
  return queryStart === -1
    ? { path: raw, query: "" }
    : { path: raw.slice(0, queryStart), query: raw.slice(queryStart) };
}
