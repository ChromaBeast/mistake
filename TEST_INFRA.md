# E2E Test Infra: Mistake Platform

## Test Philosophy
- Requirement-driven, opaque-box testing derived directly from `ORIGINAL_REQUEST.md`, `PRD.md`, `ADR-0002`, and `acceptance-criteria.md`.
- No internal white-box assumptions. Exercises REST API, Ingestion Pipeline, Paise Arithmetic, Discrepancy Detection, Entity Resolution, and State Transitions via external interfaces.
- Systematic 4-Tier Methodology: Category-Partition + Boundary Value Analysis + Pairwise Combinatorial + Real-World Workload Testing.

---

## Feature Inventory & Test Coverage Mapping

| # | Feature | Requirement Source | Tier 1 (Isolated) | Tier 2 (Boundary) | Tier 3 (Pairwise) | Tier 4 (Workload) |
|---|---------|--------------------|:-----------------:|:-----------------:|:-----------------:|:-----------------:|
| 1 | Tenant & User Auth (Signup, Login, MFA, RBAC) | `api-spec.md`, `access-control-policy.md` | 5 | 5 | ✓ | ✓ |
| 2 | Ingestion Pipeline (CSV, XLSX, PDF, 5-State Machine) | `integration-spec.md`, `data-model.md` | 5 | 5 | ✓ | ✓ |
| 3 | Entity Resolver (Exact, Alias, Review Queue, Merge) | `data-model.md`, `api-spec.md` | 5 | 5 | ✓ | ✓ |
| 4 | Deterministic Detection (Quantity, Price, Date, Status, Missing) | `data-model.md`, `user-stories.md` | 5 | 5 | ✓ | ✓ |
| 5 | Financial Impact in Paise (Integer Math, ADR-0002) | `ADR-0002`, `PRD.md` | 5 | 5 | ✓ | ✓ |
| 6 | Finding Lifecycle & Reason Logging (Verify, Dismiss, Resolve) | `data-model.md`, `api-spec.md` | 5 | 5 | ✓ | ✓ |
| 7 | Dashboard Aggregation & Metrics Summary | `api-spec.md`, `user-stories.md` | 5 | 5 | ✓ | ✓ |
| 8 | Cross-Domain Search & Facets | `api-spec.md`, `ADR-0003` | 5 | 5 | ✓ | ✓ |
| 9 | Immutable Audit Logging & Diffs | `data-model.md`, `security-policy.md` | 5 | 5 | ✓ | ✓ |
| 10 | Data Retention & Physical Purge | `data-retention-policy.md` | 5 | 5 | ✓ | ✓ |
| 11 | Subscription & Billing Engine | `api-spec.md`, `system-architecture.md` | 5 | 5 | ✓ | ✓ |

---

## Test Architecture & Layout

- **Runner**: `e2e/runner.go` or standalone executable runner executing test suites with detailed reporting.
- **Directory Layout**:
  ```
  e2e/
  ├── run_tests.go                  (<150 LoC) E2E Test Suite Orchestrator & Runner
  ├── harness/
  │   ├── client.go                 (<130 LoC) API Test Client
  │   ├── assertions.go             (<120 LoC) Test assertion utilities
  │   └── fixtures.go               (<140 LoC) Test data generators
  ├── tier1_features/
  │   ├── auth_test.go              (<150 LoC) Tier 1 Auth & RBAC tests (5+ cases)
  │   ├── ingestion_test.go         (<150 LoC) Tier 1 Ingestion tests (5+ cases)
  │   ├── resolver_test.go          (<150 LoC) Tier 1 Entity resolver tests (5+ cases)
  │   ├── detection_test.go         (<160 LoC) Tier 1 Detection tests (5+ cases)
  │   ├── financial_test.go         (<130 LoC) Tier 1 Paise math tests (5+ cases)
  │   └── lifecycle_test.go         (<140 LoC) Tier 1 Mistake lifecycle tests (5+ cases)
  ├── tier2_boundaries/
  │   ├── boundary_math_test.go     (<150 LoC) Tier 2 Zero/Negative/Overflow paise tests
  │   ├── boundary_tenant_test.go   (<150 LoC) Tier 2 Cross-tenant isolation violation tests
  │   └── boundary_ingest_test.go   (<150 LoC) Tier 2 Corrupted/Malformed files & deduplication
  ├── tier3_pairwise/
  │   └── pairwise_interactions_test.go (<160 LoC) Tier 3 Cross-feature combination tests
  └── tier4_realworld/
      └── industrial_scenarios_test.go (<170 LoC) Tier 4 End-to-end manufacturing workflows
  ```

---

## Real-World Application Scenarios (Tier 4)

| # | Scenario | Features Exercised | Complexity |
|---|----------|--------------------|------------|
| 1 | Auto Component Supplier Pipeline | Ingestion (CSV/PDF) -> Entity Resolution ("Bajaj Auto" variants) -> Qty/Price Mismatches -> Paise Leakage Calculation -> Review Queue -> Resolution | High |
| 2 | Pharmaceutical Distribution Batch | Multi-invoice ingestion -> Date delay detection -> Missing PO linkage -> High severity escalation -> Audit Trail log | High |
| 3 | Fast-Moving Consumer Goods (FMCG) Wholesaler | Status mismatch (Delivered vs Cancelled) -> Human Review Queue alias merge -> Immutable Audit diff -> Data retention purge | High |
| 4 | Multi-Tenant Cross-Contamination Attack Simulation | Attempted cross-tenant data access, token forging, privilege escalation from Viewer to Admin | Critical |
| 5 | Deduplicated Reprocessing & Caching | Re-uploading identical 10MB invoice files -> Instant cache hit verification -> Unaltered financial tally | Medium |

---

## Coverage Thresholds
- **Tier 1**: ≥ 5 test cases per feature (55+ test cases)
- **Tier 2**: ≥ 5 test cases per feature for boundary/error states (55+ test cases)
- **Tier 3**: ≥ 12 pairwise cross-feature integration test cases
- **Tier 4**: ≥ 5 full-scale real-world industrial application scenarios
- **Total Minimum**: ≥ 127 verifiable automated test cases
