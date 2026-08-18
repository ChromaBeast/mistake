# Mistake — Documentation

Restructured from the single-file v1.0 PRD into the `/docs` layout that
v1.0 itself proposed (originally section 72). Start at
[01-product/PRD.md](./01-product/PRD.md).

```
01-product      — what & why (PRD, vision, personas, stories, flows, roadmap, AC)
02-architecture — how it's built (system design, schema, events, API, ADRs)
03-security     — how it's protected
04-privacy      — how data is handled and how deletion actually works
05-legal        — clause checklists ONLY, not binding text — needs counsel
06-ai           — AI-specific policy, safety, and evaluation
07-operations   — SLA, support, DR, continuity (mostly drafts pending real data)
08-compliance   — trackers: data inventory, subprocessors, compliance matrix
```

## What changed from v1.0

**Restructured:**
- Split one 2,100-line file into the folder structure v1.0 already
  specified in its own "Product Documentation Structure" section, so
  the plan and the artifact finally match.
- Removed duplication: the "aha moment" flow appeared three times
  (Product Goal, MVP User Flow, Aha Moment sections) — now one flow in
  [user-flows.md](./01-product/user-flows.md). Value proposition and
  tagline text appeared twice — now stated once each.
- Fixed heading hierarchy: v1.0 had stray `#` (h1) headers nested inside
  numbered sections (`# What's wrong?`, `# Verified Mistakes Resolved`,
  `# Cost per Customer per Month`) which broke the document outline —
  now proper subheadings.
- Made the roadmap's Month 1–4 structure consistent — v1.0 only broke
  Month 1 into Product/Engineering; Months 2–4 didn't follow the same
  shape. Now they do, each with an explicit exit criterion (v1.0 had
  none — "done" was undefined for every month but Month 1).
- Removed leftover meta-references to "the supplied specification" and
  "the original recommendation" that read like generation artifacts
  rather than product content.

**Deepened (genuinely new content, not in v1.0):**
- [data-model.md](./02-architecture/data-model.md) — v1.0 listed 8
  entity names with zero fields. Now an actual schema.
- [api-spec.md](./02-architecture/api-spec.md) — didn't exist at all.
- [event-model.md](./02-architecture/event-model.md) — expanded from one
  JSON example into a full event catalog, versioning rule, and Kafka
  topic convention.
- [user-stories.md](./01-product/user-stories.md) — v1.0 had a bare list
  of questions ("Jobs to be done"); now organized into epics with
  acceptance criteria.
- Three [ADRs](./02-architecture/adr/) capturing decisions that were
  stated as principles in v1.0 but not recorded as decisions with
  consequences.
- [evaluation-framework.md](./06-ai/evaluation-framework.md) — v1.0
  listed metrics to track with no targets; now has proposed thresholds
  (flagged as provisional until real data exists).
- [threat-model.md](./03-security/threat-model.md) — v1.0 mentioned
  "STRIDE Analysis" as a doc to maintain but never did the analysis.

**Flagged as genuinely open** (not resolved by this pass — these need a
product or legal decision, not more writing):
- How compound mismatches (same order, multiple discrepancy types)
  aggregate financial impact — [data-model.md](./02-architecture/data-model.md#mistakes)
- Whether Kafka in Month 3 is justified by then, or should slip —
  [roadmap.md](./01-product/roadmap.md#month-3--ai--distributed-systems)
- DPDP role (Fiduciary vs. Processor) and CERT-In reporting timeline —
  [dpdp-compliance.md](./04-privacy/dpdp-compliance.md)
- Actual backup rotation → full-deletion timeline, once a provider is
  chosen — [deletion-policy.md](./04-privacy/deletion-policy.md)
- Dashboard performance target number — v1.0 said "should remain
  responsive" with no number; proposed a starting figure in
  [acceptance-criteria.md](./01-product/acceptance-criteria.md#performance)
