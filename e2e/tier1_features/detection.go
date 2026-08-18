package tier1_features

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
		Name: "Tier1_Detection_QuantityMismatch", Tier: runner.Tier1, Feature: "Deterministic Detection",
		Description: "Verify order vs invoice quantity mismatch generates a quantity_mismatch finding",
		Fn: func(baseURL string) error {
			c := harness.NewClient(baseURL)
			email := fmt.Sprintf("det_qty_%d@acme.com", time.Now().UnixNano())
			sResp, _ := c.Post("/auth/signup", map[string]any{
				"tenant_name": "Qty Mismatch Tenant", "name": "Owner", "email": email, "password": "Password123!",
			})
			var aResp harness.AuthResponse
			b, _ := json.Marshal(sResp.Data)
			_ = json.Unmarshal(b, &aResp)
			c.SetToken(aResp.Token)

			// Ingest 5000 order vs 4500 invoice
			c.UploadFile("/data-sources", "file", "order.csv", harness.GenerateOrderCSV("PO-100", "Supplier A", "SKU-1", 5000, 1000))
			c.UploadFile("/data-sources", "file", "invoice.csv", harness.GenerateInvoiceCSV("INV-100", "PO-100", "Supplier A", "SKU-1", 4500, 1000))

			resp, err := c.Get("/mistakes?mistake_type=quantity_mismatch")
			if err != nil {
				return err
			}
			if resp.StatusCode != http.StatusOK {
				return fmt.Errorf("failed fetching mistakes: %d", resp.StatusCode)
			}
			return nil
		},
	})

	runner.Register(runner.TestCase{
		Name: "Tier1_Detection_PriceMismatch", Tier: runner.Tier1, Feature: "Deterministic Detection",
		Description: "Verify unit price mismatch between PO and Invoice creates price_mismatch finding",
		Fn: func(baseURL string) error {
			c := harness.NewClient(baseURL)
			email := fmt.Sprintf("det_price_%d@acme.com", time.Now().UnixNano())
			sResp, _ := c.Post("/auth/signup", map[string]any{
				"tenant_name": "Price Mismatch Tenant", "name": "Owner", "email": email, "password": "Password123!",
			})
			var aResp harness.AuthResponse
			b, _ := json.Marshal(sResp.Data)
			_ = json.Unmarshal(b, &aResp)
			c.SetToken(aResp.Token)

			c.UploadFile("/data-sources", "file", "order.csv", harness.GenerateOrderCSV("PO-200", "Supplier B", "SKU-2", 1000, 5000))
			c.UploadFile("/data-sources", "file", "invoice.csv", harness.GenerateInvoiceCSV("INV-200", "PO-200", "Supplier B", "SKU-2", 1000, 6000))

			resp, err := c.Get("/mistakes?mistake_type=price_mismatch")
			if err != nil {
				return err
			}
			if resp.StatusCode != http.StatusOK {
				return fmt.Errorf("failed fetching price mistakes: %d", resp.StatusCode)
			}
			return nil
		},
	})

	runner.Register(runner.TestCase{
		Name: "Tier1_Detection_DateMismatch", Tier: runner.Tier1, Feature: "Deterministic Detection",
		Description: "Verify delivery delay beyond promised SLA flags date_mismatch",
		Fn: func(baseURL string) error {
			c := harness.NewClient(baseURL)
			email := fmt.Sprintf("det_date_%d@acme.com", time.Now().UnixNano())
			sResp, _ := c.Post("/auth/signup", map[string]any{
				"tenant_name": "Date Mismatch Tenant", "name": "Owner", "email": email, "password": "Password123!",
			})
			var aResp harness.AuthResponse
			b, _ := json.Marshal(sResp.Data)
			_ = json.Unmarshal(b, &aResp)
			c.SetToken(aResp.Token)

			c.UploadFile("/data-sources", "file", "pharma_batch.csv", harness.GeneratePharmaBatchCSV())

			resp, err := c.Get("/mistakes?mistake_type=date_mismatch")
			if err != nil {
				return err
			}
			if resp.StatusCode != http.StatusOK {
				return fmt.Errorf("failed fetching date mistakes: %d", resp.StatusCode)
			}
			return nil
		},
	})

	runner.Register(runner.TestCase{
		Name: "Tier1_Detection_StatusMismatch", Tier: runner.Tier1, Feature: "Deterministic Detection",
		Description: "Verify contradiction between cancelled order and delivered shipment creates status_mismatch",
		Fn: func(baseURL string) error {
			c := harness.NewClient(baseURL)
			email := fmt.Sprintf("det_status_%d@acme.com", time.Now().UnixNano())
			sResp, _ := c.Post("/auth/signup", map[string]any{
				"tenant_name": "Status Mismatch Tenant", "name": "Owner", "email": email, "password": "Password123!",
			})
			var aResp harness.AuthResponse
			b, _ := json.Marshal(sResp.Data)
			_ = json.Unmarshal(b, &aResp)
			c.SetToken(aResp.Token)

			c.UploadFile("/data-sources", "file", "fmcg_batch.csv", harness.GenerateFMCGBatchCSV())

			resp, err := c.Get("/mistakes?mistake_type=status_mismatch")
			if err != nil {
				return err
			}
			if resp.StatusCode != http.StatusOK {
				return fmt.Errorf("failed fetching status mistakes: %d", resp.StatusCode)
			}
			return nil
		},
	})

	runner.Register(runner.TestCase{
		Name: "Tier1_Detection_MissingEvidenceOrphanInvoice", Tier: runner.Tier1, Feature: "Deterministic Detection",
		Description: "Verify orphan invoices without corresponding PO trigger missing_evidence finding",
		Fn: func(baseURL string) error {
			c := harness.NewClient(baseURL)
			email := fmt.Sprintf("det_missing_%d@acme.com", time.Now().UnixNano())
			sResp, _ := c.Post("/auth/signup", map[string]any{
				"tenant_name": "Missing Evidence Tenant", "name": "Owner", "email": email, "password": "Password123!",
			})
			var aResp harness.AuthResponse
			b, _ := json.Marshal(sResp.Data)
			_ = json.Unmarshal(b, &aResp)
			c.SetToken(aResp.Token)

			c.UploadFile("/data-sources", "file", "orphan.csv", harness.GenerateInvoiceCSV("INV-ORPHAN-1", "NON-EXISTENT-PO", "Vendor X", "SKU-99", 50, 10000))

			resp, err := c.Get("/mistakes?mistake_type=missing_evidence")
			if err != nil {
				return err
			}
			if resp.StatusCode != http.StatusOK {
				return fmt.Errorf("failed fetching missing evidence mistakes: %d", resp.StatusCode)
			}
			return nil
		},
	})
}

func TestTier1_Detection(t *testing.T) {
	for _, tc := range runner.Registry {
		if tc.Tier == runner.Tier1 && tc.Feature == "Deterministic Detection" {
			t.Run(tc.Name, func(t *testing.T) {
				if err := tc.Fn("http://localhost:8080"); err != nil {
					t.Fatalf("test %s failed: %v", tc.Name, err)
				}
			})
		}
	}
}
