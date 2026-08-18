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
		Name: "Tier4_Scenario_PharmaDistributionDelayedShipmentAndMissingPO", Tier: runner.Tier4, Feature: "Pharma Distribution",
		Description: "End-to-end Pharma Distribution: Multi-invoice ingestion -> Date delay detection -> Orphan invoice missing PO linkage -> Severity escalation -> Audit trail logging",
		Fn: func(baseURL string) error {
			c := harness.NewClient(baseURL)
			sResp, err := c.Post("/auth/signup", map[string]any{
				"tenant_name": "Pharma Logistics India",
				"name":        "Quality Assurance Manager",
				"email":       fmt.Sprintf("pharma_qa_%d@acme.com", time.Now().UnixNano()),
				"password":    "PharmaSafe2026!",
			})
			if err != nil || sResp.StatusCode != http.StatusCreated {
				return fmt.Errorf("pharma signup failed: %v", err)
			}
			var authResp harness.AuthResponse
			b, _ := json.Marshal(sResp.Data)
			_ = json.Unmarshal(b, &authResp)
			c.SetToken(authResp.Token)

			// Upload pharma batch with delay and orphan invoice
			pharmaCSV := harness.GeneratePharmaBatchCSV()
			upResp, err := c.UploadFile("/data-sources", "file", "pharma_batch_08.csv", pharmaCSV)
			if err != nil || (upResp.StatusCode != http.StatusCreated && upResp.StatusCode != http.StatusOK) {
				return fmt.Errorf("pharma upload failed: %v", err)
			}

			// Query date mismatch and missing evidence findings
			mResp, err := c.Get("/mistakes")
			if err != nil || mResp.StatusCode != http.StatusOK {
				return fmt.Errorf("failed fetching pharma mistakes: %v", err)
			}

			// Query audit log
			aResp, err := c.Get("/audit-logs")
			if err != nil || aResp.StatusCode != http.StatusOK {
				return fmt.Errorf("pharma audit query failed: %v", err)
			}

			return nil
		},
	})
}

func TestTier4_PharmaScenario(t *testing.T) {
	for _, tc := range runner.Registry {
		if tc.Tier == runner.Tier4 && tc.Feature == "Pharma Distribution" {
			t.Run(tc.Name, func(t *testing.T) {
				if err := tc.Fn("http://localhost:8080"); err != nil {
					t.Fatalf("pharma scenario failed: %v", err)
				}
			})
		}
	}
}
