package handlers

import (
	"mistake-backend/internal/domain"
	"mistake-backend/internal/middleware"
	"mistake-backend/internal/storage"
	"net/http"
	"strconv"
)

type EventHandler struct {
	store storage.Store
}

func NewEventHandler(store storage.Store) *EventHandler {
	return &EventHandler{store: store}
}

func (h *EventHandler) List(w http.ResponseWriter, r *http.Request) {
	tenantID := middleware.GetTenantID(r.Context())
	q := r.URL.Query()

	limit, _ := strconv.Atoi(q.Get("limit"))
	filter := storage.EventFilter{
		EntityID:  q.Get("entity_id"),
		EventType: domain.EventType(q.Get("event_type")),
		Limit:     limit,
	}

	events, err := h.store.ListEvents(r.Context(), tenantID, filter)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	RespondJSON(w, http.StatusOK, events)
}

func (h *EventHandler) GetEntityTimeline(w http.ResponseWriter, r *http.Request) {
	tenantID := middleware.GetTenantID(r.Context())
	entityID := extractURLParam(r.URL.Path, "entities")

	timeline, err := h.store.GetEntityTimeline(r.Context(), tenantID, entityID)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	RespondJSON(w, http.StatusOK, timeline)
}
