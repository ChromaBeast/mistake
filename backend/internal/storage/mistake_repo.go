package storage

import (
	"context"
	"mistake-backend/internal/domain"
	"sort"
	"time"
)

func (s *MemoryStore) CreateMistake(ctx context.Context, m *domain.Mistake) error {
	if err := verifyTenant(ctx, m.TenantID); err != nil {
		return err
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	s.mistakes[m.ID] = m
	return nil
}

func (s *MemoryStore) GetMistake(ctx context.Context, tenantID, id string) (*domain.Mistake, error) {
	if err := verifyTenant(ctx, tenantID); err != nil {
		return nil, err
	}
	s.mu.RLock()
	defer s.mu.RUnlock()
	m, ok := s.mistakes[id]
	if !ok || m.TenantID != tenantID {
		return nil, ErrNotFound
	}
	cp := *m
	return &cp, nil
}

func (s *MemoryStore) ListMistakes(ctx context.Context, tenantID string, filter MistakeFilter) ([]*domain.Mistake, error) {
	if err := verifyTenant(ctx, tenantID); err != nil {
		return nil, err
	}
	s.mu.RLock()
	defer s.mu.RUnlock()
	var res []*domain.Mistake
	for _, m := range s.mistakes {
		if m.TenantID != tenantID {
			continue
		}
		if filter.Severity != "" && m.Severity != filter.Severity {
			continue
		}
		if filter.Status != "" && m.Status != filter.Status {
			continue
		}
		if filter.MistakeType != "" && m.MistakeType != filter.MistakeType {
			continue
		}
		if filter.AssignedTo != "" && m.AssignedTo != filter.AssignedTo {
			continue
		}
		res = append(res, m)
	}

	sort.Slice(res, func(i, j int) bool {
		return res[i].DetectedAt.After(res[j].DetectedAt)
	})

	if filter.Limit > 0 && len(res) > filter.Limit {
		res = res[:filter.Limit]
	}
	return res, nil
}

func (s *MemoryStore) UpdateMistakeStatus(ctx context.Context, tenantID, id string, status domain.MistakeStatus, changedBy, reason string) error {
	if err := verifyTenant(ctx, tenantID); err != nil {
		return err
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	m, ok := s.mistakes[id]
	if !ok || m.TenantID != tenantID {
		return ErrNotFound
	}
	from := m.Status
	m.Status = status
	now := time.Now().UTC()
	m.UpdatedAt = now
	if status == domain.MistakeStatusResolved || status == domain.MistakeStatusDismissed {
		m.ResolvedAt = &now
	}

	t := &domain.MistakeTransition{
		ID:         id + "-" + string(status) + "-" + now.Format("150405"),
		MistakeID:  id,
		TenantID:   tenantID,
		FromStatus: from,
		ToStatus:   status,
		ChangedBy:  changedBy,
		Reason:     reason,
		CreatedAt:  now,
	}
	s.mistakeTransitions = append(s.mistakeTransitions, t)
	return nil
}

func (s *MemoryStore) AssignMistake(ctx context.Context, tenantID, id, assignedTo, assignedToName string) error {
	if err := verifyTenant(ctx, tenantID); err != nil {
		return err
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	m, ok := s.mistakes[id]
	if !ok || m.TenantID != tenantID {
		return ErrNotFound
	}
	m.AssignedTo = assignedTo
	m.AssignedToName = assignedToName
	m.UpdatedAt = time.Now().UTC()
	return nil
}

func (s *MemoryStore) ListMistakeTransitions(ctx context.Context, tenantID, mistakeID string) ([]*domain.MistakeTransition, error) {
	if err := verifyTenant(ctx, tenantID); err != nil {
		return nil, err
	}
	s.mu.RLock()
	defer s.mu.RUnlock()
	var res []*domain.MistakeTransition
	for _, t := range s.mistakeTransitions {
		if t.TenantID == tenantID && t.MistakeID == mistakeID {
			res = append(res, t)
		}
	}
	return res, nil
}

func (s *MemoryStore) GetDashboardSummary(ctx context.Context, tenantID string) (*DashboardSummary, error) {
	if err := verifyTenant(ctx, tenantID); err != nil {
		return nil, err
	}
	s.mu.RLock()
	defer s.mu.RUnlock()

	summary := &DashboardSummary{
		BySeverity: make(map[string]int),
		ByStatus:   make(map[string]int),
		ByType:     make(map[string]int),
	}

	for _, m := range s.mistakes {
		if m.TenantID != tenantID {
			continue
		}
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
