package storage

import (
	"context"
	"mistake-backend/internal/domain"
	"time"
)

// CreateSession stores a new active user session indexed by token and refresh token.
func (s *MemoryStore) CreateSession(ctx context.Context, sess *domain.Session) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.sessions[sess.Token] = sess
	if sess.RefreshToken != "" {
		s.sessionsByRefreshToken[sess.RefreshToken] = sess
	}
	return nil
}

// GetSession retrieves an active session by access token.
func (s *MemoryStore) GetSession(ctx context.Context, token string) (*domain.Session, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	sess, ok := s.sessions[token]
	if !ok || time.Now().UTC().After(sess.ExpiresAt) {
		return nil, ErrNotFound
	}
	cp := *sess
	return &cp, nil
}

// GetSessionByRefreshToken retrieves an active session by refresh token.
func (s *MemoryStore) GetSessionByRefreshToken(ctx context.Context, refreshToken string) (*domain.Session, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	sess, ok := s.sessionsByRefreshToken[refreshToken]
	if !ok || time.Now().UTC().After(sess.RefreshTokenExpiresAt) {
		return nil, ErrNotFound
	}
	cp := *sess
	return &cp, nil
}

// RotateSession atomically rotates access and refresh tokens for a session, preventing replay attacks.
func (s *MemoryStore) RotateSession(
	ctx context.Context,
	oldRefreshToken, newAccessToken, newRefreshToken string,
	accessExp, refreshExp time.Time,
) (*domain.Session, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	sess, ok := s.sessionsByRefreshToken[oldRefreshToken]
	if !ok || time.Now().UTC().After(sess.RefreshTokenExpiresAt) {
		return nil, ErrNotFound
	}

	// Delete old lookup keys
	delete(s.sessions, sess.Token)
	delete(s.sessionsByRefreshToken, oldRefreshToken)

	// Update session with new rotated tokens
	sess.Token = newAccessToken
	sess.RefreshToken = newRefreshToken
	sess.ExpiresAt = accessExp
	sess.RefreshTokenExpiresAt = refreshExp

	// Re-index under new keys
	s.sessions[newAccessToken] = sess
	s.sessionsByRefreshToken[newRefreshToken] = sess

	cp := *sess
	return &cp, nil
}

// ListSessions lists active sessions for a tenant.
func (s *MemoryStore) ListSessions(ctx context.Context, tenantID string) ([]*domain.Session, error) {
	if err := verifyTenant(ctx, tenantID); err != nil {
		return nil, err
	}
	s.mu.RLock()
	defer s.mu.RUnlock()
	var res []*domain.Session
	for _, sess := range s.sessions {
		if sess.TenantID == tenantID && time.Now().UTC().Before(sess.ExpiresAt) {
			res = append(res, sess)
		}
	}
	return res, nil
}

// RevokeSession deletes a session by ID and invalidates both access and refresh tokens.
func (s *MemoryStore) RevokeSession(ctx context.Context, tenantID, sessionID string) error {
	if err := verifyTenant(ctx, tenantID); err != nil {
		return err
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	for token, sess := range s.sessions {
		if sess.ID == sessionID && sess.TenantID == tenantID {
			delete(s.sessions, token)
			if sess.RefreshToken != "" {
				delete(s.sessionsByRefreshToken, sess.RefreshToken)
			}
			return nil
		}
	}
	return ErrNotFound
}
