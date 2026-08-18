# Handoff Report: Web Frontend (Next.js) Specification Survey

**Author**: `survey_explorer_web` (Specification Miner)  
**Date**: 2026-08-18  
**Target Platform**: Next.js App Router, Tailwind CSS, TypeScript, India-first B2B Architecture  
**Working Directory**: `c:/Users/sheer/Documents/antigravity/proud-curie/.agents/survey_explorer_web`

---

## 1. Observation

Authoritative specification sources inspected across `docs/` and `.agents/ORIGINAL_REQUEST.md`:
1. **Original Request (`.agents/ORIGINAL_REQUEST.md`)**:
   - Platform name: **Mistake** — Evidence-backed B2B discrepancy and financial leakage detection platform for manufacturers, distributors, and wholesalers.
   - Core currency: INR with all financial numbers stored in integer minor units (**paise**).
   - High-performance, premium B2B UI with dark/light theme, clean `npm run build` with zero type errors.
   - Mandatory rule: **Every non-data/non-json source file across TypeScript/CSS must strictly remain readable and under 200 lines of code (<200 LoC)**.
2. **Product Requirements & Flows (`docs/01-product/`)**:
   - `PRD.md`: Core loop — Ingest → Understand → Resolve → Reconstruct → Compare → Find Mistake → Quantify → Explain → Verify → Resolve. MVP inputs: CSV, XLSX, PDF, email exports, ERP exports, manual uploads.
   - `user-flows.md`: 
     - First session to "Aha moment" in <5 min: Landing → Create Account/Tenant → Upload Records → Processing (`Queued → Processing → Extracting → Analyzing → Completed`) → Entity Extraction/Resolution → Event Creation → Mistake Detection → Business Health Dashboard ("Found 14 mistakes") → Open Mistake → Review Evidence → Verify/Dismiss → Resolve.
     - Ongoing investigation flow: Filter by severity/persona → Investigation Workspace → Verify (assign/resolve) or Dismiss (record reason).
     - Administration flow: Users & RBAC → Data Retention → Immutable Audit Log.
   - `user-stories.md`: Epics 1–8 mapping all customer workflows and acceptance criteria.
   - `personas.md`: Business Owner (Dashboard & ₹ Leakage), Operations Manager (Operational issues & triage), Finance Manager (Price/Qty mismatches & PO-invoice reconciliation), Analyst (Evidence trail & timeline), Admin (RBAC, retention, audit).
3. **Architecture & Schema (`docs/02-architecture/`)**:
   - `system-architecture.md`: Modular monolith REST API base path `/api/v1`. Web is Next.js + TypeScript.
   - `api-spec.md`:
     - Auth: `POST /auth/signup`, `POST /auth/login`, `POST /auth/logout`, `POST /auth/mfa/verify`, `POST /auth/password/reset-request`, `POST /auth/password/reset`, `GET /auth/sessions`, `DELETE /auth/sessions/:id`.
     - Users & Tenant: `GET /tenant`, `PATCH /tenant`, `GET /users`, `POST /users/invite`, `PATCH /users/:id/role`, `PATCH /users/:id/status`.
     - Data Sources: `POST /data-sources`, `GET /data-sources`, `GET /data-sources/:id`, `GET /documents/:id`, `GET /documents/:id/evidence`.
     - Entities: `GET /entities`, `GET /entities/:id`, `GET /entities/review-queue`, `POST /entities/:id/merge`, `POST /entities/:id/reject-merge`.
     - Events & Timeline: `GET /events`, `GET /entities/:id/timeline`.
     - Mistakes (Findings): `GET /mistakes`, `GET /mistakes/:id`, `PATCH /mistakes/:id/status` (requires `reason` for dismiss/resolve), `PATCH /mistakes/:id/assign`, `GET /mistakes/:id/transitions`, `GET /dashboard/summary`.
     - Search: `GET /search?q=&type=`.
     - Notifications: `GET /notifications`, `PATCH /notifications/:id/read`.
     - Audit & Retention: `GET /audit-logs`, `GET /retention-policy`, `PATCH /retention-policy`.
     - Billing: `GET /billing/subscription`, `POST /billing/checkout`, `GET /billing/invoices`.
   - `data-model.md`: Full schema definitions for `tenants`, `users`, `data_sources`, `documents`, `evidence`, `entities`, `entity_aliases`, `products`, `orders`, `order_lines`, `purchase_orders`, `po_lines`, `invoices`, `payments`, `shipments`, `events`, `mistakes`, `mistake_evidence`, `mistake_transitions`, `audit_logs`, `retention_policies`.
   - `event-model.md`: Reconstructed timeline envelope storing both `occurred_at` (business reality) and `observed_at` (ingestion time). Full event catalog from `order.created` to `mistake.resolved`.
   - `adr/0002-ai-never-computes-money.md`: AI explains, deterministic engine computes monetary figures (`financial_impact_minor = ABS(order_quantity - invoice_quantity) * invoice_unit_price_minor`).
