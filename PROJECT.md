# Project: Mistake

Evidence-backed B2B discrepancy and financial leakage detection platform for manufacturers, distributors, and wholesalers (India-first, INR currency in paise minor units).

## Architecture

Mistake is built as a three-tier architecture:
1. **Backend (`backend/`)**: Modular monolith in Go 1.25 with layered domain packages, thread-safe multi-tenant storage, in-process async ingestion pipeline, deterministic discrepancy detection engine, and exact integer minor unit (paise) financial arithmetic.
2. **Web (`web/`)**: Next.js 14 App Router with TypeScript and Tailwind CSS, featuring an India-first B2B design system, dark/light theme, INR formatting utilities, and dual-mode API client (`HttpApiClient` + `MockApiClient`).
3. **Mobile (`mobile/`)**: Flutter 3.44+ application for factory floor document capture, barcode/QR quick inspection simulation, executive swipeable triage, and offline-first sync powered by Riverpod state management.

```
                    ┌─────────────────────────┐
                    │      Mistake Users      │
                    └────┬───────────────┬────┘
                         │               │
            Web (Next.js)│               │Mobile (Flutter)
                         ▼               ▼
          ┌─────────────────────────────────────────┐
          │         Go REST API (/api/v1)           │
          ├─────────────────────────────────────────┤
          │  Auth / RBAC / Multi-Tenant Isolation   │
          │  Ingestion Pipeline (5-State Machine)   │
          │  Entity Resolver & Review Queue         │
          │  Deterministic Detection Engine         │
          │  Paise Financial Math (ADR-0002)        │
          │  Audit Logs / Retention / Billing       │
          └─────────────────────────────────────────┘
```

---

## Feature Inventory

Every feature across Backend, Web, and Mobile is enumerated below with its assigned milestone.

| # | Feature | Description | Milestone | Source | Status |
|---|---------|-------------|-----------|--------|:------:|
| 1 | Tenant & Account Creation | Signup creates isolated tenant and Owner user | M1 (Backend), M2 (Web) | Survey/Docs | DONE |
| 2 | User Auth & MFA | Login, session tokens, TOTP MFA challenge | M1 (Backend), M2 (Web), M3 (Mobile) | Survey/Docs | DONE |
| 3 | User Invite & RBAC | 5-tier role matrix (Owner, Admin, Manager, Analyst, Viewer) | M1 (Backend), M2 (Web) | Survey/Docs | DONE |
| 4 | Multi-Format Ingestion | Accepts CSV, XLSX, PDF, EML, and ERP exports | M1 (Backend), M2 (Web), M3 (Mobile) | Survey/Docs | DONE |
| 5 | Ingestion State Machine | 5-stage async progression: Queued -> Processing -> Extracting -> Analyzing -> Completed | M1 (Backend), M2 (Web), M3 (Mobile) | Survey/Docs | DONE |
| 6 | Deduplication Cache | Caches extracted evidence by file hash & version | M1 (Backend) | Survey/Docs | DONE |
| 7 | Structured Evidence Extraction | Extracts facts with location pointers, hashes, confidence | M1 (Backend), M2 (Web) | Survey/Docs | DONE |
| 8 | Canonical Entity Resolution | Resolves variant names to canonical suppliers/customers | M1 (Backend), M2 (Web) | Survey/Docs | DONE |
| 9 | Fuzzy Matching & Similarity | Levenshtein/Jaro-Winkler similarity scoring | M1 (Backend) | Survey/Docs | DONE |
| 10 | Human Review Queue | Surfaces ambiguous matches (0.70-0.95) for review | M1 (Backend), M2 (Web) | Survey/Docs | DONE |
| 11 | Entity Merge & Reject | Actions to merge canonical entities or reject aliases | M1 (Backend), M2 (Web) | Survey/Docs | DONE |
| 12 | Temporal Event Sourcing | Timestamped events with occurred_at vs observed_at | M1 (Backend), M2 (Web) | Survey/Docs | DONE |
| 13 | Reconstructed Timeline | Chronological cross-source entity business timeline | M1 (Backend), M2 (Web) | Survey/Docs | DONE |
| 14 | Quantity Mismatch Detection | PO/Order vs Invoice line item quantity variance | M1 (Backend), M2 (Web), M3 (Mobile) | Survey/Docs | DONE |
| 15 | Price Mismatch Detection | PO/Order vs Invoice unit price variance | M1 (Backend), M2 (Web), M3 (Mobile) | Survey/Docs | DONE |
| 16 | Date Mismatch Detection | Promised vs delivery delays and retroactive dates | M1 (Backend), M2 (Web), M3 (Mobile) | Survey/Docs | DONE |
| 17 | Status Mismatch Detection | Order vs Shipment vs Invoice status contradictions | M1 (Backend), M2 (Web), M3 (Mobile) | Survey/Docs | DONE |
| 18 | Missing Evidence Detection | Orphan invoices, shipments without POs/orders | M1 (Backend), M2 (Web), M3 (Mobile) | Survey/Docs | DONE |
| 19 | Deterministic Paise Math | Exact integer minor unit (paise) math (ADR-0002) | M1 (Backend), M2 (Web), M3 (Mobile) | Survey/Docs | DONE |
| 20 | Indian Currency Formatter | Paise to ₹ Lakhs, Crores, and Indian comma notation | M1 (Backend), M2 (Web), M3 (Mobile) | Survey/Docs | DONE |
| 21 | Mistake State Transitions | Detected -> Under Review -> Verified -> Resolved/Dismissed | M1 (Backend), M2 (Web), M3 (Mobile) | Survey/Docs | DONE |
| 22 | Mandatory Reason Logging | Enforces reason selection upon Dismiss/Resolve | M1 (Backend), M2 (Web), M3 (Mobile) | Survey/Docs | DONE |
| 23 | Mistake Assignment | Assigns findings to internal users | M1 (Backend), M2 (Web) | Survey/Docs | DONE |
| 24 | Business Health Dashboard | KPIs, ₹ leakage breakdown, risk score, trend charts | M1 (Backend), M2 (Web), M3 (Mobile) | Survey/Docs | DONE |
| 25 | Side-by-Side Evidence Inspector | Split-pane document viewer with bounding highlights | M2 (Web) | Survey/Docs | DONE |
| 26 | Global Cross-Domain Search | Cmd+K instant search across entities, orders, mistakes | M1 (Backend), M2 (Web) | Survey/Docs | DONE |
| 27 | Immutable Audit Trail | Tamper-evident logging of all mutations and diffs | M1 (Backend), M2 (Web) | Survey/Docs | DONE |
| 28 | Data Retention & Purge | Configurable retention periods and real data purge | M1 (Backend), M2 (Web) | Survey/Docs | DONE |
| 29 | Subscription & Billing | Tier management, mock checkout, and invoices | M1 (Backend), M2 (Web) | Survey/Docs | DONE |
| 30 | Internal Notifications | Alerts for critical leaks, assignments, completions | M1 (Backend), M2 (Web), M3 (Mobile) | Survey/Docs | DONE |
| 31 | Factory Floor Multi-Page Scanner | Mobile camera scanner simulation with edge detection | M3 (Mobile) | Survey/Docs | DONE |
| 32 | Ambient Lighting Lux Meter | Mobile lighting quality indicator & flash helper | M3 (Mobile) | Survey/Docs | DONE |
| 33 | Barcode / QR Floor Inspection | Viewfinder laser simulation and instant discrepancy check | M3 (Mobile) | Survey/Docs | DONE |
| 34 | Executive Swipeable Triage | Card deck gesture review (Verify, Dismiss, Escalate) | M3 (Mobile) | Survey/Docs | DONE |
| 35 | Offline Cache & Replay Sync | Local queue and network simulator (Online/2G/Offline) | M3 (Mobile) | Survey/Docs | DONE |
| 36 | Comprehensive E2E Verification | 4-Tier requirement-driven opaque-box test suite | M4 (E2E & Hardening) | Survey/Docs | DONE |

