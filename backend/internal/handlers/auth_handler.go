package handlers

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"log/slog"
	"mistake-backend/internal/domain"
	"mistake-backend/internal/middleware"
	"mistake-backend/internal/storage"
	"net/http"
	"strings"
	"time"

	"github.com/pquerna/otp/totp"
	"golang.org/x/crypto/bcrypt"
)

// AuthHandler manages user signup, authentication, MFA verification, and token refresh.
type AuthHandler struct {
	store     storage.Store
	jwtSecret string
}

// NewAuthHandler creates a new AuthHandler.
func NewAuthHandler(store storage.Store, jwtSecret string) *AuthHandler {
	return &AuthHandler{store: store, jwtSecret: jwtSecret}
}

func generateTokenPair(jwtSecret string, user *domain.User) (string, string, time.Time, time.Time, error) {
	now := time.Now().UTC()
	accessExp := now.Add(15 * time.Minute)
	accessToken, err := middleware.GenerateToken(jwtSecret, user, 15*time.Minute)
	if err != nil {
		return "", "", time.Time{}, time.Time{}, err
	}
	b := make([]byte, 32)
	_, _ = rand.Read(b)
	refreshToken := hex.EncodeToString(b)
	refreshExp := now.Add(7 * 24 * time.Hour)
	return accessToken, refreshToken, accessExp, refreshExp, nil
}

// Signup handles user and initial tenant registration.
func (h *AuthHandler) Signup(w http.ResponseWriter, r *http.Request) {
	var req SignupRequest
	if err := ParseJSON(r, &req); err != nil {
		RespondError(w, http.StatusBadRequest, "VALIDATION_FAILED", "Invalid JSON")
		return
	}
	if req.CompanyName == "" {
		req.CompanyName = req.TenantName
	}
	if req.Email == "" || req.Password == "" || req.CompanyName == "" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_FAILED", "Company name, email, and password are required")
		return
	}

	tenantID, userID, now := UniqueID("tenant"), UniqueID("user"), time.Now().UTC()
	tenant := &domain.Tenant{ID: tenantID, Name: req.CompanyName, Status: domain.TenantStatusActive, CreatedAt: now, UpdatedAt: now}
	if err := h.store.CreateTenant(r.Context(), tenant); err != nil {
		RespondError(w, http.StatusConflict, "TENANT_EXISTS", "Tenant could not be created")
		return
	}

	hashBytes, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Failed to hash password")
		return
	}
	user := &domain.User{
		ID: userID, TenantID: tenantID, Email: strings.ToLower(req.Email),
		Name: req.Name, PasswordHash: string(hashBytes), Role: domain.RoleOwner, Status: domain.UserStatusActive,
		CreatedAt: now, UpdatedAt: now,
	}
	if err := h.store.CreateUser(r.Context(), user); err != nil {
		RespondError(w, http.StatusConflict, "EMAIL_EXISTS", "A user with this email already exists")
		return
	}

	token, refToken, accessExp, refreshExp, _ := generateTokenPair(h.jwtSecret, user)
	if err := h.store.CreateSession(r.Context(), &domain.Session{
		ID: fmt.Sprintf("sess-%d", time.Now().UnixNano()), TenantID: tenantID, UserID: userID,
		Token: token, RefreshToken: refToken, CreatedAt: now, ExpiresAt: accessExp, RefreshTokenExpiresAt: refreshExp,
	}); err != nil {
		slog.Error("Failed to create session", "error", err)
		RespondError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Failed to create session")
		return
	}
	RespondCreated(w, AuthResponse{Token: token, RefreshToken: refToken, ExpiresIn: 900, User: user, Tenant: tenant})
}

// Login authenticates a user credentials.
func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := ParseJSON(r, &req); err != nil || req.Email == "" || req.Password == "" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_FAILED", "Email and password are required")
		return
	}

	user, err := h.store.GetUserByEmail(r.Context(), req.Email)
	if err != nil || bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)) != nil {
		RespondError(w, http.StatusUnauthorized, "INVALID_CREDENTIALS", "Invalid email or password")
		return
	}
	if user.Status == domain.UserStatusDisabled {
		RespondError(w, http.StatusForbidden, "USER_DISABLED", "This account has been disabled")
		return
	}
	if user.MFAEnabled {
		mfaToken, _ := middleware.GenerateToken(h.jwtSecret, user, 10*time.Minute)
		RespondJSON(w, http.StatusOK, AuthResponse{RequiresMFA: true, MFAToken: mfaToken})
		return
	}

	now := time.Now().UTC()
	user.LastLoginAt = &now
	token, refToken, accessExp, refreshExp, _ := generateTokenPair(h.jwtSecret, user)
	if err := h.store.CreateSession(r.Context(), &domain.Session{
		ID: fmt.Sprintf("sess-%d", time.Now().UnixNano()), TenantID: user.TenantID, UserID: user.ID,
		Token: token, RefreshToken: refToken, CreatedAt: now, ExpiresAt: accessExp, RefreshTokenExpiresAt: refreshExp,
	}); err != nil {
		slog.Error("Failed to create session", "error", err)
		RespondError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Failed to create session")
		return
	}
	tenant, _ := h.store.GetTenant(r.Context(), user.TenantID)
	RespondJSON(w, http.StatusOK, AuthResponse{Token: token, RefreshToken: refToken, ExpiresIn: 900, User: user, Tenant: tenant})
}

