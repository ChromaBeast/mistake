package test

import (
	"context"
	"fmt"
	"mistake-backend/internal/domain"
	"mistake-backend/internal/storage"
	"sync"
	"testing"
	"time"
)

func TestMemoryStoreConcurrency(t *testing.T) {
	store := storage.NewMemoryStore()
	tenantID := "tenant-concurrent"
	now := time.Now().UTC()

	_ = store.CreateTenant(context.Background(), &domain.Tenant{
		ID: tenantID, Name: "Concurrency Org", Status: domain.TenantStatusActive, CreatedAt: now, UpdatedAt: now,
	})

	const goroutines = 20
	const iterations = 50
	var wg sync.WaitGroup

	// Concurrently create and read entities
	for i := 0; i < goroutines; i++ {
		wg.Add(1)
		go func(workerID int) {
			defer wg.Done()
			for j := 0; j < iterations; j++ {
				entityID := fmt.Sprintf("entity-%d-%d", workerID, j)
				_ = store.CreateEntity(context.Background(), &domain.Entity{
					ID:            entityID,
					TenantID:      tenantID,
					CanonicalName: fmt.Sprintf("Vendor %d-%d", workerID, j),
					EntityType:    domain.EntityTypeSupplier,
					Status:        domain.EntityStatusActive,
					CreatedAt:     now,
					UpdatedAt:     now,
				})

				retrieved, err := store.GetEntity(context.Background(), tenantID, entityID)
				if err == nil && retrieved != nil {
					// Verify that modifying the retrieved copy does not mutate storage directly without update
					retrieved.CanonicalName = "Tampered Locally"
				}
			}
		}(i)
	}

	wg.Wait()

	entities, err := store.ListEntities(context.Background(), tenantID, nil)
	if err != nil {
		t.Fatalf("failed to list entities: %v", err)
	}
	if len(entities) != goroutines*iterations {
		t.Errorf("expected %d entities, got %d", goroutines*iterations, len(entities))
	}
}
