package handlers

import (
	"mistake-backend/internal/middleware"
	"mistake-backend/internal/storage"
	"net/http"
	"strings"
)

// SessionHandler handles tenant session inspection and manual revocation.
type SessionHandler struct {
	store storage.Store
}

// NewSessionHandler creates a new SessionHandler instance.
func NewSessionHandler(store storage.Store) *SessionHandler {
	return &SessionHandler{store: store}
}

// ListSessions lists active sessions for the authenticated tenant.
func (h *SessionHandler) ListSessions(w http.ResponseWriter, r *http.Request) {
	tenantID := middleware.GetTenantID(r.Context())
	sessions, err := h.store.ListSessions(r.Context(), tenantID)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	RespondJSON(w, http.StatusOK, sessions)
}

// RevokeSession revokes a specific session by ID.
func (h *SessionHandler) RevokeSession(w http.ResponseWriter, r *http.Request) {
	tenantID := middleware.GetTenantID(r.Context())
	pathParts := strings.Split(r.URL.Path, "/")
	sessID := pathParts[len(pathParts)-1]

	if err := h.store.RevokeSession(r.Context(), tenantID, sessID); err != nil {
		RespondError(w, http.StatusNotFound, "NOT_FOUND", "Session not found")
		return
	}
	RespondJSON(w, http.StatusOK, map[string]string{"message": "Session revoked"})
}
