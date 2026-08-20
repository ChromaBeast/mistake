package domain

import "time"

type PilotAgreementStatus string

const (
	PilotAgreementStatusPending  PilotAgreementStatus = "pending"
	PilotAgreementStatusAccepted PilotAgreementStatus = "accepted"
	PilotAgreementStatusDeclined PilotAgreementStatus = "declined"
)

type PilotAgreement struct {
	ID             string               `json:"id"`
	TenantID       string               `json:"tenant_id"`
	UserID         string               `json:"user_id"`
	SignatoryName  string               `json:"signatory_name"`
	SignatoryEmail string               `json:"signatory_email"`
	AgreementVer   string               `json:"agreement_version"`
	Status         PilotAgreementStatus `json:"status"`
	RetentionDays  int                  `json:"retention_days"`
	AcceptedAt     time.Time            `json:"accepted_at"`
	IPAddress      string               `json:"ip_address,omitempty"`
}
