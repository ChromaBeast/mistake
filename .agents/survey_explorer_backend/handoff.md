# Backend Specification Mining & Architectural Survey Report: Mistake (Go)

**Agent:** `survey_explorer_backend`  
**Date:** 2026-08-18  
**Scope:** Complete Go Backend Architecture, API Inventory, Multi-Tenant Storage Isolation, RBAC, Ingestion Pipeline, Entity Resolver, Deterministic Detection Engine, Financial Calculation (ADR-0002), Audit/Retention, Billing, and Testing Strategy.

---

## Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|---|---|---|---|---|---|---|
| 1 | Auth & Tenancy | Tenant & Account Creation | Signup creates a new tenant and an owner user | Company name, user email, name, password | JWT token, User object, Tenant object | Returns 400 `VALIDATION_FAILED` or 409 `EMAIL_EXISTS` | `api-spec.md:30`, `data-model.md:20-42` |
| 2 | Auth & Tenancy | User Authentication | Login authenticates user against tenant-scoped email & password hash | Email, password | JWT session token with tenant_id, user_id, role | Returns 401 `INVALID_CREDENTIALS` | `api-spec.md:31`, `access-control-policy.md` |
| 3 | Auth & Tenancy | MFA Verification | Validates TOTP/MFA code for privileged roles (Owner/Admin) | Session/MFA token, 6-digit code | Full access JWT token | Returns 401 `INVALID_MFA_CODE` | `api-spec.md:33`, `security-policy.md:15` |
| 4 | Auth & Tenancy | User Invite & RBAC Management | Admins/Owners invite users with specified fixed role | Email, name, role (`Owner`, `Admin`, `Manager`, `Analyst`, `Viewer`) | Invite record with single-use time-limited token | Returns 403 `FORBIDDEN` if non-admin or 400 if invalid role | `api-spec.md:46-48`, `access-control-policy.md:9-18` |
| 5 | Auth & Tenancy | Session Management | List and revoke active sessions centrally | Admin auth header, target session ID | List of sessions / revocation status | Returns 404 `SESSION_NOT_FOUND` or 403 `FORBIDDEN` | `api-spec.md:36-37` |
| 6 | Ingestion Pipeline | Multi-format File Ingestion | Accepts CSV, XLSX, PDF, Email exports, ERP flat exports | File upload multipart payload, Source type metadata | DataSource record (`id`, `storage_key`, `file_hash`, `status`) | Returns 400 `UNSUPPORTED_FORMAT` or 413 `FILE_TOO_LARGE` | `integration-spec.md:8-18`, `data-model.md:54-68` |
| 7 | Ingestion Pipeline | Ingestion State Machine | Async pipeline transitions: Queued -> Processing -> Extracting -> Analyzing -> Completed/Failed | DataSource ID triggered via worker goroutine | Stage-by-stage status progression and extracted documents/evidence | On failure, sets status `failed` with actionable `error_message` | `data-model.md:62-67`, `acceptance-criteria.md:55` |
| 8 | Ingestion Pipeline | Processing Deduplication Cache | Avoids repeated costly processing of identical documents | Cache key: `document_hash + extraction_version + model_version` | Cached evidence & structured entities | Bypasses reprocessing if identical key exists | `data-model.md:97-100`, `ai-policy.md:35-40` |
| 9 | Ingestion Pipeline | Structured Evidence Extraction | Extracted facts with location pointer, content hash, confidence | Document content stream | Evidence records with JSONB payload & vector embedding | Returns 422 if extraction fails | `data-model.md:79-95`, `event-model.md:22` |
| 10 | Entity Resolution | Canonical Entity Resolution | Resolves variant supplier/customer/product names to canonical entities | Raw names (e.g. "ABC Mfg.", "ABC Manufacturing Pvt Ltd") | Canonical Entity + Entity Alias records | Matches exact & normalized aliases | `user-stories.md:44-51`, `data-model.md:105-130` |
| 11 | Entity Resolution | Fuzzy Matching & Similarity Scoring | Evaluates string similarity & alias confidence score | Extracted entity name vs existing canonical entities | Confidence score (0.000 - 1.000) | Handled deterministically | `data-model.md:119`, `evaluation-framework.md:15` |
| 12 | Entity Resolution | Human Review Queue | Surfaces ambiguous matches (0.70 <= confidence < 0.95) for review | List query `GET /entities/review-queue` | Array of pending alias match candidates with score | Returns 200 with queue items | `api-spec.md:66`, `data-model.md:132-137` |
| 13 | Entity Resolution | Entity Merge & Reject Actions | Confirm merge from review queue or reject merge proposal | Entity ID, Target Entity ID / Merge action | Updated aliases, merged references, `entity.merged` event | Returns 404 if entity missing, 400 if invalid merge | `api-spec.md:67-68`, `event-model.md:49` |
| 14 | Event Subsystem | Temporal Event Sourcing | Emits timestamped events with separate `occurred_at` and `observed_at` | Domain actions (orders, invoices, payments, shipments) | Event records with JSONB payload and evidence link | Emits versioned events (`event_version`) | `event-model.md:3-31`, `data-model.md:228-244` |
| 15 | Event Subsystem | Entity Timeline Reconstruction | Reconstructs chronological business timeline across all sources | Entity ID query | Chronological ordered event list with source annotations | Returns 404 if entity not found | `api-spec.md:75`, `event-model.md:61` |
| 16 | Detection Engine | Quantity Mismatch Detection | Detects discrepancy between Order line qty and Invoice line qty | Order line items, Invoice line items | Mistake finding with exact delta and financial impact | Deterministic detection | `data-model.md:292-302`, `user-stories.md:62-64` |
| 17 | Detection Engine | Price Mismatch Detection | Detects unit price difference between PO line and Invoice line | PO unit price minor, Invoice unit price minor, Qty | Mistake finding with `price_mismatch` & financial delta | Deterministic detection | `user-stories.md:65-67`, `data-model.md:252` |
| 18 | Detection Engine | Date Mismatch Detection | Detects delivery delays beyond promised date or temporal anomalies | Shipment promised_date, delivered_at, PO/Invoice dates | Mistake finding with `date_mismatch` & days delayed | Deterministic detection | `user-stories.md:68-71`, `data-model.md:252` |
| 19 | Detection Engine | Status Mismatch Detection | Detects contradictory status across systems (ERP vs Logistics) | Order status, Shipment status, Invoice status | Mistake finding with `status_mismatch` | Deterministic detection | `user-stories.md:72-74`, `data-model.md:252` |
| 20 | Detection Engine | Missing Evidence Detection | Flags missing upstream/downstream evidence (e.g. Invoice without PO) | Entity/Document relational graph | Mistake finding with `missing_evidence` | Deterministic detection | `user-stories.md:75-78`, `data-model.md:252` |
| 21 | Financial Calculation | Deterministic Impact in Paise | Exact integer minor unit (paise) arithmetic (ADR-0002) | Mismatch quantities, prices in paise | `financial_impact_minor` (BIGINT/int64) | Never computed by AI; strict integer math | `ADR-0002:1-24`, `data-model.md:287-296` |
| 22 | Financial Calculation | Indian Currency Formatter | Formats minor units into Indian numbering system (Lakhs/Crores) | `amount_minor` (e.g. 15000000 paise) | Formatted string (e.g. "₹ 1,50,000.00") | Handles negative values and zero | `PRD.md:5`, `acceptance-criteria.md:74` |
| 23 | Finding Lifecycle | Mistake State Transitions | Lifecycle: `detected` -> `under_review` -> `verified` -> `resolved` / `dismissed` | Mistake ID, Target status, Reason string (required for resolve/dismiss) | Updated Mistake record, `mistake_transitions` row, audit event | Returns 400 if reason missing on dismiss/resolve | `api-spec.md:83`, `data-model.md:276-284` |
| 24 | Finding Lifecycle | Mistake Assignment | Assigns finding to specific internal user | Mistake ID, User ID | Updated Mistake record | Returns 404 if user not found | `api-spec.md:84` |
| 25 | Analytics & Dashboard | Business Health Summary | Aggregates total ₹ discrepancy, count by severity, active/resolved | Tenant ID session | `{ total_value_at_risk_minor, by_severity, by_status, recent_count }` | Returns 200 with aggregated metrics | `api-spec.md:86-87`, `user-stories.md:105-112` |
| 26 | Search | Cross-Entity Search | Unified search across entities, orders, POs, invoices, shipments, mistakes | Query string `?q=`, filter `?type=` | Unified search results with type, title, snippet, ID | Returns 200 with matches | `api-spec.md:91-93`, `ADR-0003:1-23` |
| 27 | Notifications | Internal User Notifications | Alert for high severity mistakes, assignments, reviews | User ID session | Notification list, mark as read endpoint | Returns 200 | `api-spec.md:97-100`, `system-architecture.md:118-123` |
| 28 | Audit Trail | Immutable Audit Logging | Tamper-evident audit logging for all critical operations | Actor ID, action, resource, before/after JSON, IP | Immutable `audit_logs` record | Fail-closed if logging fails | `data-model.md:307-318`, `security-policy.md:32-37` |
| 29 | Privacy & Compliance | Tenant Data Retention & Purge | Configurable retention period (30d, 90d, 1y, 7y) & physical purge | Tenant ID, Retention config | Deletes expired DB rows, object files, vector embeddings | Executes real deletion (not soft delete flag) | `data-retention-policy.md:1-24`, `deletion-policy.md:1-35` |
| 30 | Subscription & Billing | Subscription & Tier Engine | Manages plans (Trial, Starter ₹4.9k, Growth ₹14.9k, Enterprise ₹50k) | Tenant ID, plan selection | Subscription status, usage limits, mock invoices | Returns 200 / checkout session | `system-architecture.md:134-148`, `api-spec.md:112-116` |

