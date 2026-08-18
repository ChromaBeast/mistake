package detection

import (
	"context"
	"mistake-backend/internal/domain"
	"mistake-backend/internal/storage"
	"testing"
)

func TestSeverityRubric(t *testing.T) {
	if CalculateSeverity(15000000, 0) != domain.SeverityCritical {
		t.Errorf("expected Critical for ₹1.5L impact")
	}
	if CalculateSeverity(3000000, 0) != domain.SeverityHigh {
		t.Errorf("expected High for ₹30k impact")
	}
	if CalculateSeverity(0, 15) != domain.SeverityHigh {
		t.Errorf("expected High for 15 days delay")
	}
	if CalculateSeverity(800000, 0) != domain.SeverityMedium {
		t.Errorf("expected Medium for ₹8k impact")
	}
	if CalculateSeverity(0, 5) != domain.SeverityMedium {
		t.Errorf("expected Medium for 5 days delay")
	}
	if CalculateSeverity(20000, 0) != domain.SeverityLow {
		t.Errorf("expected Low for ₹200 impact")
	}
	if CalculateSeverity(0, 0) != domain.SeverityHealthy {
		t.Errorf("expected Healthy for 0 impact and 0 delay")
	}
}

func TestStatusMismatchDetectorUnit(t *testing.T) {
	store := storage.NewMemoryStore()
	ctx := context.WithValue(context.Background(), "tenant_id", "tenant-stat")
	tenantID := "tenant-stat"

	_ = store.CreateTenant(ctx, &domain.Tenant{ID: tenantID, Name: "Stat Test", Status: domain.TenantStatusActive})
	_ = store.CreateOrder(ctx, &domain.Order{
		ID: "ord-1", TenantID: tenantID, OrderNumber: "ORD-1", Status: "completed",
	})
	_ = store.CreateShipment(ctx, &domain.Shipment{
		ID: "shp-1", TenantID: tenantID, OrderID: "ord-1", ShipmentNumber: "SHP-1", Status: "returned",
	})

	det := NewStatusMismatchDetector(store)
	findings, err := det.Detect(ctx, tenantID)
	if err != nil || len(findings) != 1 {
		t.Fatalf("expected 1 status mismatch finding, got %d (err=%v)", len(findings), err)
	}
}
