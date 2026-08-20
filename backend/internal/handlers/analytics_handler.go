package handlers

import (
	"net/http"
	"time"

	"mistake-backend/internal/domain"
	"mistake-backend/internal/storage"
)

type AnalyticsHandler struct {
	store storage.Store
}

func NewAnalyticsHandler(store storage.Store) *AnalyticsHandler {
	return &AnalyticsHandler{store: store}
}

type RecordAhaEventRequest struct {
	EventType  domain.AhaEventType `json:"event_type"`
	DurationMs int64               `json:"duration_ms"`
	Metadata   string              `json:"metadata,omitempty"`
}

func (h *AnalyticsHandler) RecordEvent(w http.ResponseWriter, r *http.Request) {
	tenantID, _ := r.Context().Value("tenant_id").(string)
	userID, _ := r.Context().Value("user_id").(string)

	var req RecordAhaEventRequest
	if err := ParseJSON(r, &req); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_REQUEST", "invalid JSON payload")
		return
	}

	if req.EventType == "" || req.DurationMs < 0 {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "valid event_type and duration_ms required")
		return
	}

	ev := &domain.AhaEvent{
		ID:         UniqueID("aha"),
		TenantID:   tenantID,
		UserID:     userID,
		EventType:  req.EventType,
		DurationMs: req.DurationMs,
		Metadata:   req.Metadata,
		CreatedAt:  time.Now().UTC(),
	}

	if err := h.store.RecordAhaEvent(r.Context(), ev); err != nil {
		RespondError(w, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}

	RespondCreated(w, map[string]any{
		"event":   ev,
		"message": "Aha telemetry milestone recorded",
	})
}

func (h *AnalyticsHandler) GetAhaSummary(w http.ResponseWriter, r *http.Request) {
	tenantID, _ := r.Context().Value("tenant_id").(string)

	summary, err := h.store.GetAhaFunnelSummary(r.Context(), tenantID)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}

	RespondJSON(w, http.StatusOK, map[string]any{"aha_summary": summary})
}
