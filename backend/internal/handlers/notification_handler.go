package handlers

import (
	"mistake-backend/internal/middleware"
	"mistake-backend/internal/storage"
	"net/http"
)

type NotificationHandler struct {
	store storage.Store
}

func NewNotificationHandler(store storage.Store) *NotificationHandler {
	return &NotificationHandler{store: store}
}

func (h *NotificationHandler) List(w http.ResponseWriter, r *http.Request) {
	tenantID := middleware.GetTenantID(r.Context())
	userID := middleware.GetUserID(r.Context())

	notifs, err := h.store.ListNotifications(r.Context(), tenantID, userID)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	RespondJSON(w, http.StatusOK, notifs)
}

func (h *NotificationHandler) MarkRead(w http.ResponseWriter, r *http.Request) {
	tenantID := middleware.GetTenantID(r.Context())
	id := extractURLParam(r.URL.Path, "notifications")

	if err := h.store.MarkNotificationRead(r.Context(), tenantID, id); err != nil {
		RespondError(w, http.StatusNotFound, "NOT_FOUND", "Notification not found")
		return
	}
	RespondJSON(w, http.StatusOK, map[string]string{"message": "Notification marked as read"})
}
