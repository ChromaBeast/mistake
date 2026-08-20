package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"time"

	"mistake-backend/internal/domain"
	"mistake-backend/internal/storage"
)

type EvalDatasetRecord struct {
	MistakeID       string              `json:"mistake_id"`
	MistakeType     domain.MistakeType  `json:"mistake_type"`
	Severity        domain.Severity     `json:"severity"`
	ReferenceNumber string              `json:"reference_number"`
	FeedbackType    domain.FeedbackType `json:"feedback_type"`
	HumanReason     string              `json:"human_reason,omitempty"`
	Confidence      float64             `json:"model_confidence"`
	Explanation     string              `json:"model_explanation"`
	ExportedAt      time.Time           `json:"exported_at"`
}

func main() {
	fmt.Println("=== Mistake AI Evaluation Dataset Exporter ===")
	store := storage.NewMemoryStore()
	ctx := context.Background()
	tenantID := "pilot-tenant-alpha"

	_ = store.CreateTenant(ctx, &domain.Tenant{
		ID:     tenantID,
		Name:   "Alpha Polymers Ltd",
		Status: domain.TenantStatusActive,
	})

	m := &domain.Mistake{
		ID:                   "mst-sample-001",
		TenantID:             tenantID,
		MistakeType:          domain.MistakeTypeQuantityMismatch,
		Severity:             domain.SeverityHigh,
		Status:               domain.MistakeStatusVerified,
		ReferenceNumber:      "PO-2026-881",
		FinancialImpactMinor: 4500000,
		Confidence:           0.94,
		Explanation:          "PO ordered 500 units, invoice billed 450 units at unit rate ₹1,000.",
		DetectedAt:           time.Now().UTC(),
	}
	_ = store.CreateMistake(ctx, m)

	fb := &domain.MistakeFeedback{
		ID:           "fb-sample-001",
		TenantID:     tenantID,
		MistakeID:    m.ID,
		UserID:       "usr-analyst-1",
		FeedbackType: domain.FeedbackAccurate,
		Reason:       "Verified against physical delivery challan",
		CreatedAt:    time.Now().UTC(),
	}
	_ = store.CreateFeedback(ctx, fb)

	record := EvalDatasetRecord{
		MistakeID:       m.ID,
		MistakeType:     m.MistakeType,
		Severity:        m.Severity,
		ReferenceNumber: m.ReferenceNumber,
		FeedbackType:    fb.FeedbackType,
		HumanReason:     fb.Reason,
		Confidence:      m.Confidence,
		Explanation:     m.Explanation,
		ExportedAt:      time.Now().UTC(),
	}

	data, _ := json.MarshalIndent([]EvalDatasetRecord{record}, "", "  ")
	fmt.Println("Exported Evaluation Sample:")
	_, _ = os.Stdout.Write(data)
	fmt.Println("\nSuccessfully generated evaluation dataset record.")
}