4. **Security & Policies (`docs/03-security/`, `docs/04-privacy/`, `docs/06-ai/`)**:
   - RBAC: 5 fixed roles (`Owner`, `Admin`, `Manager`, `Analyst`, `Viewer`).
   - Server-side authorization; Bearer token authentication.
   - AI Processing cache key: `document_hash + extraction_version + model_version`.
   - Data Retention periods: 30 days, 90 days, 1 year, 7 years, or custom.

---

## 2. Logic Chain

1. **Next.js App Router & Layout Architecture**:
   - To provide a modern, snappy B2B experience, Next.js 14+ App Router (`/app`) with React Server Components (RSC) and Client Components (`"use client"`) provides clear separation between data prefetching, static shell rendering, and interactive stateful widgets.
   - Route Hierarchy:
     - `app/(auth)/login`, `app/(auth)/signup`, `app/(auth)/mfa` (Auth layout)
     - `app/(dashboard)/layout.tsx` (Root dashboard layout with persistent Sidebar, Top Navbar with global search trigger, Tenant switcher, and Notification Bell)
     - `app/(dashboard)/page.tsx` → Redirects or serves Business Health Dashboard
     - `app/(dashboard)/dashboard/page.tsx` → Business Health Dashboard
     - `app/(dashboard)/ingestion/page.tsx` → Ingestion Hub
     - `app/(dashboard)/workspace/page.tsx` → Mistakes / Findings List & Filters
     - `app/(dashboard)/workspace/[id]/page.tsx` → Investigation Workspace (Side-by-side evidence inspector)
     - `app/(dashboard)/entities/page.tsx` → Entity Directory
     - `app/(dashboard)/entities/[id]/page.tsx` → Entity Detail & Reconstructed Timeline
     - `app/(dashboard)/entities/review/page.tsx` → Human Review Queue
     - `app/(dashboard)/search/page.tsx` → Global Search & Faceted Results
     - `app/(dashboard)/audit/page.tsx` → Immutable Audit Trail
     - `app/(dashboard)/settings/page.tsx` → Tenant & Team RBAC Management
     - `app/(dashboard)/settings/retention/page.tsx` → Data Retention Policy
     - `app/(dashboard)/settings/billing/page.tsx` → Billing Overview & Checkout

2. **India-First B2B Design System & Typography**:
   - **Color Palette**:
     - Neutrals: Deep Slate/Zinc (`#090D16`, `#111827`, `#1E293B`, `#334155`, `#F8FAFC`) with subtle glassmorphism borders.
     - Brand / Accent: Precision Indigo & Emerald (`#4F46E5`, `#10B981`) conveying financial precision and trust.
     - Financial Discrepancy / Severity:
       - Critical: Crimson / Rose (`#EF4444`, `#F43F5E`)
       - High: Amber / Orange (`#F59E0B`, `#F97316`)
       - Medium: Golden Sand / Yellow (`#EAB308`)
       - Low / Info: Sky Blue (`#0EA5E9`)
       - Healthy / Verified: Emerald (`#10B981`)
   - **Dark / Light Theme**:
     - Powered by `next-themes` with CSS custom properties (`--background`, `--foreground`, `--card`, `--primary`, `--border`, etc.) and Tailwind `dark:` classes.
   - **Typography**:
     - Primary UI Font: `Inter` or `Geist` for crisp legibility.
     - Monospace & Numbers: `JetBrains Mono` or tabular figures (`font-mono tabular-nums`) for currency amounts, invoice IDs, hashes, and quantities.
   - **INR Currency Utilities (`lib/formatters/inr.ts`)**:
     - Conversion from paise (minor units) to rupees: `paise / 100`.
     - Indian Numbering System: `₹ 12,34,567.89` (2, 2, 3 grouping format).
     - Compact B2B format: `₹ 1.45 Cr` (Crores = 10,000,000 INR), `₹ 24.50 L` (Lakhs = 100,000 INR), `₹ 5.2 K` (Thousands).
     - Absolute vs Delta format: `+₹ 45,000` / `-₹ 12,500`.

