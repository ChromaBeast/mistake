package handlers

import (
	"crypto/rand"
	"encoding/hex"
	"log/slog"
	"golang.org/x/crypto/bcrypt"
	"mistake-backend/internal/domain"
	"mistake-backend/internal/middleware"
	"mistake-backend/internal/rbac"
	"mistake-backend/internal/storage"
	"net/http"
	"strings"
	"time"
)

type TenantHandler struct {
	store storage.Store
}

// NewTenantHandler creates a new instance of TenantHandler.
func NewTenantHandler(store storage.Store) *TenantHandler {
	return &TenantHandler{store: store}
}

type InviteUserRequest struct {
	Email string          `json:"email"`
	Name  string          `json:"name"`
	Role  domain.UserRole `json:"role"`
}

type UpdateRoleRequest struct {
	Role domain.UserRole `json:"role"`
}

type UpdateStatusRequest struct {
	Status domain.UserStatus `json:"status"`
}

// GetTenant retrieves tenant information.
func (h *TenantHandler) GetTenant(w http.ResponseWriter, r *http.Request) {
	tenantID := middleware.GetTenantID(r.Context())
	tenant, err := h.store.GetTenant(r.Context(), tenantID)
	if err != nil {
		RespondError(w, http.StatusNotFound, "NOT_FOUND", "Tenant not found")
		return
	}
	RespondJSON(w, http.StatusOK, tenant)
}

// UpdateTenant updates tenant details.
func (h *TenantHandler) UpdateTenant(w http.ResponseWriter, r *http.Request) {
	role := middleware.GetUserRole(r.Context())
	if !rbac.HasPermission(role, rbac.PermTenantWrite) {
		RespondError(w, http.StatusForbidden, "FORBIDDEN", "Insufficient permissions to update tenant")
		return
	}

	tenantID := middleware.GetTenantID(r.Context())
	tenant, err := h.store.GetTenant(r.Context(), tenantID)
	if err != nil {
		RespondError(w, http.StatusNotFound, "NOT_FOUND", "Tenant not found")
		return
	}

	var req map[string]interface{}
	if err := ParseJSON(r, &req); err != nil {
		RespondError(w, http.StatusBadRequest, "VALIDATION_FAILED", "Invalid JSON payload")
		return
	}

	if name, ok := req["name"].(string); ok && name != "" {
		tenant.Name = name
	}
	if legal, ok := req["legal_name"].(string); ok {
		tenant.LegalName = legal
	}
	if ind, ok := req["industry"].(string); ok {
		tenant.Industry = ind
	}

	if err := h.store.UpdateTenant(r.Context(), tenant); err != nil {
		slog.Error("Failed to update tenant", "error", err)
		RespondError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Failed to update tenant")
		return
	}
	RespondJSON(w, http.StatusOK, tenant)
}

// ListUsers retrieves all users for the current tenant.
func (h *TenantHandler) ListUsers(w http.ResponseWriter, r *http.Request) {
	tenantID := middleware.GetTenantID(r.Context())
	users, err := h.store.ListUsers(r.Context(), tenantID)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	RespondJSON(w, http.StatusOK, users)
}

// InviteUser invites a new user to the tenant.
func (h *TenantHandler) InviteUser(w http.ResponseWriter, r *http.Request) {
	callerRole := middleware.GetUserRole(r.Context())
	if !rbac.HasPermission(callerRole, rbac.PermUserInvite) {
		RespondError(w, http.StatusForbidden, "FORBIDDEN", "Insufficient permissions to invite users")
		return
	}

	tenantID := middleware.GetTenantID(r.Context())
	var req InviteUserRequest
	if err := ParseJSON(r, &req); err != nil || req.Email == "" || req.Role == "" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_FAILED", "Email and role are required")
		return
	}

	if !rbac.IsValidRole(req.Role) {
		RespondError(w, http.StatusBadRequest, "INVALID_ROLE", "Provided role is invalid")
		return
	}

	now := time.Now().UTC()
	b := make([]byte, 16)
	rand.Read(b)
	tempToken := hex.EncodeToString(b)
	hashBytes, _ := bcrypt.GenerateFromPassword([]byte(tempToken), bcrypt.DefaultCost)
	user := &domain.User{
		ID:           UniqueID("user"),
		TenantID:     tenantID,
		Email:        strings.ToLower(req.Email),
		Name:         req.Name,
		PasswordHash: string(hashBytes),
		Role:         req.Role,
		Status:       domain.UserStatusInvited,
		CreatedAt:    now,
		UpdatedAt:    now,
	}

	if err := h.store.CreateUser(r.Context(), user); err != nil {
		RespondError(w, http.StatusConflict, "EMAIL_EXISTS", "User email already exists")
		return
	}

	RespondCreated(w, user)
}

// UpdateUserRole updates a user's role.
func (h *TenantHandler) UpdateUserRole(w http.ResponseWriter, r *http.Request) {
	callerRole := middleware.GetUserRole(r.Context())
	if !rbac.HasPermission(callerRole, rbac.PermUserRoleUpdate) {
		RespondError(w, http.StatusForbidden, "FORBIDDEN", "Insufficient permissions to update user roles")
		return
	}

	tenantID := middleware.GetTenantID(r.Context())
	userID := extractURLParam(r.URL.Path, "users")

	var req UpdateRoleRequest
	if err := ParseJSON(r, &req); err != nil || !rbac.IsValidRole(req.Role) {
		RespondError(w, http.StatusBadRequest, "INVALID_ROLE", "Valid role required")
		return
	}

	if err := h.store.UpdateUserRole(r.Context(), tenantID, userID, req.Role); err != nil {
		RespondError(w, http.StatusNotFound, "NOT_FOUND", "User not found")
		return
	}
	RespondJSON(w, http.StatusOK, map[string]string{"message": "Role updated"})
}

// UpdateUserStatus updates a user's status.
func (h *TenantHandler) UpdateUserStatus(w http.ResponseWriter, r *http.Request) {
	callerRole := middleware.GetUserRole(r.Context())
	if !rbac.HasPermission(callerRole, rbac.PermUserStatusUpdate) {
		RespondError(w, http.StatusForbidden, "FORBIDDEN", "Insufficient permissions to update user status")
		return
	}

	tenantID := middleware.GetTenantID(r.Context())
	userID := extractURLParam(r.URL.Path, "users")

	var req UpdateStatusRequest
	if err := ParseJSON(r, &req); err != nil || req.Status == "" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_FAILED", "Status required")
		return
	}

	if err := h.store.UpdateUserStatus(r.Context(), tenantID, userID, req.Status); err != nil {
		RespondError(w, http.StatusNotFound, "NOT_FOUND", "User not found")
		return
	}
	RespondJSON(w, http.StatusOK, map[string]string{"message": "Status updated"})
}

func extractURLParam(path, segment string) string {
	parts := strings.Split(strings.Trim(path, "/"), "/")
	for i, p := range parts {
		if p == segment && i+1 < len(parts) {
			return parts[i+1]
		}
	}
	return ""
}
