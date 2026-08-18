package handlers

import (
	"fmt"
	"log/slog"
	"mistake-backend/internal/config"
	"mistake-backend/internal/domain"
	"mistake-backend/internal/middleware"
	"mistake-backend/internal/storage"
	"net/http"
	"time"
)

// BillingHandler manages subscriptions, invoices, and checkout flows.
type BillingHandler struct {
	store storage.Store
	cfg   *config.Config
}

// NewBillingHandler creates a new BillingHandler instance.
func NewBillingHandler(store storage.Store, cfg *config.Config) *BillingHandler {
	return &BillingHandler{store: store, cfg: cfg}
}

type CheckoutRequest struct {
	PlanTier domain.PlanTier `json:"plan_tier"`
}

type CheckoutResponse struct {
	SessionID string `json:"session_id"`
	PlanTier  domain.PlanTier `json:"plan_tier"`
	AmountMinor int64 `json:"amount_minor"`
	Status    string `json:"status"`
}

// GetSubscription returns current active subscription and quota for the tenant.
func (h *BillingHandler) GetSubscription(w http.ResponseWriter, r *http.Request) {
	tenantID := middleware.GetTenantID(r.Context())
	sub, err := h.store.GetSubscription(r.Context(), tenantID)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	RespondJSON(w, http.StatusOK, sub)
}

// Checkout initiates a plan subscription upgrade or change.
func (h *BillingHandler) Checkout(w http.ResponseWriter, r *http.Request) {
	tenantID := middleware.GetTenantID(r.Context())
	var req CheckoutRequest
	if err := ParseJSON(r, &req); err != nil || req.PlanTier == "" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_FAILED", "Valid plan_tier is required")
		return
	}

	plan, ok := h.cfg.Plans[string(req.PlanTier)]
	if !ok {
		plan = h.cfg.Plans["starter"]
	}

	planName := plan.Name
	amountMinor := plan.AmountMinor
	maxDocs := plan.MaxDocuments

	now := time.Now().UTC()
	sub := &domain.Subscription{
		ID:                 fmt.Sprintf("sub-%d", time.Now().UnixNano()),
		TenantID:           tenantID,
		PlanTier:           req.PlanTier,
		PlanName:           planName,
		AmountMinor:        amountMinor,
		Currency:           "INR",
		Status:             domain.SubStatusActive,
		CurrentPeriodStart: now,
		CurrentPeriodEnd:   now.AddDate(0, 1, 0),
		UsageDocumentCount: 0,
		MaxDocuments:       maxDocs,
	}
	if err := h.store.UpdateSubscription(r.Context(), sub); err != nil {
		slog.Error("Failed to update subscription", "error", err)
		RespondError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Failed to update subscription")
		return
	}

	// Create a billing invoice
	if err := h.store.CreateBillingInvoice(r.Context(), &domain.BillingInvoice{
		ID:          fmt.Sprintf("binv-%d", time.Now().UnixNano()),
		TenantID:    tenantID,
		InvoiceNo:   fmt.Sprintf("INV-MISTAKE-%s", now.Format("20060102-1504")),
		AmountMinor: amountMinor,
		Currency:    "INR",
		Status:      "paid",
		PeriodStart: now,
		PeriodEnd:   now.AddDate(0, 1, 0),
		CreatedAt:   now,
	}); err != nil {
		slog.Error("Failed to create billing invoice", "error", err)
		RespondError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Failed to create billing invoice")
		return
	}

	RespondJSON(w, http.StatusOK, CheckoutResponse{
		SessionID:   fmt.Sprintf("chk_session_%d", time.Now().UnixNano()),
		PlanTier:    req.PlanTier,
		AmountMinor: amountMinor,
		Status:      "completed",
	})
}

// ListInvoices returns past billing invoices and payment receipts.
func (h *BillingHandler) ListInvoices(w http.ResponseWriter, r *http.Request) {
	tenantID := middleware.GetTenantID(r.Context())
	invoices, err := h.store.ListBillingInvoices(r.Context(), tenantID)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	RespondJSON(w, http.StatusOK, invoices)
}
