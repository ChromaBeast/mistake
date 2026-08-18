package domain

import "time"

type PlanTier string

const (
	PlanTierTrial      PlanTier = "trial"
	PlanTierStarter    PlanTier = "starter"    // ₹4,900 / mo
	PlanTierGrowth     PlanTier = "growth"     // ₹14,900 / mo
	PlanTierEnterprise PlanTier = "enterprise" // ₹50,000 / mo
)

type SubscriptionStatus string

const (
	SubStatusActive   SubscriptionStatus = "active"
	SubStatusTrialing SubscriptionStatus = "trialing"
	SubStatusPastDue  SubscriptionStatus = "past_due"
	SubStatusCanceled SubscriptionStatus = "canceled"
)

type Subscription struct {
	ID                 string             `json:"id"`
	TenantID           string             `json:"tenant_id"`
	PlanTier           PlanTier           `json:"plan_tier"`
	PlanName           string             `json:"plan_name"`
	AmountMinor        int64              `json:"amount_minor"`
	Currency           string             `json:"currency"`
	Status             SubscriptionStatus `json:"status"`
	CurrentPeriodStart time.Time          `json:"current_period_start"`
	CurrentPeriodEnd   time.Time          `json:"current_period_end"`
	CancelAtPeriodEnd  bool               `json:"cancel_at_period_end"`
	UsageDocumentCount int                `json:"usage_document_count"`
	MaxDocuments       int                `json:"max_documents"`
}

type BillingInvoice struct {
	ID          string    `json:"id"`
	TenantID    string    `json:"tenant_id"`
	InvoiceNo   string    `json:"invoice_no"`
	AmountMinor int64     `json:"amount_minor"`
	Currency    string    `json:"currency"`
	Status      string    `json:"status"` // paid, open, void
	PeriodStart time.Time `json:"period_start"`
	PeriodEnd   time.Time `json:"period_end"`
	PDFURL      string    `json:"pdf_url,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
}
