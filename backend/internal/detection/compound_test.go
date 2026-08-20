package detection

import (
	"context"
	"mistake-backend/internal/domain"
	"mistake-backend/internal/storage"
	"testing"
	"time"
)

func TestCompoundAggregator(t *testing.T) {
	agg := NewCompoundAggregator()

	m1 := &domain.Mistake{
		ID:                   "mst-1",
		TenantID:             "t1",
		MistakeType:          domain.MistakeTypeQuantityMismatch,
		ReferenceNumber:      "PO-100",
		FinancialImpactMinor: 200000,
	}
	m2 := &domain.Mistake{
		ID:                   "mst-2",
		TenantID:             "t1",
		MistakeType:          domain.MistakeTypePriceMismatch,
		ReferenceNumber:      "PO-100",
		FinancialImpactMinor: 150000,
	}
	m3 := &domain.Mistake{
		ID:                   "mst-3",
		TenantID:             "t1",
		MistakeType:          domain.MistakeTypeDateMismatch,
		ReferenceNumber:      "PO-200",
		FinancialImpactMinor: 0,
	}

	grouped := agg.GroupCompoundMistakes([]*domain.Mistake{m1, m2, m3})

	if !grouped[0].IsCompound || !grouped[1].IsCompound {
		t.Errorf("expected m1 and m2 to be marked compound")
	}
	if grouped[2].IsCompound {
		t.Errorf("expected m3 to not be marked compound")
	}
	if grouped[0].CompoundGroupID != grouped[1].CompoundGroupID {
		t.Errorf("expected shared compound group ID for same reference number")
	}

	totalImpact := agg.CalculateCompoundImpact([]*domain.Mistake{m1, m2})
	if totalImpact != 350000 {
		t.Errorf("expected 350000 paise impact, got %d", totalImpact)
	}
}

func TestLeadTimeAnomalyDetectorGate(t *testing.T) {
	store := storage.NewMemoryStore()
	ctx := context.Background()
	tenantID := "tenant-anomaly-test"

	detector := NewLeadTimeAnomalyDetector(store)

	// Case 1: Insufficient cycles (<20) -> should return 0 findings
	for i := 0; i < 5; i++ {
		shipped := time.Now().Add(-time.Duration(10-i) * 24 * time.Hour)
		delivered := shipped.Add(48 * time.Hour)
		_ = store.CreateShipment(ctx, &domain.Shipment{
			ID:             time.Now().Format("20060102150405") + string(rune(i)),
			TenantID:       tenantID,
			ShipmentNumber: "SH-LOW",
			ShippedAt:      &shipped,
			DeliveredAt:    &delivered,
			Status:         "delivered",
		})
	}

	findings, err := detector.Detect(ctx, tenantID)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(findings) != 0 {
		t.Errorf("expected 0 findings when below 20-cycle gate, got %d", len(findings))
	}
}