---

## Edge Cases

| # | Feature | Input | Observed / Required Behavior |
|---|---|---|---|
| 1 | Tenant Isolation | Request includes query/body `tenant_id="tenant-B"` but auth token is for `tenant-A` | Reject immediately with HTTP 400 / 403 `TENANT_MISMATCH`. Never silently ignore or override with token tenant. |
| 2 | Financial Impact | Order has quantity mismatch AND price mismatch on the same line item | Create TWO separate `mistakes` records (one `quantity_mismatch`, one `price_mismatch`). Do not conflate into single composite finding. |
| 3 | Financial Impact | Invoice unit price is ₹0 or quantity is negative | Validate input; reject corrupt negative numbers with 400; if unit price is 0, impact is 0 paise. |
| 4 | State Machine | User attempts to transition directly from `detected` to `resolved` without `reason` | Reject with HTTP 400 `REASON_REQUIRED`. Transitions to `dismissed` or `resolved` strictly mandate a non-empty `reason`. |
| 5 | Entity Resolver | Two identical supplier names with different GSTIN or different addresses | Treat as ambiguous match; route to Review Queue (`confidence < 0.95`) rather than auto-merging. |
| 6 | Ingestion Pipeline | Uploaded file is encrypted/corrupted PDF or malformed CSV | Pipeline moves from `Processing` to `Failed`; writes actionable `error_message` (e.g. "Password-protected PDF" or "Invalid CSV delimiter"). |
| 7 | Ingestion Pipeline | Uploaded identical file uploaded twice | Check cache key `file_hash + extraction_version + model_version`; return cached evidence without burning compute/tokens. |
| 8 | Date Mismatch | Invoice date is earlier than Purchase Order creation date | Flag `date_mismatch` (impossible chronological event sequence); financial impact is 0 paise; severity is Medium. |
| 9 | Missing Evidence | Payment extracted with `invoice_id = NULL` (unallocated payment) | Create `missing_evidence` finding; financial impact = `payment.amount_minor`; severity is High/Critical based on amount. |
| 10 | Real Deletion | Tenant triggers deletion or retention expiry | Physically delete records from `orders`, `invoices`, `evidence`, `events`, vector embeddings, and delete object storage files. Audit log records the purge event. |

