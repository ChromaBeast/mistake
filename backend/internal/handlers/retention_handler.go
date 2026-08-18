package handlers

import (
	"fmt"
	"mistake-backend/internal/domain"
	"mistake-backend/internal/middleware"
	"mistake-backend/internal/storage"
	"net/http"
	"time"
)

type RetentionHandler struct {
	store storage.Store
}

func NewRetentionHandler(store storage.Store) *RetentionHandler {
	return &RetentionHandler{store: store}
}

type UpdateRetentionRequest struct {
	RetentionPeriod string `json:"retention_period"` // e.g. "30d", "90d", "1y", "7y"
	RetentionDays   int    `json:"retention_days"`
	AutoPurge       bool   `json:"auto_purge"`
	PurgeNow        bool   `json:"purge_now,omitempty"`
}

func (h *RetentionHandler) Get(w http.ResponseWriter, r *http.Request) {
	tenantID := middleware.GetTenantID(r.Context())
	policy, err := h.store.GetRetentionPolicy(r.Context(), tenantID)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	RespondJSON(w, http.StatusOK, policy)
}

func (h *RetentionHandler) Update(w http.ResponseWriter, r *http.Request) {
	tenantID := middleware.GetTenantID(r.Context())
	userID := middleware.GetUserID(r.Context())

	var req UpdateRetentionRequest
	if err := ParseJSON(r, &req); err != nil {
		RespondError(w, http.StatusBadRequest, "VALIDATION_FAILED", "Invalid payload")
		return
	}

	policy, _ := h.store.GetRetentionPolicy(r.Context(), tenantID)
	if req.RetentionPeriod != "" {
		policy.RetentionPeriod = req.RetentionPeriod
	}
	if req.RetentionDays > 0 {
		policy.RetentionDays = req.RetentionDays
	}
	policy.AutoPurge = req.AutoPurge

	_ = h.store.UpdateRetentionPolicy(r.Context(), policy)

	// If purgeNow requested, perform physical purge per deletion-policy
	if req.PurgeNow {
		_ = h.store.PurgeTenantData(r.Context(), tenantID)
		_ = h.store.CreateAuditLog(r.Context(), &domain.AuditLog{
			ID:           fmt.Sprintf("audit-purge-%d", time.Now().UnixNano()),
			TenantID:     tenantID,
			ActorUserID:  userID,
			Action:       "data.retention.purged",
			ResourceType: "tenant_data",
			CreatedAt:    time.Now().UTC(),
		})
	}

	RespondJSON(w, http.StatusOK, policy)
}
