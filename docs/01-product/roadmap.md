# Roadmap

Four-month build to a pilot-ready MVP, each month with consistent
Product / Engineering breakdown and an explicit exit criterion — v1.0 of
this PRD had Month 1 broken out this way but Months 2–4 were not, which
made it hard to tell what "done" meant for those months. Fixed here.

## Month 1 — Foundation

**Product:** PRD (this doc set), UX flows, architecture decision records,
database model, event model, security model.

**Engineering:** Next.js scaffold, Go API scaffold, Flutter foundation,
PostgreSQL + pgvector, Docker Compose local dev, authentication,
multi-tenancy (`tenant_id` on every table), RBAC (5 fixed roles).

**Exit criterion:** a user can sign up, create a tenant, invite a
teammate with a role, and log in — with tenant isolation and RBAC
enforced server-side and covered by tests.

## Month 2 — Mistake Engine

**Product:** finalize detection UX (Investigation Workspace, evidence
presentation), issue lifecycle states, severity rubric.

**Engineering:** ingestion pipeline, document processing, entity
extraction, entity resolution, event model implementation, evidence
store, contradiction engine (5 MVP detection types), financial impact
engine, issue lifecycle state machine.

**Exit criterion:** given a synthetic dataset with known-planted
discrepancies, the engine detects them, computes correct ₹ impact
deterministically, and produces an evidence trail for each — this is
the core of Mistake and should not slip.

## Month 3 — AI + Distributed Systems

**Product:** confidence-score UX, explanation quality bar, human review
queue for ambiguous entity matches.

**Engineering:** Kafka introduced (extraction/resolution/detection
workers), RAG for evidence retrieval, AI extraction, AI explanation
generation, confidence scoring, anomaly-detection experiments,
evaluation framework (see
[evaluation-framework.md](../06-ai/evaluation-framework.md)),
prompt-injection defenses (see
[prompt-security.md](../06-ai/prompt-security.md)).

> Note: introducing Kafka here is a roadmap commitment, which is in
> tension with the architecture principle "Kafka solves a real problem,
> not a portfolio checkbox" (see
> [system-architecture.md](../02-architecture/system-architecture.md#architecture-evolution)).
> Before Month 3 starts, confirm the actual bottleneck (likely: worker
> fan-out for document processing at pilot-scale volume) — if the
> modular monolith with background workers is still coping, defer Kafka
> to Month 4 or later and spend the time on detection accuracy instead.

**Exit criterion:** evaluation dataset shows extraction accuracy,
contradiction precision, and contradiction recall above the thresholds
in [evaluation-framework.md](../06-ai/evaluation-framework.md), and a
documented prompt-injection test suite passes.

## Month 4 — Production

**Engineering:** GCP deployment, Kubernetes, CI/CD, observability
(OpenTelemetry + Grafana), backups, billing, security hardening, audit
logs, privacy controls, mobile application (Flutter), production
deployment.

**Then:** onboard 3–5 pilot companies.

**Exit criterion:** all items in
[acceptance-criteria.md](./acceptance-criteria.md) pass, disaster
recovery targets in
[disaster-recovery.md](../07-operations/disaster-recovery.md) are
tested (not just documented), and the first pilot company sees a real
finding in their first session.

**Suggested pilot success criteria** (not in v1.0 — add before pilots
start): number of verified (not just detected) mistakes per pilot in
week 1, ₹ value identified per pilot, and a qualitative "would you pay
for this" check-in at week 4. Track in
[../08-compliance](../08-compliance) alongside security questionnaire
responses pilots will likely request.

## Metrics: North Star & supporting

**North Star:** Verified Mistakes Resolved — ties the brand directly to
measurable customer value, and specifically requires *verification*
(human-confirmed), not just detection, so it can't be inflated by a
noisy detector.

**Long-term business metric:** ₹ Value Protected.

**Supporting funnel:**
Mistakes detected → Mistakes verified → Mistakes resolved → financial
value exposed → financial value recovered → orders saved → late
deliveries predicted (once forecasting ships) → false positives → false
negatives → time saved.

**AI quality metrics** (see full detail and targets in
[evaluation-framework.md](../06-ai/evaluation-framework.md)): extraction
accuracy, entity-resolution accuracy, contradiction precision/recall,
confidence calibration, latency, token cost, processing cost,
customer-level AI cost.

**Unit economics:** Cost per Customer per Month (AI + compute + storage
+ database + network + processing + monitoring) measured against
subscription and usage revenue to track gross margin from Month 1 of
paid pilots, not retrofitted later.

## Key risks

| Risk | Why it matters | Mitigation |
|---|---|---|
| False positives | Too many incorrect findings destroy trust fast — this product's entire value prop is "trust the finding" | Deterministic checks, mandatory evidence, confidence scoring, human verification step before anything is "final" |
| False negatives | Missing serious issues quietly caps value | Multiple detection techniques, ongoing evaluation against the dataset in [evaluation-framework.md](../06-ai/evaluation-framework.md) |
| AI cost | Large document volumes can produce poor margins | Model routing (cheap model first), caching by document hash, batching, per-customer usage controls |
| Security incidents | Customer data (financial records) is highly sensitive | Tenant isolation, encryption, RBAC, MFA, monitoring — see [03-security](../03-security) |
| Scope explosion | Too many integrations overwhelms a small team | Strict MVP scope; new inputs require a written justification, not just customer request volume |
| Premature distributed architecture | Too many services slows a small team down before there's a scaling problem | Modular monolith first; Kafka only when a measured bottleneck justifies it (see Month 3 note above) |

## Future expansion

After the core product is validated with pilots: live integrations
(ERP/accounting connectors, WhatsApp ingestion, email integrations),
advanced graph relationships between entities, anomaly detection beyond
simple mismatches, forecasting, operational intelligence, workflow
automation, controlled AI agents with approval gates, enterprise
connectors.

Sequencing these against MVP non-goals: see
[PRD.md § MVP scope](./PRD.md#4-mvp-scope).
