package test

import (
	"context"
	"mistake-backend/internal/domain"
	"mistake-backend/internal/pipeline"
	"mistake-backend/internal/seed"
	"mistake-backend/internal/storage"
	"testing"
	"time"
)

func TestIngestionPipeline(t *testing.T) {
	store := storage.NewMemoryStore()
	pipe := pipeline.NewPipeline(store)
	ctx := context.Background()
	tenantID := "tenant-pipe-1"

	_ = store.CreateTenant(ctx, &domain.Tenant{ID: tenantID, Name: "Pipeline Test", Status: domain.TenantStatusActive})

	// 1. Process CSV sample data
	csvData := seed.SampleCSVData()
	dsID := "ds-csv-101"
	ds := &domain.DataSource{
		ID:         dsID,
		TenantID:   tenantID,
		UploadedBy: "user-1",
		SourceType: domain.SourceTypeCSV,
		Filename:   "orders.csv",
		Status:     domain.DataSourceStatusQueued,
		UploadedAt: time.Now().UTC(),
	}
	_ = store.CreateDataSource(ctx, ds)

	err := pipe.ProcessDataSource(ctx, tenantID, dsID, csvData)
	if err != nil {
		t.Fatalf("pipeline processing failed: %v", err)
	}

	updatedDS, err := store.GetDataSource(ctx, tenantID, dsID)
	if err != nil || updatedDS.Status != domain.DataSourceStatusCompleted {
		t.Errorf("expected DataSource status completed, got %s (err=%v)", updatedDS.Status, err)
	}
	if updatedDS.ItemCount < 3 {
		t.Errorf("expected at least 3 items processed, got %d", updatedDS.ItemCount)
	}

	// 2. Test Deduplication Cache: Same file content processed twice
	dsID2 := "ds-csv-102"
	ds2 := &domain.DataSource{
		ID:         dsID2,
		TenantID:   tenantID,
		UploadedBy: "user-1",
		SourceType: domain.SourceTypeCSV,
		Filename:   "orders_duplicate.csv",
		Status:     domain.DataSourceStatusQueued,
		UploadedAt: time.Now().UTC(),
	}
	_ = store.CreateDataSource(ctx, ds2)

	err2 := pipe.ProcessDataSource(ctx, tenantID, dsID2, csvData)
	if err2 != nil {
		t.Fatalf("second processing failed: %v", err2)
	}

	updatedDS2, _ := store.GetDataSource(ctx, tenantID, dsID2)
	if updatedDS2.Status != domain.DataSourceStatusCompleted {
		t.Errorf("expected completed via cache, got %s", updatedDS2.Status)
	}

	// 3. Test Email Parser
	emailData := seed.SampleEmailData()
	dsEmailID := "ds-eml-201"
	_ = store.CreateDataSource(ctx, &domain.DataSource{
		ID:         dsEmailID,
		TenantID:   tenantID,
		UploadedBy: "user-1",
		SourceType: domain.SourceTypeEmailExport,
		Filename:   "invoice.eml",
		Status:     domain.DataSourceStatusQueued,
		UploadedAt: time.Now().UTC(),
	})

	errEmail := pipe.ProcessDataSource(ctx, tenantID, dsEmailID, emailData)
	if errEmail != nil {
		t.Fatalf("email processing failed: %v", errEmail)
	}
}
