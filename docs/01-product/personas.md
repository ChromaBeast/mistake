# Personas

Each persona maps to a primary in-product experience and a set of
permissions (see [access-control-policy.md](../03-security/access-control-policy.md)
for the full RBAC matrix).

## Business Owner

**Core question:** "Where are we losing money?"
**Primary experience:** Business Health Dashboard
**Default role:** Owner
**Success signal:** Checks the dashboard without being prompted; can
state the current ₹ discrepancy figure from memory.

## Operations Manager

**Core question:** "Which operational problems need attention?"
**Primary experience:** Issues → Investigation → Resolution
**Default role:** Manager
**Success signal:** Clears assigned issues within SLA (target defined in
[sla.md](../07-operations/sla.md)) without needing engineering help to
understand a finding.

## Finance Manager

**Core question:** "Which records don't reconcile financially?"
**Primary experience:** Financial Issues view (filtered Investigation
Workspace: `severity IN (critical, high)` and `mistake_type IN
(price_mismatch, quantity_mismatch)`)
**Default role:** Manager or Analyst
**Success signal:** Uses Mistake's financial impact figure directly in
month-end reconciliation instead of recalculating manually.

## Analyst

**Core question:** "What evidence supports this finding?"
**Primary experience:** Investigation Workspace (full evidence trail,
timeline, confidence scores)
**Default role:** Analyst
**Success signal:** Verifies or dismisses a finding using only in-app
evidence — never needs to go back to the source system to double-check.

## Administrator

**Manages:** users, roles, permissions, retention policy, security
settings, privacy settings, audit logs.
**Primary experience:** Administration console
**Default role:** Admin
**Success signal:** Onboards a new team member (invite → role assignment
→ first login) without support intervention.

## Jobs to be done (cross-persona)

Every persona above should be able to get an answer, in-product, to:

- "What doesn't agree?"
- "Where could we be losing money?"
- "Which orders are at risk?"
- "Show me the evidence."
- "Why did Mistake flag this?"
- "What changed?"
- "What should I investigate?"

These map directly to user stories in [user-stories.md](./user-stories.md).
