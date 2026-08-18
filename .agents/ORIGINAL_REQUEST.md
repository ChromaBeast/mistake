# Original User Request

## Initial Request — 2026-08-18T13:23:51+05:30

You are the Project Orchestrator for building Mistake, an evidence-backed B2B discrepancy and financial leakage detection platform for manufacturers, distributors, and wholesalers (India-first, INR currency in paise minor units).

Your working directory is: c:/Users/sheer/Documents/antigravity/proud-curie/.agents/orchestrator_1
Original User Request is at: c:/Users/sheer/Documents/antigravity/proud-curie/.agents/ORIGINAL_REQUEST.md

Inspect the existing docs/ folder at c:/Users/sheer/Documents/antigravity/proud-curie/docs for detailed architecture, API specs, schemas, and ADRs.

Your responsibilities:
1. Decompose the mission and orchestrate specialist subagents (explorers, implementers, reviewers, testers) to build the complete platform across backend/, web/, and mobile/.
2. Backend (Go):
   - Modular monolith REST API (/api/v1/auth, /tenant, /users, /data-sources, /documents, /entities, /events, /mistakes, /search, /audit-logs, /retention-policy, /billing).
   - Tenant-isolated multi-tenant storage and RBAC (Owner, Admin, Manager, Analyst, Viewer).
   - Ingestion pipeline with real-time status progression (Queued -> Processing -> Extracting -> Analyzing -> Completed).
   - Entity resolver with alias matching and human review queue.
   - Deterministic detection engine (quantity mismatch, price mismatch, date mismatch, status mismatch, missing evidence).
   - Deterministic financial impact calculation in minor units (paise) per ADR-0002.
   - Comprehensive test suite passing with `go test ./...`.
3. Web (Next.js):
   - High-performance, premium B2B UI with INR formatting.
   - Business Health Dashboard, Ingestion Hub, Investigation Workspace (side-by-side evidence inspector, chronological multi-source timeline, math breakdown, explanation, reason logging), Entity Explorer, Global Search, Immutable Audit Trail, Settings.
   - Build cleanly with `npm run build` with zero type errors.
4. Mobile (Flutter):
   - Factory floor document capture (scanner simulation, barcode/QR inspection) and executive triage.
   - flutter_riverpod, riverpod_annotation, riverpod_generator, build_runner.
   - Strictly uses Color.withValues(alpha: ...) (never withOpacity).
   - Reusable granular components.
   - Clean `flutter analyze` and generated providers.
5. Strict Constraints:
   - Every non-data/non-json source file across Go, TypeScript/CSS, and Dart must strictly remain readable and under 200 lines of code (<200 LoC).
   - Maintain your progress.md and BRIEFING.md continuously.
6. When complete and verified across backend, web, and mobile, report victory back to Sentinel.
