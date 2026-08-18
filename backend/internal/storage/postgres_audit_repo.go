package storage

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"mistake-backend/internal/domain"

	"github.com/jackc/pgx/v5"
)

func (s *PostgresStore) CreateEvent(ctx context.Context, ev *domain.Event) error {
	pJSON, _ := json.Marshal(ev.Payload)
	q := `INSERT INTO events (id, tenant_id, entity_id, event_type, payload_json, occurred_at, created_at)
	      VALUES ($1, $2, $3, $4, $5, $6, $7)`
	_, err := s.pool.Exec(ctx, q, ev.ID, ev.TenantID, ev.EntityID, ev.EventType, pJSON, ev.OccurredAt, ev.CreatedAt)
	return err
}

func (s *PostgresStore) ListEvents(ctx context.Context, tenantID string, filter EventFilter) ([]*domain.Event, error) {
	q := `SELECT id, tenant_id, entity_id, event_type, payload_json, occurred_at, created_at FROM events WHERE tenant_id=$1`
	args := []any{tenantID}
	argIdx := 2
	if filter.EntityID != "" {
		q += fmt.Sprintf(" AND entity_id=$%d", argIdx)
		args = append(args, filter.EntityID)
		argIdx++
	}
	if filter.EventType != "" {
		q += fmt.Sprintf(" AND event_type=$%d", argIdx)
		args = append(args, filter.EventType)
		argIdx++
	}
	q += " ORDER BY occurred_at DESC"
	if filter.Limit > 0 {
		q += fmt.Sprintf(" LIMIT %d", filter.Limit)
	}

	rows, err := s.pool.Query(ctx, q, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var res []*domain.Event
	for rows.Next() {
		var ev domain.Event
		var pJSON []byte
		if err := rows.Scan(&ev.ID, &ev.TenantID, &ev.EntityID, &ev.EventType, &pJSON, &ev.OccurredAt, &ev.CreatedAt); err != nil {
			return nil, err
		}
		if len(pJSON) > 0 {
			_ = json.Unmarshal(pJSON, &ev.Payload)
		}
		res = append(res, &ev)
	}
	return res, nil
}

func (s *PostgresStore) GetEntityTimeline(ctx context.Context, tenantID, entityID string) ([]*domain.Event, error) {
	return s.ListEvents(ctx, tenantID, EventFilter{EntityID: entityID})
}

func (s *PostgresStore) CreateAuditLog(ctx context.Context, log *domain.AuditLog) error {
	beforeJSON, _ := json.Marshal(log.Before)
	afterJSON, _ := json.Marshal(log.After)
	q := `INSERT INTO audit_logs (id, tenant_id, actor_user_id, actor_email, action, resource_type, resource_id, before_json, after_json, ip_address, created_at)
	      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`
	_, err := s.pool.Exec(ctx, q, log.ID, log.TenantID, log.ActorUserID, log.ActorEmail, log.Action, log.ResourceType, log.ResourceID, beforeJSON, afterJSON, log.IPAddress, log.CreatedAt)
	return err
}

func (s *PostgresStore) ListAuditLogs(ctx context.Context, tenantID string, filter AuditFilter) ([]*domain.AuditLog, error) {
	q := `SELECT id, tenant_id, actor_user_id, actor_email, action, resource_type, resource_id, before_json, after_json, ip_address, created_at FROM audit_logs WHERE tenant_id=$1`
	args := []any{tenantID}
	argIdx := 2
	if filter.ActorUserID != "" {
		q += fmt.Sprintf(" AND actor_user_id=$%d", argIdx)
		args = append(args, filter.ActorUserID)
		argIdx++
	}
	if filter.Action != "" {
		q += fmt.Sprintf(" AND action=$%d", argIdx)
		args = append(args, filter.Action)
		argIdx++
	}
	q += " ORDER BY created_at DESC"
	if filter.Limit > 0 {
		q += fmt.Sprintf(" LIMIT %d", filter.Limit)
	}

	rows, err := s.pool.Query(ctx, q, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var res []*domain.AuditLog
	for rows.Next() {
		var l domain.AuditLog
		var beforeJSON, afterJSON []byte
		if err := rows.Scan(&l.ID, &l.TenantID, &l.ActorUserID, &l.ActorEmail, &l.Action, &l.ResourceType, &l.ResourceID, &beforeJSON, &afterJSON, &l.IPAddress, &l.CreatedAt); err != nil {
			return nil, err
		}
		if len(beforeJSON) > 0 {
			_ = json.Unmarshal(beforeJSON, &l.Before)
		}
		if len(afterJSON) > 0 {
			_ = json.Unmarshal(afterJSON, &l.After)
		}
		res = append(res, &l)
	}
	return res, nil
}

func (s *PostgresStore) GetRetentionPolicy(ctx context.Context, tenantID string) (*domain.RetentionPolicy, error) {
	q := `SELECT id, tenant_id, resource_type, retention_period, retention_days, auto_purge, created_at, updated_at FROM retention_policies WHERE tenant_id=$1`
	var p domain.RetentionPolicy
	err := s.pool.QueryRow(ctx, q, tenantID).Scan(&p.ID, &p.TenantID, &p.ResourceType, &p.RetentionPeriod, &p.RetentionDays, &p.AutoPurge, &p.CreatedAt, &p.UpdatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		now := time.Now().UTC()
		return &domain.RetentionPolicy{ID: "ret-" + tenantID, TenantID: tenantID, ResourceType: "all", RetentionPeriod: "7y", RetentionDays: 2555, AutoPurge: false, CreatedAt: now, UpdatedAt: now}, nil
	}
	return &p, err
}

func (s *PostgresStore) UpdateRetentionPolicy(ctx context.Context, p *domain.RetentionPolicy) error {
	q := `INSERT INTO retention_policies (id, tenant_id, resource_type, retention_period, retention_days, auto_purge, created_at, updated_at)
	      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	      ON CONFLICT (tenant_id) DO UPDATE SET resource_type=$3, retention_period=$4, retention_days=$5, auto_purge=$6, updated_at=$8`
	_, err := s.pool.Exec(ctx, q, p.ID, p.TenantID, p.ResourceType, p.RetentionPeriod, p.RetentionDays, p.AutoPurge, p.CreatedAt, p.UpdatedAt)
	return err
}

func (s *PostgresStore) PurgeTenantData(ctx context.Context, tenantID string) error {
	_, err := s.pool.Exec(ctx, `DELETE FROM tenants WHERE id=$1`, tenantID)
	return err
}
