# Data Inventory

Maps directly to the schema in
[data-model.md](../02-architecture/data-model.md) — kept as a separate,
compliance-oriented view (what's personal/sensitive, not just what's a
column) rather than duplicating the schema.

| Data category | Tables | Contains personal data? | Notes |
|---|---|---|---|
| Account data | `users` | Yes — name, email | Tenant employees, not tenant's customers |
| Business records | `orders`, `purchase_orders`, `invoices`, `payments`, `shipments` | Possibly — contact names/emails embedded in source documents | Incidental, not the processing purpose |
| Entities | `entities`, `entity_aliases` | Possibly — if `entity_type = customer` resolves to an individual rather than a company | Mostly B2B counterparties |
| Evidence | `evidence` | Same as source document | Includes extracted content and a pointer to the original file |
| Events | `events` | Inherits from source | JSONB payload may echo personal data from the triggering document |
| Audit logs | `audit_logs` | Yes — `actor_user_id`, `ip_address` | Retention should follow its own policy, not the tenant's general data retention (audit logs often need to outlive the data they describe) |

This table should be regenerated whenever the schema changes materially
— treat schema changes to `data-model.md` as requiring a check here.
