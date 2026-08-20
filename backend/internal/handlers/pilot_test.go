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

func TestFeedbackAndAnalyticsHandlers(t *testing.T) {
	store := storage.NewMemoryStore()
	ctx := context.WithValue(context.Background(), "tenant_id", "t-pilot")
	ctx = context.WithValue(ctx, "user_id", "u-pilot")

	_ = store.CreateTenant(ctx, &domain.Tenant{
		ID:     "t-pilot",
		Name:   "Pilot Handler Corp",
		Status: domain.TenantStatusActive,
	})
	_ = store.CreateMistake(ctx, &domain.Mistake{
		ID:          "mst-101",
		TenantID:    "t-pilot",
		MistakeType: domain.MistakeTypeQuantityMismatch,
		Status:      domain.MistakeStatusDetected,
		DetectedAt:  time.Now().UTC(),
	})

	feedbackH := NewFeedbackHandler(store)
	analyticsH := NewAnalyticsHandler(store)
	agreementH := NewPilotAgreementHandler(store)

	// 1. Submit Feedback
	fbBody, _ := json.Marshal(CreateFeedbackRequest{
		FeedbackType: domain.FeedbackAccurate,
		Reason:       "Verified against paper PO",
	})
	req := httptest.NewRequest("POST", "/api/v1/mistakes/mst-101/feedback", bytes.NewReader(fbBody)).WithContext(ctx)
	req.SetPathValue("id", "mst-101")
	rec := httptest.NewRecorder()
	feedbackH.SubmitFeedback(rec, req)

	if rec.Code != http.StatusCreated {
		t.Fatalf("expected 201 Created, got %d", rec.Code)
	}

	// 2. Query Metrics
	mReq := httptest.NewRequest("GET", "/api/v1/analytics/accuracy-metrics", nil).WithContext(ctx)
	mRec := httptest.NewRecorder()
	feedbackH.GetMetrics(mRec, mReq)
	if mRec.Code != http.StatusOK {
		t.Fatalf("expected 200 OK, got %d", mRec.Code)
	}

	// 3. Record Aha Event
	ahaBody, _ := json.Marshal(RecordAhaEventRequest{
		EventType:  domain.AhaEventFirstUpload,
		DurationMs: 12000,
	})
	aReq := httptest.NewRequest("POST", "/api/v1/analytics/events", bytes.NewReader(ahaBody)).WithContext(ctx)
	aRec := httptest.NewRecorder()
	analyticsH.RecordEvent(aRec, aReq)
	if aRec.Code != http.StatusCreated {
		t.Fatalf("expected 201 Created for aha event, got %d", aRec.Code)
	}

	// 4. Accept Pilot Agreement
	paBody, _ := json.Marshal(AcceptAgreementRequest{
		SignatoryName:  "Rohan Gupta",
		SignatoryEmail: "rohan@pilothandler.com",
		AgreementVer:   "v2.0-dpa",
		RetentionDays:  30,
	})
	pReq := httptest.NewRequest("POST", "/api/v1/tenant/pilot-agreement/accept", bytes.NewReader(paBody)).WithContext(ctx)
	pRec := httptest.NewRecorder()
	agreementH.AcceptAgreement(pRec, pReq)
	if pRec.Code != http.StatusCreated {
		t.Fatalf("expected 201 Created for pilot agreement, got %d", pRec.Code)
	}
}
