package storage

import (
	"context"
	"errors"
	"mistake-backend/internal/domain"
	"time"

	"github.com/jackc/pgx/v5"
)

func (s *PostgresStore) CreateFeedback(ctx context.Context, f *domain.MistakeFeedback) error {
	if f.CreatedAt.IsZero() {
		f.CreatedAt = time.Now().UTC()
	}
	q := `INSERT INTO mistake_feedback (id, tenant_id, mistake_id, user_id, feedback_type, reason, created_at)
	      VALUES ($1, $2, $3, $4, $5, $6, $7)
	      ON CONFLICT (id) DO UPDATE SET feedback_type=$5, reason=$6`
	_, err := s.pool.Exec(ctx, q, f.ID, f.TenantID, f.MistakeID, f.UserID, f.FeedbackType, f.Reason, f.CreatedAt)
	return err
}

func (s *PostgresStore) GetFeedbackByMistake(ctx context.Context, tenantID, mistakeID string) (*domain.MistakeFeedback, error) {
	q := `SELECT id, tenant_id, mistake_id, user_id, feedback_type, reason, created_at
	      FROM mistake_feedback WHERE tenant_id=$1 AND mistake_id=$2 LIMIT 1`
	var f domain.MistakeFeedback
	err := s.pool.QueryRow(ctx, q, tenantID, mistakeID).Scan(&f.ID, &f.TenantID, &f.MistakeID, &f.UserID, &f.FeedbackType, &f.Reason, &f.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	return &f, err
}

func (s *PostgresStore) GetFeedbackMetrics(ctx context.Context, tenantID string) (*domain.FeedbackMetrics, error) {
	q := `SELECT 
	        COUNT(*) as total,
	        COUNT(*) FILTER (WHERE feedback_type = 'accurate') as accurate_cnt,
	        COUNT(*) FILTER (WHERE feedback_type = 'not_accurate') as not_accurate_cnt,
	        COUNT(*) FILTER (WHERE feedback_type = 'not_sure') as not_sure_cnt
	      FROM mistake_feedback WHERE tenant_id=$1`
	var total, accurate, notAccurate, notSure int
	err := s.pool.QueryRow(ctx, q, tenantID).Scan(&total, &accurate, &notAccurate, &notSure)
	if err != nil {
		return nil, err
	}
	metrics := &domain.FeedbackMetrics{
		TenantID:         tenantID,
		TotalReviewed:    total,
		AccurateCount:    accurate,
		NotAccurateCount: notAccurate,
		NotSureCount:     notSure,
	}
	if total > 0 {
		metrics.FalsePositiveRate = float64(notAccurate) / float64(total)
		metrics.AccuracyRate = float64(accurate) / float64(total)
	}
	return metrics, nil
}

func (s *PostgresStore) RecordAhaEvent(ctx context.Context, ev *domain.AhaEvent) error {
	if ev.CreatedAt.IsZero() {
		ev.CreatedAt = time.Now().UTC()
	}
	q := `INSERT INTO aha_events (id, tenant_id, user_id, event_type, duration_ms, metadata, created_at)
	      VALUES ($1, $2, $3, $4, $5, $6, $7)`
	_, err := s.pool.Exec(ctx, q, ev.ID, ev.TenantID, ev.UserID, ev.EventType, ev.DurationMs, ev.Metadata, ev.CreatedAt)
	return err
}

func (s *PostgresStore) GetAhaFunnelSummary(ctx context.Context, tenantID string) (*domain.AhaFunnelSummary, error) {
	q := `SELECT 
	        COALESCE(AVG(duration_ms) FILTER (WHERE event_type = 'time_to_first_upload'), 0) / 1000.0,
	        COALESCE(AVG(duration_ms) FILTER (WHERE event_type = 'time_to_first_finding'), 0) / 1000.0,
	        COALESCE(AVG(duration_ms) FILTER (WHERE event_type = 'time_to_first_verify'), 0) / 1000.0
	      FROM aha_events WHERE tenant_id=$1`
	var uploadSec, findingSec, verifySec float64
	err := s.pool.QueryRow(ctx, q, tenantID).Scan(&uploadSec, &findingSec, &verifySec)
	if err != nil {
		return nil, err
	}
	summary := &domain.AhaFunnelSummary{
		TenantID:            tenantID,
		AvgTimeToUploadSec:  uploadSec,
		AvgTimeToFindingSec: findingSec,
		AvgTimeToVerifySec:  verifySec,
	}
	return summary, nil
}

func (s *PostgresStore) RecordPilotAgreement(ctx context.Context, pa *domain.PilotAgreement) error {
	if pa.AcceptedAt.IsZero() {
		pa.AcceptedAt = time.Now().UTC()
	}
	q := `INSERT INTO pilot_agreements (id, tenant_id, user_id, signatory_name, signatory_email, agreement_version, status, retention_days, accepted_at, ip_address)
	      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	      ON CONFLICT (tenant_id) DO UPDATE SET status=$7, accepted_at=$9`
	_, err := s.pool.Exec(ctx, q, pa.ID, pa.TenantID, pa.UserID, pa.SignatoryName, pa.SignatoryEmail, pa.AgreementVer, pa.Status, pa.RetentionDays, pa.AcceptedAt, pa.IPAddress)
	return err
}

func (s *PostgresStore) GetPilotAgreement(ctx context.Context, tenantID string) (*domain.PilotAgreement, error) {
	q := `SELECT id, tenant_id, user_id, signatory_name, signatory_email, agreement_version, status, retention_days, accepted_at, ip_address
	      FROM pilot_agreements WHERE tenant_id=$1 LIMIT 1`
	var pa domain.PilotAgreement
	err := s.pool.QueryRow(ctx, q, tenantID).Scan(&pa.ID, &pa.TenantID, &pa.UserID, &pa.SignatoryName, &pa.SignatoryEmail, &pa.AgreementVer, &pa.Status, &pa.RetentionDays, &pa.AcceptedAt, &pa.IPAddress)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	return &pa, err
}
