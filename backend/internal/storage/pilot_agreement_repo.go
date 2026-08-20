package storage

import (
	"context"
	"mistake-backend/internal/domain"
	"time"
)

func (s *MemoryStore) RecordPilotAgreement(ctx context.Context, pa *domain.PilotAgreement) error {
	if err := verifyTenant(ctx, pa.TenantID); err != nil {
		return err
	}
	s.mu.Lock()
	defer s.mu.Unlock()

	if pa.AcceptedAt.IsZero() {
		pa.AcceptedAt = time.Now().UTC()
	}
	s.pilotAgreements[pa.TenantID] = pa
	return nil
}

func (s *MemoryStore) GetPilotAgreement(ctx context.Context, tenantID string) (*domain.PilotAgreement, error) {
	if err := verifyTenant(ctx, tenantID); err != nil {
		return nil, err
	}
	s.mu.RLock()
	defer s.mu.RUnlock()

	pa, ok := s.pilotAgreements[tenantID]
	if !ok {
		return nil, ErrNotFound
	}
	cp := *pa
	return &cp, nil
}
