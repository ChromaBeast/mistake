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

	// The audit ledger is append-only and grows without bound; never query it
	// without a ceiling. Clients may request up to 500 entries per page.
	limit, _ := strconv.Atoi(q.Get("limit"))
	if limit <= 0 || limit > 500 {
		limit = 200
	}
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
