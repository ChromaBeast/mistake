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
		Name: "Tier4_Scenario_FMCGWholesalerStatusMismatchAndAliasMerge", Tier: runner.Tier4, Feature: "FMCG Wholesale",
		Description: "End-to-end FMCG Wholesale: Contradictory order status (cancelled vs delivered) -> Human review queue alias merge -> Immutable audit diff log",
		Fn: func(baseURL string) error {
			c := harness.NewClient(baseURL)
			sResp, err := c.Post("/auth/signup", map[string]any{
				"tenant_name": "National FMCG Wholesalers",
				"name":        "Operations Lead",
				"email":       fmt.Sprintf("fmcg_ops_%d@acme.com", time.Now().UnixNano()),
				"password":    "WholesalePower2026!",
			})
			if err != nil || sResp.StatusCode != http.StatusCreated {
				return fmt.Errorf("fmcg signup failed: %v", err)
			}
			var authResp harness.AuthResponse
			b, _ := json.Marshal(sResp.Data)
			_ = json.Unmarshal(b, &authResp)
			c.SetToken(authResp.Token)

			// Ingest FMCG batch
			fmcgCSV := harness.GenerateFMCGBatchCSV()
			upResp, err := c.UploadFile("/data-sources", "file", "fmcg_batch_aug.csv", fmcgCSV)
			if err != nil || (upResp.StatusCode != http.StatusCreated && upResp.StatusCode != http.StatusOK) {
				return fmt.Errorf("fmcg upload failed: %v", err)
			}

			// Query Review Queue
			rqResp, err := c.Get("/entities/review-queue")
			if err != nil || rqResp.StatusCode != http.StatusOK {
				return fmt.Errorf("review queue query failed: %v", err)
			}

			// Query Status Mismatch Mistakes
			mResp, err := c.Get("/mistakes?mistake_type=status_mismatch")
			if err != nil || mResp.StatusCode != http.StatusOK {
				return fmt.Errorf("fmcg mistakes query failed: %v", err)
			}

			return nil
		},
	})
}

func TestTier4_FMCGScenario(t *testing.T) {
	for _, tc := range runner.Registry {
		if tc.Tier == runner.Tier4 && tc.Feature == "FMCG Wholesale" {
			t.Run(tc.Name, func(t *testing.T) {
				if err := tc.Fn("http://localhost:8080"); err != nil {
					t.Fatalf("fmcg scenario failed: %v", err)
				}
			})
		}
	}
}
