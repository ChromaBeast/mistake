package test

import (
	"context"
	"mistake-backend/internal/detection"
	"mistake-backend/internal/domain"
	"mistake-backend/internal/storage"
	"testing"
	"time"
)

func TestDetectionEngine(t *testing.T) {
	store := storage.NewMemoryStore()
	engine := detection.NewDetectionEngine(store)
	ctx := context.Background()
	tenantID := "tenant-det-1"
	now := time.Now().UTC()

	_ = store.CreateTenant(ctx, &domain.Tenant{ID: tenantID, Name: "Detection Test", Status: domain.TenantStatusActive})

	// 1. Setup Quantity Mismatch: Order (500 units @ ₹1,200) vs Invoice (450 units @ ₹1,200)
	orderID := "ord-qty-1"
	_ = store.CreateOrder(ctx, &domain.Order{
		ID: orderID, TenantID: tenantID, OrderNumber: "ORD-QTY-1", Status: "completed",
		Lines: []domain.OrderLine{{ID: "ol-1", OrderID: orderID, ProductName: "Steel Flange", Quantity: 500, UnitPriceMinor: 120000}},
	})
	_ = store.CreateInvoice(ctx, &domain.Invoice{
		ID: "inv-qty-1", TenantID: tenantID, RelatedOrderID: orderID, InvoiceNumber: "INV-QTY-1", AmountMinor: 54000000,
		Lines: []domain.InvoiceLine{{ID: "il-1", InvoiceID: "inv-qty-1", ProductName: "Steel Flange", Quantity: 450, UnitPriceMinor: 120000}},
	})

	// 2. Setup Price Mismatch: PO (1,000 units @ ₹4,500 = 450,000 paise) vs Invoice (1,000 units @ ₹4,850 = 485,000 paise)
	poID := "po-prc-1"
	_ = store.CreatePurchaseOrder(ctx, &domain.PurchaseOrder{
		ID: poID, TenantID: tenantID, PONumber: "PO-PRC-1", Status: "confirmed",
		Lines: []domain.POLine{{ID: "pol-1", PurchaseOrderID: poID, ProductName: "Copper Wire", Quantity: 1000, UnitPriceMinor: 450000}},
	})
	_ = store.CreateInvoice(ctx, &domain.Invoice{
		ID: "inv-prc-1", TenantID: tenantID, RelatedPOID: poID, InvoiceNumber: "INV-PRC-1", AmountMinor: 485000000,
		Lines: []domain.InvoiceLine{{ID: "il-2", InvoiceID: "inv-prc-1", ProductName: "Copper Wire", Quantity: 1000, UnitPriceMinor: 485000}},
	})

	// 3. Setup Delayed Shipment: Promised 10 days ago, delivered 2 days ago (8 days delay -> Medium severity)
	promised := now.AddDate(0, 0, -10)
	delivered := now.AddDate(0, 0, -2)
	_ = store.CreateShipment(ctx, &domain.Shipment{
		ID: "shp-1", TenantID: tenantID, ShipmentNumber: "SHP-1", Status: "delivered",
		PromisedDate: &promised, DeliveredAt: &delivered,
	})

	// 4. Setup Orphan Invoice
	_ = store.CreateInvoice(ctx, &domain.Invoice{
		ID: "inv-orphan-1", TenantID: tenantID, InvoiceNumber: "INV-ORPHAN-1", AmountMinor: 25000000,
	})

	// Run Detection Engine
	findings, err := engine.RunAll(ctx, tenantID)
	if err != nil {
		t.Fatalf("detection engine failed: %v", err)
	}

	if len(findings) < 4 {
		t.Errorf("expected at least 4 findings, got %d", len(findings))
	}

	foundQty := false
	foundPrice := false
	foundDate := false
	foundMissing := false

	for _, f := range findings {
		switch f.MistakeType {
		case domain.MistakeTypeQuantityMismatch:
			foundQty = true
			if f.FinancialImpactMinor != 6000000 { // 50 * 120,000 = 6,000,000 paise (₹60,000.00)
				t.Errorf("expected 6,000,000 paise quantity impact, got %d", f.FinancialImpactMinor)
			}
		case domain.MistakeTypePriceMismatch:
			foundPrice = true
			if f.FinancialImpactMinor != 35000000 { // 35,000 * 1,000 = 35,000,000 paise (₹3,50,000.00)
				t.Errorf("expected 35,000,000 paise price impact, got %d", f.FinancialImpactMinor)
			}
			if f.Severity != domain.SeverityCritical {
				t.Errorf("expected Critical severity for ₹3.5L discrepancy, got %s", f.Severity)
			}
		case domain.MistakeTypeDateMismatch:
			foundDate = true
		case domain.MistakeTypeMissingEvidence:
			foundMissing = true
		}
	}

	if !foundQty || !foundPrice || !foundDate || !foundMissing {
		t.Errorf("missing detector findings: qty=%v, price=%v, date=%v, missing=%v", foundQty, foundPrice, foundDate, foundMissing)
	}
}
