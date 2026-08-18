package pipeline

import (
	"bytes"
	"context"
	"fmt"
	"log/slog"
	"mistake-backend/internal/detection"
	"mistake-backend/internal/domain"
	"mistake-backend/internal/resolver"
	"mistake-backend/internal/storage"
	"time"
)

type Pipeline struct {
	store     storage.Store
	resolver  *resolver.EntityResolver
	detection *detection.DetectionEngine
}

func NewPipeline(store storage.Store) *Pipeline {
	return &Pipeline{
		store:     store,
		resolver:  resolver.NewEntityResolver(store),
		detection: detection.NewDetectionEngine(store),
	}
}

// ProcessDataSource orchestrates the 5-state async progression.
func (p *Pipeline) ProcessDataSource(ctx context.Context, tenantID, dataSourceID string, fileContent []byte) error {
	ds, err := p.store.GetDataSource(ctx, tenantID, dataSourceID)
	if err != nil {
		return err
	}

	// 1. Queued -> Processing
	ds.Status = domain.DataSourceStatusProcessing
	if err := p.store.UpdateDataSource(ctx, ds); err != nil {
		slog.Error("Failed to update data source", "error", err)
		return err
	}

	fileHash, _ := ComputeFileHash(bytes.NewReader(fileContent))
	ds.FileHash = fileHash

	// 2. Check Deduplication Cache
	cacheEvidence, _ := p.store.GetEvidenceByHash(ctx, tenantID, fileHash, CurrentExtractionVersion, CurrentModelVersion)
	if cacheEvidence != nil {
		ds.Status = domain.DataSourceStatusCompleted
		now := time.Now().UTC()
		ds.ProcessedAt = &now
		if err := p.store.UpdateDataSource(ctx, ds); err != nil {
			slog.Error("Failed to update data source", "error", err)
			return err
		}
		return nil
	}

	// 3. Processing -> Extracting
	ds.Status = domain.DataSourceStatusExtracting
	if err := p.store.UpdateDataSource(ctx, ds); err != nil {
		slog.Error("Failed to update data source", "error", err)
		return err
	}

	facts, err := p.extractFacts(ds.SourceType, fileContent)
	if err != nil {
		ds.Status = domain.DataSourceStatusFailed
		ds.ErrorMessage = fmt.Sprintf("Extraction failed: %v", err)
		if uErr := p.store.UpdateDataSource(ctx, ds); uErr != nil {
			slog.Error("Failed to update data source on error", "error", uErr)
		}
		return err
	}

	docID := fmt.Sprintf("doc-%s", ds.ID)
	doc := &domain.Document{
		ID: docID, TenantID: tenantID, DataSourceID: ds.ID,
		DocumentType: domain.DocTypeOrder, PageCount: 1,
		ContentHash: fileHash, CreatedAt: time.Now().UTC(),
	}
	if err := p.store.CreateDocument(ctx, doc); err != nil {
		ds.Status = domain.DataSourceStatusFailed
		ds.ErrorMessage = fmt.Sprintf("Document creation failed: %v", err)
		_ = p.store.UpdateDataSource(ctx, ds)
		slog.Error("Failed to create document", "error", err)
		return err
	}

	for _, fact := range facts {
		select {
		case <-ctx.Done():
			return ctx.Err()
		default:
		}
		if err := p.saveFact(ctx, tenantID, docID, fileHash, fact); err != nil {
			ds.Status = domain.DataSourceStatusFailed
			ds.ErrorMessage = fmt.Sprintf("Failed to save fact: %v", err)
			_ = p.store.UpdateDataSource(ctx, ds)
			slog.Error("Failed to save fact", "error", err)
			return err
		}
	}

	// 4. Extracting -> Analyzing
	ds.Status = domain.DataSourceStatusAnalyzing
	ds.ItemCount = len(facts)
	if err := p.store.UpdateDataSource(ctx, ds); err != nil {
		slog.Error("Failed to update data source", "error", err)
		return err
	}

	_, _ = p.detection.RunAll(ctx, tenantID)

	// 5. Analyzing -> Completed
	now := time.Now().UTC()
	ds.Status = domain.DataSourceStatusCompleted
	ds.ProcessedAt = &now
	if err := p.store.UpdateDataSource(ctx, ds); err != nil {
		slog.Error("Failed to update data source", "error", err)
		return err
	}
	return nil
}

func (p *Pipeline) extractFacts(st domain.SourceType, content []byte) ([]*domain.ExtractedFact, error) {
	r := bytes.NewReader(content)
	switch st {
	case domain.SourceTypeCSV:
		return NewCSVParser().Parse(r, ',')
	case domain.SourceTypeXLSX:
		return NewXLSXParser().Parse(r)
	case domain.SourceTypePDF:
		return NewPDFParser().Parse(r)
	case domain.SourceTypeEmailExport:
		return NewEmailParser().Parse(r)
	default:
		return NewCSVParser().Parse(r, ',')
	}
}

func (p *Pipeline) saveFact(ctx context.Context, tenantID, docID, fileHash string, fact *domain.ExtractedFact) error {
	now := time.Now().UTC()
	evID := fmt.Sprintf("ev-%d", time.Now().UnixNano())
	ev := &domain.Evidence{
		ID: evID, TenantID: tenantID, DocumentID: docID,
		SourceType: fact.FactType, SourceLocation: fact.Location,
		ExtractedContent: fact.Data, DocumentHash: fileHash,
		ExtractionVersion: CurrentExtractionVersion, ModelVersion: CurrentModelVersion,
		Confidence: fact.Confidence, CreatedAt: now,
	}
	if err := p.store.CreateEvidence(ctx, ev); err != nil {
		slog.Error("Failed to create evidence", "error", err)
		return err
	}

	var entityID string
	if fact.EntityName != "" {
		res, err := p.resolver.Resolve(ctx, tenantID, domain.EntityType(fact.EntityType), fact.EntityName, evID)
		if err == nil && res != nil {
			entityID = res.EntityID
		}
	}

	return p.ingestBusinessObject(ctx, tenantID, fact, entityID, evID, now)
}
