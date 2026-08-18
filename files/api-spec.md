# API Specification

Did not exist in v1.0. This is a working REST surface for the Go API —
enough to unblock frontend/mobile work in parallel with backend build,
not a final OpenAPI contract. Convert to OpenAPI/Swagger once stable and
generate client SDKs for Next.js and Flutter from it rather than
hand-writing both.

## Conventions

- Base path: `/api/v1`
- Auth: `Authorization: Bearer <session token>`; `tenant_id` is derived
  server-side from the token, **never** accepted as a request parameter
  — a request that includes a `tenant_id` body/query field for a
  different tenant than the token's must be rejected, not silently
  ignored (silent-ignore has historically hidden bugs where the frontend
  believes it's tenant-scoping correctly but isn't).
- Pagination: cursor-based, `?cursor=...&limit=50` (default 50, max 200).
- Errors: `{ "error": { "code": "string", "message": "string", "details": {} } }`
  with standard HTTP status codes; `code` is a stable machine-readable
  string (e.g. `TENANT_MISMATCH`, `VALIDATION_FAILED`) the frontend can
  branch on without parsing `message`.
- Idempotency: mutating endpoints that can be retried safely (uploads,
  webhook receivers) accept an `Idempotency-Key` header.

## Auth

| Method | Path | Description |
|---|---|---|
| POST | `/auth/signup` | Create account + tenant, first user gets role `Owner` |
| POST | `/auth/login` | Authenticate, returns session token |
| POST | `/auth/logout` | Revoke current session |
| POST | `/auth/mfa/verify` | Complete MFA challenge |
| POST | `/auth/password/reset-request` | Start password recovery |
| POST | `/auth/password/reset` | Complete password recovery |
| GET | `/auth/sessions` | List active sessions (Admin) |
| DELETE | `/auth/sessions/:id` | Revoke a specific session (Admin) |

## Users & tenant

| Method | Path | Description |
|---|---|---|
| GET | `/tenant` | Current tenant settings |
| PATCH | `/tenant` | Update tenant settings (Owner/Admin) |
| GET | `/users` | List users in tenant |
| POST | `/users/invite` | Invite a user with a role |
| PATCH | `/users/:id/role` | Change a user's role (Owner/Admin) |
| PATCH | `/users/:id/status` | Disable/re-enable a user |

## Data sources & documents

| Method | Path | Description |
|---|---|---|
| POST | `/data-sources` | Create an upload (returns pre-signed object storage URL) |
| GET | `/data-sources` | List uploads with status |
| GET | `/data-sources/:id` | Upload detail + processing status |
| GET | `/documents/:id` | Document detail |
| GET | `/documents/:id/evidence` | Evidence extracted from a document |

## Entities

| Method | Path | Description |
|---|---|---|
| GET | `/entities` | List/search entities (`?entity_type=`) |
| GET | `/entities/:id` | Entity detail with aliases and source references |
| GET | `/entities/review-queue` | Ambiguous entity matches pending human review |
| POST | `/entities/:id/merge` | Confirm a merge from the review queue |
| POST | `/entities/:id/reject-merge` | Reject a suggested merge |

## Events

| Method | Path | Description |
|---|---|---|
| GET | `/events` | Query events (`?entity_id=&event_type=&from=&to=`) |
| GET | `/entities/:id/timeline` | Reconstructed timeline for one entity |

## Mistakes (findings)

| Method | Path | Description |
|---|---|---|
| GET | `/mistakes` | List/filter (`?severity=&status=&mistake_type=&assigned_to=`) |
| GET | `/mistakes/:id` | Full finding: summary, entities, timeline, evidence, explanation, recommendation |
| PATCH | `/mistakes/:id/status` | Transition status (`under_review`, `verified`, `dismissed`, `resolved`), body requires `reason` for dismiss/resolve |
| PATCH | `/mistakes/:id/assign` | Assign to a user |
| GET | `/mistakes/:id/transitions` | Full state-change history |
| GET | `/dashboard/summary` | Aggregate figures for the Business Health Dashboard |

## Search

| Method | Path | Description |
|---|---|---|
| GET | `/search` | Cross-entity search (`?q=&type=`) over customers, suppliers, products, orders, POs, invoices, payments, shipments, evidence, mistakes |

## Notifications

| Method | Path | Description |
|---|---|---|
| GET | `/notifications` | List for current user |
| PATCH | `/notifications/:id/read` | Mark read |

## Admin / audit

| Method | Path | Description |
|---|---|---|
| GET | `/audit-logs` | Query audit log (`?actor=&action=&resource_type=&from=&to=`) |
| GET | `/retention-policy` | Current retention config |
| PATCH | `/retention-policy` | Update retention config (Owner/Admin) |

## Billing

| Method | Path | Description |
|---|---|---|
| GET | `/billing/subscription` | Current plan and status |
| POST | `/billing/checkout` | Start plan upgrade/change |
| GET | `/billing/invoices` | Billing history |

## Not in MVP

No endpoints for live ERP/accounting/WhatsApp integration, no
autonomous-agent action endpoints beyond the recommendation objects
already embedded in `GET /mistakes/:id` — see
[PRD.md § MVP scope](../01-product/PRD.md#4-mvp-scope) and
[integration-spec.md](./integration-spec.md) for what's deferred and why.
