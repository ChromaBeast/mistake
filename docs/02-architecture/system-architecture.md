# System Architecture

## Stack

| Layer | Choice |
|---|---|
| Web | Next.js + TypeScript |
| Mobile | Flutter |
| Backend | Go |
| Database | PostgreSQL + pgvector |
| Object storage | S3-compatible |
| Messaging | Kafka (introduced after core MVP — see below) |
| Deployment | Docker initially, Kubernetes during production hardening |
| Observability | OpenTelemetry + Grafana |

## High-level diagram (Phase 1)

```
                  ┌───────────────┐
                  │  Next.js Web  │
                  └───────┬───────┘
                          │
                  ┌───────▼───────┐
                  │    Go API     │
                  └───────┬───────┘
                          │
               ┌──────────┼──────────┐
               ▼          ▼          ▼
         PostgreSQL     Redis     Object Storage
               │
               ▼
        Background Workers
               │
               ▼
       Document Processing
               │
               ▼
         AI Extraction
               │
               ▼
      Deterministic Engine
               │
               ▼
        Mistake Findings
```

Full request/response contract: [api-spec.md](./api-spec.md). Full
schema: [data-model.md](./data-model.md).

## Architecture evolution

**Phase 1 — modular monolith.** Next.js → Go API → PostgreSQL + Redis +
Object Storage + in-process background workers. This is the entire
system for Months 1–2 and should stay simple enough that any engineer
can trace a request from HTTP call to database write without crossing a
network boundary.

**Phase 2 — Kafka.** Extraction Worker, Resolution Worker, and Detection
Worker become independently scalable consumers once document volume
actually creates a queueing/backpressure problem the monolith can't
absorb with more worker goroutines. See the Month 3 caution in
[roadmap.md](../01-product/roadmap.md#month-3--ai--distributed-systems) —
this step should be justified by a measured bottleneck, not scheduled
by default.

**Phase 3 — scale individual workloads independently** where justified
(e.g. document processing needs GPU-adjacent infra that the API doesn't).
Do not introduce distributed complexity without an actual requirement —
see [ADR-0001](./adr/0001-modular-monolith-first.md).

## AI / deterministic separation

This is one of the most important technical requirements of the product
— see [../06-ai/ai-policy.md](../06-ai/ai-policy.md) for the full
policy. Summary:

```
Raw Evidence → AI Extraction → Structured Event → Deterministic Engine
  → Mistake Detection → AI Explanation → Human Verification
```

AI may extract, classify, summarize, infer, suggest, rank, and explain.
Deterministic code alone controls authorization, tenant boundaries,
financial calculations, timestamps, state transitions, retention,
deletion, permissions, severity, and evidence existence. An LLM must
never be the source of truth for a monetary figure — see
[data-model.md § mistakes](./data-model.md#mistakes) and
[ADR-0002](./adr/0002-ai-never-computes-money.md).

## Web

Next.js + TypeScript. Primary uses: dashboards, tables, investigation
workspace, administration, analytics, configuration, privacy center,
billing.

## Mobile

Flutter. Use for factory-floor scenarios: camera capture, barcode/QR
scanning, voice notes, push notifications, offline event capture,
approvals. Flutter is not intended to replace the primary web
investigation experience — it's a capture and approval surface, not a
full analyst workbench.

## Data architecture

PostgreSQL is the system of record for tenants, users, permissions,
events, entities, evidence metadata, mistakes, alerts, billing,
configuration, audit logs, JSONB payloads, and vector embeddings
(pgvector). Full table-level schema: [data-model.md](./data-model.md).

**Search:** PostgreSQL full-text search + pgvector covers customers,
suppliers, products, orders, POs, invoices, payments, shipments,
evidence, and Mistakes for MVP. No dedicated search engine (Elasticsearch
etc.) is needed until query patterns or latency actually require it —
same "don't introduce infrastructure preemptively" principle as Kafka.

## Notifications

MVP notification types: critical Mistake detected, order at risk, new
high-severity discrepancy, issue assigned to you, approval required. No
autonomous external communication in MVP — every notification is
informational to an internal user, never sent to a customer or supplier
without a human clicking send.

## Recommended actions vs. actions

Mistake may *recommend*: review invoice, verify quantity, contact
supplier, investigate shipment, upload missing evidence, assign to
finance, draft communication. Recommendations are distinct from actions
— any consequential external action requires human approval (see
[../06-ai/ai-safety-policy.md](../06-ai/ai-safety-policy.md)).

## Billing

Initial tiers and pricing are hypotheses requiring market validation,
not commitments:

| Tier | Hypothesis |
|---|---|
| Free / Trial | — |
| Starter | ₹4,999/month |
| Growth | ₹14,999/month |
| Enterprise | ₹50,000+/month |

Pricing should reflect customer value (₹ Value Protected) rather than AI
message counts — avoid a usage-metering UX that makes customers hesitant
to upload more data, since more data is what makes the product work
better.
