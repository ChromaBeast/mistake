package storage

import (
	"context"
	"mistake-backend/internal/domain"
	"testing"
	"time"
)

func TestStorageTenantIsolation(t *testing.T) {
	store := NewMemoryStore()
	ctxA := context.WithValue(context.Background(), "tenant_id", "tenant-A")
	ctxB := context.WithValue(context.Background(), "tenant_id", "tenant-B")

	_ = store.CreateTenant(ctxA, &domain.Tenant{ID: "tenant-A", Name: "Tenant Alpha", Status: domain.TenantStatusActive})
	_ = store.CreateTenant(ctxB, &domain.Tenant{ID: "tenant-B", Name: "Tenant Beta", Status: domain.TenantStatusActive})

	// User created in Tenant A
	_ = store.CreateUser(ctxA, &domain.User{
		ID: "u-a", TenantID: "tenant-A", Email: "alpha@example.com",
		Role: domain.RoleOwner, Status: domain.UserStatusActive,
	})

	// Attempt to query User from Tenant B context -> must fail with ErrTenantMismatch or ErrNotFound
	_, err := store.GetUserByID(ctxB, "tenant-B", "u-a")
	if err == nil {
		t.Errorf("tenant B should not access user from tenant A")
	}

	// Direct cross-tenant parameter mismatch
	_, err2 := store.GetUserByID(ctxA, "tenant-B", "u-a")
	if err2 != ErrTenantMismatch {
		t.Errorf("expected ErrTenantMismatch when ctxA accesses tenant-B repo method")
	}
}

func TestStoragePurge(t *testing.T) {
	store := NewMemoryStore()
	ctx := context.WithValue(context.Background(), "tenant_id", "tenant-purge")
	tenantID := "tenant-purge"

	_ = store.CreateTenant(ctx, &domain.Tenant{ID: tenantID, Name: "Purge Corp", Status: domain.TenantStatusActive})
	_ = store.CreateDataSource(ctx, &domain.DataSource{
		ID: "ds-p1", TenantID: tenantID, UploadedBy: "u1", SourceType: domain.SourceTypeCSV,
		Filename: "data.csv", Status: domain.DataSourceStatusCompleted, UploadedAt: time.Now().UTC(),
	})

	list, _ := store.ListDataSources(ctx, tenantID)
	if len(list) != 1 {
		t.Fatalf("expected 1 data source before purge")
	}

	if err := store.PurgeTenantData(ctx, tenantID); err != nil {
		t.Fatalf("purge failed: %v", err)
	}

	listAfter, _ := store.ListDataSources(ctx, tenantID)
	if len(listAfter) != 0 {
		t.Errorf("expected 0 data sources after physical purge")
	}
}
