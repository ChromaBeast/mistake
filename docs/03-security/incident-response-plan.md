# Incident Response Plan

```
Security Incident Detected
          ↓
Classify Severity
          ↓
Contain
          ↓
Preserve Evidence
          ↓
Investigate
          ↓
Notify Required Parties
          ↓
Remediate
          ↓
Postmortem
```

## Notes
- "Notify Required Parties" scope (which regulator, which customers,
  what timeline) depends on applicable Indian regulation (CERT-In
  incident reporting timelines in particular) and each pilot's DPA terms
  — confirm the actual CERT-In reporting window with legal counsel
  before finalizing this runbook; do not assume a specific number of
  hours without that confirmation (see
  [dpdp-compliance.md](../04-privacy/dpdp-compliance.md)).
- Every incident gets a postmortem regardless of severity, filed in the
  incident runbook (see
  [incident-runbook.md](../07-operations/incident-runbook.md)) — the
  postmortem is where recurring root causes should surface, e.g. if
  three incidents in a quarter trace back to the same missing
  `tenant_id` filter pattern, that's a code-review checklist gap, not
  three unrelated bugs.
