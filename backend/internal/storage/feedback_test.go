package storage

import (
	"context"
	"mistake-backend/internal/domain"
	"testing"
	"time"
)

func TestFeedbackAndAhaTelemetry(t *testing.T) {
	store := NewMemoryStore()
	ctx := context.Background()
	tenantID := "tenant-test-pilot"

	_ = store.CreateTenant(ctx, &domain.Tenant{
		ID:     tenantID,
		Name:   "Pilot Test Corp",
		Status: domain.TenantStatusActive,
	})

	// 1. Test Feedback Capture
	fb1 := &domain.MistakeFeedback{
		ID:           "fb-1",
		TenantID:     tenantID,
		MistakeID:    "mst-1",
		UserID:       "usr-1",
		FeedbackType: domain.FeedbackAccurate,
		CreatedAt:    time.Now().UTC(),
	}
	if err := store.CreateFeedback(ctx, fb1); err != nil {
		t.Fatalf("failed to create feedback: %v", err)
	}

	fb2 := &domain.MistakeFeedback{
		ID:           "fb-2",
		TenantID:     tenantID,
		MistakeID:    "mst-2",
		UserID:       "usr-1",
		FeedbackType: domain.FeedbackNotAccurate,
		Reason:       "Expected volume discount",
		CreatedAt:    time.Now().UTC(),
	}
	if err := store.CreateFeedback(ctx, fb2); err != nil {
		t.Fatalf("failed to create feedback: %v", err)
	}

	metrics, err := store.GetFeedbackMetrics(ctx, tenantID)
	if err != nil {
		t.Fatalf("failed to get feedback metrics: %v", err)
	}
	if metrics.TotalReviewed != 2 {
		t.Errorf("expected 2 reviews, got %d", metrics.TotalReviewed)
	}
	if metrics.FalsePositiveRate != 0.5 {
		t.Errorf("expected 0.5 FPR, got %f", metrics.FalsePositiveRate)
	}

	// 2. Test Aha Telemetry
	ev1 := &domain.AhaEvent{
		ID:         "aha-1",
		TenantID:   tenantID,
		UserID:     "usr-1",
		EventType:  domain.AhaEventFirstUpload,
		DurationMs: 45000,
	}
	_ = store.RecordAhaEvent(ctx, ev1)

	summary, err := store.GetAhaFunnelSummary(ctx, tenantID)
	if err != nil {
		t.Fatalf("failed to get aha summary: %v", err)
	}
	if summary.AvgTimeToUploadSec != 45.0 {
		t.Errorf("expected 45s upload time, got %f", summary.AvgTimeToUploadSec)
	}

	// 3. Test Pilot Agreement
	pa := &domain.PilotAgreement{
		ID:             "pa-1",
		TenantID:       tenantID,
		UserID:         "usr-1",
		SignatoryName:  "Vikram Sharma",
		SignatoryEmail: "vikram@pilottest.in",
		AgreementVer:   "v2.0-pilot-dpa",
		Status:         domain.PilotAgreementStatusAccepted,
		RetentionDays:  30,
	}
	if err := store.RecordPilotAgreement(ctx, pa); err != nil {
		t.Fatalf("failed to record pilot agreement: %v", err)
	}
	savedPa, err := store.GetPilotAgreement(ctx, tenantID)
	if err != nil || savedPa.SignatoryName != "Vikram Sharma" {
		t.Fatalf("failed to retrieve pilot agreement")
	}
}