3. **Component Decomposition & Strict <200 LoC Constraint**:
   - Under the user's global rule, **every non-data, non-JSON file must remain readable and under 200 LoC**.
   - Large screens cannot be monolithic single-file components. Every screen is decomposed into granular, focused components:
     - `components/ui/*`: Primitive atoms (Button, Badge, Card, Modal, Dropdown, Table, Tabs, Input, Select, Tooltip, Progress, Drawer, Skeleton) each 50–120 LoC.
     - `components/dashboard/*`: `HealthScoreGauge.tsx`, `SummaryKpiCards.tsx`, `LeakageCategoryChart.tsx`, `DiscrepancyTrendChart.tsx`, `RecentFindingsTable.tsx`.
     - `components/ingestion/*`: `DropzoneUpload.tsx`, `DataSourceTable.tsx`, `PipelineStatusBadge.tsx`, `PipelineProgressStepper.tsx`, `IngestionErrorModal.tsx`.
     - `components/workspace/*`: `EvidenceInspectorSideBySide.tsx`, `BoundingHighlightViewer.tsx`, `TimelineView.tsx`, `MathBreakdownCard.tsx`, `ExplanationCard.tsx`, `TriageActionBar.tsx`, `StatusTransitionModal.tsx`, `TransitionAuditHistory.tsx`.
     - `components/entities/*`: `EntityTable.tsx`, `EntityFilters.tsx`, `EntityTimeline.tsx`, `AliasListCard.tsx`, `ReviewQueueCard.tsx`, `MergeActionModal.tsx`.
     - `components/search/*`: `GlobalSearchBar.tsx`, `SearchFilterSidebar.tsx`, `SearchResultItem.tsx`, `EvidenceSnippetHighlight.tsx`.
     - `components/audit/*`: `AuditLogTable.tsx`, `AuditDiffModal.tsx`, `AuditFilterBar.tsx`.
     - `components/settings/*`: `TenantProfileForm.tsx`, `TeamMembersTable.tsx`, `InviteUserModal.tsx`, `RetentionPolicyForm.tsx`, `BillingTierCards.tsx`, `InvoiceHistoryTable.tsx`.

4. **API Client, Mocking Adapter, & State Management**:
   - **Dual-Mode API Client**: An API interface (`ApiClient`) with two interchangeable implementations:
     1. `HttpApiClient`: Makes real fetch calls to `/api/v1` with Bearer token authentication and error mapping.
     2. `MockApiClient`: Provides rich, deterministic synthetic data covering all 5 input document types, 5 mistake types, multi-tenant users, review queue items, and audit logs.
     - Mode selection driven by `NEXT_PUBLIC_USE_MOCK=true` or fallback when offline, ensuring immediate dev & test readiness.
   - **State & Caching**: Lightweight React Context / Custom Hooks (`useMistakes`, `useIngestion`, `useEntities`, `useAuth`, `useAudit`) with auto-revalidation, optimistic updates, and mock synchronization.
   - **Error Boundaries & Suspense**: Granular error boundaries per card/module with reload triggers and fallback skeleton states.

---

