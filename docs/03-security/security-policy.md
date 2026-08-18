# Security Policy

## Scope
Applies to all Mistake systems handling tenant data: web, mobile, API,
background workers, and infrastructure.

## Required controls
- Tenant isolation, enforced server-side (see
  [access-control-policy.md](./access-control-policy.md))
- Server-side authorization on every request — never trust a
  client-supplied `tenant_id` or role claim (see
  [api-spec.md](../02-architecture/api-spec.md#conventions))
- RBAC across five fixed MVP roles (Owner, Admin, Manager, Analyst,
  Viewer)
- MFA required for Owner and Admin roles
- Encryption in transit and at rest (see
  [encryption-policy.md](./encryption-policy.md))
- Encrypted, tested backups (see
  [backup-recovery-policy.md](./backup-recovery-policy.md))
- Dedicated secret manager — no secrets in source control, env files
  committed, or config JSON in the repo
- Audit logging for the action list below
- Configurable, tenant-scoped data retention with real deletion (see
  [../04-privacy/deletion-policy.md](../04-privacy/deletion-policy.md))
- Documented incident response (see
  [incident-response-plan.md](./incident-response-plan.md))
- Ongoing vulnerability management (see
  [vulnerability-management.md](./vulnerability-management.md))
- AI-specific security: prompt-injection defenses, tool-scoped agent
  permissions (see [../06-ai/prompt-security.md](../06-ai/prompt-security.md))

## Minimum audit log coverage
Authentication events, permission changes, evidence access, evidence
deletion, Mistake status changes, data exports, retention policy
changes, privacy actions (access/correction/deletion requests), account
deletion. Every audit row: who, what, when, from where, before, after
— see [data-model.md § Audit & retention](../02-architecture/data-model.md#audit--retention).

## Ownership
Security is a product requirement, not an add-on team's concern — every
feature's Definition of Done includes a security review (see
[PRD.md § Definition of Done](../01-product/PRD.md#9-definition-of-done)).
