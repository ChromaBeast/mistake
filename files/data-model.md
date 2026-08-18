# Data Model

This did not exist as a real schema in v1.0 — it listed 8 entity names
with no fields. This is a working draft schema good enough to start
building against; treat table/column names as the contract and revise
via ADR (see [adr/](./adr/)) rather than ad hoc drift once implementation
starts.

Conventions: every tenant-owned table carries `tenant_id` (never
nullable, never trusted from client input — derived server-side from the
authenticated session, see
[access-control-policy.md](../03-security/access-control-policy.md)).
All primary keys are UUIDs. All tables carry `created_at`; mutable tables
carry `updated_at`. Money is stored as integer minor units (paise) with a
separate `currency` column, never floating point.

## Core tenancy

```sql
tenants (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  legal_name TEXT,
  industry TEXT,
  status TEXT NOT NULL DEFAULT 'active', -- active | suspended | deleted
  retention_policy_id UUID REFERENCES retention_policies(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

users (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  email CITEXT NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL, -- Owner | Admin | Manager | Analyst | Viewer
  mfa_enabled BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active', -- active | invited | disabled
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, email)
);
```

Custom roles are a post-MVP concern (see
[access-control-policy.md](../03-security/access-control-policy.md)) —
`role` stays a constrained enum for MVP rather than a many-to-many
permissions table, to avoid building an authorization system before
there's a customer asking for one.

## Ingestion

