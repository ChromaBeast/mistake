package handlers

import (
	"errors"
	"net/http"
	"time"

	"mistake-backend/internal/domain"
	"mistake-backend/internal/storage"
)

type FeedbackHandler struct {
	store storage.Store
}

func NewFeedbackHandler(store storage.Store) *FeedbackHandler {
	return &FeedbackHandler{store: store}
}

type CreateFeedbackRequest struct {
	FeedbackType domain.FeedbackType `json:"feedback_type"`
	Reason       string              `json:"reason,omitempty"`
}

func (h *FeedbackHandler) SubmitFeedback(w http.ResponseWriter, r *http.Request) {
	tenantID, _ := r.Context().Value("tenant_id").(string)
	userID, _ := r.Context().Value("user_id").(string)
	mistakeID := r.PathValue("id")

	if mistakeID == "" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "mistake_id is required")
		return
	}

	var req CreateFeedbackRequest
	if err := ParseJSON(r, &req); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_REQUEST", "invalid JSON payload")
		return
	}

	if req.FeedbackType != domain.FeedbackAccurate &&
		req.FeedbackType != domain.FeedbackNotAccurate &&
		req.FeedbackType != domain.FeedbackNotSure {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "invalid feedback_type")
		return
	}

	fb := &domain.MistakeFeedback{
		ID:           UniqueID("fb"),
		TenantID:     tenantID,
		MistakeID:    mistakeID,
		UserID:       userID,
		FeedbackType: req.FeedbackType,
		Reason:       req.Reason,
		CreatedAt:    time.Now().UTC(),
	}

	if err := h.store.CreateFeedback(r.Context(), fb); err != nil {
		RespondError(w, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}

	RespondCreated(w, map[string]any{
		"feedback": fb,
		"message":  "Feedback recorded successfully",
	})
}

func (h *FeedbackHandler) GetMistakeFeedback(w http.ResponseWriter, r *http.Request) {
	tenantID, _ := r.Context().Value("tenant_id").(string)
	mistakeID := r.PathValue("id")

	fb, err := h.store.GetFeedbackByMistake(r.Context(), tenantID, mistakeID)
	if err != nil {
		if errors.Is(err, storage.ErrNotFound) {
			RespondJSON(w, http.StatusOK, map[string]any{"feedback": nil})
			return
		}
		RespondError(w, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}

	RespondJSON(w, http.StatusOK, map[string]any{"feedback": fb})
}

func (h *FeedbackHandler) GetMetrics(w http.ResponseWriter, r *http.Request) {
	tenantID, _ := r.Context().Value("tenant_id").(string)

	metrics, err := h.store.GetFeedbackMetrics(r.Context(), tenantID)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}

	RespondJSON(w, http.StatusOK, map[string]any{"metrics": metrics})
}
