package test

import (
	"context"
	"mistake-backend/internal/domain"
	"mistake-backend/internal/pipeline"
	"mistake-backend/internal/storage"
	"testing"
	"time"
)

func TestPipelineContextCancellation(t *testing.T) {
	store := storage.NewMemoryStore()
	pipe := pipeline.NewPipeline(store)
	tenantID := "tenant-cancel-test"

	_ = store.CreateTenant(context.Background(), &domain.Tenant{
		ID: tenantID, Name: "Cancel Test Org", Status: domain.TenantStatusActive,
	})

	csvData := sampleCSVData()
	dsID := "ds-cancel-1"
	_ = store.CreateDataSource(context.Background(), &domain.DataSource{
		ID:         dsID,
		TenantID:   tenantID,
		UploadedBy: "user-1",
		SourceType: domain.SourceTypeCSV,
		Filename:   "large_orders.csv",
		Status:     domain.DataSourceStatusQueued,
		UploadedAt: time.Now().UTC(),
	})

	// Cancel context immediately
	ctx, cancel := context.WithCancel(context.Background())
	cancel()

	err := pipe.ProcessDataSource(ctx, tenantID, dsID, csvData)
	if err == nil {
		t.Errorf("expected context cancellation error, got nil")
	}
}