---

## 1. Observation

1. **Architecture & Principles**:
   - `docs/02-architecture/adr/0001-modular-monolith-first.md`: Mandates Phase 1 as a modular monolith in Go with in-process background workers and PostgreSQL + Redis + S3-compatible Object Storage.
   - `docs/02-architecture/adr/0002-ai-never-computes-money.md`: Mandates that `financial_impact_minor` is computed exclusively by deterministic integer arithmetic in Go applying fixed formulas per `mistake_type`. AI extracts parameters and explains results, but never computes or decides monetary amounts.
   - `docs/02-architecture/adr/0003-postgres-before-dedicated-search.md`: Mandates PostgreSQL full-text search and `pgvector` for search and semantic embeddings, avoiding dedicated search clusters for MVP.
   - `docs/01-product/PRD.md` & `docs/01-product/user-flows.md`: Outlines the core product loop: *Ingest -> Understand -> Resolve -> Reconstruct -> Compare -> Find Mistake -> Quantify -> Explain -> Verify -> Resolve*.

2. **Data Model & Money Storage**:
   - `docs/02-architecture/data-model.md`:
     - Every tenant-owned table carries `tenant_id UUID NOT NULL REFERENCES tenants(id)`.
     - Primary keys are UUIDs. Timestamps are TIMESTAMPTZ.
     - Currency values are stored in integer minor units (paise) as `BIGINT` (Go `int64`) with a `currency TEXT DEFAULT 'INR'` column.
     - Primary tables: `tenants`, `users`, `data_sources`, `documents`, `evidence`, `entities`, `entity_aliases`, `products`, `orders`, `order_lines`, `purchase_orders`, `po_lines`, `invoices`, `payments`, `shipments`, `events`, `mistakes`, `mistake_evidence`, `mistake_transitions`, `audit_logs`, `retention_policies`.

