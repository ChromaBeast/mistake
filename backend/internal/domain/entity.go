package domain

import "time"

type EntityType string

const (
	EntityTypeCustomer EntityType = "customer"
	EntityTypeSupplier EntityType = "supplier"
	EntityTypeProduct  EntityType = "product"
)

type EntityStatus string

const (
	EntityStatusActive   EntityStatus = "active"
	EntityStatusMerged   EntityStatus = "merged"
	EntityStatusArchived EntityStatus = "archived"
)

type Entity struct {
	ID            string       `json:"id"`
	TenantID      string       `json:"tenant_id"`
	EntityType    EntityType   `json:"entity_type"`
	CanonicalName string       `json:"canonical_name"`
	GSTIN         string       `json:"gstin,omitempty"`
	Status        EntityStatus `json:"status"`
	MergedIntoID  string       `json:"merged_into_id,omitempty"`
	Aliases       []string     `json:"aliases,omitempty"`
	CreatedAt     time.Time    `json:"created_at"`
	UpdatedAt     time.Time    `json:"updated_at"`
}

type EntityAlias struct {
	ID               string    `json:"id"`
	EntityID         string    `json:"entity_id"`
	TenantID         string    `json:"tenant_id"`
	AliasName        string    `json:"alias_name"`
	SourceEvidenceID string    `json:"source_evidence_id,omitempty"`
	Confidence       float64   `json:"confidence"`
	CreatedAt        time.Time `json:"created_at"`
}

type Product struct {
	EntityID      string `json:"entity_id"`
	TenantID      string `json:"tenant_id"`
	SKU           string `json:"sku"`
	Description   string `json:"description,omitempty"`
	UnitOfMeasure string `json:"unit_of_measure,omitempty"`
}

type ReviewQueueItem struct {
	ID               string    `json:"id"`
	TenantID         string    `json:"tenant_id"`
	RawName          string    `json:"raw_name"`
	EntityType       EntityType `json:"entity_type"`
	MatchedEntityID  string    `json:"matched_entity_id"`
	MatchedCanonical string    `json:"matched_canonical"`
	Confidence       float64   `json:"confidence"`
	SourceEvidenceID string    `json:"source_evidence_id,omitempty"`
	CreatedAt        time.Time `json:"created_at"`
}
