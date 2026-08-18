package storage

import (
	"context"
	"mistake-backend/internal/domain"
	"sort"
)

func (s *MemoryStore) CreateEvent(ctx context.Context, ev *domain.Event) error {
	if err := verifyTenant(ctx, ev.TenantID); err != nil {
		return err
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	s.events = append(s.events, ev)
	return nil
}

func (s *MemoryStore) ListEvents(ctx context.Context, tenantID string, filter EventFilter) ([]*domain.Event, error) {
	if err := verifyTenant(ctx, tenantID); err != nil {
		return nil, err
	}
	s.mu.RLock()
	defer s.mu.RUnlock()
	var res []*domain.Event
	for _, ev := range s.events {
		if ev.TenantID != tenantID {
			continue
		}
		if filter.EntityID != "" && ev.EntityID != filter.EntityID {
			continue
		}
		if filter.EventType != "" && ev.EventType != filter.EventType {
			continue
		}
		if filter.From != nil && ev.ObservedAt.Before(*filter.From) {
			continue
		}
		if filter.To != nil && ev.ObservedAt.After(*filter.To) {
			continue
		}
		res = append(res, ev)
	}

	sort.Slice(res, func(i, j int) bool {
		return res[i].ObservedAt.After(res[j].ObservedAt)
	})

	if filter.Limit > 0 && len(res) > filter.Limit {
		res = res[:filter.Limit]
	}
	return res, nil
}

func (s *MemoryStore) GetEntityTimeline(ctx context.Context, tenantID, entityID string) ([]*domain.Event, error) {
	if err := verifyTenant(ctx, tenantID); err != nil {
		return nil, err
	}
	s.mu.RLock()
	defer s.mu.RUnlock()
	var res []*domain.Event
	for _, ev := range s.events {
		if ev.TenantID == tenantID && ev.EntityID == entityID {
			res = append(res, ev)
		}
	}

	sort.Slice(res, func(i, j int) bool {
		t1 := evTime(res[i])
		t2 := evTime(res[j])
		return t1 < t2
	})
	return res, nil
}

func evTime(e *domain.Event) int64 {
	if e.OccurredAt != nil {
		return e.OccurredAt.UnixNano()
	}
	return e.ObservedAt.UnixNano()
}
