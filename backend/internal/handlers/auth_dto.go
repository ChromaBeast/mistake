package handlers

import "mistake-backend/internal/domain"

// SignupRequest payload for user and tenant registration.
type SignupRequest struct {
	CompanyName string `json:"company_name"`
	TenantName  string `json:"tenant_name"`
	Email       string `json:"email"`
	Name        string `json:"name"`
	Password    string `json:"password"`
}

// LoginRequest payload for authentication.
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// MFAVerifyRequest payload for 2FA validation.
type MFAVerifyRequest struct {
	MFAToken string `json:"mfa_token"`
	Code     string `json:"code"`
}

// RefreshTokenRequest payload for token rotation.
type RefreshTokenRequest struct {
	RefreshToken string `json:"refresh_token"`
}

// AuthResponse payload returned on successful authentication.
type AuthResponse struct {
	Token        string         `json:"token"`
	RefreshToken string         `json:"refresh_token,omitempty"`
	ExpiresIn    int64          `json:"expires_in,omitempty"`
	User         *domain.User   `json:"user"`
	Tenant       *domain.Tenant `json:"tenant,omitempty"`
	RequiresMFA  bool           `json:"requires_mfa,omitempty"`
	MFAToken     string         `json:"mfa_token,omitempty"`
}
