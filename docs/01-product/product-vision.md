# Product Vision

## Vision statement

Mistake becomes a trusted intelligence layer that continuously identifies
things that do not agree across a company's operational reality. It does
not replace business systems — it sits **above them as a verification and
intelligence layer**.

The long-term system should be able to answer, for any finding:

| Question | Answered by |
|---|---|
| What happened? | Event reconstruction |
| When did it happen? | Temporal model (`occurred_at`) |
| Which records support it? | Evidence trail |
| Which records contradict it? | Contradiction engine |
| How confident are we? | Confidence scoring |
| What financial impact could this have? | Financial impact engine |
| What should a human investigate? | Severity + recommended action |
| Has the issue been resolved? | Mistake lifecycle state |

## Expansion trajectory

MVP → reconciliation and contradiction detection only. Later phases (not
committed, sequenced by validated demand — see
[roadmap.md](./roadmap.md#future-expansion)):

- Live integrations (ERP, accounting, WhatsApp, email)
- Operational risk and anomaly detection beyond simple mismatches
- Forecasting (e.g. predicted late deliveries before they're late)
- Controlled AI actions (draft-and-approve workflows)
- Continuous business monitoring (push, not pull)

## Brand positioning

### Brand idea

The name **Mistake** intentionally flips the usual enterprise-software
naming pattern. Instead of presenting as another generic "AI platform,"
"analytics platform," "data platform," or "reconciliation engine," the
brand states the problem directly:

> **Mistake finds mistakes before they become expensive.**

### Tagline candidates

| Use | Tagline |
|---|---|
| Primary | Mistake — Find what doesn't add up. |
| Secondary | Mistake — Catch problems before they cost you. |
| Long-term / enterprise | Mistake — Business intelligence you can investigate. |

### Brand principle

The name should not restrict the company to document reconciliation.
Mistake can eventually expand into operational risk, anomaly detection,
workflow intelligence, forecasting, controlled AI actions, and continuous
business monitoring — the brand describes an outcome ("we catch what's
wrong"), not a mechanism, so it doesn't need to be retired as the product
grows.

### Naming disambiguation

"Mistake" is used two ways in this document set and must stay
disambiguated in the product UI:

- **Mistake** (capitalized, brand) — the company/product.
- **a mistake** (lowercase, or "finding" / "issue" in code and API) — a
  single detected contradiction.

In code, API payloads, and the database, use `mistake` / `issue`
interchangeably as the object name (see
[data-model.md](../02-architecture/data-model.md#mistakes)) but keep
user-facing copy consistent with whatever the UI team finalizes during
design — recommend defaulting to "issue" in-product and reserving
"Mistake" for the brand, to avoid "3 Mistakes found" reading ambiguously
in support conversations.
