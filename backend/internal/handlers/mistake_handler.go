package handlers

import (
	"mistake-backend/internal/domain"
	"mistake-backend/internal/middleware"
	"mistake-backend/internal/storage"
	"net/http"
	"strconv"
)

type MistakeHandler struct {
	store storage.Store
}

func NewMistakeHandler(store storage.Store) *MistakeHandler {
	return &MistakeHandler{store: store}
}

func (h *MistakeHandler) List(w http.ResponseWriter, r *http.Request) {
	tenantID := middleware.GetTenantID(r.Context())
	q := r.URL.Query()

	limit, _ := strconv.Atoi(q.Get("limit"))
	filter := storage.MistakeFilter{
		Severity:    domain.Severity(q.Get("severity")),
		Status:      domain.MistakeStatus(q.Get("status")),
		MistakeType: domain.MistakeType(q.Get("mistake_type")),
		AssignedTo:  q.Get("assigned_to"),
		Limit:       limit,
	}

	mistakes, err := h.store.ListMistakes(r.Context(), tenantID, filter)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	RespondJSON(w, http.StatusOK, mistakes)
}

func (h *MistakeHandler) Get(w http.ResponseWriter, r *http.Request) {
	tenantID := middleware.GetTenantID(r.Context())
	id := extractURLParam(r.URL.Path, "mistakes")

	mistake, err := h.store.GetMistake(r.Context(), tenantID, id)
	if err != nil {
		RespondError(w, http.StatusNotFound, "NOT_FOUND", "Mistake not found")
		return
	}
	RespondJSON(w, http.StatusOK, mistake)
}

func (h *MistakeHandler) GetDashboardSummary(w http.ResponseWriter, r *http.Request) {
	tenantID := middleware.GetTenantID(r.Context())
	summary, err := h.store.GetDashboardSummary(r.Context(), tenantID)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	RespondJSON(w, http.StatusOK, summary)
}
