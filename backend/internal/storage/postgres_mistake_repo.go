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

func (s *PostgresStore) CreateMistake(ctx context.Context, m *domain.Mistake) error {
	evIDsJSON, _ := json.Marshal(m.EvidenceIDs)
	q := `INSERT INTO mistakes (id, tenant_id, mistake_type, severity, status, affected_entity_type, affected_entity_id, affected_entity_name, reference_number, financial_impact_minor, currency, confidence, explanation, recommended_action, assigned_to, assigned_to_name, evidence_ids, detected_at, resolved_at, created_at, updated_at)
	      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
	      ON CONFLICT (id) DO UPDATE SET severity=$4, status=$5, financial_impact_minor=$10, confidence=$12, explanation=$13, recommended_action=$14, assigned_to=$15, assigned_to_name=$16, resolved_at=$19, updated_at=$21`
	_, err := s.pool.Exec(ctx, q, m.ID, m.TenantID, m.MistakeType, m.Severity, m.Status, m.AffectedEntityType, m.AffectedEntityID, m.AffectedEntityName, m.ReferenceNumber, m.FinancialImpactMinor, m.Currency, m.Confidence, m.Explanation, m.RecommendedAction, m.AssignedTo, m.AssignedToName, evIDsJSON, m.DetectedAt, m.ResolvedAt, m.CreatedAt, m.UpdatedAt)
	return err
}

