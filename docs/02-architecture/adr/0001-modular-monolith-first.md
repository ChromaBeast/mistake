# ADR-0001: Modular monolith first, Kafka only when justified

**Status:** Accepted

## Context
The product needs to move fast for a small team through Months 1–2 while
the detection engine (the actual product) is unproven. A distributed,
event-driven architecture from day one adds operational overhead
(deployment, debugging, local dev complexity) before there's a scaling
problem to justify it.

## Decision
Build Phase 1 as a modular monolith: Next.js → Go API → PostgreSQL +
Redis + Object Storage + in-process background workers. Introduce Kafka
in Phase 2 only once a measured bottleneck (not a schedule) justifies it
— see [system-architecture.md](../system-architecture.md#architecture-evolution).

## Consequences
- Faster iteration through the highest-uncertainty phase of the product.
- Risk: Month 3 roadmap currently schedules Kafka by default rather than
  by measured need — this is a known tension, flagged in
  [roadmap.md](../../01-product/roadmap.md#month-3--ai--distributed-systems),
  to be resolved before Month 3 starts.
