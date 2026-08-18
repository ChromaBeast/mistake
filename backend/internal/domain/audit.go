package domain

import "time"

type AuditLog struct {
	ID           string                 `json:"id"`
	TenantID     string                 `json:"tenant_id"`
	ActorUserID  string                 `json:"actor_user_id,omitempty"`
	ActorEmail   string                 `json:"actor_email,omitempty"`
	Action       string                 `json:"action"`
	ResourceType string                 `json:"resource_type"`
	ResourceID   string                 `json:"resource_id,omitempty"`
	Before       map[string]interface{} `json:"before,omitempty"`
	After        map[string]interface{} `json:"after,omitempty"`
	IPAddress    string                 `json:"ip_address,omitempty"`
	CreatedAt    time.Time              `json:"created_at"`
}
