package handlers

import (
	"errors"
	"net/http"
	"time"

	"mistake-backend/internal/domain"
	"mistake-backend/internal/storage"
)

type PilotAgreementHandler struct {
	store storage.Store
}

func NewPilotAgreementHandler(store storage.Store) *PilotAgreementHandler {
	return &PilotAgreementHandler{store: store}
}

type AcceptAgreementRequest struct {
	SignatoryName  string `json:"signatory_name"`
	SignatoryEmail string `json:"signatory_email"`
	AgreementVer   string `json:"agreement_version"`
	RetentionDays  int    `json:"retention_days"`
}

func (h *PilotAgreementHandler) GetStatus(w http.ResponseWriter, r *http.Request) {
	tenantID, _ := r.Context().Value("tenant_id").(string)

	agreement, err := h.store.GetPilotAgreement(r.Context(), tenantID)
	if err != nil {
		if errors.Is(err, storage.ErrNotFound) {
			RespondJSON(w, http.StatusOK, map[string]any{
				"status":   "pending",
				"accepted": false,
			})
			return
		}
		RespondError(w, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}

	RespondJSON(w, http.StatusOK, map[string]any{
		"status":    agreement.Status,
		"accepted":  agreement.Status == domain.PilotAgreementStatusAccepted,
		"agreement": agreement,
	})
}

func (h *PilotAgreementHandler) AcceptAgreement(w http.ResponseWriter, r *http.Request) {
	tenantID, _ := r.Context().Value("tenant_id").(string)
	userID, _ := r.Context().Value("user_id").(string)

	var req AcceptAgreementRequest
	if err := ParseJSON(r, &req); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_REQUEST", "invalid JSON payload")
		return
	}

	if req.SignatoryName == "" || req.SignatoryEmail == "" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "signatory name and email are required")
		return
	}

	if req.AgreementVer == "" {
		req.AgreementVer = "v2.0-pilot-dpa"
	}
	if req.RetentionDays <= 0 {
		req.RetentionDays = 30
	}

	pa := &domain.PilotAgreement{
		ID:             UniqueID("pa"),
		TenantID:       tenantID,
		UserID:         userID,
		SignatoryName:  req.SignatoryName,
		SignatoryEmail: req.SignatoryEmail,
		AgreementVer:   req.AgreementVer,
		Status:         domain.PilotAgreementStatusAccepted,
		RetentionDays:  req.RetentionDays,
		AcceptedAt:     time.Now().UTC(),
		IPAddress:      r.RemoteAddr,
	}

	if err := h.store.RecordPilotAgreement(r.Context(), pa); err != nil {
		RespondError(w, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}

	RespondCreated(w, map[string]any{
		"agreement": pa,
		"message":   "Pilot Data Handling Agreement accepted successfully",
	})
}
