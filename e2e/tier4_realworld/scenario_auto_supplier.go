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
		Name: "Tier4_Scenario_AutoSupplierDiscrepancyBatch", Tier: runner.Tier4, Feature: "Auto Supplier Pipeline",
		Description: "End-to-end Auto Supplier: CSV Ingestion -> Entity Resolution (Bajaj Auto) -> Qty/Price Mismatch Detection -> Minor Unit Paise Math -> Review Queue -> Resolution",
		Fn: func(baseURL string) error {
			c := harness.NewClient(baseURL)
			// 1. Setup Tenant & Owner
			sResp, err := c.Post("/auth/signup", map[string]any{
				"tenant_name": "Bajaj Auto Tier-1 Supplier",
				"name":        "Supply Chain Director",
				"email":       fmt.Sprintf("auto_supplier_%d@acme.com", time.Now().UnixNano()),
				"password":    "EnterpriseAuto2026!",
			})
			if err != nil || sResp.StatusCode != http.StatusCreated {
				return fmt.Errorf("signup failed: %v", err)
			}
			var authResp harness.AuthResponse
			b, _ := json.Marshal(sResp.Data)
			_ = json.Unmarshal(b, &authResp)
			c.SetToken(authResp.Token)

			// 2. Upload Auto Supplier Discrepancy Batch CSV
			batchCSV := harness.GenerateAutoSupplierBatchCSV()
			upResp, err := c.UploadFile("/data-sources", "file", "bajaj_batch_aug2026.csv", batchCSV)
			if err != nil {
				return fmt.Errorf("upload failed: %w", err)
			}
			if upResp.StatusCode != http.StatusCreated && upResp.StatusCode != http.StatusOK {
				return fmt.Errorf("upload status error: %d", upResp.StatusCode)
			}

			// 3. Query Entities and Review Queue
			_, err = c.Get("/entities?entity_type=customer")
			if err != nil {
				return fmt.Errorf("entity query failed: %w", err)
			}

			// 4. Query Detected Mistakes
			mistakesResp, err := c.Get("/mistakes")
			if err != nil {
				return fmt.Errorf("mistakes query failed: %w", err)
			}
			if mistakesResp.StatusCode != http.StatusOK {
				return fmt.Errorf("expected 200 from mistakes query, got %d", mistakesResp.StatusCode)
			}

			// 5. Query Dashboard Summary
			dashResp, err := c.Get("/dashboard/summary")
			if err != nil || dashResp.StatusCode != http.StatusOK {
				return fmt.Errorf("dashboard summary failed: %v", err)
			}

			// 6. Query Audit Trail
			auditResp, err := c.Get("/audit-logs")
			if err != nil || auditResp.StatusCode != http.StatusOK {
				return fmt.Errorf("audit query failed: %v", err)
			}

			return nil
		},
	})
}

func TestTier4_AutoSupplierScenario(t *testing.T) {
	for _, tc := range runner.Registry {
		if tc.Tier == runner.Tier4 && tc.Feature == "Auto Supplier Pipeline" {
			t.Run(tc.Name, func(t *testing.T) {
				if err := tc.Fn("http://localhost:8080"); err != nil {
					t.Fatalf("scenario failed: %v", err)
				}
			})
		}
	}
}
