package handlers

import (
	"mistake-backend/internal/middleware"
	"mistake-backend/internal/storage"
	"net/http"
	"strconv"
)

type AuditHandler struct {
	store storage.Store
}

func NewAuditHandler(store storage.Store) *AuditHandler {
	return &AuditHandler{store: store}
}

func (h *AuditHandler) List(w http.ResponseWriter, r *http.Request) {
	tenantID := middleware.GetTenantID(r.Context())
	q := r.URL.Query()

	limit, _ := strconv.Atoi(q.Get("limit"))
	filter := storage.AuditFilter{
		ActorUserID:  q.Get("actor"),
		Action:       q.Get("action"),
		ResourceType: q.Get("resource_type"),
		Limit:        limit,
	}

	logs, err := h.store.ListAuditLogs(r.Context(), tenantID, filter)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	RespondJSON(w, http.StatusOK, logs)
}
