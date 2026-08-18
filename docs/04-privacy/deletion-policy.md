# Deletion Policy

## Principle
Deletion means **real deletion**, not a `deleted_at` flag that hides a
row from queries while the data physically remains. This was explicit in
v1.0 and is carried forward as a hard requirement.

## What deletion must touch
- Primary database rows
- Object storage (original uploaded files, extracted document copies)
- Vector embeddings (pgvector rows tied to deleted evidence)
- Search indexes (if a dedicated search index is ever introduced — see
  [ADR-0003](../02-architecture/adr/0003-postgres-before-dedicated-search.md))
- Cache
- Backups, on whatever cadence the backup provider's rotation allows —
  document the actual maximum time-to-full-deletion including backup
  rotation (e.g. "data is fully purged, including from backups, within
  35 days of a deletion request") once the backup provider and rotation
  policy are finalized (see
  [backup-recovery-policy.md](../03-security/backup-recovery-policy.md))
  — v1.0 didn't give this number and it's something customers will ask
  for directly.

## Triggers
- Retention period expiry (see
  [data-retention-policy.md](./data-retention-policy.md))
- Explicit user/tenant deletion request via the Privacy Center (see
  [privacy-policy.md](./privacy-policy.md))
- Account/tenant closure

## Audit
Every deletion action is itself an audit log entry (who/what/when) even
though the underlying data is gone — see
[security-policy.md](../03-security/security-policy.md#minimum-audit-log-coverage).