// MFAVerify verifies MFA code and issues tokens.
func (h *AuthHandler) MFAVerify(w http.ResponseWriter, r *http.Request) {
	var req MFAVerifyRequest
	if err := ParseJSON(r, &req); err != nil || req.MFAToken == "" || req.Code == "" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_FAILED", "MFA token and 6-digit code are required")
		return
	}
	claims, err := middleware.ValidateToken(h.jwtSecret, req.MFAToken)
	if err != nil {
		RespondError(w, http.StatusUnauthorized, "INVALID_MFA_TOKEN", "MFA challenge expired or invalid")
		return
	}
	user, err := h.store.GetUserByID(r.Context(), claims.TenantID, claims.UserID)
	if err != nil || user == nil || user.MFASecret == "" || !totp.Validate(req.Code, user.MFASecret) {
		RespondError(w, http.StatusUnauthorized, "INVALID_MFA_CODE", "Invalid MFA code")
		return
	}

	now := time.Now().UTC()
	token, refToken, accessExp, refreshExp, _ := generateTokenPair(h.jwtSecret, user)
	_ = h.store.CreateSession(r.Context(), &domain.Session{
		ID: fmt.Sprintf("sess-%d", time.Now().UnixNano()), TenantID: user.TenantID, UserID: user.ID,
		Token: token, RefreshToken: refToken, CreatedAt: now, ExpiresAt: accessExp, RefreshTokenExpiresAt: refreshExp,
	})
	tenant, _ := h.store.GetTenant(r.Context(), claims.TenantID)
	RespondJSON(w, http.StatusOK, AuthResponse{Token: token, RefreshToken: refToken, ExpiresIn: 900, User: user, Tenant: tenant})
}

// RefreshToken exchanges an active refresh token for a rotated token pair.
func (h *AuthHandler) RefreshToken(w http.ResponseWriter, r *http.Request) {
	var req RefreshTokenRequest
	if err := ParseJSON(r, &req); err != nil || req.RefreshToken == "" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_FAILED", "refresh_token is required")
		return
	}

	sess, err := h.store.GetSessionByRefreshToken(r.Context(), req.RefreshToken)
	if err != nil {
		RespondError(w, http.StatusUnauthorized, "INVALID_REFRESH_TOKEN", "Refresh token is invalid or expired")
		return
	}

	user, err := h.store.GetUserByID(r.Context(), sess.TenantID, sess.UserID)
	if err != nil || user.Status == domain.UserStatusDisabled {
		RespondError(w, http.StatusUnauthorized, "USER_DISABLED", "User is inactive or disabled")
		return
	}

	token, newRefToken, accessExp, refreshExp, err := generateTokenPair(h.jwtSecret, user)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Failed to generate tokens")
		return
	}

	if _, err := h.store.RotateSession(r.Context(), req.RefreshToken, token, newRefToken, accessExp, refreshExp); err != nil {
		RespondError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Failed to rotate session")
		return
	}

	tenant, _ := h.store.GetTenant(r.Context(), user.TenantID)
	RespondJSON(w, http.StatusOK, AuthResponse{Token: token, RefreshToken: newRefToken, ExpiresIn: 900, User: user, Tenant: tenant})
}

// Logout terminates the current user session.
func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	authHeader := r.Header.Get("Authorization")
	if strings.HasPrefix(authHeader, "Bearer ") {
		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
		tenantID := middleware.GetTenantID(r.Context())
		if sess, err := h.store.GetSession(r.Context(), tokenStr); err == nil {
			_ = h.store.RevokeSession(r.Context(), sess.TenantID, sess.ID)
		} else if tenantID != "" {
			_ = h.store.RevokeSession(r.Context(), tenantID, tokenStr)
		}
	}
	RespondJSON(w, http.StatusOK, map[string]string{"message": "Logged out successfully"})
}

// GetMe returns the authenticated user profile.
func (h *AuthHandler) GetMe(w http.ResponseWriter, r *http.Request) {
	tenantID := middleware.GetTenantID(r.Context())
	userID := middleware.GetUserID(r.Context())
	if tenantID == "" || userID == "" {
		RespondError(w, http.StatusUnauthorized, "UNAUTHORIZED", "Unauthorized")
		return
	}
	user, err := h.store.GetUserByID(r.Context(), tenantID, userID)
	if err != nil || user == nil {
		RespondError(w, http.StatusNotFound, "NOT_FOUND", "User not found")
		return
	}
	RespondJSON(w, http.StatusOK, user)
}
