# Mistake — Product Requirements Document

**Status:** Draft v2.0 (restructured from v1.0)
**Product:** Mistake
**Target Market:** India-first, B2B
**Platforms:** Web (primary), Mobile (secondary)

This is the top-level PRD. It defines *what* Mistake is and *why* it exists.
Detailed specs live in sibling documents — this file links out rather than
duplicating them:

| Concern | Document |
|---|---|
| Vision, positioning | [product-vision.md](./product-vision.md) |
| Personas | [personas.md](./personas.md) |
| User stories, epics | [user-stories.md](./user-stories.md) |
| Core flows | [user-flows.md](./user-flows.md) |
| Delivery plan | [roadmap.md](./roadmap.md) |
| MVP exit criteria | [acceptance-criteria.md](./acceptance-criteria.md) |
| System design | [../02-architecture/system-architecture.md](../02-architecture/system-architecture.md) |
| Database schema | [../02-architecture/data-model.md](../02-architecture/data-model.md) |
| API surface | [../02-architecture/api-spec.md](../02-architecture/api-spec.md) |
| Event catalog | [../02-architecture/event-model.md](../02-architecture/event-model.md) |
| AI architecture & guardrails | [../06-ai/ai-policy.md](../06-ai/ai-policy.md) |

---

## 1. Problem

Businesses hold the same underlying facts in multiple disconnected places —
ERP, email, WhatsApp, spreadsheets, PDFs, accounting systems — and those
records drift apart:

```
Order            → ERP
Quantity change  → Email
Different qty    → WhatsApp
PO               → Accounting
Invoice          → Finance
Shipment         → Logistics
```

The drift produces financial leakage, incorrect invoices, quantity
discrepancies, missed deliveries, undocumented changes, and disputes that
get reconciled manually, late, or not at all.

## 2. What Mistake does

Mistake ingests a company's existing records (CSV, XLSX, PDF, email
exports, ERP exports, manual uploads — **no live integration required to
get value**), and:

1. Extracts structured information from unstructured/semi-structured input
2. Resolves entities across sources (same supplier, different spellings)
3. Reconstructs a timeline of events per business object
4. Compares related records for contradictions
5. Calculates deterministic financial impact
6. Presents every finding with its supporting evidence

**Product promise:** *Find what doesn't add up in your business.*

The MVP is intentionally narrow: detect contradictions and money leaks in
uploaded records. It is explicitly **not** a generalized autonomous
business platform, an ERP, or a chatbot. See
[MVP scope](#4-mvp-scope) and non-goals below.

## 3. Target customers

Manufacturers, distributors, wholesalers, trading companies, and
logistics-heavy businesses with meaningful PO/invoice reconciliation
volume and heavy reliance on spreadsheets/ERP exports — i.e. businesses
where a discrepancy has a real financial or operational consequence.
Full persona detail: [personas.md](./personas.md).

## 4. MVP scope

**In scope:**
- Inputs: CSV, XLSX, PDF, email exports, ERP exports, manual uploads
- Entities: Customer, Supplier, Product, Order, Purchase Order, Invoice,
  Payment, Shipment
- Detection: quantity mismatch, price mismatch, date mismatch, status
  mismatch, missing evidence
- Full issue lifecycle: Detected → Under Review → Verified →
  Resolved/Unresolved, or Dismissed
- Business Health Dashboard, Investigation Workspace, evidence trail
- Multi-tenant, RBAC, audit logging, tenant-isolated from day one

**Explicitly out of scope for MVP** (see
[roadmap.md § Future Expansion](./roadmap.md#future-expansion) for when
these get revisited):
- Live integrations (WhatsApp API, ERP write-back, accounting connectors)
- Autonomous agents or autonomous external communication
- Voice agent
- Graph database, Kubernetes-first architecture, custom permission engine
- Broad business automation beyond finding and explaining mistakes

## 5. Core value proposition

> **Mistake finds contradictions and potential money leaks hidden across
> your business records** — evidence-backed, explainable, with no
> integration project required to see first value.

Supporting pillars: multi-source reconciliation, financial impact
analysis, auditability, temporal reasoning (what happened vs. when we
found out), privacy-conscious architecture, enterprise-grade security
foundation from day one (not bolted on later).

## 6. Success metrics

**North Star:** Verified Mistakes Resolved.
**Long-term business metric:** ₹ Value Protected.

Full metric tree, targets, and AI quality/cost metrics:
[roadmap.md § Metrics](./roadmap.md#metrics-north-star--supporting).

## 7. Brand

The name inverts the usual enterprise-software pattern — instead of
"analytics platform" or "reconciliation engine," it names the problem
directly. Full positioning, taglines, and expansion principle:
[product-vision.md](./product-vision.md#brand-positioning).

## 8. Strategic product principles

1. Value before integration — usefulness before every system is connected
2. Evidence before conclusions — every finding is traceable
3. AI assists; deterministic systems decide — the LLM is never the
   authoritative business database
4. Security is part of the product, not an add-on
5. Tenant isolation is architectural, never frontend-enforced
6. Event-driven infrastructure only when a real requirement justifies it
7. AI unit economics are a first-class requirement, not an afterthought
8. Human approval gates every consequential action
9. Measure business outcomes (Mistakes resolved) over AI usage volume
10. Don't over-engineer the MVP — prove the core intelligence first

## 9. Definition of Done

A feature is complete only when: functional implementation exists,
authorization is enforced, tenant isolation is verified, audit events
exist where required, errors are handled, observability exists, tests
exist, docs exist, security implications are reviewed, and acceptance
criteria pass.

AI features additionally require: an evaluation dataset, measured
accuracy, documented failure modes, prompt-injection testing, model/version
tracking, cost measurement, and a human fallback path where appropriate.

## 10. Final product definition

Mistake is not an AI chatbot, not an ERP, not a generic analytics
dashboard. It is:

> **An evidence-backed system that finds mistakes hidden across business
> records.**

Core loop: **Ingest → Understand → Resolve → Reconstruct → Compare →
Find Mistake → Quantify → Explain → Verify → Resolve.**
