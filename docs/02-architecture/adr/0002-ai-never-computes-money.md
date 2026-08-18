# ADR-0002: AI never computes the authoritative financial impact figure

**Status:** Accepted

## Context
LLM output is probabilistic and not reliably reproducible. A product
whose entire value proposition rests on being trusted with money and
discrepancies cannot have a ₹ figure that varies between two runs on the
same input, or that a customer can't audit back to a formula.

## Decision
`mistakes.financial_impact_minor` (see
[data-model.md](../data-model.md#mistakes)) is written exclusively by
deterministic code applying a fixed formula per `mistake_type`. AI may
extract the raw quantities/prices that feed the formula, and may explain
the result in natural language, but never outputs the number itself.

## Consequences
- Every financial impact figure is exactly reproducible and auditable.
- Requires a deterministic formula to be defined for every new
  `mistake_type` before it ships — see the open question flagged in
  [data-model.md § Mistakes](../data-model.md#mistakes) about compound
  mismatches, which needs a product decision before Month 2.