3. **API Surface**:
   - `docs/02-architecture/api-spec.md`:
     - Base path `/api/v1`.
     - Bearer token authentication with server-side tenant derivation.
     - Endpoints across `/auth`, `/tenant`, `/users`, `/data-sources`, `/documents`, `/entities`, `/events`, `/mistakes`, `/dashboard/summary`, `/search`, `/notifications`, `/audit-logs`, `/retention-policy`, `/billing`.
     - Standardized error format: `{ "error": { "code": "...", "message": "...", "details": {} } }`.

4. **Security & RBAC**:
   - `docs/03-security/access-control-policy.md`:
     - 5 fixed roles: `Owner`, `Admin`, `Manager`, `Analyst`, `Viewer`.
     - Authorization must be checked server-side on every request.
     - Cross-tenant requests must fail closed.

5. **Code Quality Constraint**:
   - Rule `<RULE[user_global]>` & Dispatch: Every Go source file must remain readable and strictly under 200 lines of code (<200 LoC).

---

## 2. Logic Chain

1. **Modularity & Layering**:
   - Because the system is a modular monolith, we organize the backend into clean domain packages (`auth`, `tenant`, `ingestion`, `resolver`, `event`, `detection`, `financial`, `mistake`, `search`, `audit`, `billing`, `retention`).
   - By separating interfaces, domain models, storage repositories, business services, and HTTP handlers into dedicated files, every single Go source file can easily stay between 50 and 150 lines of code, well below the 200 LoC threshold.

2. **Tenant Isolation Enforcement**:
   - A dedicated `TenantContext` middleware extracts the JWT claims, injects `TenantID`, `UserID`, and `Role` into the Go `context.Context`.
   - Every repository method accepts `ctx context.Context` and binds `tenant_id` to every SQL query / storage query, guaranteeing zero cross-tenant leakage.

3. **Ingestion & Async Pipeline**:
   - When a user uploads a document via `POST /api/v1/data-sources`, the file is stored in ObjectStorage, a `data_sources` record is inserted with `status = "queued"`, and an asynchronous task is dispatched to an in-process worker pool.
   - The worker parses the file (CSV/XLSX/PDF/EML), extracts structured facts, records `documents` and `evidence`, triggers the `EntityResolver`, creates `events`, and executes the `DetectionEngine`.
   - On completion, `data_sources.status` becomes `"completed"`, and new `mistakes` are populated in the database.

4. **Entity Resolution Logic**:
   - Extracted entity strings are normalized (case folding, trimming punctuation, stripping common legal suffixes: "Pvt Ltd", "Limited", "LLP").
   - The resolver first queries for exact alias match. If absent, it computes similarity (Levenshtein / Jaro-Winkler).
   - If similarity score $\ge 0.95$, it automatically associates the alias with the canonical entity.
   - If $0.70 \le \text{score} < 0.95$, it inserts an entry into `entities/review-queue`.
   - If $< 0.70$, it creates a new canonical entity.

5. **Detection Rules & Minor Unit Arithmetic**:
   - Detection engine runs 5 deterministic checkers:
     1. **Quantity Mismatch**: `|order_line.quantity - invoice_line.quantity| * invoice_line.unit_price_minor`.
     2. **Price Mismatch**: `|po_line.unit_price_minor - invoice_line.unit_price_minor| * invoice_line.quantity`.
     3. **Date Mismatch**: Identifies shipments where `delivered_at > promised_date` (or `promised_date` passed without delivery) or `invoice.issued_at < po.occurred_at`.
     4. **Status Mismatch**: Flags discrepancies where Order is marked "Completed" in ERP but Shipment is "Returned/Failed" or Invoice is "Cancelled".
     5. **Missing Evidence**: Flags orphan invoices missing associated POs, orphan shipments missing orders, or orphan payments missing invoices.
   - Severity rubric:
     - Critical: Impact $> ₹1,00,000$ (10,000,000 paise).
     - High: Impact $> ₹25,000$ (2,500,000 paise) or delivery delay $> 14$ days.
     - Medium: Impact $> ₹5,000$ (500,000 paise) or delivery delay $> 3$ days.
     - Low: Impact $\le ₹5,000$ (500,000 paise).
     - Healthy: No discrepancies found.

