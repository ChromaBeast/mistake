package handlers

import (
	"mistake-backend/internal/middleware"
	"mistake-backend/internal/storage"
	"net/http"
)

type SearchHandler struct {
	store storage.Store
}

func NewSearchHandler(store storage.Store) *SearchHandler {
	return &SearchHandler{store: store}
}

func (h *SearchHandler) Search(w http.ResponseWriter, r *http.Request) {
	tenantID := middleware.GetTenantID(r.Context())
	q := r.URL.Query().Get("q")
	filterType := r.URL.Query().Get("type")

	if q == "" {
		RespondJSON(w, http.StatusOK, []*storage.SearchResult{})
		return
	}

	results, err := h.store.GlobalSearch(r.Context(), tenantID, q, filterType)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	RespondJSON(w, http.StatusOK, results)
}
