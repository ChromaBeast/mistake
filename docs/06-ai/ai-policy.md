# AI Policy

## Core principle
AI must never become the authoritative source of business truth. This is
one of the most important technical requirements of the product — see
[ADR-0002](../02-architecture/adr/0002-ai-never-computes-money.md).

```
Raw Evidence → AI Extraction → Structured Event → Deterministic Engine
  → Mistake Detection → AI Explanation → Human Verification
```

**AI can:** extract, classify, summarize, infer, suggest, rank, explain.

**Deterministic code alone controls:** authorization, tenant boundaries,
financial calculations, timestamps, state transitions, retention,
deletion, permissions, severity, evidence existence.

## Routing & Model Fallback Hierarchy
Not every document should go to an expensive model. The pipeline routes through explicit Gemini fallback chains:

```
Document → Classifier
   ├── Structured (CSV, XLSX) ──► Deterministic Parsers (No LLM needed)
   ├── Standard Ingestion ──────► Gemini Flash-Lite Tier
   │                              Primary: gemini-3.5-flash-lite
   │                              Fallback: gemini-3.1-flash-lite
   ├── Frontier / Reasoning ────► Gemini Flash Tier
   │                              Primary: gemini-3.7-flash
   │                              Fallback 1: gemini-3.6-flash
   │                              Fallback 2: gemini-3.5-flash
   └── Ambiguous (Confidence < 85%) ──► Human Review Queue
```


Optimize for accuracy, cost, latency, and reliability, in that priority order.


## Processing cache
Cache key: `document_hash + extraction_version + model_version` (see
[data-model.md § Ingestion](../02-architecture/data-model.md#ingestion)).
Identical documents under the same processing configuration should never
incur repeated processing cost — this is both a cost control and a
consistency guarantee (same input, same output, unless the extraction
pipeline itself changed).

## Permissions
Every AI agent has an explicit identity, tool list, scopes, limits, and
approval requirements — never implicit "the AI has whatever access is
convenient." See [ai-safety-policy.md](./ai-safety-policy.md) for the
two MVP agent types and what each can/cannot do.

## Quality and cost
Tracked continuously, not just pre-launch — see
[evaluation-framework.md](./evaluation-framework.md) for accuracy
thresholds and [model-risk-policy.md](./model-risk-policy.md) for
ongoing model risk review.
