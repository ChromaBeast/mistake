package storage

import (
	"context"
	"encoding/json"
	"errors"

	"mistake-backend/internal/domain"

	"github.com/jackc/pgx/v5"
)

func (s *PostgresStore) CreateDataSource(ctx context.Context, ds *domain.DataSource) error {
	q := `INSERT INTO data_sources (id, tenant_id, uploaded_by, source_type, filename, storage_key, file_hash, status, error_message, item_count, uploaded_at, processed_at)
	      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
	      ON CONFLICT (id) DO UPDATE SET status=$8, error_message=$9, item_count=$10, processed_at=$12`
	_, err := s.pool.Exec(ctx, q, ds.ID, ds.TenantID, ds.UploadedBy, ds.SourceType, ds.Filename, ds.StorageKey, ds.FileHash, ds.Status, ds.ErrorMessage, ds.ItemCount, ds.UploadedAt, ds.ProcessedAt)
	return err
}

func (s *PostgresStore) GetDataSource(ctx context.Context, tenantID, id string) (*domain.DataSource, error) {
	q := `SELECT id, tenant_id, uploaded_by, source_type, filename, storage_key, file_hash, status, error_message, item_count, uploaded_at, processed_at
	      FROM data_sources WHERE tenant_id=$1 AND id=$2`
	var ds domain.DataSource
	err := s.pool.QueryRow(ctx, q, tenantID, id).Scan(&ds.ID, &ds.TenantID, &ds.UploadedBy, &ds.SourceType, &ds.Filename, &ds.StorageKey, &ds.FileHash, &ds.Status, &ds.ErrorMessage, &ds.ItemCount, &ds.UploadedAt, &ds.ProcessedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	return &ds, err
}

func (s *PostgresStore) ListDataSources(ctx context.Context, tenantID string) ([]*domain.DataSource, error) {
	q := `SELECT id, tenant_id, uploaded_by, source_type, filename, storage_key, file_hash, status, error_message, item_count, uploaded_at, processed_at
	      FROM data_sources WHERE tenant_id=$1 ORDER BY uploaded_at DESC`
	rows, err := s.pool.Query(ctx, q, tenantID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var res []*domain.DataSource
	for rows.Next() {
		var ds domain.DataSource
		if err := rows.Scan(&ds.ID, &ds.TenantID, &ds.UploadedBy, &ds.SourceType, &ds.Filename, &ds.StorageKey, &ds.FileHash, &ds.Status, &ds.ErrorMessage, &ds.ItemCount, &ds.UploadedAt, &ds.ProcessedAt); err != nil {
			return nil, err
		}
		res = append(res, &ds)
	}
	return res, nil
}

func (s *PostgresStore) UpdateDataSource(ctx context.Context, ds *domain.DataSource) error {
	return s.CreateDataSource(ctx, ds)
}

func (s *PostgresStore) CreateDocument(ctx context.Context, doc *domain.Document) error {
	q := `INSERT INTO documents (id, tenant_id, data_source_id, document_type, page_count, content_hash, created_at)
	      VALUES ($1, $2, $3, $4, $5, $6, $7)
	      ON CONFLICT (id) DO UPDATE SET document_type=$4, content_hash=$6`
	_, err := s.pool.Exec(ctx, q, doc.ID, doc.TenantID, doc.DataSourceID, doc.DocumentType, doc.PageCount, doc.ContentHash, doc.CreatedAt)
	return err
}

func (s *PostgresStore) GetDocument(ctx context.Context, tenantID, id string) (*domain.Document, error) {
	q := `SELECT id, tenant_id, data_source_id, document_type, page_count, content_hash, created_at
	      FROM documents WHERE tenant_id=$1 AND id=$2`
	var doc domain.Document
	err := s.pool.QueryRow(ctx, q, tenantID, id).Scan(&doc.ID, &doc.TenantID, &doc.DataSourceID, &doc.DocumentType, &doc.PageCount, &doc.ContentHash, &doc.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	return &doc, err
}

func (s *PostgresStore) ListDocuments(ctx context.Context, tenantID, dsID string) ([]*domain.Document, error) {
	q := `SELECT id, tenant_id, data_source_id, document_type, page_count, content_hash, created_at
	      FROM documents WHERE tenant_id=$1 AND data_source_id=$2`
	rows, err := s.pool.Query(ctx, q, tenantID, dsID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var res []*domain.Document
	for rows.Next() {
		var doc domain.Document
		if err := rows.Scan(&doc.ID, &doc.TenantID, &doc.DataSourceID, &doc.DocumentType, &doc.PageCount, &doc.ContentHash, &doc.CreatedAt); err != nil {
			return nil, err
		}
		res = append(res, &doc)
	}
	return res, nil
}

func (s *PostgresStore) CreateEvidence(ctx context.Context, ev *domain.Evidence) error {
	contentJSON, _ := json.Marshal(ev.ExtractedContent)
	q := `INSERT INTO evidence (id, tenant_id, document_id, source_type, source_location, source_timestamp, original_content_ref, extracted_content, document_hash, extraction_version, model_version, confidence, created_at)
	      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
	      ON CONFLICT (id) DO UPDATE SET confidence=$12, extracted_content=$8`
	_, err := s.pool.Exec(ctx, q, ev.ID, ev.TenantID, ev.DocumentID, ev.SourceType, ev.SourceLocation, ev.SourceTimestamp, ev.OriginalContentRef, contentJSON, ev.DocumentHash, ev.ExtractionVersion, ev.ModelVersion, ev.Confidence, ev.CreatedAt)
	return err
}

func (s *PostgresStore) GetEvidence(ctx context.Context, tenantID, id string) (*domain.Evidence, error) {
	q := `SELECT id, tenant_id, document_id, source_type, source_location, source_timestamp, original_content_ref, extracted_content, document_hash, extraction_version, model_version, confidence, created_at
	      FROM evidence WHERE tenant_id=$1 AND id=$2`
	var ev domain.Evidence
	var contentJSON []byte
	err := s.pool.QueryRow(ctx, q, tenantID, id).Scan(&ev.ID, &ev.TenantID, &ev.DocumentID, &ev.SourceType, &ev.SourceLocation, &ev.SourceTimestamp, &ev.OriginalContentRef, &contentJSON, &ev.DocumentHash, &ev.ExtractionVersion, &ev.ModelVersion, &ev.Confidence, &ev.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	if len(contentJSON) > 0 {
		_ = json.Unmarshal(contentJSON, &ev.ExtractedContent)
	}
	return &ev, err
}

func (s *PostgresStore) ListEvidenceByDocument(ctx context.Context, tenantID, docID string) ([]*domain.Evidence, error) {
	q := `SELECT id, tenant_id, document_id, source_type, source_location, source_timestamp, original_content_ref, extracted_content, document_hash, extraction_version, model_version, confidence, created_at
	      FROM evidence WHERE tenant_id=$1 AND document_id=$2`
	rows, err := s.pool.Query(ctx, q, tenantID, docID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var res []*domain.Evidence
	for rows.Next() {
		var ev domain.Evidence
		var contentJSON []byte
		if err := rows.Scan(&ev.ID, &ev.TenantID, &ev.DocumentID, &ev.SourceType, &ev.SourceLocation, &ev.SourceTimestamp, &ev.OriginalContentRef, &contentJSON, &ev.DocumentHash, &ev.ExtractionVersion, &ev.ModelVersion, &ev.Confidence, &ev.CreatedAt); err != nil {
			return nil, err
		}
		if len(contentJSON) > 0 {
			_ = json.Unmarshal(contentJSON, &ev.ExtractedContent)
		}
		res = append(res, &ev)
	}
	return res, nil
}

func (s *PostgresStore) GetEvidenceByHash(ctx context.Context, tenantID, docHash, extVer, modelVer string) (*domain.Evidence, error) {
	q := `SELECT id, tenant_id, document_id, source_type, source_location, source_timestamp, original_content_ref, extracted_content, document_hash, extraction_version, model_version, confidence, created_at
	      FROM evidence WHERE tenant_id=$1 AND document_hash=$2 AND extraction_version=$3 AND model_version=$4`
	var ev domain.Evidence
	var contentJSON []byte
	err := s.pool.QueryRow(ctx, q, tenantID, docHash, extVer, modelVer).Scan(&ev.ID, &ev.TenantID, &ev.DocumentID, &ev.SourceType, &ev.SourceLocation, &ev.SourceTimestamp, &ev.OriginalContentRef, &contentJSON, &ev.DocumentHash, &ev.ExtractionVersion, &ev.ModelVersion, &ev.Confidence, &ev.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	if len(contentJSON) > 0 {
		_ = json.Unmarshal(contentJSON, &ev.ExtractedContent)
	}
	return &ev, err
}

