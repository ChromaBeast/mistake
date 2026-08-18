package storage

import (
	"context"
	"mistake-backend/internal/domain"
	"strings"
	"time"
)

func (s *MemoryStore) CreateTenant(ctx context.Context, t *domain.Tenant) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if _, exists := s.tenants[t.ID]; exists {
		return ErrAlreadyExists
	}
	s.tenants[t.ID] = t
	return nil
}

func (s *MemoryStore) GetTenant(ctx context.Context, tenantID string) (*domain.Tenant, error) {
	if err := verifyTenant(ctx, tenantID); err != nil {
		return nil, err
	}
	s.mu.RLock()
	defer s.mu.RUnlock()
	t, ok := s.tenants[tenantID]
	if !ok {
		return nil, ErrNotFound
	}
	cp := *t
	return &cp, nil
}

func (s *MemoryStore) UpdateTenant(ctx context.Context, t *domain.Tenant) error {
	if err := verifyTenant(ctx, t.ID); err != nil {
		return err
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	if _, ok := s.tenants[t.ID]; !ok {
		return ErrNotFound
	}
	t.UpdatedAt = time.Now().UTC()
	s.tenants[t.ID] = t
	return nil
}

func (s *MemoryStore) CreateUser(ctx context.Context, u *domain.User) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	emailKey := strings.ToLower(u.Email)
	if _, exists := s.usersByEmail[emailKey]; exists {
		return ErrAlreadyExists
	}
	s.users[u.ID] = u
	s.usersByEmail[emailKey] = u
	return nil
}

func (s *MemoryStore) GetUserByID(ctx context.Context, tenantID, userID string) (*domain.User, error) {
	if err := verifyTenant(ctx, tenantID); err != nil {
		return nil, err
	}
	s.mu.RLock()
	defer s.mu.RUnlock()
	u, ok := s.users[userID]
	if !ok || u.TenantID != tenantID {
		return nil, ErrNotFound
	}
	cp := *u
	return &cp, nil
}

func (s *MemoryStore) GetUserByEmail(ctx context.Context, email string) (*domain.User, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	u, ok := s.usersByEmail[strings.ToLower(email)]
	if !ok {
		return nil, ErrNotFound
	}
	cp := *u
	return &cp, nil
}

func (s *MemoryStore) ListUsers(ctx context.Context, tenantID string) ([]*domain.User, error) {
	if err := verifyTenant(ctx, tenantID); err != nil {
		return nil, err
	}
	s.mu.RLock()
	defer s.mu.RUnlock()
	var res []*domain.User
	for _, u := range s.users {
		if u.TenantID == tenantID {
			res = append(res, u)
		}
	}
	return res, nil
}

func (s *MemoryStore) UpdateUserRole(ctx context.Context, tenantID, userID string, role domain.UserRole) error {
	if err := verifyTenant(ctx, tenantID); err != nil {
		return err
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	u, ok := s.users[userID]
	if !ok || u.TenantID != tenantID {
		return ErrNotFound
	}
	u.Role = role
	u.UpdatedAt = time.Now().UTC()
	return nil
}

func (s *MemoryStore) UpdateUserStatus(ctx context.Context, tenantID, userID string, status domain.UserStatus) error {
	if err := verifyTenant(ctx, tenantID); err != nil {
		return err
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	u, ok := s.users[userID]
	if !ok || u.TenantID != tenantID {
		return ErrNotFound
	}
	u.Status = status
	u.UpdatedAt = time.Now().UTC()
	return nil
}

