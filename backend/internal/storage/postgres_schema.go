package storage

// InitialDBSchema contains DDL for tables and tenant indexes.
const InitialDBSchema = `
CREATE TABLE IF NOT EXISTS tenants (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    legal_name TEXT,
    industry TEXT,
    status TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL,
    mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_secret TEXT,
    status TEXT NOT NULL,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);

CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    refresh_token TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    refresh_token_expires_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_refresh ON sessions(refresh_token);


CREATE TABLE IF NOT EXISTS data_sources (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    uploaded_by TEXT NOT NULL,
    source_type TEXT NOT NULL,
    filename TEXT NOT NULL,
    storage_key TEXT,
    file_hash TEXT,
    status TEXT NOT NULL,
    error_message TEXT,
    item_count INT DEFAULT 0,
    uploaded_at TIMESTAMPTZ NOT NULL,
    processed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_ds_tenant ON data_sources(tenant_id);

CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    data_source_id TEXT REFERENCES data_sources(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    page_count INT DEFAULT 1,
    content_hash TEXT,
    created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS evidence (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    document_id TEXT REFERENCES documents(id) ON DELETE CASCADE,
    source_type TEXT NOT NULL,
    source_location TEXT,
    source_timestamp TIMESTAMPTZ,
    original_content_ref TEXT,
    extracted_content JSONB,
    document_hash TEXT NOT NULL,
    extraction_version TEXT NOT NULL,
    model_version TEXT,
    confidence NUMERIC,
    created_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_evidence_hash ON evidence(tenant_id, document_hash, extraction_version, model_version);


CREATE TABLE IF NOT EXISTS entities (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL,
    canonical_name TEXT NOT NULL,
    gstin TEXT,
    status TEXT NOT NULL,
    merged_into_id TEXT,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_entities_tenant ON entities(tenant_id);

CREATE TABLE IF NOT EXISTS entity_aliases (
    id TEXT PRIMARY KEY,
    entity_id TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    alias_name TEXT NOT NULL,
    source_evidence_id TEXT,
    confidence NUMERIC,
    created_at TIMESTAMPTZ NOT NULL
);


CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    entity_id TEXT,
    sku TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    unit_price_minor BIGINT,
    hsn_code TEXT,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    customer_id TEXT,
    customer_name TEXT,
    order_number TEXT NOT NULL,
    status TEXT NOT NULL,
    currency TEXT NOT NULL,
    total_amount_minor BIGINT NOT NULL,
    occurred_at TIMESTAMPTZ,
    observed_at TIMESTAMPTZ NOT NULL,
    source_evidence_id TEXT,
    lines_json JSONB,
    created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS purchase_orders (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    supplier_id TEXT,
    supplier_name TEXT,
    po_number TEXT NOT NULL,
    status TEXT NOT NULL,
    currency TEXT NOT NULL,
    total_amount_minor BIGINT NOT NULL,
    occurred_at TIMESTAMPTZ,
    observed_at TIMESTAMPTZ NOT NULL,
    source_evidence_id TEXT,
    lines_json JSONB,
    created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    related_order_id TEXT,
    related_po_id TEXT,
    supplier_id TEXT,
    customer_id TEXT,
    invoice_number TEXT NOT NULL,
    amount_minor BIGINT NOT NULL,
    currency TEXT NOT NULL,
    status TEXT NOT NULL,
    issued_at TIMESTAMPTZ,
    observed_at TIMESTAMPTZ NOT NULL,
    source_evidence_id TEXT,
    lines_json JSONB,
    created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    invoice_id TEXT,
    amount_minor BIGINT NOT NULL,
    currency TEXT NOT NULL,
    method TEXT,
    paid_at TIMESTAMPTZ,
    source_evidence_id TEXT,
    created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS shipments (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    order_id TEXT,
    po_id TEXT,
    shipment_number TEXT,
    status TEXT NOT NULL,
    promised_date TIMESTAMPTZ,
    shipped_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    source_evidence_id TEXT,
    created_at TIMESTAMPTZ NOT NULL
);


CREATE TABLE IF NOT EXISTS mistakes (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    mistake_type TEXT NOT NULL,
    severity TEXT NOT NULL,
    status TEXT NOT NULL,
    affected_entity_type TEXT,
    affected_entity_id TEXT,
    affected_entity_name TEXT,
    reference_number TEXT,
    financial_impact_minor BIGINT NOT NULL,
    currency TEXT NOT NULL,
    confidence NUMERIC,
    explanation TEXT NOT NULL,
    recommended_action TEXT,
    assigned_to TEXT,
    assigned_to_name TEXT,
    evidence_ids JSONB,
    detected_at TIMESTAMPTZ NOT NULL,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_mistakes_tenant ON mistakes(tenant_id, status);

CREATE TABLE IF NOT EXISTS mistake_transitions (
    id TEXT PRIMARY KEY,
    mistake_id TEXT NOT NULL REFERENCES mistakes(id) ON DELETE CASCADE,
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    from_status TEXT NOT NULL,
    to_status TEXT NOT NULL,
    changed_by TEXT NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL
);


CREATE TABLE IF NOT EXISTS review_queue (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    raw_name TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    matched_entity_id TEXT,
    matched_canonical TEXT,
    confidence NUMERIC,
    source_evidence_id TEXT,
    created_at TIMESTAMPTZ NOT NULL
);


CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    entity_id TEXT,
    event_type TEXT NOT NULL,
    payload_json JSONB,
    occurred_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    actor_user_id TEXT,
    actor_email TEXT,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    before_json JSONB,
    after_json JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_audit_tenant ON audit_logs(tenant_id, created_at DESC);

CREATE TABLE IF NOT EXISTS retention_policies (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    resource_type TEXT NOT NULL,
    retention_period TEXT NOT NULL,
    retention_days INT NOT NULL,
    auto_purge BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);


CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY,
    tenant_id TEXT UNIQUE NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    plan_tier TEXT NOT NULL,
    plan_name TEXT NOT NULL,
    amount_minor BIGINT NOT NULL,
    currency TEXT NOT NULL,
    status TEXT NOT NULL,
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    usage_document_count INT DEFAULT 0,
    max_documents INT DEFAULT 100
);

CREATE TABLE IF NOT EXISTS billing_invoices (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    invoice_no TEXT NOT NULL,
    amount_minor BIGINT NOT NULL,
    currency TEXT NOT NULL,
    status TEXT NOT NULL,
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    pdf_url TEXT,
    created_at TIMESTAMPTZ NOT NULL
);


CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    resource TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL
);

`
