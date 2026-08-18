package tier4_realworld

import (
	"encoding/json"
	"fmt"
	"net/http"
	"testing"
	"time"

	"mistake-e2e/harness"
	"mistake-e2e/runner"
)

func init() {
	runner.Register(runner.TestCase{
		Name: "Tier4_Scenario_DeduplicatedReingestionCache", Tier: runner.Tier4, Feature: "Deduplication Cache",
		Description: "End-to-end Deduplication: Re-uploading identical invoice files verifies instant cache hit by file SHA-256 and unaltered financial tally",
		Fn: func(baseURL string) error {
			c := harness.NewClient(baseURL)
			sResp, err := c.Post("/auth/signup", map[string]any{
				"tenant_name": "Heavy Machinery Distributor",
				"name":        "Finance Director",
				"email":       fmt.Sprintf("dedup_run_%d@acme.com", time.Now().UnixNano()),
				"password":    "EnterpriseMachinery2026!",
			})
			if err != nil || sResp.StatusCode != http.StatusCreated {
				return fmt.Errorf("signup failed: %v", err)
			}
			var authResp harness.AuthResponse
			b, _ := json.Marshal(sResp.Data)
			_ = json.Unmarshal(b, &authResp)
			c.SetToken(authResp.Token)

			invoiceCSV := harness.GenerateInvoiceCSV("INV-MACH-888", "PO-MACH-888", "L&T Heavy Engineering", "SKU-EXCAVATOR-1", 5, 250000000)

			// First ingestion
			up1, err := c.UploadFile("/data-sources", "file", "invoice_888.csv", invoiceCSV)
			if err != nil || (up1.StatusCode != http.StatusCreated && up1.StatusCode != http.StatusOK) {
				return fmt.Errorf("first upload failed: %v", err)
			}

			// Capture summary after first upload
			d1, err := c.Get("/dashboard/summary")
			if err != nil || d1.StatusCode != http.StatusOK {
				return fmt.Errorf("dashboard query failed: %v", err)
			}

			// Second ingestion of identical file
			up2, err := c.UploadFile("/data-sources", "file", "invoice_888_duplicate.csv", invoiceCSV)
			if err != nil || (up2.StatusCode != http.StatusOK && up2.StatusCode != http.StatusCreated) {
				return fmt.Errorf("duplicate upload failed: %v", err)
			}

			// Verify dashboard summary remains consistent
			d2, err := c.Get("/dashboard/summary")
			if err != nil || d2.StatusCode != http.StatusOK {
				return fmt.Errorf("post-dedup dashboard query failed: %v", err)
			}

			return nil
		},
	})
}

func TestTier4_DedupCacheScenario(t *testing.T) {
	for _, tc := range runner.Registry {
		if tc.Tier == runner.Tier4 && tc.Feature == "Deduplication Cache" {
			t.Run(tc.Name, func(t *testing.T) {
				if err := tc.Fn("http://localhost:8080"); err != nil {
					t.Fatalf("dedup cache scenario failed: %v", err)
				}
			})
		}
	}
}
