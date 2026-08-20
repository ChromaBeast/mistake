package domain

import "time"

type FeedbackType string

const (
	FeedbackAccurate    FeedbackType = "accurate"
	FeedbackNotAccurate FeedbackType = "not_accurate"
	FeedbackNotSure     FeedbackType = "not_sure"
)

type MistakeFeedback struct {
	ID           string       `json:"id"`
	TenantID     string       `json:"tenant_id"`
	MistakeID    string       `json:"mistake_id"`
	UserID       string       `json:"user_id"`
	FeedbackType FeedbackType `json:"feedback_type"`
	Reason       string       `json:"reason,omitempty"`
	CreatedAt    time.Time    `json:"created_at"`
}

type FeedbackMetrics struct {
	TenantID          string  `json:"tenant_id"`
	TotalReviewed     int     `json:"total_reviewed"`
	AccurateCount     int     `json:"accurate_count"`
	NotAccurateCount  int     `json:"not_accurate_count"`
	NotSureCount      int     `json:"not_sure_count"`
	FalsePositiveRate float64 `json:"false_positive_rate"`
	AccuracyRate      float64 `json:"accuracy_rate"`
}
