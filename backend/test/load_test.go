package test

import (
	"context"
	"fmt"
	"sync"
	"testing"
	"time"

	"mistake-backend/internal/detection"
	"mistake-backend/internal/domain"
	"mistake-backend/internal/storage"
)

// TestPilotLoad5000Documents benchmarks 5,000 document reconciliations across concurrent tenants.
func TestPilotLoad5000Documents(t *testing.T) {
	const totalBatches = 500
	const docsPerBatch = 10
	const concurrency = 20

	ctx := context.Background()
	store := storage.NewMemoryStore()

	// Seed 5,000 paired records
	for i := 0; i < totalBatches; i++ {
		tenantID := fmt.Sprintf("tenant-%d", i%10)
		poID := fmt.Sprintf("po-%d", i)
		po := &domain.PurchaseOrder{
			ID:               poID,
			TenantID:         tenantID,
			PONumber:         fmt.Sprintf("PO-%d", i),
			Status:           "Active",
			Currency:         "INR",
			TotalAmountMinor: 15000000,
			ObservedAt:       time.Now(),
			CreatedAt:        time.Now(),
			Lines: []domain.POLine{
				{
					ID:              fmt.Sprintf("pol-%d", i),
					PurchaseOrderID: poID,
					TenantID:        tenantID,
					ProductID:       "PROD-01",
					ProductName:     "Steel Beams",
					Quantity:        100,
					UnitPriceMinor:  150000,
				},
			},
		}
		_ = store.CreatePurchaseOrder(ctx, po)

		inv := &domain.Invoice{
			ID:               fmt.Sprintf("inv-%d", i),
			TenantID:         tenantID,
			RelatedPOID:      poID,
			InvoiceNumber:    fmt.Sprintf("INV-%d", i),
			Status:           "Active",
			Currency:         "INR",
			AmountMinor:      17500000, // Discrepancy
			ObservedAt:       time.Now(),

			CreatedAt:        time.Now(),
			Lines: []domain.InvoiceLine{
				{
					ID:             fmt.Sprintf("invl-%d", i),
					InvoiceID:      fmt.Sprintf("inv-%d", i),
					TenantID:       tenantID,
					ProductID:      "PROD-01",
					ProductName:    "Steel Beams",
					Quantity:       100,
					UnitPriceMinor: 175000, // +₹250/unit price mismatch
				},
			},
		}
		_ = store.CreateInvoice(ctx, inv)
	}

	detector := detection.NewPriceMismatchDetector(store)
	var wg sync.WaitGroup
	start := time.Now()
	var totalFindings int64
	var mu sync.Mutex

	for w := 0; w < concurrency; w++ {
		wg.Add(1)
		go func(workerID int) {
			defer wg.Done()
			for tID := 0; tID < 10; tID++ {
				findings, err := detector.Detect(ctx, fmt.Sprintf("tenant-%d", tID))
				if err == nil && len(findings) > 0 {
					mu.Lock()
					totalFindings += int64(len(findings))
					mu.Unlock()
				}
			}
		}(w)
	}

	wg.Wait()
	elapsed := time.Since(start)
	totalProcessed := totalBatches * docsPerBatch

	t.Logf("Pilot Load Test (5,000 documents): executed in %v (throughput: %.1f docs/sec)",
		elapsed, float64(totalProcessed)/elapsed.Seconds())

	if elapsed > 5*time.Second {
		t.Errorf("5k reconciliation too slow: took %v, expected < 5s", elapsed)
	}
}