---

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|:------:|
| M0 | E2E Testing Suite Track | Design & implement 4-Tier test suite & runner (`TEST_READY.md`) | none | DONE |
| M1 | Go Backend Modular Monolith | Complete REST API, Multi-tenant store, RBAC, Ingestion, Resolver, Detection Engine, Paise Math, Go Tests | none | DONE |
| M2 | Next.js Web Application | India-first B2B UI, 7 core screens, Side-by-side Evidence Inspector, Dual API client, clean build | none | DONE |
| M3 | Flutter Mobile Application | Document capture scanner, Barcode/QR inspection, Executive swipe triage, Riverpod, clean analyze | none | DONE |
| M4 | Final E2E Pass & Hardening | 100% E2E test pass across all tiers, Adversarial coverage hardening, Forensic Audit approval | M0, M1, M2, M3 | DONE |

---

## Interface Contracts

### Backend REST API (`/api/v1`)
- **Authentication**: `Authorization: Bearer <session_token>`
- **Standard Error Response**:
  ```json
  {
    "error": {
      "code": "VALIDATION_ERROR | UNAUTHORIZED | FORBIDDEN | NOT_FOUND | CONFLICT | TENANT_MISMATCH",
      "message": "Human readable description",
      "details": {}
    }
  }
  ```
- **Financial Units**: All monetary values (`financial_impact_minor`, `amount_minor`, `unit_price_minor`) are represented as signed 64-bit integers (`int64` in Go, `number`/`bigint` in TS, `int` in Dart) representing **Paise** (1 INR = 100 Paise).

### Key REST Endpoints
- `POST /api/v1/auth/signup`, `POST /api/v1/auth/login`, `POST /api/v1/auth/mfa/verify`
- `GET /api/v1/tenant`, `PATCH /api/v1/tenant`, `GET /api/v1/users`, `POST /api/v1/users/invite`
- `POST /api/v1/data-sources`, `GET /api/v1/data-sources`, `GET /api/v1/data-sources/:id`
- `GET /api/v1/entities`, `GET /api/v1/entities/:id`, `GET /api/v1/entities/review-queue`, `POST /api/v1/entities/:id/merge`, `POST /api/v1/entities/:id/reject-merge`
- `GET /api/v1/events`, `GET /api/v1/entities/:id/timeline`
- `GET /api/v1/mistakes`, `GET /api/v1/mistakes/:id`, `PATCH /api/v1/mistakes/:id/status`, `PATCH /api/v1/mistakes/:id/assign`
- `GET /api/v1/dashboard/summary`
- `GET /api/v1/search?q=&type=`
- `GET /api/v1/notifications`, `PATCH /api/v1/notifications/:id/read`
- `GET /api/v1/audit-logs`, `GET /api/v1/retention-policy`, `PATCH /api/v1/retention-policy`
- `GET /api/v1/billing/subscription`, `POST /api/v1/billing/checkout`

---

## Code Layout & Strict Governance

### Hard Constraint: Every non-data / non-json source file across Go, TypeScript/CSS, and Dart must strictly remain readable and under 200 lines of code (<200 LoC).

- **`backend/`**: Go modular monolith package hierarchy (95 files, all <200 LoC).
- **`web/`**: Next.js App Router hierarchy (132 files, all <200 LoC).
- **`mobile/`**: Flutter Riverpod modular hierarchy (104 files, all <200 LoC).
- **`e2e/`**: Comprehensive 4-Tier test suite runner and tests (33 files, all <200 LoC).
