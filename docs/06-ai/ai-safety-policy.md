# AI Safety Policy

## Agent types (MVP)

### Evidence Analyst
**Can:** read documents, read events, read entities.
**Cannot:** delete, send email, modify ERP.

### Action Agent
**Can:** create alert, draft email, create task.
**Cannot:** send without human approval.

Administrative agents (anything touching users, permissions, retention,
billing) should almost never operate fully autonomously — if a future
admin-facing agent is proposed, it needs its own explicit permission
scope reviewed against this policy before shipping, not an extension of
an existing agent's scope by default.

## Recommendations vs. actions
Mistake may *recommend* (review invoice, verify quantity, contact
supplier, investigate shipment, upload missing evidence, assign to
finance, draft communication). Recommendations are never auto-executed.
Any consequential external action requires human approval — no
autonomous external communication in MVP (see
[system-architecture.md § Notifications](../02-architecture/system-architecture.md#notifications)).

## Human fallback
Every AI-driven feature needs a defined fallback for when confidence is
low or the AI pipeline fails outright (e.g. ambiguous entity matches
route to a human review queue rather than auto-merging — see
[data-model.md § Entities](../02-architecture/data-model.md#entities-customer--supplier--product)).
This is part of Definition of Done for AI features — see
[PRD.md § Definition of Done](../01-product/PRD.md#9-definition-of-done).
