# Disaster Recovery

## Targets by phase

| Phase | RPO | RTO |
|---|---|---|
| Initial (pilot) | 24 hours | 12 hours |
| Post-pilot hardening | 1 hour | 4 hours |
| Enterprise-ready | Minutes | < 1 hour |

## Requirement
Recovery procedures must be **tested**, not just documented — a backup
that's never been restored is unverified. Schedule an actual restore
drill before the first pilot's data volume makes a drill expensive to
run, and repeat on a fixed cadence (recommend quarterly at minimum).

Backup mechanics: [../03-security/backup-recovery-policy.md](../03-security/backup-recovery-policy.md).