## 3. Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Auth & Tenancy | User Signup & Tenant Creation | Self-serve onboarding creating isolated tenant and `Owner` user in <5 min | Email, Password, Name, Company Name | Session Token, Tenant ID, User Object | Duplicate email or invalid password returns 400 with validation message | PRD §2, user-flows.md, api-spec.md |
| 2 | Auth & Tenancy | User Login & MFA Challenge | Secure authentication with MFA step for Admin/Owner roles | Email, Password, MFA OTP code | Session JWT, User Profile, Role | 401 Unauthorized on invalid credentials / expired MFA | api-spec.md, security-policy.md |
| 3 | Auth & Tenancy | Active Session Management | List and centrally revoke active user sessions | Session ID | Success confirmation | 403 Forbidden for non-Admin/Owner | api-spec.md, data-model.md |
| 4 | Dashboard | Business Health KPI Overview | Top metrics: Total Discrepancy (₹), Open Contradictions, High-Risk Orders, Missing Evidence, ₹ Value Protected | Date range, Tenant scope | Aggregate metrics object | Graceful empty/loading state | PRD §8, user-stories.md US-7.1, api-spec.md |
| 5 | Dashboard | Financial Risk Score & Health Gauge | Visual 0–100 business health score with status badge (Healthy, Moderate, Critical) | Active mistakes severity & financial impact | Score (0-100), health classification, risk drivers | Falls back to "Healthy" (100) when zero mistakes exist | PRD §8, user-stories.md |
| 6 | Dashboard | Leakage Category Breakdown | Visual chart breakdown of financial leakage across 5 mistake types in ₹ | Filter criteria | Category breakdown with ₹ amounts and percentage shares | 0 ₹ when no active leaks | data-model.md, api-spec.md |
| 7 | Dashboard | Discrepancy Trend Chart | Historical temporal trend of detected vs resolved leakage over time | Timeframe (7d, 30d, 90d, 1y) | Time-series data points with ₹ leakage and issue count | Empty chart state with prompt to ingest data | PRD §8, user-stories.md US-7.1 |
| 8 | Ingestion | Multi-format Document Dropzone | Drag-and-drop file upload accepting CSV, XLSX, PDF, email exports, ERP exports | File objects (max 25MB) | Data Source ID, Storage Key, Pre-signed URL | Rejects unsupported extensions (e.g. .exe, .zip) with clear guidance | PRD §4, US-2.1, api-spec.md |
| 9 | Ingestion | Real-Time Pipeline Progress Tracker | Visual stepper tracking 5 asynchronous states: `Queued → Processing → Extracting → Analyzing → Completed` | Data Source ID | Current pipeline state, step duration, extraction statistics | Shows `Failed` state with actionable message on parse error | US-2.1, US-2.2, acceptance-criteria.md |
| 10 | Ingestion | Actionable Ingestion Error Diagnostics | Specific, non-generic error explanations (e.g. password protected PDF, unrecognized columns) | Upload failure event | Error diagnostic card with re-upload action | Error details displayed without app crash | US-2.2, acceptance-criteria.md |
| 11 | Ingestion | Data Source History & Retry | Historical catalog of uploaded sources, file hashes, processed records, with retry capability | Tenant ID, filters | Paginated upload records | Retry disabled for currently processing jobs | api-spec.md, data-model.md |
| 12 | Investigation | Side-by-Side Evidence Inspector | Split-pane visual document comparison (e.g., PO vs Invoice) highlighting conflicting fields | Mistake ID, Evidence IDs | Dual document view with coordinate bounding boxes & line diffs | Shows "Source Document Unavailable" fallback if raw file missing | PRD §2, US-5.1, api-spec.md |
| 13 | Investigation | Chronological Multi-Source Timeline | Unified timeline interleaving events with `occurred_at` (business time) and `observed_at` (ingestion time) | Entity ID / Mistake ID | Ordered event cards with source badges (WhatsApp, Email, ERP, PDF) | Distinguishes date-only precision from exact timestamps | event-model.md, US-3.2, US-5.1 |
| 14 | Investigation | Deterministic Math Breakdown | Clear mathematical proof of discrepancy calculation in minor units (paise) | Mistake finding | Formula string, variables, quantity delta, unit price, total ₹ leak | Displays "Non-monetary discrepancy" for date/status mismatches | ADR-0002, data-model.md |
| 15 | Investigation | Natural Language Explanation & Advice | AI-generated summary explaining root cause and recommended remediation action | Mistake finding | Explanation paragraph, recommended action bullet points | Fallback standard template if explanation generation failed | PRD §2, US-4.1-4.5, US-5.1 |
| 16 | Investigation | Confidence Score & Corroboration | Display extraction and detection confidence score (0-100%) and supporting records | Mistake finding | Confidence meter badge, corroborating evidence list | Visual warning indicator if confidence < 80% | evaluation-framework.md, US-5.2 |
| 17 | Investigation | Mistake Triage & Reason Logging | State transitions: `Detected → Under Review → Verified → Resolved / Dismissed` with mandatory reason dialog | New status, User ID, Reason text | Status transition event, audit log entry, updated badge | Blocks transition if `reason` is empty for Dismiss / Resolve | US-6.1, event-model.md, api-spec.md |
| 18 | Investigation | Mistake Assignment | Assign finding to specific team member (Finance/Ops) for resolution SLA tracking | Mistake ID, User ID | Updated `assigned_to` field, notification trigger | 400 if user does not belong to tenant | api-spec.md, personas.md |
| 19 | Entity Explorer | Counterparty Directory | Searchable list of Customers, Suppliers, and Products with discrepancy badges | Search query, Entity type filter | Paginated entity cards/rows with alias count and active mistakes | Empty search results state | data-model.md, api-spec.md |
| 20 | Entity Explorer | Entity Detail & Alias Profile | Canonical entity profile showing known aliases, linked documents, and order history | Entity ID | Profile view, alias chip list with confidence scores, source references | 404 if entity not found | data-model.md, api-spec.md |
| 21 | Entity Explorer | Human Review Queue for Aliases | Queue of ambiguous entity matches (<95% confidence) with side-by-side match comparison | Tenant ID | List of merge candidates with match confidence score and evidence | Real-time queue item removal on action | US-3.1, evaluation-framework.md, api-spec.md |
| 22 | Entity Explorer | Entity Merge & Reject Actions | One-click actions to confirm canonical entity merge or reject suggested alias | Surviving Entity ID, Merged Entity ID / Reject flag | `entity.merged` event, updated alias list | Rollback and error notification on merge conflict | US-3.1, api-spec.md |
| 23 | Global Search | Cross-Domain Instant Search (`Cmd+K`) | Fast global search over Customers, Suppliers, Products, Orders, POs, Invoices, Payments, Shipments, Mistakes | Search query string, type filters | Grouped search results with snippet previews and quick jump | Debounced search query; highlights matched substrings | system-architecture.md, api-spec.md |
| 24 | Global Search | Advanced Faceted Filters | Filter findings by Date Range, Entity, Document Type, Severity, Status, and Amount Range | Filter object | Filtered results list with active filter tag chips | "Reset all filters" helper | api-spec.md, US-7.1 |
| 25 | Audit Trail | Immutable Audit Event Log | Searchable, paginated audit log of all system actions, status changes, and data modifications | Date range, Actor, Action, Resource Type | Audit log table with ISO timestamps, IP addresses, and user names | Read-only; non-modifiable | security-policy.md, api-spec.md, data-model.md |
| 26 | Audit Trail | Before/After JSON Diff Inspector | Modal dialog showing exact JSON diff between pre- and post-action state | Audit Log ID | Visual side-by-side green/red JSON diff viewer | Displays "No prior state" for creation events | data-model.md, security-policy.md |
| 27 | Settings & Admin | Tenant Profile & Preference Config | View/edit company name, legal name, industry, default currency | Tenant update payload | Updated tenant profile | Restricted to `Owner` and `Admin` roles | access-control-policy.md, api-spec.md |
| 28 | Settings & Admin | Team RBAC Management | Invite new users with explicit role (`Owner`, `Admin`, `Manager`, `Analyst`, `Viewer`), update roles, disable/re-enable | User email, Role, Status | User list, single-use invite token | Disallows self-demotion of last Owner; enforces server RBAC | access-control-policy.md, US-1.2, api-spec.md |
| 29 | Settings & Admin | Data Retention Policy Manager | Configure retention duration per data category (30d, 90d, 1y, 7y, custom) | Resource type, Retention interval | Updated retention policies table | Requires Admin/Owner role; confirmation dialog on shortening | data-retention-policy.md, api-spec.md |
| 30 | Settings & Admin | Billing & Subscription Overview | View active plan (Starter ₹4,999/mo, Growth ₹14,999/mo, Enterprise), invoice receipts, upgrade checkout | Plan tier selection | Plan summary, billing history, mock checkout redirect | Read-only for non-Owners | system-architecture.md § Billing, api-spec.md |
| 31 | In-App Feedback | Notification Center | Real-time notification drawer/dropdown for critical findings, assignments, and upload completions | User ID | Notification item list with read/unread toggle and deep links | Mark all as read action | system-architecture.md § Notifications, api-spec.md |
| 32 | Design System | Indian Numbering (INR) Formatter | Utility functions converting paise to formatted ₹ Lakhs, ₹ Crores, and standard Indian comma notation | Minor units (BIGINT paise), format options | Formatted string (e.g. "₹ 1,23,456.78", "₹ 4.50 Cr") | Handles negative amounts ("-₹ 500.00"), zero ("₹ 0.00"), and nulls ("—") | ORIGINAL_REQUEST.md, data-model.md |
| 33 | Design System | Theme Mode Switcher | Dark mode / Light mode toggle with automatic system theme detection and persistent local storage | Selected theme ('light', 'dark', 'system') | Applied CSS classes and color tokens | No flash of unstyled content (SSR compatible) | ORIGINAL_REQUEST.md |
| 34 | Error Handling | Modular Error Boundaries & Skeletons | Component-level error catching preventing full page crashes with retry controls | Render error | Fallback error UI with "Try again" button | Logs client error details safely | PRD § Definition of Done |

