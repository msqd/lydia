# 1. A multiple-choice facet narrows

Date: 2026-10-09. Status: accepted.

## Context

`MultipleChoiceFacet` came from HARP with an inverted selection. With nothing chosen, every box is
drawn ticked. Unticking one stores every *other* value known at that moment, and ticking every box
collapses back to "no filter".

On a list that grows, that stored list is a snapshot. A value that appears later is excluded without
anyone asking for it. Two links can also mean the same view, because values are stored in click
order.

jaco works over a live list and kept its own facet for that reason
([msqd/jaco#129](https://github.com/msqd/jaco/issues/129)).

## Decision

A multiple-choice facet narrows by default, and there is no mode to keep the old behaviour:

- nothing chosen means nothing ticked and no filter;
- a tick adds that value to the filter;
- values are stored in the facet's order, not in click order;
- ticking every box keeps every value; it does not collapse to "no filter".

`Filters` keeps its shape: `filters[name]` is the list of included values, and `undefined` means no
filter.

## Consequences

- HARP changes behaviour: their transaction facets open unticked, and a click narrows
  instead of excluding. This is a breaking change.
- Lydia stores no filters. A list a consumer saved under the old behaviour filters as before, but
  it still leaves out values that appeared since; only the consumer can tell such lists apart.
- jaco can drop its local facet once nested options land.
