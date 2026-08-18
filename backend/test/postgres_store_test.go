package test

import (
	"strings"
	"testing"

	"mistake-backend/internal/storage"
)

func TestPostgresSchemaDDL(t *testing.T) {
	ddl := storage.InitialDBSchema

	expectedTables := []string{
		"CREATE TABLE IF NOT EXISTS tenants",
		"CREATE TABLE IF NOT EXISTS users",
		"CREATE TABLE IF NOT EXISTS sessions",
		"CREATE TABLE IF NOT EXISTS data_sources",
		"CREATE TABLE IF NOT EXISTS documents",
		"CREATE TABLE IF NOT EXISTS evidence",
		"CREATE TABLE IF NOT EXISTS entities",
		"CREATE TABLE IF NOT EXISTS entity_aliases",
		"CREATE TABLE IF NOT EXISTS products",
		"CREATE TABLE IF NOT EXISTS orders",
		"CREATE TABLE IF NOT EXISTS purchase_orders",
		"CREATE TABLE IF NOT EXISTS invoices",
		"CREATE TABLE IF NOT EXISTS payments",
		"CREATE TABLE IF NOT EXISTS shipments",
		"CREATE TABLE IF NOT EXISTS mistakes",
		"CREATE TABLE IF NOT EXISTS mistake_transitions",
		"CREATE TABLE IF NOT EXISTS review_queue",
		"CREATE TABLE IF NOT EXISTS events",
		"CREATE TABLE IF NOT EXISTS audit_logs",
		"CREATE TABLE IF NOT EXISTS retention_policies",
		"CREATE TABLE IF NOT EXISTS subscriptions",
		"CREATE TABLE IF NOT EXISTS billing_invoices",
		"CREATE TABLE IF NOT EXISTS notifications",
	}

	for _, table := range expectedTables {
		if !strings.Contains(ddl, table) {
			t.Errorf("expected DDL to contain table definition %q", table)
		}
	}
}

func TestStoreInterfaceParity(t *testing.T) {
	var _ storage.Store = (*storage.MemoryStore)(nil)
	var _ storage.Store = (*storage.PostgresStore)(nil)
}
