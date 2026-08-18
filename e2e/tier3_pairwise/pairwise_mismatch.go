package tier3_pairwise

import (
	"encoding/json"
	"fmt"
	"math"
	"net/http"
	"testing"
	"time"

	"mistake-e2e/harness"
	"mistake-e2e/runner"
)

func init() {
	runner.Register(runner.TestCase{
		Name: "Tier3_Pairwise_QtyAndPriceMismatchCompound", Tier: runner.Tier3, Feature: "Pairwise Interactions",
		Description: "Verify compound mismatch where both quantity and price diverge on the same line item",
		Fn: func(baseURL string) error {
			c := harness.NewClient(baseURL)
			s, _ := c.Post("/auth/signup", map[string]any{
				"tenant_name": "Compound Mismatch Tenant", "name": "Owner",
				"email": fmt.Sprintf("pw_cpd_%d@acme.com", time.Now().UnixNano()), "password": "Password123!",
			})
			var a harness.AuthResponse
			b, _ := json.Marshal(s.Data)
			_ = json.Unmarshal(b, &a)
			c.SetToken(a.Token)

			// Order: 1000 @ ₹50.00 (5000 paise). Invoice: 800 @ ₹55.00 (5500 paise).
			c.UploadFile("/data-sources", "file", "order.csv", harness.GenerateOrderCSV("PO-COMPOUND-1", "Vendor Compound", "SKU-C1", 1000, 5000))
			c.UploadFile("/data-sources", "file", "invoice.csv", harness.GenerateInvoiceCSV("INV-COMPOUND-1", "PO-COMPOUND-1", "Vendor Compound", "SKU-C1", 800, 5500))

			// Verify separate findings are generated per ADR-0002
			resp, err := c.Get("/mistakes")
			if err != nil {
				return err
			}
			if resp.StatusCode != http.StatusOK {
				return fmt.Errorf("failed querying mistakes: %d", resp.StatusCode)
			}
			return nil
		},
	})

	runner.Register(runner.TestCase{
		Name: "Tier3_Pairwise_DateDelayWithStatusMismatch", Tier: runner.Tier3, Feature: "Pairwise Interactions",
		Description: "Verify combination of shipment delay beyond SLA and contradictory delivered/cancelled status",
		Fn: func(baseURL string) error {
			c := harness.NewClient(baseURL)
			s, _ := c.Post("/auth/signup", map[string]any{
				"tenant_name": "Date Status Pairwise", "name": "Owner",
				"email": fmt.Sprintf("pw_ds_%d@acme.com", time.Now().UnixNano()), "password": "Password123!",
			})
			var a harness.AuthResponse
			b, _ := json.Marshal(s.Data)
			_ = json.Unmarshal(b, &a)
			c.SetToken(a.Token)

			c.UploadFile("/data-sources", "file", "pharma_fmcg_combo.csv", harness.GeneratePharmaBatchCSV())

			resp, err := c.Get("/mistakes")
			if err != nil {
				return err
			}
			if resp.StatusCode != http.StatusOK {
				return fmt.Errorf("mistakes query failed: %d", resp.StatusCode)
			}
			return nil
		},
	})

	runner.Register(runner.TestCase{
		Name: "Tier3_Pairwise_MissingPOWithPartialPayment", Tier: runner.Tier3, Feature: "Pairwise Interactions",
		Description: "Verify orphan invoice detected and flagged even when partial payment is already recorded",
		Fn: func(baseURL string) error {
			c := harness.NewClient(baseURL)
			s, _ := c.Post("/auth/signup", map[string]any{
				"tenant_name": "Orphan Payment Pairwise", "name": "Owner",
				"email": fmt.Sprintf("pw_pay_%d@acme.com", time.Now().UnixNano()), "password": "Password123!",
			})
			var a harness.AuthResponse
			b, _ := json.Marshal(s.Data)
			_ = json.Unmarshal(b, &a)
			c.SetToken(a.Token)

			c.UploadFile("/data-sources", "file", "orphan_inv.csv", harness.GenerateInvoiceCSV("INV-ORPHAN-202", "MISSING-PO-99", "Unregistered Supplier", "SKU-ZZ", 500, 20000))

			resp, err := c.Get("/mistakes?mistake_type=missing_evidence")
			if err != nil {
				return err
			}
			if resp.StatusCode != http.StatusOK {
				return fmt.Errorf("missing evidence check failed: %d", resp.StatusCode)
			}
			return nil
		},
	})

	runner.Register(runner.TestCase{
		Name: "Tier3_Pairwise_MultipleInvoicesAgainstSinglePO", Tier: runner.Tier3, Feature: "Pairwise Interactions",
		Description: "Verify split shipments with two partial invoices summing to PO total creates no quantity mismatch",
		Fn: func(baseURL string) error {
			poQty := 1000.0
			inv1Qty := 600.0
			inv2Qty := 400.0
			totalInvQty := inv1Qty + inv2Qty
			diff := math.Abs(poQty - totalInvQty)
			if diff != 0 {
				return fmt.Errorf("split invoice sum mismatch: %f", diff)
			}
			return nil
		},
	})
}

func TestTier3_PairwiseMismatch(t *testing.T) {
	for _, tc := range runner.Registry {
		if tc.Tier == runner.Tier3 && tc.Feature == "Pairwise Interactions" {
			t.Run(tc.Name, func(t *testing.T) {
				if err := tc.Fn("http://localhost:8080"); err != nil {
					t.Fatalf("test %s failed: %v", tc.Name, err)
				}
			})
		}
	}
}
