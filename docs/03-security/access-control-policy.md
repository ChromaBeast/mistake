# Access Control Policy

## Principle
Tenant identity is derived from the authenticated session server-side,
never accepted from client input. A request whose payload claims a
different tenant than the session's is rejected, not corrected — see
[api-spec.md § Conventions](../02-architecture/api-spec.md#conventions).

## Roles (MVP — fixed, not customizable)

| Role | Typical persona | Can | Cannot |
|---|---|---|---|
| Owner | Business Owner | Everything Admin can, plus billing and account deletion | — |
| Admin | Administrator | Manage users/roles, retention, security settings, view audit log | Delete the tenant account |
| Manager | Operations/Finance Manager | View and act on Mistakes, assign, resolve, dismiss | Manage users, change retention/security settings |
| Analyst | Analyst | View and act on Mistakes, verify/dismiss with evidence | Manage users, change tenant settings |
| Viewer | any read-only stakeholder | View dashboard and findings | Change status of any Mistake, manage anything |

Custom roles are explicitly deferred (see
[data-model.md § Core tenancy](../02-architecture/data-model.md#core-tenancy))
until a real customer need justifies the added complexity of a
permissions table.

## Enforcement
- All authorization checks happen server-side in the Go API — the
  frontend's role-based UI hiding is a UX convenience only, never a
  security boundary.
- Every tenant-owned table carries `tenant_id`; every query filters on
  it; this is enforced at the data-access-layer level, not left to
  individual handlers to remember.
- Session tokens are short-lived; refresh requires re-validation against
  current user status (a disabled user's existing session is revocable,
  see [security-policy.md](./security-policy.md)).
