package harness

import "time"

// APIError represents the standard machine-readable error structure.
type APIError struct {
	Code    string         `json:"code"`
	Message string         `json:"message"`
	Details map[string]any `json:"details,omitempty"`
}

// APIResponse wraps API responses or error structures.
type APIResponse struct {
	Data       any       `json:"data,omitempty"`
	Error      *APIError `json:"error,omitempty"`
	StatusCode int       `json:"-"`
}

// Tenant represents an organization tenant.
type Tenant struct {
	ID                string    `json:"id"`
	Name              string    `json:"name"`
	LegalName         string    `json:"legal_name,omitempty"`
	Industry          string    `json:"industry,omitempty"`
	Status            string    `json:"status"`
	RetentionPolicyID string    `json:"retention_policy_id,omitempty"`
	CreatedAt         time.Time `json:"created_at"`
}

// User represents a user account within a tenant.
type User struct {
	ID          string     `json:"id"`
	TenantID    string     `json:"tenant_id"`
	Email       string     `json:"email"`
	Name        string     `json:"name"`
	Role        string     `json:"role"`
	MFAEnabled  bool       `json:"mfa_enabled"`
	Status      string     `json:"status"`
	LastLoginAt *time.Time `json:"last_login_at,omitempty"`
	CreatedAt   time.Time  `json:"created_at"`
}

// AuthResponse is returned on successful signup/login.
type AuthResponse struct {
	Token       string `json:"token"`
	User        User   `json:"user"`
	Tenant      Tenant `json:"tenant"`
	MFARequired bool   `json:"mfa_required,omitempty"`
	MFASecret   string `json:"mfa_secret,omitempty"`
}

// DataSource represents an uploaded ingestion file.
type DataSource struct {
	ID           string     `json:"id"`
	TenantID     string     `json:"tenant_id"`
	UploadedBy   string     `json:"uploaded_by"`
	SourceType   string     `json:"source_type"`
	Filename     string     `json:"filename"`
	StorageKey   string     `json:"storage_key"`
	FileHash     string     `json:"file_hash"`
	Status       string     `json:"status"`
	ErrorMessage string     `json:"error_message,omitempty"`
	ItemCount    int        `json:"item_count"`
	UploadedAt   time.Time  `json:"uploaded_at"`
	ProcessedAt  *time.Time `json:"processed_at,omitempty"`
}

// Entity represents canonical supplier/customer/product.
type Entity struct {
	ID            string    `json:"id"`
	TenantID      string    `json:"tenant_id"`
	EntityType    string    `json:"entity_type"`
	CanonicalName string    `json:"canonical_name"`
	GSTIN         string    `json:"gstin,omitempty"`
	Status        string    `json:"status"`
	MergedIntoID  string    `json:"merged_into_id,omitempty"`
	Aliases       []string  `json:"aliases,omitempty"`
	CreatedAt     time.Time `json:"created_at"`
}

// ReviewQueueItem represents ambiguous entity matches pending review.
type ReviewQueueItem struct {
	ID               string    `json:"id"`
	TenantID         string    `json:"tenant_id"`
	RawName          string    `json:"raw_name"`
	EntityType       string    `json:"entity_type"`
	MatchedEntityID  string    `json:"matched_entity_id"`
	MatchedCanonical string    `json:"matched_canonical"`
	Confidence       float64   `json:"confidence"`
	SourceEvidenceID string    `json:"source_evidence_id,omitempty"`
	CreatedAt        time.Time `json:"created_at"`
}
