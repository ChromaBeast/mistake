package storage

import (
	"context"
	"fmt"
)

// adminCountableTables whitelists tenant-scoped tables for operational row
// counting. Kept explicit so the admin CLI can never interpolate arbitrary
// table names into SQL.
var adminCountableTables = map[string]bool{
	"users":        true,
	"sessions":     true,
	"mistakes":     true,
	"data_sources": true,
	"entities":     true,
	"documents":    true,
	"invoices":     true,
	"audit_logs":   true,
}

// TenantExists reports whether the tenant row exists.
func (s *PostgresStore) TenantExists(ctx context.Context, tenantID string) (bool, error) {
	var exists bool
	err := s.pool.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM tenants WHERE id=$1)`, tenantID).Scan(&exists)
	return exists, err
}

// CountTenantRows returns the number of rows a tenant owns in the given
// whitelisted table. Returns -1 if the table is not countable.
func (s *PostgresStore) CountTenantRows(ctx context.Context, table, tenantID string) (int, error) {
	if !adminCountableTables[table] {
		return -1, fmt.Errorf("table %q is not whitelisted for tenant row counting", table)
	}
	var n int
	err := s.pool.QueryRow(ctx, fmt.Sprintf("SELECT COUNT(*) FROM %s WHERE tenant_id=$1", table), tenantID).Scan(&n)
	return n, err
}
