package storage

import (
	"context"
	"errors"

	"mistake-backend/internal/domain"

	"github.com/jackc/pgx/v5"
)

func (s *PostgresStore) CreateEntity(ctx context.Context, e *domain.Entity) error {
	q := `INSERT INTO entities (id, tenant_id, entity_type, canonical_name, gstin, status, merged_into_id, created_at, updated_at)
	      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	      ON CONFLICT (id) DO UPDATE SET canonical_name=$4, gstin=$5, status=$6, merged_into_id=$7, updated_at=$9`
	_, err := s.pool.Exec(ctx, q, e.ID, e.TenantID, e.EntityType, e.CanonicalName, e.GSTIN, e.Status, e.MergedIntoID, e.CreatedAt, e.UpdatedAt)
	return err
}

func (s *PostgresStore) GetEntity(ctx context.Context, tenantID, id string) (*domain.Entity, error) {
	q := `SELECT id, tenant_id, entity_type, canonical_name, gstin, status, merged_into_id, created_at, updated_at
	      FROM entities WHERE tenant_id=$1 AND id=$2`
	var e domain.Entity
	err := s.pool.QueryRow(ctx, q, tenantID, id).Scan(&e.ID, &e.TenantID, &e.EntityType, &e.CanonicalName, &e.GSTIN, &e.Status, &e.MergedIntoID, &e.CreatedAt, &e.UpdatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	return &e, err
}

func (s *PostgresStore) GetEntityByCanonical(ctx context.Context, tenantID string, eType domain.EntityType, name string) (*domain.Entity, error) {
	q := `SELECT id, tenant_id, entity_type, canonical_name, gstin, status, merged_into_id, created_at, updated_at
	      FROM entities WHERE tenant_id=$1 AND entity_type=$2 AND LOWER(canonical_name)=LOWER($3)`
	var e domain.Entity
	err := s.pool.QueryRow(ctx, q, tenantID, eType, name).Scan(&e.ID, &e.TenantID, &e.EntityType, &e.CanonicalName, &e.GSTIN, &e.Status, &e.MergedIntoID, &e.CreatedAt, &e.UpdatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	return &e, err
}

func (s *PostgresStore) ListEntities(ctx context.Context, tenantID string, eType *domain.EntityType) ([]*domain.Entity, error) {
	var rows pgx.Rows
	var err error
	if eType != nil {
		q := `SELECT id, tenant_id, entity_type, canonical_name, gstin, status, merged_into_id, created_at, updated_at
		      FROM entities WHERE tenant_id=$1 AND entity_type=$2 ORDER BY canonical_name ASC`
		rows, err = s.pool.Query(ctx, q, tenantID, *eType)
	} else {
		q := `SELECT id, tenant_id, entity_type, canonical_name, gstin, status, merged_into_id, created_at, updated_at
		      FROM entities WHERE tenant_id=$1 ORDER BY canonical_name ASC`
		rows, err = s.pool.Query(ctx, q, tenantID)
	}
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var res []*domain.Entity
	for rows.Next() {
		var e domain.Entity
		if err := rows.Scan(&e.ID, &e.TenantID, &e.EntityType, &e.CanonicalName, &e.GSTIN, &e.Status, &e.MergedIntoID, &e.CreatedAt, &e.UpdatedAt); err != nil {
			return nil, err
		}
		res = append(res, &e)
	}
	return res, nil
}

func (s *PostgresStore) UpdateEntity(ctx context.Context, e *domain.Entity) error {
	return s.CreateEntity(ctx, e)
}

func (s *PostgresStore) CreateAlias(ctx context.Context, a *domain.EntityAlias) error {
	q := `INSERT INTO entity_aliases (id, entity_id, tenant_id, alias_name, source_evidence_id, confidence, created_at)
	      VALUES ($1, $2, $3, $4, $5, $6, $7)`
	_, err := s.pool.Exec(ctx, q, a.ID, a.EntityID, a.TenantID, a.AliasName, a.SourceEvidenceID, a.Confidence, a.CreatedAt)
	return err
}

func (s *PostgresStore) ListAliases(ctx context.Context, tenantID, entityID string) ([]*domain.EntityAlias, error) {
	q := `SELECT id, entity_id, tenant_id, alias_name, source_evidence_id, confidence, created_at
	      FROM entity_aliases WHERE tenant_id=$1 AND entity_id=$2`
	rows, err := s.pool.Query(ctx, q, tenantID, entityID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var res []*domain.EntityAlias
	for rows.Next() {
		var a domain.EntityAlias
		if err := rows.Scan(&a.ID, &a.EntityID, &a.TenantID, &a.AliasName, &a.SourceEvidenceID, &a.Confidence, &a.CreatedAt); err != nil {
			return nil, err
		}
		res = append(res, &a)
	}
	return res, nil
}

func (s *PostgresStore) GetAliasByName(ctx context.Context, tenantID string, name string) (*domain.EntityAlias, error) {
	q := `SELECT id, entity_id, tenant_id, alias_name, source_evidence_id, confidence, created_at
	      FROM entity_aliases WHERE tenant_id=$1 AND LOWER(alias_name)=LOWER($2)`
	var a domain.EntityAlias
	err := s.pool.QueryRow(ctx, q, tenantID, name).Scan(&a.ID, &a.EntityID, &a.TenantID, &a.AliasName, &a.SourceEvidenceID, &a.Confidence, &a.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	return &a, err
}

func (s *PostgresStore) AddToReviewQueue(ctx context.Context, item *domain.ReviewQueueItem) error {
	q := `INSERT INTO review_queue (id, tenant_id, raw_name, entity_type, matched_entity_id, matched_canonical, confidence, source_evidence_id, created_at)
	      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`
	_, err := s.pool.Exec(ctx, q, item.ID, item.TenantID, item.RawName, item.EntityType, item.MatchedEntityID, item.MatchedCanonical, item.Confidence, item.SourceEvidenceID, item.CreatedAt)
	return err
}

func (s *PostgresStore) ListReviewQueue(ctx context.Context, tenantID string) ([]*domain.ReviewQueueItem, error) {
	q := `SELECT id, tenant_id, raw_name, entity_type, matched_entity_id, matched_canonical, confidence, source_evidence_id, created_at
	      FROM review_queue WHERE tenant_id=$1 ORDER BY created_at DESC`
	rows, err := s.pool.Query(ctx, q, tenantID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var res []*domain.ReviewQueueItem
	for rows.Next() {
		var item domain.ReviewQueueItem
		if err := rows.Scan(&item.ID, &item.TenantID, &item.RawName, &item.EntityType, &item.MatchedEntityID, &item.MatchedCanonical, &item.Confidence, &item.SourceEvidenceID, &item.CreatedAt); err != nil {
			return nil, err
		}
		res = append(res, &item)
	}
	return res, nil
}

func (s *PostgresStore) RemoveFromReviewQueue(ctx context.Context, tenantID, id string) error {
	q := `DELETE FROM review_queue WHERE tenant_id=$1 AND id=$2`
	_, err := s.pool.Exec(ctx, q, tenantID, id)
	return err
}

func (s *PostgresStore) MergeEntities(ctx context.Context, tenantID, survivorID, targetID string) error {
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	if _, err := tx.Exec(ctx, `UPDATE entity_aliases SET entity_id=$1 WHERE tenant_id=$2 AND entity_id=$3`, survivorID, tenantID, targetID); err != nil {
		return err
	}
	if _, err := tx.Exec(ctx, `DELETE FROM entities WHERE tenant_id=$1 AND id=$2`, tenantID, targetID); err != nil {
		return err
	}

	return tx.Commit(ctx)
}
