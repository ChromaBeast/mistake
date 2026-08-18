# Encryption Policy

| Layer | Requirement |
|---|---|
| Transit | TLS for all client-server and service-to-service traffic |
| At rest | Encrypted database volumes and object storage |
| Backups | Encrypted, using a separate key from live data where the backup provider supports it |
| Secrets | Dedicated secret manager (not env files, not source control); rotated on role change or suspected compromise |

Key management ownership and rotation cadence to be finalized during
Month 1 infrastructure setup (see
[roadmap.md § Month 1](../01-product/roadmap.md#month-1--foundation)) —
not specified further here since it depends on the final cloud provider
choice (GCP per [roadmap.md § Month 4](../01-product/roadmap.md#month-4--production)).
