package test

import (
	"context"
	"mistake-backend/internal/domain"
	"mistake-backend/internal/resolver"
	"mistake-backend/internal/storage"
	"testing"
)

func TestEntityResolver(t *testing.T) {
	store := storage.NewMemoryStore()
	r := resolver.NewEntityResolver(store)
	ctx := context.Background()
	tenantID := "tenant-res-1"

	_ = store.CreateTenant(ctx, &domain.Tenant{ID: tenantID, Name: "Resolver Corp", Status: domain.TenantStatusActive})

	// 1. First resolution: should create new canonical entity
	res1, err := r.Resolve(ctx, tenantID, domain.EntityTypeSupplier, "Tata Steel Tubes Pvt Ltd", "ev-1")
	if err != nil {
		t.Fatalf("resolve failed: %v", err)
	}
	if res1.Action != resolver.ActionCreatedNew {
		t.Errorf("expected ActionCreatedNew, got %s", res1.Action)
	}

	// 2. Exact alias resolution
	res2, err := r.Resolve(ctx, tenantID, domain.EntityTypeSupplier, "Tata Steel Tubes Pvt Ltd", "ev-2")
	if err != nil {
		t.Fatalf("resolve failed: %v", err)
	}
	if res2.EntityID != res1.EntityID || res2.Action != resolver.ActionExactMatch {
		t.Errorf("expected exact match to %s, got %+v", res1.EntityID, res2)
	}

	// 3. High similarity resolution (auto merge >= 0.95)
	// "Tata Steel Tubes Ltd" vs "Tata Steel Tubes Pvt Ltd" (both normalize to "tata steel tubes")
	res3, err := r.Resolve(ctx, tenantID, domain.EntityTypeSupplier, "Tata Steel Tubes Limited", "ev-3")
	if err != nil {
		t.Fatalf("resolve failed: %v", err)
	}
	if res3.Action != resolver.ActionAutoMerged && res3.Action != resolver.ActionExactMatch {
		t.Errorf("expected AutoMerged or ExactMatch, got %s", res3.Action)
	}
	if res3.EntityID != res1.EntityID {
		t.Errorf("expected merged into %s, got %s", res1.EntityID, res3.EntityID)
	}

	// 4. Ambiguous match (Review Queue 0.70 <= score < 0.95)
	res4, err := r.Resolve(ctx, tenantID, domain.EntityTypeSupplier, "Tata Steel Tube", "ev-4")
	if err != nil {
		t.Fatalf("resolve failed: %v", err)
	}
	if res4.Action != resolver.ActionReviewQueue {
		t.Errorf("expected ActionReviewQueue for 0.9375 score, got %s (confidence %f)", res4.Action, res4.Confidence)
	}

	// 5. Completely new entity (<0.70)
	res5, err := r.Resolve(ctx, tenantID, domain.EntityTypeSupplier, "Bharat Petroleum Corp", "ev-5")
	if err != nil {
		t.Fatalf("resolve failed: %v", err)
	}
	if res5.Action != resolver.ActionCreatedNew || res5.EntityID == res1.EntityID {
		t.Errorf("expected new entity for distinct supplier, got %+v", res5)
	}
}
