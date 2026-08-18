package domain

import "time"

type RetentionPolicy struct {
	ID              string    `json:"id"`
	TenantID        string    `json:"tenant_id"`
	ResourceType    string    `json:"resource_type"`
	RetentionPeriod string    `json:"retention_period"` // e.g. "30d", "90d", "1y", "7y"
	RetentionDays   int       `json:"retention_days"`
	AutoPurge       bool      `json:"auto_purge"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}
