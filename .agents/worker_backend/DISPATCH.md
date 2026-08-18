## 2026-08-18T13:27:21Z
Implement the complete Go Backend modular monolith in `backend/`:
1. `go.mod` (module `mistake-backend`, Go 1.25).
2. Domain models (`domain/`): Tenant, User, DataSource, Document, Evidence, Entity, EntityAlias, Order, OrderLine, PurchaseOrder, POLine, Invoice, Payment, Shipment, Event, Mistake, MistakeTransition, AuditLog, RetentionPolicy, Billing.
3. Financial package (`financial/`): Paise minor unit arithmetic (`paise.go`), Indian currency formatter (`format.go`).
4. RBAC package (`rbac/`): 5 roles (Owner, Admin, Manager, Analyst, Viewer), permission matrix.
5. Storage package (`storage/`): Thread-safe multi-tenant memory store implementing store interface with tenant isolation on every single query/method, tenant repo, entity repo, business repo, mistake repo, event repo, audit repo.
6. Ingestion Pipeline (`pipeline/`): 5-state progression (Queued -> Processing -> Extracting -> Analyzing -> Completed), async worker pool, CSV/TSV parser, XLSX parser, PDF parser, Email parser, deduplication cache.
7. Entity Resolver (`resolver/`): Levenshtein similarity matcher, alias matching, confidence scoring (≥0.95 auto, 0.70-0.95 review queue, <0.70 new), review queue, merge/reject actions.
8. Detection Engine (`detection/`): Engine orchestrator, Quantity mismatch detector, Price mismatch detector, Date mismatch detector, Status mismatch detector, Missing evidence detector, deterministic severity rubric.
9. HTTP Handlers & Router (`handlers/`, `cmd/server/router.go`, `cmd/server/main.go`): REST API for all routes (`/api/v1/auth`, `/tenant`, `/users`, `/data-sources`, `/documents`, `/entities`, `/events`, `/mistakes`, `/dashboard/summary`, `/search`, `/notifications`, `/audit-logs`, `/retention-policy`, `/billing`), middleware (auth JWT, tenant context, RBAC, audit, CORS, recovery), error response formatting.
10. Seed Generator (`seed/`): Rich Indian B2B sample data generator and test files generator.
11. Test Suite (`test/`): Auth & RBAC tests, detection tests, financial paise tests, pipeline tests, resolver tests.

Strict constraints:
- Non-data/non-json source files must remain readable and under 200 lines of code (<200 LoC).
- Financial calculation in minor units (paise) per ADR-0002.
- Tests must pass with `go test ./...` in `backend/`.
