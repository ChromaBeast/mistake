# User Stories

Organized by epic. Each story references the persona (see
[personas.md](./personas.md)) and links to the detection/entity/lifecycle
concepts defined in the architecture docs. `AC` = acceptance criteria.

## Epic 1 — Account & Tenant Setup

**US-1.1** As a new customer, I want to create an account and tenant so
that my company's data is isolated from every other customer's.
- AC: signup creates exactly one `tenant` row and one `user` row with
  role `Owner`.
- AC: no tenant data is readable without an authenticated session scoped
  to that tenant (see [access-control-policy.md](../03-security/access-control-policy.md)).

**US-1.2** As an Owner or Admin, I want to invite teammates with a
specific role so that they see only what their job requires.
- AC: invite email contains a single-use, time-limited token.
- AC: invited user cannot select their own role — it's set by the
  inviter.

**US-1.3** As any user, I want to authenticate securely and recover my
password so that I'm not locked out or exposed to account takeover.
- AC: MFA is enforced for Admin and Owner roles.
- AC: sessions can be revoked centrally by an Admin.

## Epic 2 — Data Ingestion

**US-2.1** As an Operations Manager, I want to upload CSV, XLSX, PDF,
email exports, or ERP exports without any integration setup, so that I
get value in my first session.
- AC: upload accepts the five MVP formats and rejects/flags unsupported
  formats with a clear error.
- AC: processing is asynchronous; the UI shows status
  (`Queued → Processing → Extracting → Analyzing → Completed/Failed`).

**US-2.2** As an Operations Manager, I want to see why a specific file
failed to process, so that I can fix and re-upload it instead of guessing.
- AC: failed uploads show a specific, non-generic error (e.g. "password
  protected PDF," "unrecognized column headers," not "processing error").

## Epic 3 — Entity & Event Understanding

**US-3.1** As the system, records referring to the same real-world
supplier/customer/product under different names must be resolved to one
canonical entity, so that comparisons are apples-to-apples.
- AC: "ABC Manufacturing Pvt Ltd," "ABC Manufacturing," and "ABC Mfg."
  resolve to one entity with aliases preserved and matching evidence
  retained.
- AC: low-confidence matches are queued for human review rather than
  auto-merged.

**US-3.2** As an Analyst, I want every business change (quantity edit,
status change, new document) represented as a timestamped event with
both when-it-happened and when-we-found-out, so that I can reconstruct a
timeline.
- AC: every event stores `occurred_at` and `observed_at` separately (see
  [event-model.md](../02-architecture/event-model.md)).

## Epic 4 — Mistake Detection

**US-4.1** As a Finance Manager, I want quantity mismatches between
Order and Invoice flagged automatically, with the exact delta, so that I
don't have to manually cross-check every line.
**US-4.2** As a Finance Manager, I want price mismatches between PO and
Invoice flagged with the ₹ impact, so that I can prioritize by financial
exposure.
**US-4.3** As an Operations Manager, I want date mismatches (promised
vs. actual delivery, order date vs. source-document date, or impossible
event ordering) flagged, so that at-risk orders surface before the
customer complains.
**US-4.4** As an Operations Manager, I want status mismatches between
systems (e.g. ERP says Delivered, Shipment record says Pending) flagged,
so that I know which system is wrong before reporting to a customer.
**US-4.5** As an Analyst, I want to be told when expected supporting
evidence is missing (invoice without PO, shipment without order, payment
without identifiable invoice), so that I can chase the paperwork before
it becomes a dispute.
- AC (all of US-4.1–4.5): every detected mistake is created with
  severity, affected entity, financial impact (if applicable), evidence
  references, a plain-language explanation, and a recommended action —
  never as an unexplained AI statement.

## Epic 5 — Investigation

**US-5.1** As an Analyst, when I open a finding, I want a summary,
timeline, evidence, explanation, and recommended action in one place, so
that I don't have to hunt across systems.
**US-5.2** As any persona, I want to see a confidence score and its
supporting/corroborating evidence rather than a bare AI claim, so that I
can trust — or challenge — the finding.

## Epic 6 — Resolution

**US-6.1** As an Analyst, I want to move a finding through
Detected → Under Review → Verified → Resolved/Unresolved (or Dismiss it),
recording a reason each time, so that there's an auditable resolution
history.
- AC: every state transition records user, timestamp, previous state,
  new state, and reason (see
  [event-model.md](../02-architecture/event-model.md#lifecycle-transitions)).

## Epic 7 — Dashboard & Reporting

**US-7.1** As a Business Owner, I want a single screen answering "what's
wrong," with total ₹ discrepancy, contradiction count, high-risk order
count, and missing-document count, so that I don't have to open
individual findings to get a pulse check.
**US-7.2** As a Business Owner, I want the dashboard to lead with
business outcomes (₹, order counts) rather than technical/processing
detail, so that it's useful without training.

## Epic 8 — Administration & Trust

**US-8.1** As an Admin, I want to configure data retention per data
type, so that we meet our internal policy and applicable regulation.
**US-8.2** As an Admin, I want an audit log of who did what, when, and
from where, so that I can answer a security or compliance question
without guessing.
**US-8.3** As an Admin, I want tenant isolation and RBAC enforced
server-side, so that a frontend bug can never leak another tenant's data.