func (s *PostgresStore) GetMistake(ctx context.Context, tenantID, id string) (*domain.Mistake, error) {
	q := `SELECT id, tenant_id, mistake_type, severity, status, affected_entity_type, affected_entity_id, affected_entity_name, reference_number, financial_impact_minor, currency, confidence, explanation, recommended_action, assigned_to, assigned_to_name, evidence_ids, detected_at, resolved_at, created_at, updated_at
	      FROM mistakes WHERE tenant_id=$1 AND id=$2`
	var m domain.Mistake
	var evIDsJSON []byte
	err := s.pool.QueryRow(ctx, q, tenantID, id).Scan(&m.ID, &m.TenantID, &m.MistakeType, &m.Severity, &m.Status, &m.AffectedEntityType, &m.AffectedEntityID, &m.AffectedEntityName, &m.ReferenceNumber, &m.FinancialImpactMinor, &m.Currency, &m.Confidence, &m.Explanation, &m.RecommendedAction, &m.AssignedTo, &m.AssignedToName, &evIDsJSON, &m.DetectedAt, &m.ResolvedAt, &m.CreatedAt, &m.UpdatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	if len(evIDsJSON) > 0 {
		_ = json.Unmarshal(evIDsJSON, &m.EvidenceIDs)
	}
	return &m, err
}

func (s *PostgresStore) ListMistakes(ctx context.Context, tenantID string, filter MistakeFilter) ([]*domain.Mistake, error) {
	q := `SELECT id, tenant_id, mistake_type, severity, status, affected_entity_type, affected_entity_id, affected_entity_name, reference_number, financial_impact_minor, currency, confidence, explanation, recommended_action, assigned_to, assigned_to_name, evidence_ids, detected_at, resolved_at, created_at, updated_at
	      FROM mistakes WHERE tenant_id=$1`
	args := []any{tenantID}
	argIdx := 2

	if filter.Severity != "" {
		q += fmt.Sprintf(" AND severity=$%d", argIdx)
		args = append(args, filter.Severity)
		argIdx++
	}
	if filter.Status != "" {
		q += fmt.Sprintf(" AND status=$%d", argIdx)
		args = append(args, filter.Status)
		argIdx++
	}
	if filter.MistakeType != "" {
		q += fmt.Sprintf(" AND mistake_type=$%d", argIdx)
		args = append(args, filter.MistakeType)
		argIdx++
	}
	if filter.AssignedTo != "" {
		q += fmt.Sprintf(" AND assigned_to=$%d", argIdx)
		args = append(args, filter.AssignedTo)
		argIdx++
	}
	q += " ORDER BY detected_at DESC"
	if filter.Limit > 0 {
		q += fmt.Sprintf(" LIMIT %d", filter.Limit)
	}

	rows, err := s.pool.Query(ctx, q, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var res []*domain.Mistake
	for rows.Next() {
		var m domain.Mistake
		var evIDsJSON []byte
		if err := rows.Scan(&m.ID, &m.TenantID, &m.MistakeType, &m.Severity, &m.Status, &m.AffectedEntityType, &m.AffectedEntityID, &m.AffectedEntityName, &m.ReferenceNumber, &m.FinancialImpactMinor, &m.Currency, &m.Confidence, &m.Explanation, &m.RecommendedAction, &m.AssignedTo, &m.AssignedToName, &evIDsJSON, &m.DetectedAt, &m.ResolvedAt, &m.CreatedAt, &m.UpdatedAt); err != nil {
			return nil, err
		}
		if len(evIDsJSON) > 0 {
			_ = json.Unmarshal(evIDsJSON, &m.EvidenceIDs)
		}
		res = append(res, &m)
	}
	return res, nil
}

func (s *PostgresStore) UpdateMistakeStatus(ctx context.Context, tenantID, id string, status domain.MistakeStatus, changedBy, reason string) error {
	m, err := s.GetMistake(ctx, tenantID, id)
	if err != nil {
		return err
	}
	from := m.Status
	m.Status = status
	now := time.Now().UTC()
	m.UpdatedAt = now
	if status == domain.MistakeStatusResolved || status == domain.MistakeStatusDismissed {
		m.ResolvedAt = &now
	}

	if err := s.CreateMistake(ctx, m); err != nil {
		return err
	}

	transID := id + "-" + string(status) + "-" + now.Format("150405")
	tq := `INSERT INTO mistake_transitions (id, mistake_id, tenant_id, from_status, to_status, changed_by, reason, created_at)
	       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`
	_, _ = s.pool.Exec(ctx, tq, transID, id, tenantID, from, status, changedBy, reason, now)
	return nil
}

func (s *PostgresStore) AssignMistake(ctx context.Context, tenantID, id, assignedTo, assignedToName string) error {
	now := time.Now().UTC()
	q := `UPDATE mistakes SET assigned_to=$1, assigned_to_name=$2, updated_at=$3 WHERE tenant_id=$4 AND id=$5`
	_, err := s.pool.Exec(ctx, q, assignedTo, assignedToName, now, tenantID, id)
	return err
}

func (s *PostgresStore) ListMistakeTransitions(ctx context.Context, tenantID, mistakeID string) ([]*domain.MistakeTransition, error) {
	q := `SELECT id, mistake_id, tenant_id, from_status, to_status, changed_by, reason, created_at
	      FROM mistake_transitions WHERE tenant_id=$1 AND mistake_id=$2 ORDER BY created_at ASC`
	rows, err := s.pool.Query(ctx, q, tenantID, mistakeID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var res []*domain.MistakeTransition
	for rows.Next() {
		var tr domain.MistakeTransition
		if err := rows.Scan(&tr.ID, &tr.MistakeID, &tr.TenantID, &tr.FromStatus, &tr.ToStatus, &tr.ChangedBy, &tr.Reason, &tr.CreatedAt); err != nil {
			return nil, err
		}
		res = append(res, &tr)
	}
	return res, nil
}

func (s *PostgresStore) GetDashboardSummary(ctx context.Context, tenantID string) (*DashboardSummary, error) {
	mistakes, err := s.ListMistakes(ctx, tenantID, MistakeFilter{})
	if err != nil {
		return nil, err
	}

	summary := &DashboardSummary{
		BySeverity: make(map[string]int),
		ByStatus:   make(map[string]int),
		ByType:     make(map[string]int),
	}

	for _, m := range mistakes {
		summary.TotalDiscrepancies++
		summary.BySeverity[string(m.Severity)]++
		summary.ByStatus[string(m.Status)]++
		summary.ByType[string(m.MistakeType)]++

		if m.Status == domain.MistakeStatusDetected || m.Status == domain.MistakeStatusUnderReview || m.Status == domain.MistakeStatusVerified {
			summary.ActiveMistakes++
			summary.TotalValueAtRiskMinor += m.FinancialImpactMinor
		} else if m.Status == domain.MistakeStatusResolved {
			summary.ResolvedMistakes++
		}
	}

	return summary, nil
}
