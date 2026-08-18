package resolver

import (
	"context"
	"mistake-backend/internal/domain"
	"mistake-backend/internal/storage"
	"testing"
)

func TestMatcherNormalization(t *testing.T) {
	s1 := NormalizeEntityName("Tata Steel Tubes Pvt. Ltd.")
	if s1 != "tata steel tubes" {
		t.Errorf("expected 'tata steel tubes', got '%s'", s1)
	}

	s2 := NormalizeEntityName("Bharat Heavy Electricals Limited")
	if s2 != "bharat heavy electricals" {
		t.Errorf("expected 'bharat heavy electricals', got '%s'", s2)
	}

	dist := LevenshteinDistance("abc", "abd")
	if dist != 1 {
		t.Errorf("expected distance 1, got %d", dist)
	}

	sim := CalculateSimilarity("Tata Motors Pvt Ltd", "Tata Motors Limited")
	if sim < 0.99 {
		t.Errorf("expected similarity 1.0 after normalization, got %f", sim)
	}
}

func TestReviewQueueService(t *testing.T) {
	store := storage.NewMemoryStore()
	rq := NewReviewQueueService(store)
	ctx := context.WithValue(context.Background(), "tenant_id", "tenant-rq")
	tenantID := "tenant-rq"

	_ = store.CreateTenant(ctx, &domain.Tenant{ID: tenantID, Name: "RQ Test", Status: domain.TenantStatusActive})
	targetEntity := &domain.Entity{
		ID: "ent-canon-1", TenantID: tenantID, CanonicalName: "Tata Steel Corp",
		EntityType: domain.EntityTypeSupplier, Status: domain.EntityStatusActive,
	}
	_ = store.CreateEntity(ctx, targetEntity)

	item := &domain.ReviewQueueItem{
		ID: "rq-1", TenantID: tenantID, RawName: "Tata Steel Tubes",
		EntityType: domain.EntityTypeSupplier, MatchedEntityID: targetEntity.ID,
		MatchedCanonical: targetEntity.CanonicalName, Confidence: 0.85,
	}
	_ = store.AddToReviewQueue(ctx, item)

	// Confirm Merge
	if err := rq.ConfirmMerge(ctx, tenantID, "rq-1"); err != nil {
		t.Fatalf("ConfirmMerge failed: %v", err)
	}

	queue, _ := store.ListReviewQueue(ctx, tenantID)
	if len(queue) != 0 {
		t.Errorf("expected review queue to be empty after merge")
	}

	alias, err := store.GetAliasByName(ctx, tenantID, "Tata Steel Tubes")
	if err != nil || alias.EntityID != targetEntity.ID {
		t.Errorf("alias was not created properly on confirm merge")
	}
}