---

## 4. Edge Cases

| # | Feature | Input | Observed / Specified Behavior |
|---|---------|-------|-------------------------------|
| 1 | INR Currency Formatter | `paise = 0` | Formats as `"₹ 0.00"`; in compact mode `"₹ 0"`. |
| 2 | INR Currency Formatter | `paise = -150000000` (Negative 15 Lakhs) | Formats as `"-₹ 15,00,000.00"` or `"-₹ 15.00 L"` with negative sign preceding currency symbol. |
| 3 | INR Currency Formatter | `paise = 1000000000` (1 Crore) | Formats as `"₹ 1,00,00,000.00"` or `"₹ 1.00 Cr"`. Grouping correctly places first comma after 3 digits from right, then every 2 digits. |
| 4 | INR Currency Formatter | `paise = null` / `undefined` | Formats gracefully as `"₹ 0.00"` or `"N/A"` / `"—"` depending on placeholder flag, never throws TypeError. |
| 5 | Dropzone Upload | File > 25MB or unsupported MIME type (e.g. `.exe`) | Client-side pre-validation immediately blocks upload and displays specific badge: `"Unsupported file format. Please upload CSV, XLSX, PDF, or email export."` |
| 6 | Ingestion Pipeline | Corrupted PDF / Password protected PDF | Pipeline moves to `Failed` state; UI displays red alert card with exact cause: `"Password protected PDF detected. Please upload an unlocked file."` and a retry button. |
| 7 | Multi-Source Timeline | Event with only date precision (`"occurred_at_precision": "date_only"`) | Timeline displays `"Aug 17, 2026 (Date only)"` without fabricating a `00:00:00` misleading time. |
| 8 | Multi-Source Timeline | `observed_at` earlier than `occurred_at` (Clock skew or retrospective backdated order) | Timeline highlights clock variance badge explaining that the document records an event dated after upload observation. |
| 9 | Side-by-side Evidence | PDF bounding box coordinates exceed page boundaries | Viewer clamps bounding box to `[0, 0, 100%, 100%]` viewport to prevent rendering overflow. |
| 10 | Triage Transition | User attempts to Dismiss or Resolve a mistake with an empty reason text box | UI disables submission button and shows field error: `"A reason is required to dismiss or resolve this finding."` |
| 11 | Entity Merge | Review queue item where user rejects suggestion | Item instantly animates out of queue, triggers `POST /entities/:id/reject-merge`, and marks candidate alias as distinct. |
| 12 | RBAC Permissions | Viewer user opens Investigation Workspace | Triage action buttons (`Verify`, `Dismiss`, `Resolve`, `Assign`) are disabled with tooltip `"Viewers cannot modify mistake status"`. |
| 13 | Global Search | Search query with zero results across all tabs | Displays helpful empty state: `"No matching records found for '<query>'. Try adjusting your filters or search terms."` |
| 14 | Retention Policy | Admin reduces retention from 7 Years to 30 Days | Danger confirmation modal appears requiring typing the tenant name to confirm irreversible deletion of historical evidence. |
| 15 | File Line Length Rule | Non-data/non-json source file approaching 200 LoC | Decomposed into dedicated sub-components, custom hooks, or utility files to strictly remain <200 LoC. |