6. **Audit & Compliance**:
   - Every state change on mistakes, user roles, retention policies, and file deletions triggers an immutable row in `audit_logs`.

---

## 3. Caveats

1. **AI Extraction vs. Local Mock**:
   - In offline / local test environments, document parsing and evidence extraction will use deterministic parsers (CSV, XLSX, PDF text extractors) and synthetic extraction models so that the entire backend test suite (`go test ./...`) executes deterministically without relying on third-party AI API keys.
2. **Database Engine Support**:
   - The data access layer will be designed with clean interfaces so it can run against PostgreSQL + pgvector in production/Docker, and SQLite / In-Memory with full SQL schema compatibility for rapid unit and integration testing.
3. **Compound Mismatches**:
   - Per ADR-0002 and `data-model.md`, when an order and invoice differ in both quantity and price, two distinct `mistakes` records are generated rather than a single merged record.

---

## 4. Conclusion & Backend Package Structure (<200 LoC Blueprint)

The Go backend must be constructed with a clean, decoupled modular monolith layout where **every file is strictly under 200 LoC**.

### Target Go Module Structure:
```
backend/
├── go.mod
├── go.sum
├── cmd/
│   └── server/
│       ├── main.go                       (<120 LoC) Entrypoint & server bootstrap
│       └── router.go                     (<140 LoC) Route registration
├── internal/
│   ├── config/
│   │   └── config.go                     (<110 LoC) Environment & settings
│   ├── middleware/
│   │   ├── auth.go                       (<130 LoC) JWT & Session validation
│   │   ├── tenant.go                     (<90 LoC)  Tenant context injection
│   │   ├── rbac.go                       (<110 LoC) Role-based permission checks
│   │   ├── audit.go                      (<90 LoC)  Automatic audit logging
│   │   ├── cors.go                       (<60 LoC)  CORS & headers
│   │   └── recover.go                    (<50 LoC)  Panic recovery & error handler
│   ├── domain/
│   │   ├── tenant.go                     (<80 LoC)  Tenant & User domain models
│   │   ├── datasource.go                 (<90 LoC)  DataSource & Document models
│   │   ├── evidence.go                   (<80 LoC)  Evidence & extraction models
│   │   ├── entity.go                     (<90 LoC)  Entity & Alias models
│   │   ├── business.go                   (<140 LoC) Orders, POs, Invoices, Payments
│   │   ├── event.go                      (<80 LoC)  Event models & catalog
│   │   ├── mistake.go                    (<110 LoC) Mistake & Transition models
│   │   ├── audit.go                      (<60 LoC)  AuditLog domain model
│   │   ├── retention.go                  (<60 LoC)  RetentionPolicy model
│   │   └── billing.go                    (<80 LoC)  Subscription & Billing models
│   ├── financial/
│   │   ├── paise.go                      (<90 LoC)  Minor unit exact arithmetic
│   │   └── format.go                     (<80 LoC)  Indian currency string formatter
│   ├── rbac/
│   │   ├── roles.go                      (<70 LoC)  Role definitions & constants
│   │   └── matrix.go                     (<90 LoC)  Permission matrix evaluation
│   ├── storage/
│   │   ├── store.go                      (<80 LoC)  Store interface definition
│   │   ├── memory_store.go               (<160 LoC) Thread-safe multi-tenant memory store
│   │   ├── tenant_repo.go                (<120 LoC) Tenant & User storage
│   │   ├── entity_repo.go                (<140 LoC) Entity & Alias storage
│   │   ├── business_repo.go              (<150 LoC) Order, PO, Invoice storage
│   │   ├── mistake_repo.go               (<140 LoC) Mistake & Transition storage
│   │   ├── event_repo.go                 (<110 LoC) Event storage & timelines
│   │   └── audit_repo.go                 (<90 LoC)  Audit log storage
│   ├── pipeline/
│   │   ├── pipeline.go                   (<120 LoC) Ingestion state machine
│   │   ├── worker.go                     (<110 LoC) Async background worker pool
│   │   ├── parser_csv.go                 (<130 LoC) CSV & TSV parser
│   │   ├── parser_xlsx.go                (<140 LoC) XLSX workbook parser
│   │   ├── parser_pdf.go                 (<130 LoC) PDF text & table parser
│   │   └── parser_email.go               (<120 LoC) Email & EML parser
│   ├── resolver/
│   │   ├── resolver.go                   (<130 LoC) Entity resolver engine
│   │   ├── matcher.go                    (<110 LoC) String similarity & Levenshtein
│   │   └── review_queue.go               (<90 LoC)  Review queue management
│   ├── detection/
│   │   ├── engine.go                     (<130 LoC) Orchestration of detection rules
│   │   ├── detect_quantity.go            (<110 LoC) Quantity mismatch detector
│   │   ├── detect_price.go               (<110 LoC) Price mismatch detector
│   │   ├── detect_date.go                (<110 LoC) Date mismatch detector
│   │   ├── detect_status.go              (<110 LoC) Status mismatch detector
│   │   ├── detect_missing.go             (<110 LoC) Missing evidence detector
│   │   └── severity.go                   (<90 LoC)  Deterministic severity rubric
│   ├── handlers/
│   │   ├── helpers.go                    (<80 LoC)  JSON response & error helpers
│   │   ├── auth_handler.go               (<150 LoC) Signup, Login, Logout, MFA
│   │   ├── tenant_handler.go             (<110 LoC) Tenant settings & Users
│   │   ├── datasource_handler.go         (<130 LoC) Upload & Processing status
│   │   ├── entity_handler.go             (<140 LoC) Entities, aliases, review queue
│   │   ├── event_handler.go              (<110 LoC) Events & Entity timelines
│   │   ├── mistake_handler.go            (<150 LoC) Mistake listing & detail
│   │   ├── mistake_transition_handler.go (<130 LoC) Status transitions & assign
│   │   ├── dashboard_handler.go          (<120 LoC) Business Health Summary metrics
│   │   ├── search_handler.go             (<110 LoC) Global cross-entity search
│   │   ├── notification_handler.go       (<90 LoC)  User notifications
│   │   ├── audit_handler.go              (<90 LoC)  Audit logs query
│   │   ├── retention_handler.go          (<90 LoC)  Retention policy settings
│   │   └── billing_handler.go            (<110 LoC) Subscription, checkout, invoices
│   └── seed/
│       ├── seed_data.go                  (<160 LoC) Indian B2B sample generator
│       └── sample_files.go               (<140 LoC) Ingestion test files generator
└── test/
    ├── auth_test.go                      (<150 LoC) Auth & RBAC integration tests
    ├── detection_test.go                 (<160 LoC) Mismatch detection test suite
    ├── financial_test.go                 (<120 LoC) Paise arithmetic test suite
    ├── pipeline_test.go                  (<150 LoC) Async pipeline test suite
    └── resolver_test.go                  (<140 LoC) Entity resolver test suite
```

