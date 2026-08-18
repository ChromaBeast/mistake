package storage

import (
	"context"
	"fmt"
	"mistake-backend/internal/domain"
)

func (s *MemoryStore) CreateDataSource(ctx context.Context, ds *domain.DataSource) error {
	if err := verifyTenant(ctx, ds.TenantID); err != nil {
		return err
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	s.dataSources[ds.ID] = ds
	return nil
}

func (s *MemoryStore) GetDataSource(ctx context.Context, tenantID, id string) (*domain.DataSource, error) {
	if err := verifyTenant(ctx, tenantID); err != nil {
		return nil, err
	}
	s.mu.RLock()
	defer s.mu.RUnlock()
	ds, ok := s.dataSources[id]
	if !ok || ds.TenantID != tenantID {
		return nil, ErrNotFound
	}
	cp := *ds
	return &cp, nil
}

func (s *MemoryStore) ListDataSources(ctx context.Context, tenantID string) ([]*domain.DataSource, error) {
	if err := verifyTenant(ctx, tenantID); err != nil {
		return nil, err
	}
	s.mu.RLock()
	defer s.mu.RUnlock()
	var res []*domain.DataSource
	for _, ds := range s.dataSources {
		if ds.TenantID == tenantID {
			res = append(res, ds)
		}
	}
	return res, nil
}

func (s *MemoryStore) UpdateDataSource(ctx context.Context, ds *domain.DataSource) error {
	if err := verifyTenant(ctx, ds.TenantID); err != nil {
		return err
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	if _, ok := s.dataSources[ds.ID]; !ok {
		return ErrNotFound
	}
	s.dataSources[ds.ID] = ds
	return nil
}

func (s *MemoryStore) CreateDocument(ctx context.Context, doc *domain.Document) error {
	if err := verifyTenant(ctx, doc.TenantID); err != nil {
		return err
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	s.documents[doc.ID] = doc
	return nil
}

func (s *MemoryStore) GetDocument(ctx context.Context, tenantID, id string) (*domain.Document, error) {
	if err := verifyTenant(ctx, tenantID); err != nil {
		return nil, err
	}
	s.mu.RLock()
	defer s.mu.RUnlock()
	doc, ok := s.documents[id]
	if !ok || doc.TenantID != tenantID {
		return nil, ErrNotFound
	}
	cp := *doc
	return &cp, nil
}

func (s *MemoryStore) ListDocuments(ctx context.Context, tenantID, dsID string) ([]*domain.Document, error) {
	if err := verifyTenant(ctx, tenantID); err != nil {
		return nil, err
	}
	s.mu.RLock()
	defer s.mu.RUnlock()
	var res []*domain.Document
	for _, doc := range s.documents {
		if doc.TenantID == tenantID && (dsID == "" || doc.DataSourceID == dsID) {
			res = append(res, doc)
		}
	}
	return res, nil
}

func (s *MemoryStore) CreateEvidence(ctx context.Context, ev *domain.Evidence) error {
	if err := verifyTenant(ctx, ev.TenantID); err != nil {
		return err
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	s.evidence[ev.ID] = ev
	cacheKey := fmt.Sprintf("%s:%s:%s:%s", ev.TenantID, ev.DocumentHash, ev.ExtractionVersion, ev.ModelVersion)
	s.evidenceByHash[cacheKey] = ev
	return nil
}

func (s *MemoryStore) GetEvidence(ctx context.Context, tenantID, id string) (*domain.Evidence, error) {
	if err := verifyTenant(ctx, tenantID); err != nil {
		return nil, err
	}
	s.mu.RLock()
	defer s.mu.RUnlock()
	ev, ok := s.evidence[id]
	if !ok || ev.TenantID != tenantID {
		return nil, ErrNotFound
	}
	cp := *ev
	return &cp, nil
}

func (s *MemoryStore) ListEvidenceByDocument(ctx context.Context, tenantID, docID string) ([]*domain.Evidence, error) {
	if err := verifyTenant(ctx, tenantID); err != nil {
		return nil, err
	}
	s.mu.RLock()
	defer s.mu.RUnlock()
	var res []*domain.Evidence
	for _, ev := range s.evidence {
		if ev.TenantID == tenantID && (docID == "" || ev.DocumentID == docID) {
			res = append(res, ev)
		}
	}
	return res, nil
}

func (s *MemoryStore) GetEvidenceByHash(ctx context.Context, tenantID, docHash, extVer, modelVer string) (*domain.Evidence, error) {
	if err := verifyTenant(ctx, tenantID); err != nil {
		return nil, err
	}
	s.mu.RLock()
	defer s.mu.RUnlock()
	cacheKey := fmt.Sprintf("%s:%s:%s:%s", tenantID, docHash, extVer, modelVer)
	ev, ok := s.evidenceByHash[cacheKey]
	if !ok {
		return nil, ErrNotFound
	}
	cp := *ev
	return &cp, nil
}