---

## 5. Proposed Web Architecture & File Blueprint

### Directory Layout (`c:/Users/sheer/Documents/antigravity/proud-curie/web/`)

```
web/
├── package.json                   # Next.js 14, Tailwind CSS, Lucide icons, clsx, tailwind-merge
├── tsconfig.json                  # Strict TypeScript configuration
├── tailwind.config.ts             # Custom B2B palette, India-first theme, dark mode
├── postcss.config.js
├── next.config.mjs
├── public/
│   ├── favicon.ico
│   └── logo.svg
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root layout with ThemeProvider, Font setup, QueryClient
│   │   ├── globals.css            # Tailwind directives, CSS variables for theme tokens
│   │   ├── (auth)/
│   │   │   ├── layout.tsx         # Centered card layout for authentication
│   │   │   ├── login/page.tsx     # Login screen with MFA support
│   │   │   └── signup/page.tsx    # Tenant + Owner registration screen
│   │   └── (dashboard)/
│   │       ├── layout.tsx         # Dashboard shell: Sidebar, Header, Global Search trigger
│   │       ├── page.tsx           # Redirects to /dashboard
│   │       ├── dashboard/
│   │       │   └── page.tsx       # Business Health Dashboard
│   │       ├── ingestion/
│   │       │   └── page.tsx       # Ingestion Hub (Upload & Pipeline tracker)
│   │       ├── workspace/
│   │       │   ├── page.tsx       # Mistake Finder & Filterable List
│   │       │   └── [id]/page.tsx  # Investigation Workspace (Evidence Inspector)
│   │       ├── entities/
│   │       │   ├── page.tsx       # Entity Explorer (Customers/Suppliers/Products)
│   │       │   ├── [id]/page.tsx  # Entity Detail & History
│   │       │   └── review/page.tsx # Human Review Queue (Ambiguous matches)
│   │       ├── search/
│   │       │   └── page.tsx       # Global Search & Faceted Filter results
│   │       ├── audit/
│   │       │   └── page.tsx       # Immutable Audit Log
│   │       └── settings/
│   │           ├── page.tsx       # Tenant & Team RBAC Management
│   │           ├── retention/page.tsx # Retention Policy Config
│   │           └── billing/page.tsx   # Billing & Subscription Overview
│   ├── components/
│   │   ├── ui/                    # Granular primitive UI atoms (<120 LoC each)
│   │   │   ├── Button.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── Tabs.tsx
│   │   │   ├── Tooltip.tsx
│   │   │   ├── Progress.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   ├── Dropdown.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   ├── layout/                # Shell components
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── NavItem.tsx
│   │   │   ├── TenantSwitcher.tsx
│   │   │   └── NotificationDropdown.tsx
│   │   ├── dashboard/             # Dashboard widgets (<150 LoC each)
│   │   │   ├── HealthGauge.tsx
│   │   │   ├── KpiSummaryGrid.tsx
│   │   │   ├── KpiCard.tsx
│   │   │   ├── CategoryBreakdownChart.tsx
│   │   │   ├── DiscrepancyTrendChart.tsx
│   │   │   └── RecentFindingsList.tsx
│   │   ├── ingestion/             # Ingestion Hub widgets
│   │   │   ├── UploadDropzone.tsx
│   │   │   ├── PipelineStepper.tsx
│   │   │   ├── DataSourceList.tsx
│   │   │   └── ErrorDiagnosticsCard.tsx
│   │   ├── workspace/             # Investigation Workspace widgets
│   │   │   ├── EvidenceSplitView.tsx
│   │   │   ├── DocumentBoundingBox.tsx
│   │   │   ├── MultiSourceTimeline.tsx
│   │   │   ├── MathBreakdownProof.tsx
│   │   │   ├── ExplanationCard.tsx
│   │   │   ├── RecommendationBanner.tsx
│   │   │   ├── TriageActions.tsx
│   │   │   ├── TransitionModal.tsx
│   │   │   └── TransitionHistoryLog.tsx
│   │   ├── entities/              # Entity Explorer widgets
│   │   │   ├── EntityGrid.tsx
│   │   │   ├── EntityDetailHeader.tsx
│   │   │   ├── AliasTagList.tsx
│   │   │   ├── ReviewQueueList.tsx
│   │   │   └── MergeCandidateCard.tsx
│   │   ├── search/                # Global Search widgets
│   │   │   ├── SearchModal.tsx
│   │   │   ├── FilterSidebar.tsx
│   │   │   └── SearchResultCard.tsx
│   │   ├── audit/                 # Audit Trail widgets
│   │   │   ├── AuditTable.tsx
│   │   │   ├── AuditDiffViewer.tsx
│   │   │   └── AuditFilterBar.tsx
│   │   └── settings/              # Settings & Admin widgets
│   │       ├── TenantSettingsForm.tsx
│   │       ├── UserManagementTable.tsx
│   │       ├── InviteUserDialog.tsx
│   │       ├── RetentionPolicyForm.tsx
│   │       └── BillingPlanCards.tsx
│   ├── lib/
│   │   ├── api/                   # API layer
│   │   │   ├── client.ts          # ApiClient interface definition
│   │   │   ├── http.ts            # Fetch wrapper calling /api/v1
│   │   │   ├── mock.ts            # MockApiClient for offline / preview
│   │   │   ├── mock-data.ts       # Rich synthetic dataset for all 7 screens
│   │   │   └── index.ts           # Dual-adapter factory based on env
│   │   ├── formatters/
│   │   │   ├── inr.ts             # Paise to INR, Lakhs, Crores formatters
│   │   │   └── date.ts            # Relative and ISO date formatting
│   │   ├── hooks/                 # Reusable custom React hooks
│   │   │   ├── useMistakes.ts
│   │   │   ├── useIngestion.ts
│   │   │   ├── useEntities.ts
│   │   │   ├── useAuditLogs.ts
│   │   │   └── useTenant.ts
│   │   ├── context/
│   │   │   ├── AuthContext.tsx
│   │   │   └── ThemeContext.tsx
│   │   └── utils/
│   │       ├── cn.ts              # ClassName merger (clsx + twMerge)
│   │       └── validation.ts      # Client input validation
│   └── types/                     # Clean TypeScript domain models
│       ├── auth.ts
│       ├── tenant.ts
│       ├── ingestion.ts
│       ├── entity.ts
│       ├── mistake.ts
│       ├── event.ts
│       ├── audit.ts
│       └── billing.ts
```

