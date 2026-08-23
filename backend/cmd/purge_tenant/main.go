// Command purge_tenant deletes a tenant and, via ON DELETE CASCADE, every
// row it owns: users, sessions, data sources, documents, evidence, entities,
// orders, invoices, mistakes, audit entries, and notifications.
//
// Intended for operational cleanup (e.g., removing legacy demo data) and
// tenant off-boarding. Destructive and irreversible.
//
// Usage:
//
//	DATABASE_URL="postgres://..." go run ./cmd/purge_tenant -tenant tenant-apex-101          # dry run
//	DATABASE_URL="postgres://..." go run ./cmd/purge_tenant -tenant tenant-apex-101 -yes     # execute
package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"os"

	"mistake-backend/internal/storage"
)

func main() {
	tenantID := flag.String("tenant", "", "Tenant ID to purge (required)")
	databaseURL := flag.String("url", os.Getenv("DATABASE_URL"), "PostgreSQL connection string (defaults to DATABASE_URL)")
	confirm := flag.Bool("yes", false, "Execute the deletion; without this flag the command only reports what would be removed")
	flag.Parse()

	if *tenantID == "" {
		log.Fatal("-tenant is required")
	}
	if *databaseURL == "" {
		log.Fatal("DATABASE_URL (or -url) is required")
	}

	ctx := context.Background()
	store, err := storage.NewPostgresStore(ctx, *databaseURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer store.Close()

	count := func(table string) int {
		n, err := store.CountTenantRows(ctx, table, *tenantID)
		if err != nil {
			log.Fatalf("Count query on %s failed: %v", table, err)
		}
		return n
	}

	fmt.Printf("Tenant %q currently owns:\n  users: %d\n  sessions: %d\n  mistakes: %d\n  data sources: %d\n",
		*tenantID, count("users"), count("sessions"), count("mistakes"), count("data_sources"))

	exists, err := store.TenantExists(ctx, *tenantID)
	if err != nil {
		log.Fatalf("Lookup failed: %v", err)
	}
	if !exists {
		log.Printf("Tenant %q does not exist — nothing to do.", *tenantID)
		return
	}

	if !*confirm {
		fmt.Println("\nDry run only. Re-run with -yes to permanently delete the tenant and ALL cascaded rows.")
		return
	}

	if err := store.PurgeTenantData(ctx, *tenantID); err != nil {
		log.Fatalf("Purge failed: %v", err)
	}

	if remaining := count("users"); remaining != 0 {
		log.Fatalf("Verification failed: %d user rows still reference the purged tenant", remaining)
	}
	fmt.Printf("Tenant %q and all owned rows were deleted successfully.\n", *tenantID)
}
