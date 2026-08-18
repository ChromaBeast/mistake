# Event Model

## Envelope

Every event carries both when the business fact actually happened and
when Mistake found out about it — this distinction is what enables
temporal reasoning (e.g. "we only learned about this quantity change
three days after the fact, from a different source than the original
order").

```json
{
  "event_id": "uuid",
  "tenant_id": "uuid",
  "entity_id": "uuid",
  "event_type": "order.quantity.changed",
  "event_version": 1,
  "source": "whatsapp",
  "occurred_at": "2026-08-17T14:32:00Z",
  "observed_at": "2026-08-17T16:05:00Z",
  "payload": {},
  "evidence_id": "uuid",
  "confidence": 0.94
}
```

`occurred_at` may be null or estimated when the source doesn't state a
time explicitly (e.g. a scanned PDF with only a date) — in that case
store the best-available granularity and flag it in `payload`
(`"occurred_at_precision": "date_only"`) rather than fabricating a time.

## Event catalog (MVP)

| Event type | Fires when | Key payload fields |
|---|---|---|
| `order.created` | Order first extracted | `order_number`, `customer_id`, `line_items` |
| `order.quantity.changed` | A later source shows a different quantity for the same order | `previous_quantity`, `new_quantity` |
| `order.price.changed` | A later source shows a different price | `previous_price_minor`, `new_price_minor` |
| `order.status.changed` | Status field differs between sources or over time | `previous_status`, `new_status` |
| `purchase_order.created` | PO first extracted | `po_number`, `supplier_id` |
| `invoice.created` | Invoice first extracted | `invoice_number`, `amount_minor` |
| `invoice.amount.changed` | Amount differs across sources | `previous_amount_minor`, `new_amount_minor` |
| `payment.created` | Payment record extracted | `amount_minor`, `invoice_id` (nullable) |
| `shipment.created` | Shipment record extracted | `shipment_number`, `order_id` |
| `shipment.status.changed` | Status differs across sources | `previous_status`, `new_status` |
| `document.uploaded` | Upload accepted | `data_source_id`, `source_type` |
| `document.processed` | Extraction pipeline completes | `document_id`, `status` |
| `entity.created` | New canonical entity created | `entity_type`, `canonical_name` |
| `entity.merged` | Two entities resolved to one | `surviving_entity_id`, `merged_entity_id` |
| `mistake.detected` | Contradiction engine creates a finding | `mistake_id`, `mistake_type`, `severity` |
| `mistake.verified` | Human confirms the finding | `mistake_id`, `actor_user_id` |
| `mistake.dismissed` | Human dismisses the finding | `mistake_id`, `actor_user_id`, `reason` |
| `mistake.resolved` | Finding closed out | `mistake_id`, `actor_user_id`, `reason` |

## Lifecycle transitions

Every `mistakes.status` change writes both an `events` row (for the
timeline/audit trail) and a `mistake_transitions` row (see
[data-model.md](./data-model.md#mistakes)) — the two aren't redundant:
`mistake_transitions` is the authoritative state-machine record used for
lifecycle queries, `events` is what feeds the Investigation Workspace
timeline alongside every other entity's history.

```
detected → under_review → verified → { resolved | unresolved }
detected → dismissed  (reason required)
under_review → dismissed  (reason required)
```

## Versioning

`event_version` increments only on breaking payload changes (field
removed, type changed, semantic meaning changed). Additive fields (new
optional key) do not require a version bump. Consumers must ignore
unknown fields rather than fail. Never reuse an `event_type` string for
a semantically different event — mint a new type instead.

## Kafka topic convention (Phase 2, see
[system-architecture.md § Architecture evolution](./system-architecture.md#architecture-evolution))

`mistake.events.<domain>` — e.g. `mistake.events.orders`,
`mistake.events.invoices`, `mistake.events.shipments`,
`mistake.events.entities`, `mistake.events.mistakes`. Partition key:
`tenant_id` (keeps per-tenant ordering without a global ordering
guarantee, which nothing in MVP needs). Retention: match the tenant's
configured event retention (see
[data-retention-policy.md](../04-privacy/data-retention-policy.md)), not
Kafka's default.