---

## 6. Caveats

1. **Backend Decoupling via Dual Adapter**:
   - During parallel development, backend Go endpoints might not be deployed yet. The `MockApiClient` implementation is essential to ensure Next.js frontend builds cleanly with zero errors, and all UI flows (file upload simulation, pipeline status progression, evidence inspection, triage status updates, entity merges) can be exercised end-to-end.
2. **Deterministic Financial Math in Frontend**:
   - Per ADR-0002, the frontend only renders the computed `financial_impact_minor` from the backend/mock model and never recalculates monetary values on its own. It displays the formula breakdown as an educational proof for the user.
3. **Strict Line-of-Code Governance**:
   - Any component that begins expanding towards ~180 LoC must be split immediately into sub-components, custom hooks, or helper utilities to guarantee 100% compliance with the user's `<200 LoC` global constraint.

---

## 7. Conclusion

The specification survey for the Web Frontend (Next.js) is complete and fully documented.
- All 7 core screens and functional modules are comprehensively analyzed and mapped to authoritative specifications in `docs/` and `.agents/ORIGINAL_REQUEST.md`.
- Design tokens, typography, dark/light theme, and INR formatting utilities (`paise` -> `₹`, `Lakhs`, `Crores`) are strictly defined.
- Complete component hierarchy has been designed to strictly enforce the `<200 LoC` per file constraint.
- Dual-mode API client layer (`HttpApiClient` + `MockApiClient`) guarantees smooth integration, mock verification, and flawless buildability (`npm run build`).

