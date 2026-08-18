package domain

import "time"

type MistakeType string

const (
	MistakeTypeQuantityMismatch MistakeType = "quantity_mismatch"
	MistakeTypePriceMismatch    MistakeType = "price_mismatch"
	MistakeTypeDateMismatch     MistakeType = "date_mismatch"
	MistakeTypeStatusMismatch   MistakeType = "status_mismatch"
	MistakeTypeMissingEvidence  MistakeType = "missing_evidence"
)

type Severity string

const (
	SeverityCritical Severity = "critical"
	SeverityHigh     Severity = "high"
	SeverityMedium   Severity = "medium"
	SeverityLow      Severity = "low"
	SeverityHealthy  Severity = "healthy"
)

type MistakeStatus string

const (
	MistakeStatusDetected    MistakeStatus = "detected"
	MistakeStatusUnderReview MistakeStatus = "under_review"
	MistakeStatusVerified    MistakeStatus = "verified"
	MistakeStatusResolved    MistakeStatus = "resolved"
	MistakeStatusDismissed   MistakeStatus = "dismissed"
)

type Mistake struct {
	ID                   string          `json:"id"`
	TenantID             string          `json:"tenant_id"`
	MistakeType          MistakeType     `json:"mistake_type"`
	Severity             Severity        `json:"severity"`
	Status               MistakeStatus   `json:"status"`
	AffectedEntityType   string          `json:"affected_entity_type,omitempty"`
	AffectedEntityID     string          `json:"affected_entity_id,omitempty"`
	AffectedEntityName   string          `json:"affected_entity_name,omitempty"`
	ReferenceNumber      string          `json:"reference_number,omitempty"`
	FinancialImpactMinor int64           `json:"financial_impact_minor"`
	Currency             string          `json:"currency"`
	Confidence           float64         `json:"confidence"`
	Explanation          string          `json:"explanation"`
	RecommendedAction    string          `json:"recommended_action,omitempty"`
	AssignedTo           string          `json:"assigned_to,omitempty"`
	AssignedToName       string          `json:"assigned_to_name,omitempty"`
	EvidenceIDs          []string        `json:"evidence_ids,omitempty"`
	DetectedAt           time.Time       `json:"detected_at"`
	ResolvedAt           *time.Time      `json:"resolved_at,omitempty"`
	CreatedAt            time.Time       `json:"created_at"`
	UpdatedAt            time.Time       `json:"updated_at"`
}

type MistakeTransition struct {
	ID         string        `json:"id"`
	MistakeID  string        `json:"mistake_id"`
	TenantID   string        `json:"tenant_id"`
	FromStatus MistakeStatus `json:"from_status"`
	ToStatus   MistakeStatus `json:"to_status"`
	ChangedBy  string        `json:"changed_by"`
	Reason     string        `json:"reason,omitempty"`
	CreatedAt  time.Time     `json:"created_at"`
}
