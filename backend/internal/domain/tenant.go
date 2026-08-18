package domain

import "time"

type TenantStatus string

const (
	TenantStatusActive    TenantStatus = "active"
	TenantStatusSuspended TenantStatus = "suspended"
	TenantStatusDeleted   TenantStatus = "deleted"
)

type Tenant struct {
	ID                string       `json:"id"`
	Name              string       `json:"name"`
	LegalName         string       `json:"legal_name,omitempty"`
	Industry          string       `json:"industry,omitempty"`
	Status            TenantStatus `json:"status"`
	RetentionPolicyID string       `json:"retention_policy_id,omitempty"`
	CreatedAt         time.Time    `json:"created_at"`
	UpdatedAt         time.Time    `json:"updated_at"`
}

type UserStatus string

const (
	UserStatusActive   UserStatus = "active"
	UserStatusInvited  UserStatus = "invited"
	UserStatusDisabled UserStatus = "disabled"
)

type UserRole string

const (
	RoleOwner   UserRole = "Owner"
	RoleAdmin   UserRole = "Admin"
	RoleManager UserRole = "Manager"
	RoleAnalyst UserRole = "Analyst"
	RoleViewer  UserRole = "Viewer"
)

type User struct {
	ID           string     `json:"id"`
	TenantID     string     `json:"tenant_id"`
	Email        string     `json:"email"`
	Name         string     `json:"name"`
	PasswordHash string     `json:"-"`
	Role         UserRole   `json:"role"`
	MFAEnabled   bool       `json:"mfa_enabled"`
	MFASecret    string     `json:"-"`
	Status       UserStatus `json:"status"`
	LastLoginAt  *time.Time `json:"last_login_at,omitempty"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}

type Session struct {
	ID                    string    `json:"id"`
	TenantID              string    `json:"tenant_id"`
	UserID                string    `json:"user_id"`
	Token                 string    `json:"token"`
	RefreshToken          string    `json:"refresh_token,omitempty"`
	IPAddress             string    `json:"ip_address,omitempty"`
	UserAgent             string    `json:"user_agent,omitempty"`
	CreatedAt             time.Time `json:"created_at"`
	ExpiresAt             time.Time `json:"expires_at"`
	RefreshTokenExpiresAt time.Time `json:"refresh_token_expires_at,omitempty"`
}