---

## 8. Verification Method

To independently verify the Web Frontend specification and future implementation:

1. **Typecheck & Clean Build**:
   ```bash
   cd c:/Users/sheer/Documents/antigravity/proud-curie/web
   npm install
   npm run build
   ```
   *Expected result*: Clean Next.js production build with 0 TypeScript errors and 0 ESLint warnings.

2. **Strict Line of Code Compliance (<200 LoC per file)**:
   ```powershell
   cd c:/Users/sheer/Documents/antigravity/proud-curie/web/src
   Get-ChildItem -Recurse -Include *.ts,*.tsx,*.css | ForEach-Object {
       $lines = (Get-Content $_.FullName | Measure-Object -Line).Lines
       if ($lines -ge 200) {
           Write-Error "VIOLATION: $($_.FullName) has $lines lines (>=200 LoC)"
       }
   }
   ```
   *Expected result*: Zero output/violations.

3. **INR Formatting Unit Tests**:
   - Verify `formatPaiseToINR(123456789)` returns `"₹ 12,34,567.89"`.
   - Verify `formatPaiseToCompactINR(150000000)` returns `"₹ 15.00 L"`.
   - Verify `formatPaiseToCompactINR(2500000000)` returns `"₹ 2.50 Cr"`.
   - Verify `formatPaiseToINR(-50000)` returns `"-₹ 500.00"`.

4. **Screen-by-Screen UI Verification**:
   - Health Dashboard: Render KPI cards, Health Gauge (0-100), Category Leakage Chart, Trend Chart.
   - Ingestion Hub: Drag-drop upload simulation, 5-state progress stepper (`Queued → Processing → Extracting → Analyzing → Completed`).
   - Investigation Workspace: Side-by-side evidence diff, multi-source timeline, math breakdown proof, triage action bar with mandatory reason dialog.
   - Entity Explorer: Customer/Supplier directory, detail timeline, review queue with one-click merge/reject.
   - Global Search: `Cmd+K` instant search dialog with faceted filter sidebar.
   - Audit Trail: Immutable event log with before/after JSON diff modal.
   - Settings: Team member RBAC invite, retention duration selector, billing plan tiers.
