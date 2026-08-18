package storage

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// PostgresStore implements the Store interface backed by a PostgreSQL database.
type PostgresStore struct {
	pool *pgxpool.Pool
}

// NewPostgresStore establishes a connection pool to the PostgreSQL database.
func NewPostgresStore(ctx context.Context, databaseURL string) (*PostgresStore, error) {
	config, err := pgxpool.ParseConfig(databaseURL)
	if err != nil {
		return nil, fmt.Errorf("failed to parse DATABASE_URL: %w", err)
	}

	config.MaxConns = 25
	config.MinConns = 2
	config.MaxConnLifetime = 30 * time.Minute
	config.MaxConnIdleTime = 5 * time.Minute

	pool, err := pgxpool.NewWithConfig(ctx, config)
	if err != nil {
		return nil, fmt.Errorf("failed to create connection pool: %w", err)
	}

	// Verify connectivity
	pingCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()
	if err := pool.Ping(pingCtx); err != nil {
		pool.Close()
		return nil, fmt.Errorf("database ping failed: %w", err)
	}

	slog.Info("Connected to PostgreSQL successfully")
	return &PostgresStore{pool: pool}, nil
}

// AutoMigrate executes the DDL schema ensuring all required tables and indexes exist.
func (s *PostgresStore) AutoMigrate(ctx context.Context) error {
	slog.Info("Running PostgreSQL schema migration...")
	_, err := s.pool.Exec(ctx, InitialDBSchema)
	if err != nil {
		return fmt.Errorf("migration failed: %w", err)
	}
	slog.Info("PostgreSQL schema up to date")
	return nil
}

// Ping checks if the PostgreSQL database is reachable.
func (s *PostgresStore) Ping(ctx context.Context) error {
	return s.pool.Ping(ctx)
}

// Close closes all connections in the pool.
func (s *PostgresStore) Close() {
	s.pool.Close()
}
