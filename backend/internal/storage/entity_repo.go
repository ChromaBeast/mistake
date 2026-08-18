package storage

import (
	"context"
	"mistake-backend/internal/domain"
	"strings"
	"time"
)

func (s *MemoryStore) CreateEntity(ctx context.Context, e *domain.Entity) error {
	if err := verifyTenant(ctx, e.TenantID); err != nil {
		return err
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	s.entities[e.ID] = e
	return nil
}

func (s *MemoryStore) GetEntity(ctx context.Context, tenantID, id string) (*domain.Entity, error) {
	if err := verifyTenant(ctx, tenantID); err != nil {
		return nil, err
	}
	s.mu.RLock()
	defer s.mu.RUnlock()
	e, ok := s.entities[id]
	if !ok || e.TenantID != tenantID {
		return nil, ErrNotFound
	}
	cp := *e
	return &cp, nil
}

func (s *MemoryStore) GetEntityByCanonical(ctx context.Context, tenantID string, eType domain.EntityType, name string) (*domain.Entity, error) {
	if err := verifyTenant(ctx, tenantID); err != nil {
		return nil, err
	}
	s.mu.RLock()
	defer s.mu.RUnlock()
	norm := strings.ToLower(strings.TrimSpace(name))
	for _, e := range s.entities {
		if e.TenantID == tenantID && e.EntityType == eType && e.Status == domain.EntityStatusActive {
			if strings.ToLower(strings.TrimSpace(e.CanonicalName)) == norm {
				cp := *e
				return &cp, nil
			}
		}
	}
	return nil, ErrNotFound
}

func (s *MemoryStore) ListEntities(ctx context.Context, tenantID string, eType *domain.EntityType) ([]*domain.Entity, error) {
	if err := verifyTenant(ctx, tenantID); err != nil {
		return nil, err
	}
	s.mu.RLock()
	defer s.mu.RUnlock()
	var res []*domain.Entity
	for _, e := range s.entities {
		if e.TenantID == tenantID && e.Status == domain.EntityStatusActive {
			if eType == nil || e.EntityType == *eType {
				res = append(res, e)
			}
		}
	}
	return res, nil
}

func (s *MemoryStore) UpdateEntity(ctx context.Context, e *domain.Entity) error {
	if err := verifyTenant(ctx, e.TenantID); err != nil {
		return err
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	if _, ok := s.entities[e.ID]; !ok {
		return ErrNotFound
	}
	e.UpdatedAt = time.Now().UTC()
	s.entities[e.ID] = e
	return nil
}

func (s *MemoryStore) CreateAlias(ctx context.Context, a *domain.EntityAlias) error {
	if err := verifyTenant(ctx, a.TenantID); err != nil {
		return err
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	s.aliases[a.ID] = a
	return nil
}

func (s *MemoryStore) ListAliases(ctx context.Context, tenantID, entityID string) ([]*domain.EntityAlias, error) {
	if err := verifyTenant(ctx, tenantID); err != nil {
		return nil, err
	}
	s.mu.RLock()
	defer s.mu.RUnlock()
	var res []*domain.EntityAlias
	for _, a := range s.aliases {
		if a.TenantID == tenantID && (entityID == "" || a.EntityID == entityID) {
			res = append(res, a)
		}
	}
	return res, nil
}

func (s *MemoryStore) GetAliasByName(ctx context.Context, tenantID string, name string) (*domain.EntityAlias, error) {
	if err := verifyTenant(ctx, tenantID); err != nil {
		return nil, err
	}
	s.mu.RLock()
	defer s.mu.RUnlock()
	norm := strings.ToLower(strings.TrimSpace(name))
	for _, a := range s.aliases {
		if a.TenantID == tenantID {
			if strings.ToLower(strings.TrimSpace(a.AliasName)) == norm {
				cp := *a
				return &cp, nil
			}
		}
	}
	return nil, ErrNotFound
}

func (s *MemoryStore) AddToReviewQueue(ctx context.Context, item *domain.ReviewQueueItem) error {
	if err := verifyTenant(ctx, item.TenantID); err != nil {
		return err
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	s.reviewQueue[item.ID] = item
	return nil
}

func (s *MemoryStore) ListReviewQueue(ctx context.Context, tenantID string) ([]*domain.ReviewQueueItem, error) {
	if err := verifyTenant(ctx, tenantID); err != nil {
		return nil, err
	}
	s.mu.RLock()
	defer s.mu.RUnlock()
	var res []*domain.ReviewQueueItem
	for _, item := range s.reviewQueue {
		if item.TenantID == tenantID {
			res = append(res, item)
		}
	}
	return res, nil
}

func (s *MemoryStore) RemoveFromReviewQueue(ctx context.Context, tenantID, id string) error {
	if err := verifyTenant(ctx, tenantID); err != nil {
		return err
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	if item, ok := s.reviewQueue[id]; ok && item.TenantID == tenantID {
		delete(s.reviewQueue, id)
		return nil
	}
	return ErrNotFound
}

func (s *MemoryStore) MergeEntities(ctx context.Context, tenantID, survivorID, targetID string) error {
	if err := verifyTenant(ctx, tenantID); err != nil {
		return err
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	survivor, ok1 := s.entities[survivorID]
	target, ok2 := s.entities[targetID]
	if !ok1 || !ok2 || survivor.TenantID != tenantID || target.TenantID != tenantID {
		return ErrNotFound
	}
	target.Status = domain.EntityStatusMerged
	target.MergedIntoID = survivorID
	target.UpdatedAt = time.Now().UTC()

	// Re-point aliases of target to survivor
	for _, a := range s.aliases {
		if a.TenantID == tenantID && a.EntityID == targetID {
			a.EntityID = survivorID
		}
	}
	return nil
}
