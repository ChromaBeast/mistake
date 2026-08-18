# MVP Acceptance Criteria

The MVP is complete when a test customer can do everything below. Group
headers match the epics in [user-stories.md](./user-stories.md).

## Account
- [ ] create account
- [ ] create tenant
- [ ] invite user with a specific role
- [ ] authenticate (including MFA for Admin/Owner)

## Data
- [ ] upload CSV
- [ ] upload XLSX
- [ ] upload PDF
- [ ] view processing status in real time
- [ ] view failures with a specific, actionable error
- [ ] access evidence for any extracted fact

## Intelligence
- [ ] extract entities from all five MVP input formats
- [ ] create events from extracted entities
- [ ] resolve entities across sources (aliases preserved)
- [ ] detect quantity mismatch
- [ ] detect price mismatch
- [ ] detect date mismatch
- [ ] detect status mismatch
- [ ] detect missing evidence

## Investigation
- [ ] view a Mistake (finding)
- [ ] view severity
- [ ] view financial impact
- [ ] view affected entity
- [ ] view timeline
- [ ] view evidence
- [ ] view explanation
- [ ] view recommendation

## Resolution
- [ ] mark under review
- [ ] verify
- [ ] dismiss (with recorded reason)
- [ ] resolve
- [ ] record reason on every transition

## Security
- [ ] tenant isolation verified (cross-tenant read/write attempts fail)
- [ ] RBAC enforced server-side for every role
- [ ] audit logs produced for every action in the list in
      [../03-security/security-policy.md](../03-security/security-policy.md)

## Performance
- [ ] uploads process asynchronously; UI never blocks on processing
- [ ] processing status moves through `Queued → Processing → Extracting
      → Analyzing → Completed/Failed` and is visible at every stage
- [ ] dashboard interactions remain responsive under pilot-scale data
      volume (define and load-test against an actual number before
      Month 4 — v1.0 left this unquantified; suggest starting from
      "5,000 documents / tenant, p95 dashboard load < 2s" and revising
      after the first pilot's real volume is known)
- [ ] failures are visible in the UI and recoverable (re-upload, retry)
      without support intervention

## Worked example — Given/When/Then for the core loop

```
Given a tenant with no prior data
When the user uploads one Order (XLSX) showing 5,000 units
 and one Invoice (PDF) showing 4,500 units for the same PO number
Then processing completes without manual intervention
 and exactly one Mistake is created with mistake_type = quantity_mismatch
 and severity is set by the deterministic rubric (not by the LLM alone)
 and financial_impact_amount = (500 * invoice_unit_price)
 and the Mistake's evidence includes both source documents
 and the explanation names the two conflicting quantities and their sources
```

```
Given a Mistake in status "Detected"
When an Analyst clicks "Verify"
Then status transitions to "Verified"
 and a mistake_transition row is written with actor, timestamp, reason
 and the transition is queryable in the audit log
```

Full detection-type behavior and financial impact formulas:
[../02-architecture/data-model.md](../02-architecture/data-model.md).
