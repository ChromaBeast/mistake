package storage

import (
	"context"
	"errors"
	"time"

	"mistake-backend/internal/domain"

	"github.com/jackc/pgx/v5"
)

func (s *PostgresStore) CreateTenant(ctx context.Context, t *domain.Tenant) error {
	q := `INSERT INTO tenants (id, name, legal_name, industry, status, created_at, updated_at)
	      VALUES ($1, $2, $3, $4, $5, $6, $7)
	      ON CONFLICT (id) DO UPDATE SET name=$2, legal_name=$3, industry=$4, status=$5, updated_at=$7`
	_, err := s.pool.Exec(ctx, q, t.ID, t.Name, t.LegalName, t.Industry, t.Status, t.CreatedAt, t.UpdatedAt)
	return err
}

func (s *PostgresStore) GetTenant(ctx context.Context, tenantID string) (*domain.Tenant, error) {
	q := `SELECT id, name, legal_name, industry, status, created_at, updated_at FROM tenants WHERE id=$1`
	var t domain.Tenant
	err := s.pool.QueryRow(ctx, q, tenantID).Scan(&t.ID, &t.Name, &t.LegalName, &t.Industry, &t.Status, &t.CreatedAt, &t.UpdatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	return &t, err
}

func (s *PostgresStore) UpdateTenant(ctx context.Context, t *domain.Tenant) error {
	return s.CreateTenant(ctx, t)
}

func (s *PostgresStore) CreateUser(ctx context.Context, u *domain.User) error {
	q := `INSERT INTO users (id, tenant_id, email, name, password_hash, role, mfa_enabled, mfa_secret, status, last_login_at, created_at, updated_at)
	      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
	      ON CONFLICT (id) DO UPDATE SET name=$4, role=$6, mfa_enabled=$7, status=$9, updated_at=$12`
	_, err := s.pool.Exec(ctx, q, u.ID, u.TenantID, u.Email, u.Name, u.PasswordHash, u.Role, u.MFAEnabled, u.MFASecret, u.Status, u.LastLoginAt, u.CreatedAt, u.UpdatedAt)
	return err
}

func (s *PostgresStore) GetUserByID(ctx context.Context, tenantID, userID string) (*domain.User, error) {
	q := `SELECT id, tenant_id, email, name, password_hash, role, mfa_enabled, mfa_secret, status, last_login_at, created_at, updated_at
	      FROM users WHERE tenant_id=$1 AND id=$2`
	var u domain.User
	err := s.pool.QueryRow(ctx, q, tenantID, userID).Scan(&u.ID, &u.TenantID, &u.Email, &u.Name, &u.PasswordHash, &u.Role, &u.MFAEnabled, &u.MFASecret, &u.Status, &u.LastLoginAt, &u.CreatedAt, &u.UpdatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	return &u, err
}

func (s *PostgresStore) GetUserByEmail(ctx context.Context, email string) (*domain.User, error) {
	q := `SELECT id, tenant_id, email, name, password_hash, role, mfa_enabled, mfa_secret, status, last_login_at, created_at, updated_at
	      FROM users WHERE email=$1`
	var u domain.User
	err := s.pool.QueryRow(ctx, q, email).Scan(&u.ID, &u.TenantID, &u.Email, &u.Name, &u.PasswordHash, &u.Role, &u.MFAEnabled, &u.MFASecret, &u.Status, &u.LastLoginAt, &u.CreatedAt, &u.UpdatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	return &u, err
}

func (s *PostgresStore) ListUsers(ctx context.Context, tenantID string) ([]*domain.User, error) {
	q := `SELECT id, tenant_id, email, name, password_hash, role, mfa_enabled, mfa_secret, status, last_login_at, created_at, updated_at
	      FROM users WHERE tenant_id=$1`
	rows, err := s.pool.Query(ctx, q, tenantID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var res []*domain.User
	for rows.Next() {
		var u domain.User
		if err := rows.Scan(&u.ID, &u.TenantID, &u.Email, &u.Name, &u.PasswordHash, &u.Role, &u.MFAEnabled, &u.MFASecret, &u.Status, &u.LastLoginAt, &u.CreatedAt, &u.UpdatedAt); err != nil {
			return nil, err
		}
		res = append(res, &u)
	}
	return res, nil
}

func (s *PostgresStore) UpdateUserRole(ctx context.Context, tenantID, userID string, role domain.UserRole) error {
	q := `UPDATE users SET role=$1, updated_at=$2 WHERE tenant_id=$3 AND id=$4`
	_, err := s.pool.Exec(ctx, q, role, time.Now().UTC(), tenantID, userID)
	return err
}

func (s *PostgresStore) UpdateUserStatus(ctx context.Context, tenantID, userID string, status domain.UserStatus) error {
	q := `UPDATE users SET status=$1, updated_at=$2 WHERE tenant_id=$3 AND id=$4`
	_, err := s.pool.Exec(ctx, q, status, time.Now().UTC(), tenantID, userID)
	return err
}

func (s *PostgresStore) CreateSession(ctx context.Context, ses *domain.Session) error {
	q := `INSERT INTO sessions (id, tenant_id, user_id, token, refresh_token, ip_address, user_agent, created_at, expires_at, refresh_token_expires_at)
	      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	      ON CONFLICT (id) DO UPDATE SET token=$4, refresh_token=$5, expires_at=$9, refresh_token_expires_at=$10`
	_, err := s.pool.Exec(ctx, q, ses.ID, ses.TenantID, ses.UserID, ses.Token, ses.RefreshToken, ses.IPAddress, ses.UserAgent, ses.CreatedAt, ses.ExpiresAt, ses.RefreshTokenExpiresAt)
	return err
}

func (s *PostgresStore) GetSession(ctx context.Context, token string) (*domain.Session, error) {
	q := `SELECT id, tenant_id, user_id, token, refresh_token, ip_address, user_agent, created_at, expires_at, refresh_token_expires_at FROM sessions WHERE token=$1`
	var ses domain.Session
	err := s.pool.QueryRow(ctx, q, token).Scan(&ses.ID, &ses.TenantID, &ses.UserID, &ses.Token, &ses.RefreshToken, &ses.IPAddress, &ses.UserAgent, &ses.CreatedAt, &ses.ExpiresAt, &ses.RefreshTokenExpiresAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	return &ses, err
}

func (s *PostgresStore) GetSessionByRefreshToken(ctx context.Context, refreshToken string) (*domain.Session, error) {
	q := `SELECT id, tenant_id, user_id, token, refresh_token, ip_address, user_agent, created_at, expires_at, refresh_token_expires_at FROM sessions WHERE refresh_token=$1`
	var ses domain.Session
	err := s.pool.QueryRow(ctx, q, refreshToken).Scan(&ses.ID, &ses.TenantID, &ses.UserID, &ses.Token, &ses.RefreshToken, &ses.IPAddress, &ses.UserAgent, &ses.CreatedAt, &ses.ExpiresAt, &ses.RefreshTokenExpiresAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	return &ses, err
}

func (s *PostgresStore) RotateSession(ctx context.Context, oldRefreshToken, newAccessToken, newRefreshToken string, accessExp, refreshExp time.Time) (*domain.Session, error) {
	ses, err := s.GetSessionByRefreshToken(ctx, oldRefreshToken)
	if err != nil {
		return nil, err
	}
	q := `UPDATE sessions SET token=$1, refresh_token=$2, expires_at=$3, refresh_token_expires_at=$4 WHERE id=$5`
	_, err = s.pool.Exec(ctx, q, newAccessToken, newRefreshToken, accessExp, refreshExp, ses.ID)
	if err != nil {
		return nil, err
	}
	ses.Token = newAccessToken
	ses.RefreshToken = newRefreshToken
	ses.ExpiresAt = accessExp
	ses.RefreshTokenExpiresAt = refreshExp
	return ses, nil
}

func (s *PostgresStore) ListSessions(ctx context.Context, tenantID string) ([]*domain.Session, error) {
	q := `SELECT id, tenant_id, user_id, token, refresh_token, ip_address, user_agent, created_at, expires_at, refresh_token_expires_at FROM sessions WHERE tenant_id=$1`
	rows, err := s.pool.Query(ctx, q, tenantID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var res []*domain.Session
	for rows.Next() {
		var ses domain.Session
		if err := rows.Scan(&ses.ID, &ses.TenantID, &ses.UserID, &ses.Token, &ses.RefreshToken, &ses.IPAddress, &ses.UserAgent, &ses.CreatedAt, &ses.ExpiresAt, &ses.RefreshTokenExpiresAt); err != nil {
			return nil, err
		}
		res = append(res, &ses)
	}
	return res, nil
}

func (s *PostgresStore) RevokeSession(ctx context.Context, tenantID, sessionID string) error {
	q := `DELETE FROM sessions WHERE tenant_id=$1 AND id=$2`
	_, err := s.pool.Exec(ctx, q, tenantID, sessionID)
	return err
}

