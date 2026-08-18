## 2026-08-18T13:27:21+05:30
You are worker_web.
Your working directory is: c:/Users/sheer/Documents/antigravity/proud-curie/.agents/worker_web
Your write ownership: c:/Users/sheer/Documents/antigravity/proud-curie/web/ (exclusive).

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

STRICT CONSTRAINTS:
1. Every non-data / non-json source file across TypeScript and CSS must strictly remain readable and under 200 lines of code (<200 LoC).
2. Clean `npm run build` with zero TypeScript errors and zero lint warnings.
3. India-first B2B UI, INR currency in paise minor units (`formatPaiseToINR`, Lakhs, Crores).

Read:
- c:/Users/sheer/Documents/antigravity/proud-curie/.agents/ORIGINAL_REQUEST.md
- c:/Users/sheer/Documents/antigravity/proud-curie/PROJECT.md
- c:/Users/sheer/Documents/antigravity/proud-curie/.agents/survey_explorer_web/handoff.md
- docs/ directory for UI specs, API specs, ADRs.

Your task:
Implement the complete Next.js Web application in `web/`:
1. `package.json`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.js`, `next.config.mjs`.
2. India-first B2B Design System: Dark/Light theme, custom Tailwind palette (slate/emerald/rose/amber), typography, INR formatters (`lib/formatters/inr.ts`, `date.ts`).
3. Domain Types & API Client layer (`types/`, `lib/api/`): `ApiClient` interface, `HttpApiClient`, `MockApiClient` with rich realistic Indian B2B seed data across all 7 screens, toggleable via env.
4. Granular Reusable UI Atoms (`components/ui/`): Button, Badge, Card, Modal, Input, Select, Table, Tabs, Tooltip, Progress, Skeleton, Dropdown, ErrorBoundary (<120 LoC each).
5. App Shell & Layout (`components/layout/`, `app/`): Sidebar, Header with Cmd+K search trigger, TenantSwitcher, NotificationDropdown, ThemeProvider.
6. 7 Core Functional Screens:
   - Business Health Dashboard (`app/(dashboard)/dashboard/` & `components/dashboard/`): Health score gauge, KPI summary grid, leakage category breakdown chart, discrepancy trend chart, recent findings.
   - Ingestion Hub (`app/(dashboard)/ingestion/` & `components/ingestion/`): Dropzone upload, 5-state progress stepper (`Queued -> Processing -> Extracting -> Analyzing -> Completed`), data source list, error diagnostics card.
   - Investigation Workspace (`app/(dashboard)/workspace/` & `[id]/`, `components/workspace/`): Side-by-side evidence inspector with coordinate bounding box highlights, multi-source chronological timeline (`occurred_at` vs `observed_at`), deterministic math breakdown proof, explanation & remediation card, triage action bar (Verify, Dismiss, Resolve with mandatory reason dialog, Assign).
   - Entity Explorer (`app/(dashboard)/entities/` & `review/`, `components/entities/`): Customer/Supplier directory, entity detail timeline, alias management, human review queue with one-click merge/reject.
   - Global Search (`app/(dashboard)/search/` & `components/search/`): Cmd+K search modal, faceted filter sidebar, grouped results.
   - Immutable Audit Trail (`app/(dashboard)/audit/` & `components/audit/`): Verifiable log table, before/after JSON diff modal, filter bar.
   - Settings & Admin (`app/(dashboard)/settings/` & `retention/`, `billing/`, `components/settings/`): Tenant profile, team RBAC invites, retention policy duration manager, billing plan tiers & invoices.
7. Auth Screens (`app/(auth)/login/`, `signup/`).

Verify that `npm run build` succeeds with zero errors.
Verify that every source file is strictly < 200 LoC.
Write your completion handoff report to `c:/Users/sheer/Documents/antigravity/proud-curie/.agents/worker_web/handoff.md`.
Send a message when finished.
