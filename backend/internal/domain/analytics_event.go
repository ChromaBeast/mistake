package domain

import "time"

type AhaEventType string

const (
	AhaEventFirstUpload   AhaEventType = "time_to_first_upload"
	AhaEventFirstFinding  AhaEventType = "time_to_first_finding"
	AhaEventFirstVerify   AhaEventType = "time_to_first_verify"
	AhaEventFirstDismiss  AhaEventType = "time_to_first_dismiss"
	AhaEventFirstResolve  AhaEventType = "time_to_first_resolve"
)

type AhaEvent struct {
	ID         string       `json:"id"`
	TenantID   string       `json:"tenant_id"`
	UserID     string       `json:"user_id"`
	EventType  AhaEventType `json:"event_type"`
	DurationMs int64        `json:"duration_ms"`
	Metadata   string       `json:"metadata,omitempty"`
	CreatedAt  time.Time    `json:"created_at"`
}

type AhaFunnelSummary struct {
	TenantID              string  `json:"tenant_id"`
	AvgTimeToUploadSec    float64 `json:"avg_time_to_upload_sec"`
	AvgTimeToFindingSec   float64 `json:"avg_time_to_finding_sec"`
	AvgTimeToVerifySec    float64 `json:"avg_time_to_verify_sec"`
	TotalUploads          int     `json:"total_uploads"`
	TotalVerifiedMistakes int     `json:"total_verified_mistakes"`
	AhaConversionRate     float64 `json:"aha_conversion_rate"`
}
