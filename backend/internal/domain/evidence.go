package domain

import "time"

type Evidence struct {
	ID                  string                 `json:"id"`
	TenantID            string                 `json:"tenant_id"`
	DocumentID          string                 `json:"document_id"`
	SourceType          string                 `json:"source_type"`
	SourceLocation      string                 `json:"source_location,omitempty"`
	SourceTimestamp     *time.Time             `json:"source_timestamp,omitempty"`
	OriginalContentRef  string                 `json:"original_content_ref,omitempty"`
	ExtractedContent    map[string]interface{} `json:"extracted_content"`
	DocumentHash        string                 `json:"document_hash"`
	ExtractionVersion   string                 `json:"extraction_version"`
	ModelVersion        string                 `json:"model_version,omitempty"`
	Confidence          float64                `json:"confidence"`
	Embedding           []float32              `json:"embedding,omitempty"`
	CreatedAt           time.Time              `json:"created_at"`
}

type ExtractedFact struct {
	FactType   string                 `json:"fact_type"`
	Identifier string                 `json:"identifier"`
	EntityName string                 `json:"entity_name"`
	EntityType string                 `json:"entity_type"`
	Data       map[string]interface{} `json:"data"`
	Location   string                 `json:"location"`
	Timestamp  *time.Time             `json:"timestamp,omitempty"`
	Confidence float64                `json:"confidence"`
}
