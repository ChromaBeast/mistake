package harness

import "time"

// Mistake represents a detected financial discrepancy finding.
type Mistake struct {
	ID                   string     `json:"id"`
	TenantID             string     `json:"tenant_id"`
	MistakeType          string     `json:"mistake_type"`
	Severity             string     `json:"severity"`
	Status               string     `json:"status"`
	AffectedEntityType   string     `json:"affected_entity_type,omitempty"`
	AffectedEntityID     string     `json:"affected_entity_id,omitempty"`
	AffectedEntityName   string     `json:"affected_entity_name,omitempty"`
	ReferenceNumber      string     `json:"reference_number,omitempty"`
	FinancialImpactMinor int64      `json:"financial_impact_minor"`
	Currency             string     `json:"currency"`
	Confidence           float64    `json:"confidence"`
	Explanation          string     `json:"explanation"`
	RecommendedAction    string     `json:"recommended_action,omitempty"`
	AssignedTo           string     `json:"assigned_to,omitempty"`
	AssignedToName       string     `json:"assigned_to_name,omitempty"`
	EvidenceIDs          []string   `json:"evidence_ids,omitempty"`
	DetectedAt           time.Time  `json:"detected_at"`
	ResolvedAt           *time.Time `json:"resolved_at,omitempty"`
	CreatedAt            time.Time  `json:"created_at"`
}

// MistakeTransition represents an immutable state change on a mistake.
type MistakeTransition struct {
	ID         string    `json:"id"`
	MistakeID  string    `json:"mistake_id"`
	TenantID   string    `json:"tenant_id"`
	FromStatus string    `json:"from_status"`
	ToStatus   string    `json:"to_status"`
	ChangedBy  string    `json:"changed_by"`
	Reason     string    `json:"reason,omitempty"`
	CreatedAt  time.Time `json:"created_at"`
}

// DashboardSummary represents the high-level business health KPIs.
type DashboardSummary struct {
	TotalValueAtRiskMinor int64            `json:"total_value_at_risk_minor"`
	TotalDiscrepancies    int              `json:"total_discrepancies"`
	ActiveMistakes        int              `json:"active_mistakes"`
	ResolvedMistakes      int              `json:"resolved_mistakes"`
	BySeverity            map[string]int   `json:"by_severity"`
	ByStatus              map[string]int   `json:"by_status"`
	ByType                map[string]int   `json:"by_type"`
	MonthlyLeakageTrend   []MonthlyLeakage `json:"monthly_leakage_trend"`
}

// MonthlyLeakage represents monthly aggregation.
type MonthlyLeakage struct {
	Month       string `json:"month"`
	AmountMinor int64  `json:"amount_minor"`
	Count       int    `json:"count"`
}

// Event represents an event sourcing record.
type Event struct {
	ID         string         `json:"id"`
	TenantID   string         `json:"tenant_id"`
	EntityID   string         `json:"entity_id,omitempty"`
	EventType  string         `json:"event_type"`
	Source     string         `json:"source"`
	OccurredAt *time.Time     `json:"occurred_at,omitempty"`
	ObservedAt time.Time      `json:"observed_at"`
	Payload    map[string]any `json:"payload"`
}

// AuditLog represents an immutable mutation audit entry.
type AuditLog struct {
	ID           string         `json:"id"`
	TenantID     string         `json:"tenant_id"`
	ActorUserID  string         `json:"actor_user_id,omitempty"`
	Action       string         `json:"action"`
	ResourceType string         `json:"resource_type"`
	ResourceID   string         `json:"resource_id,omitempty"`
	Before       map[string]any `json:"before,omitempty"`
	After        map[string]any `json:"after,omitempty"`
	IPAddress    string         `json:"ip_address,omitempty"`
	CreatedAt    time.Time      `json:"created_at"`
}

// RetentionPolicy represents tenant retention configuration.
type RetentionPolicy struct {
	ID            string    `json:"id"`
	TenantID      string    `json:"tenant_id"`
	ResourceType  string    `json:"resource_type"`
	RetentionDays int       `json:"retention_days"`
	CreatedAt     time.Time `json:"created_at"`
}

// Subscription represents tenant billing plan.
type Subscription struct {
	ID                      string `json:"id"`
	TenantID                string `json:"tenant_id"`
	Plan                    string `json:"plan"`
	Status                  string `json:"status"`
	MaxMonthlyDocuments     int    `json:"max_monthly_documents"`
	CurrentMonthlyDocuments int    `json:"current_monthly_documents"`
	PricePaiseMonthly       int64  `json:"price_paise_monthly"`
}

// SearchResult represents a hit in global search.
type SearchResult struct {
	ID          string `json:"id"`
	Type        string `json:"type"`
	Title       string `json:"title"`
	Subtitle    string `json:"subtitle"`
	Snippet     string `json:"snippet"`
	ReferenceID string `json:"reference_id,omitempty"`
}