```sql
data_sources (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  uploaded_by UUID NOT NULL REFERENCES users(id),
  source_type TEXT NOT NULL, -- csv | xlsx | pdf | email_export | erp_export | manual
  filename TEXT NOT NULL,
  storage_key TEXT NOT NULL, -- object storage path
  file_hash TEXT NOT NULL,   -- sha256, used for AI processing cache
  status TEXT NOT NULL DEFAULT 'queued',
    -- queued | processing | extracting | analyzing | completed | failed
  error_message TEXT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ
);

documents (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  data_source_id UUID NOT NULL REFERENCES data_sources(id),
  document_type TEXT, -- order | po | invoice | shipment_note | email | unknown
  page_count INT,
  content_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

evidence (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  document_id UUID NOT NULL REFERENCES documents(id),
  source_type TEXT NOT NULL,
  source_location TEXT,        -- e.g. page 2, row 14, email thread offset
  source_timestamp TIMESTAMPTZ,
  original_content_ref TEXT,   -- pointer back to the raw object
  extracted_content JSONB NOT NULL,
  document_hash TEXT NOT NULL,
  extraction_version TEXT NOT NULL,
  model_version TEXT,
  confidence NUMERIC(4,3),     -- 0.000–1.000
  embedding VECTOR(1536),      -- pgvector, for evidence search/RAG
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

Cache key for reprocessing avoidance:
`document_hash + extraction_version + model_version` (see
[event-model.md](./event-model.md) and
[../06-ai/ai-policy.md](../06-ai/ai-policy.md#processing-cache)).

## Entities (customer / supplier / product)

```sql
entities (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  entity_type TEXT NOT NULL, -- customer | supplier | product
  canonical_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

entity_aliases (
  id UUID PRIMARY KEY,
  entity_id UUID NOT NULL REFERENCES entities(id),
  alias_name TEXT NOT NULL,
  source_evidence_id UUID REFERENCES evidence(id),
  confidence NUMERIC(4,3),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- type-specific detail, 1:1 with entities where entity_type matches
products (
  entity_id UUID PRIMARY KEY REFERENCES entities(id),
  sku TEXT,
  description TEXT,
  unit_of_measure TEXT
);
```

Ambiguous alias matches (below the auto-merge confidence threshold — see
[evaluation-framework.md](../06-ai/evaluation-framework.md) for the
actual number) are surfaced in a review queue rather than silently
merged. `customers` and `suppliers` reuse the `entities` table with
`entity_type` as discriminator rather than separate tables, since MVP
doesn't need type-specific fields beyond what `entities` already holds.

## Business objects

```sql
orders (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  customer_id UUID NOT NULL REFERENCES entities(id),
  order_number TEXT NOT NULL,
  status TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  occurred_at TIMESTAMPTZ,   -- when the order actually happened
  observed_at TIMESTAMPTZ,   -- when Mistake ingested it
  source_evidence_id UUID REFERENCES evidence(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

order_lines (
  id UUID PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id),
  product_id UUID REFERENCES entities(id),
  quantity NUMERIC NOT NULL,
  unit_price_minor BIGINT NOT NULL
);

purchase_orders (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  supplier_id UUID NOT NULL REFERENCES entities(id),
  po_number TEXT NOT NULL,
  status TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  occurred_at TIMESTAMPTZ,
  observed_at TIMESTAMPTZ,
  source_evidence_id UUID REFERENCES evidence(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

po_lines (
  id UUID PRIMARY KEY,
  purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id),
  product_id UUID REFERENCES entities(id),
  quantity NUMERIC NOT NULL,
  unit_price_minor BIGINT NOT NULL
);

invoices (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  related_order_id UUID REFERENCES orders(id),
  related_po_id UUID REFERENCES purchase_orders(id),
  invoice_number TEXT NOT NULL,
  amount_minor BIGINT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL,
  issued_at TIMESTAMPTZ,
  observed_at TIMESTAMPTZ,
  source_evidence_id UUID REFERENCES evidence(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

payments (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  invoice_id UUID REFERENCES invoices(id),
  amount_minor BIGINT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  method TEXT,
  paid_at TIMESTAMPTZ,
  source_evidence_id UUID REFERENCES evidence(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

shipments (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  order_id UUID REFERENCES orders(id),
  shipment_number TEXT,
  status TEXT NOT NULL,
  promised_date DATE,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  source_evidence_id UUID REFERENCES evidence(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## Events

```sql
events (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  entity_id UUID REFERENCES entities(id),
  event_type TEXT NOT NULL,   -- see event-model.md for full catalog
  event_version INT NOT NULL DEFAULT 1,
  source TEXT NOT NULL,       -- whatsapp | email | erp | pdf | manual | ...
  occurred_at TIMESTAMPTZ,
  observed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  payload JSONB NOT NULL,
  evidence_id UUID REFERENCES evidence(id),
  confidence NUMERIC(4,3),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

Full event catalog and payload shapes: [event-model.md](./event-model.md).

## Mistakes

```sql
mistakes (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  mistake_type TEXT NOT NULL,
    -- quantity_mismatch | price_mismatch | date_mismatch
    -- | status_mismatch | missing_evidence
  severity TEXT NOT NULL, -- critical | high | medium | low | healthy
  status TEXT NOT NULL DEFAULT 'detected',
    -- detected | under_review | verified | resolved | unresolved | dismissed
  affected_entity_type TEXT,
  affected_entity_id UUID,
  financial_impact_minor BIGINT,   -- NULL if not applicable
  currency TEXT DEFAULT 'INR',
  confidence NUMERIC(4,3),
  explanation TEXT NOT NULL,       -- AI-generated, human-readable
  recommended_action TEXT,
  assigned_to UUID REFERENCES users(id),
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

mistake_evidence (
  mistake_id UUID NOT NULL REFERENCES mistakes(id),
  evidence_id UUID NOT NULL REFERENCES evidence(id),
  PRIMARY KEY (mistake_id, evidence_id)
);

mistake_transitions (
  id UUID PRIMARY KEY,
  mistake_id UUID NOT NULL REFERENCES mistakes(id),
  from_status TEXT NOT NULL,
  to_status TEXT NOT NULL,
  changed_by UUID NOT NULL REFERENCES users(id),
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

`financial_impact_minor` is written exclusively by the deterministic
financial impact engine — never by an LLM call. See
[ai-policy.md](../06-ai/ai-policy.md) and
[ADR-0002](./adr/0002-ai-never-computes-money.md).

**Financial impact formula (quantity mismatch example):**
`financial_impact_minor = ABS(order_quantity - invoice_quantity) *
invoice_unit_price_minor`. When multiple mismatches touch the same
order/invoice pair (e.g. both quantity and price disagree), sum the
per-mismatch impacts but create separate `mistakes` rows per
`mistake_type` rather than one compound row — this keeps severity and
evidence per-type instead of blending them, and matches how
[detection logic](./data-model.md#mistakes) is described per-type in
[user-stories.md § Epic 4](../01-product/user-stories.md#epic-4--mistake-detection).
This wasn't specified in v1.0 and should be confirmed with product
before Month 2 build starts.

## Audit & retention

```sql
audit_logs (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  actor_user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  before JSONB,
  after JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

retention_policies (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  resource_type TEXT NOT NULL,
  retention_period INTERVAL NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

Full retention mechanics (what "deletion" actually touches — DB, object
storage, vector data, search indexes, cache, backups):
[data-retention-policy.md](../04-privacy/data-retention-policy.md) and
[deletion-policy.md](../04-privacy/deletion-policy.md).

## Indexing notes (MVP-sufficient, revisit at scale)

- `tenant_id` is the leading column on every composite index — every
  query is tenant-scoped, so this should never be a sequential scan.
- `evidence.embedding` gets an IVFFlat or HNSW pgvector index once
  evidence volume makes exact search slow — not needed at pilot scale.
- `mistakes(tenant_id, status, severity)` composite index for the
  dashboard's primary query.
- `events(tenant_id, entity_id, occurred_at)` for timeline reconstruction.
