package handlers

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"mistake-backend/internal/domain"
	"mistake-backend/internal/storage"
)

func TestMistakeStatusTransitionGuard(t *testing.T) {
	store := storage.NewMemoryStore()
	ctx := context.WithValue(context.Background(), "tenant_id", "t-trans")
	ctx = context.WithValue(ctx, "user_id", "u-trans")

	_ = store.CreateTenant(ctx, &domain.Tenant{ID: "t-trans", Name: "Transition Test Co", Status: domain.TenantStatusActive})
	_ = store.CreateMistake(ctx, &domain.Mistake{
		ID:          "mst-t1",
		TenantID:    "t-trans",
		MistakeType: domain.MistakeTypeQuantityMismatch,
		Status:      domain.MistakeStatusDetected,
		DetectedAt:  time.Now().UTC(),
	})

	h := NewMistakeTransitionHandler(store)
	patch := func(status domain.MistakeStatus, reason string) *httptest.ResponseRecorder {
		body, _ := json.Marshal(StatusTransitionRequest{Status: status, Reason: reason})
		req := httptest.NewRequest("PATCH", "/api/v1/mistakes/mst-t1/status", bytes.NewReader(body)).WithContext(ctx)
		req.SetPathValue("id", "mst-t1")
		rec := httptest.NewRecorder()
		h.UpdateStatus(rec, req)
		return rec
	}

	// Illegal jump detected -> verified must be rejected with 409.
	if rec := patch(domain.MistakeStatusVerified, ""); rec.Code != http.StatusConflict {
		t.Fatalf("expected 409 for detected->verified, got %d", rec.Code)
	}

	// Terminal states are immutable.
	_ = store.UpdateMistakeStatus(ctx, "t-trans", "mst-t1", domain.MistakeStatusUnderReview, "u-trans", "")
	_ = store.UpdateMistakeStatus(ctx, "t-trans", "mst-t1", domain.MistakeStatusVerified, "u-trans", "")
	_ = store.UpdateMistakeStatus(ctx, "t-trans", "mst-t1", domain.MistakeStatusResolved, "u-trans", "Vendor debit note applied")
	if rec := patch(domain.MistakeStatusDismissed, "second look"); rec.Code != http.StatusConflict {
		t.Fatalf("expected 409 for resolved->dismissed, got %d", rec.Code)
	}

	// Legal path still works end-to-end on a fresh finding.
	_ = store.CreateMistake(ctx, &domain.Mistake{
		ID:          "mst-t2",
		TenantID:    "t-trans",
		MistakeType: domain.MistakeTypePriceMismatch,
		Status:      domain.MistakeStatusDetected,
		DetectedAt:  time.Now().UTC(),
	})
	body, _ := json.Marshal(StatusTransitionRequest{Status: domain.MistakeStatusUnderReview})
	req := httptest.NewRequest("PATCH", "/api/v1/mistakes/mst-t2/status", bytes.NewReader(body)).WithContext(ctx)
	req.SetPathValue("id", "mst-t2")
	rec := httptest.NewRecorder()
	h.UpdateStatus(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200 for detected->under_review, got %d", rec.Code)
	}

	// Resolving without a reason stays forbidden.
	body, _ = json.Marshal(StatusTransitionRequest{Status: domain.MistakeStatusResolved})
	req = httptest.NewRequest("PATCH", "/api/v1/mistakes/mst-t2/status", bytes.NewReader(body)).WithContext(ctx)
	req.SetPathValue("id", "mst-t2")
	rec = httptest.NewRecorder()
	h.UpdateStatus(rec, req)
	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected 400 REASON_REQUIRED, got %d", rec.Code)
	}
}