---

## 5. Verification Method

To independently verify the backend architecture and specification conformance:

1. **Verify Go Environment**:
   ```bash
   go version
   # Expected: go version go1.25.5 windows/amd64 (verified)
   ```

2. **Verify Code Layout & Line Count Compliance (<200 LoC)**:
   ```powershell
   Get-ChildItem -Path c:/Users/sheer/Documents/antigravity/proud-curie/backend -Recurse -Filter *.go | ForEach-Object {
       $lines = (Get-Content $_.FullName | Measure-Object -Line).Lines
       if ($lines -ge 200) {
           Write-Error "File exceeds 200 lines: $($_.FullName) ($lines lines)"
       }
   }
   ```

3. **Verify Full Backend Test Suite**:
   ```bash
   cd c:/Users/sheer/Documents/antigravity/proud-curie/backend
   go test -v -race ./...
   ```

4. **Verify Deterministic Financial Impact & Currency Formatter**:
   Run the financial unit tests verifying paise calculations:
   - Order (500 units @ ₹1,200) vs Invoice (450 units @ ₹1,200) -> Exact delta: 50 units * 120,000 paise = 6,000,000 paise (₹60,000.00).
   - PO (1,000 units @ ₹4,500 = 450,000 paise) vs Invoice (1,000 units @ ₹4,850 = 485,000 paise) -> Exact delta: 35,000 paise * 1,000 = 35,000,000 paise (₹3,50,000.00).
   - Zero floating point drift across all computations.

5. **Verify Multi-Tenant Boundary Enforcement**:
   Execute cross-tenant API tests ensuring tenant A cannot read or mutate tenant B records.
