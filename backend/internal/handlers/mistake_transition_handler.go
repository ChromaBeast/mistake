package handlers

import (
	"fmt"
	"mistake-backend/internal/domain"
	"mistake-backend/internal/middleware"
	"mistake-backend/internal/storage"
	"net/http"
	"strings"
	"time"
)

type MistakeTransitionHandler struct {
	store storage.Store
}

func NewMistakeTransitionHandler(store storage.Store) *MistakeTransitionHandler {
	return &MistakeTransitionHandler{store: store}
}

type StatusTransitionRequest struct {
	Status domain.MistakeStatus `json:"status"`
	Reason string               `json:"reason"`
}

type AssignRequest struct {
	AssignedTo string `json:"assigned_to"`
}

func (h *MistakeTransitionHandler) UpdateStatus(w http.ResponseWriter, r *http.Request) {
	tenantID := middleware.GetTenantID(r.Context())
	userID := middleware.GetUserID(r.Context())
	id := extractURLParam(r.URL.Path, "mistakes")

	var req StatusTransitionRequest
	if err := ParseJSON(r, &req); err != nil || req.Status == "" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_FAILED", "Target status is required")
		return
	}

	// Reason required for dismiss / resolve per API spec & edge cases
	if (req.Status == domain.MistakeStatusDismissed || req.Status == domain.MistakeStatusResolved) && strings.TrimSpace(req.Reason) == "" {
		RespondError(w, http.StatusBadRequest, "REASON_REQUIRED", "Mandatory reason required when resolving or dismissing a mistake finding")
		return
	}

	if err := h.store.UpdateMistakeStatus(r.Context(), tenantID, id, req.Status, userID, req.Reason); err != nil {
		RespondError(w, http.StatusNotFound, "NOT_FOUND", "Mistake not found")
		return
	}

	// Record event
	now := time.Now().UTC()
	_ = h.store.CreateEvent(r.Context(), &domain.Event{
		ID:        fmt.Sprintf("ev-mst-%s-%d", id, now.UnixNano()),
		TenantID:  tenantID,
		EventType: domain.EventType("mistake." + string(req.Status)),
		Source:    "user_action",
		ObservedAt: now,
		Payload: map[string]interface{}{
			"mistake_id": id,
			"actor_id":   userID,
			"to_status":  req.Status,
			"reason":     req.Reason,
		},
		Confidence: 1.0,
		CreatedAt:  now,
	})

	m, _ := h.store.GetMistake(r.Context(), tenantID, id)
	RespondJSON(w, http.StatusOK, m)
}

func (h *MistakeTransitionHandler) Assign(w http.ResponseWriter, r *http.Request) {
	tenantID := middleware.GetTenantID(r.Context())
	id := extractURLParam(r.URL.Path, "mistakes")

	var req AssignRequest
	if err := ParseJSON(r, &req); err != nil || req.AssignedTo == "" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_FAILED", "assigned_to user ID is required")
		return
	}

	assignedUser, err := h.store.GetUserByID(r.Context(), tenantID, req.AssignedTo)
	if err != nil {
		RespondError(w, http.StatusNotFound, "USER_NOT_FOUND", "Assigned user not found in tenant")
		return
	}

	if err := h.store.AssignMistake(r.Context(), tenantID, id, req.AssignedTo, assignedUser.Name); err != nil {
		RespondError(w, http.StatusNotFound, "NOT_FOUND", "Mistake not found")
		return
	}

	// Create user notification
	_ = h.store.CreateNotification(r.Context(), &domain.Notification{
		ID:        fmt.Sprintf("notif-%d", time.Now().UnixNano()),
		TenantID:  tenantID,
		UserID:    req.AssignedTo,
		Type:      domain.NotificationTypeMistakeAssigned,
		Title:     "New Finding Assigned",
		Message:   fmt.Sprintf("Discrepancy #%s has been assigned to you for investigation.", id),
		Resource:  fmt.Sprintf("/mistakes/%s", id),
		CreatedAt: time.Now().UTC(),
	})

	m, _ := h.store.GetMistake(r.Context(), tenantID, id)
	RespondJSON(w, http.StatusOK, m)
}

func (h *MistakeTransitionHandler) ListTransitions(w http.ResponseWriter, r *http.Request) {
	tenantID := middleware.GetTenantID(r.Context())
	id := extractURLParam(r.URL.Path, "mistakes")

	transitions, err := h.store.ListMistakeTransitions(r.Context(), tenantID, id)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	RespondJSON(w, http.StatusOK, transitions)
}
