package storage

import (
	"context"
	"mistake-backend/internal/domain"
	"sort"
	"time"
)

func (s *MemoryStore) CreateAuditLog(ctx context.Context, log *domain.AuditLog) error {
	if err := verifyTenant(ctx, log.TenantID); err != nil {
		return err
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	s.auditLogs = append(s.auditLogs, log)
	return nil
}

func (s *MemoryStore) ListAuditLogs(ctx context.Context, tenantID string, filter AuditFilter) ([]*domain.AuditLog, error) {
	if err := verifyTenant(ctx, tenantID); err != nil {
		return nil, err
	}
	s.mu.RLock()
	defer s.mu.RUnlock()
	var res []*domain.AuditLog
	for _, l := range s.auditLogs {
		if l.TenantID != tenantID {
			continue
		}
		if filter.ActorUserID != "" && l.ActorUserID != filter.ActorUserID {
			continue
		}
		if filter.Action != "" && l.Action != filter.Action {
			continue
		}
		if filter.ResourceType != "" && l.ResourceType != filter.ResourceType {
			continue
		}
		if filter.From != nil && l.CreatedAt.Before(*filter.From) {
			continue
		}
		if filter.To != nil && l.CreatedAt.After(*filter.To) {
			continue
		}
		res = append(res, l)
	}
	sort.Slice(res, func(i, j int) bool { return res[i].CreatedAt.After(res[j].CreatedAt) })
	if filter.Limit > 0 && len(res) > filter.Limit {
		res = res[:filter.Limit]
	}
	return res, nil
}

func (s *MemoryStore) GetRetentionPolicy(ctx context.Context, tenantID string) (*domain.RetentionPolicy, error) {
	if err := verifyTenant(ctx, tenantID); err != nil {
		return nil, err
	}
	s.mu.RLock()
	defer s.mu.RUnlock()
	p, ok := s.retentionPolicies[tenantID]
	if !ok {
		return &domain.RetentionPolicy{
			ID: "default-retention-" + tenantID, TenantID: tenantID, ResourceType: "all",
			RetentionPeriod: "1y", RetentionDays: 365, AutoPurge: false,
			CreatedAt: time.Now().UTC(), UpdatedAt: time.Now().UTC(),
		}, nil
	}
	cp := *p
	return &cp, nil
}

func (s *MemoryStore) UpdateRetentionPolicy(ctx context.Context, p *domain.RetentionPolicy) error {
	if err := verifyTenant(ctx, p.TenantID); err != nil {
		return err
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	p.UpdatedAt = time.Now().UTC()
	s.retentionPolicies[p.TenantID] = p
	return nil
}

func (s *MemoryStore) PurgeTenantData(ctx context.Context, tenantID string) error {
	if err := verifyTenant(ctx, tenantID); err != nil {
		return err
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	for id, ds := range s.dataSources {
		if ds.TenantID == tenantID { delete(s.dataSources, id) }
	}
	for id, doc := range s.documents {
		if doc.TenantID == tenantID { delete(s.documents, id) }
	}
	for id, ev := range s.evidence {
		if ev.TenantID == tenantID { delete(s.evidence, id) }
	}
	for id, m := range s.mistakes {
		if m.TenantID == tenantID { delete(s.mistakes, id) }
	}
	return nil
}
