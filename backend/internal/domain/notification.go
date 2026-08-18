package domain

import "time"

type NotificationType string

const (
	NotificationTypeMistakeDetected NotificationType = "mistake_detected"
	NotificationTypeMistakeAssigned NotificationType = "mistake_assigned"
	NotificationTypeReviewRequired  NotificationType = "review_required"
	NotificationTypePipelineFailed  NotificationType = "pipeline_failed"
)

type Notification struct {
	ID        string           `json:"id"`
	TenantID  string           `json:"tenant_id"`
	UserID    string           `json:"user_id"`
	Type      NotificationType `json:"type"`
	Title     string           `json:"title"`
	Message   string           `json:"message"`
	Resource  string           `json:"resource,omitempty"`
	Read      bool             `json:"read"`
	CreatedAt time.Time        `json:"created_at"`
}
