# Data Retention Policy

## Tenant-configurable retention periods
30 days, 90 days, 1 year, 7 years, or custom — configured per tenant via
`retention_policies` (see
[data-model.md](../02-architecture/data-model.md#audit--retention)).

## Covers
Evidence, events, audit logs, backups, and derived data (extracted
entities, computed financial impact figures tied to expired source
evidence).

## Default (until a tenant sets their own)
Recommend defaulting new tenants to **1 year**, not indefinite retention
— v1.0 didn't specify a default, which means "keep everything forever"
by omission. An explicit default that a tenant can shorten or extend is
safer than silent indefinite retention, both for trust and for
[DPDP](./dpdp-compliance.md) alignment.

## Enforcement
Retention is enforced by a scheduled job, not manual cleanup — see
[deletion-policy.md](./deletion-policy.md) for what "expired" actually
triggers.
