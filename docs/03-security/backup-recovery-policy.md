# Backup & Recovery Policy

Backups are encrypted (see [encryption-policy.md](./encryption-policy.md))
and cover the PostgreSQL database, object storage, and configuration
needed to reconstruct a tenant's data. Recovery procedures must be
tested, not just scheduled — an untested backup is a hypothesis, not a
control.

Recovery time/point objectives and the testing cadence live in
[disaster-recovery.md](../07-operations/disaster-recovery.md) so they
sit alongside the operational runbook rather than duplicated here.
