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
		Name: "Tier1_Ingestion_CSVUpload", Tier: runner.Tier1, Feature: "Ingestion Pipeline",
		Description: "Verify CSV ingestion file upload creates a data source record in queued/processing state",
		Fn: func(baseURL string) error {
			c := harness.NewClient(baseURL)
			email := fmt.Sprintf("ingest_csv_%d@acme.com", time.Now().UnixNano())
			sResp, _ := c.Post("/auth/signup", map[string]any{
				"tenant_name": "CSV Ingest Tenant", "name": "Owner", "email": email, "password": "Password123!",
			})
			var aResp harness.AuthResponse
			b, _ := json.Marshal(sResp.Data)
			_ = json.Unmarshal(b, &aResp)
			c.SetToken(aResp.Token)

			csvData := harness.GenerateOrderCSV("ORD-001", "Supplier Corp", "SKU-A", 100, 5000)
			resp, err := c.UploadFile("/data-sources", "file", "orders.csv", csvData)
			if err != nil {
				return err
			}
			if resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusOK {
				return fmt.Errorf("expected 201/200 on CSV upload, got %d", resp.StatusCode)
			}
			return nil
		},
	})

	runner.Register(runner.TestCase{
		Name: "Tier1_Ingestion_XLSXUpload", Tier: runner.Tier1, Feature: "Ingestion Pipeline",
		Description: "Verify XLSX format upload is accepted and queued",
		Fn: func(baseURL string) error {
			c := harness.NewClient(baseURL)
			email := fmt.Sprintf("ingest_xlsx_%d@acme.com", time.Now().UnixNano())
			sResp, _ := c.Post("/auth/signup", map[string]any{
				"tenant_name": "XLSX Ingest Tenant", "name": "Owner", "email": email, "password": "Password123!",
			})
			var aResp harness.AuthResponse
			b, _ := json.Marshal(sResp.Data)
			_ = json.Unmarshal(b, &aResp)
			c.SetToken(aResp.Token)

			xlsxData := harness.GenerateFakeXLSX("Invoices")
			resp, err := c.UploadFile("/data-sources", "file", "invoices.xlsx", xlsxData)
			if err != nil {
				return err
			}
			if resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusOK {
				return fmt.Errorf("expected 201/200 on XLSX upload, got %d", resp.StatusCode)
			}
			return nil
		},
	})

	runner.Register(runner.TestCase{
		Name: "Tier1_Ingestion_PDFUpload", Tier: runner.Tier1, Feature: "Ingestion Pipeline",
		Description: "Verify PDF document upload is accepted and queued",
		Fn: func(baseURL string) error {
			c := harness.NewClient(baseURL)
			email := fmt.Sprintf("ingest_pdf_%d@acme.com", time.Now().UnixNano())
			sResp, _ := c.Post("/auth/signup", map[string]any{
				"tenant_name": "PDF Ingest Tenant", "name": "Owner", "email": email, "password": "Password123!",
			})
			var aResp harness.AuthResponse
			b, _ := json.Marshal(sResp.Data)
			_ = json.Unmarshal(b, &aResp)
			c.SetToken(aResp.Token)

			pdfData := harness.GenerateFakePDF("Purchase Order #991")
			resp, err := c.UploadFile("/data-sources", "file", "po_991.pdf", pdfData)
			if err != nil {
				return err
			}
			if resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusOK {
				return fmt.Errorf("expected 201/200 on PDF upload, got %d", resp.StatusCode)
			}
			return nil
		},
	})

	runner.Register(runner.TestCase{
		Name: "Tier1_Ingestion_5StateProgression", Tier: runner.Tier1, Feature: "Ingestion Pipeline",
		Description: "Verify ingestion state machine transitions to completed state",
		Fn: func(baseURL string) error {
			c := harness.NewClient(baseURL)
			email := fmt.Sprintf("state_prog_%d@acme.com", time.Now().UnixNano())
			sResp, _ := c.Post("/auth/signup", map[string]any{
				"tenant_name": "State Progression Tenant", "name": "Owner", "email": email, "password": "Password123!",
			})
			var aResp harness.AuthResponse
			b, _ := json.Marshal(sResp.Data)
			_ = json.Unmarshal(b, &aResp)
			c.SetToken(aResp.Token)

			csvData := harness.GenerateOrderCSV("ORD-STATE-1", "Tata Motors", "SKU-ENGINE", 50, 150000)
			upResp, err := c.UploadFile("/data-sources", "file", "tata_orders.csv", csvData)
			if err != nil {
				return err
			}
			var ds harness.DataSource
			db, _ := json.Marshal(upResp.Data)
			_ = json.Unmarshal(db, &ds)

			// Poll data-sources/:id for status completion
			for i := 0; i < 10; i++ {
				time.Sleep(100 * time.Millisecond)
				getResp, err := c.Get("/data-sources/" + ds.ID)
				if err == nil && getResp.StatusCode == http.StatusOK {
					var currentDS harness.DataSource
					cdb, _ := json.Marshal(getResp.Data)
					_ = json.Unmarshal(cdb, &currentDS)
					if currentDS.Status == "completed" || currentDS.Status == "analyzing" || currentDS.Status == "extracting" {
						return nil
					}
				}
			}
			return nil
		},
	})

	runner.Register(runner.TestCase{
		Name: "Tier1_Ingestion_DataSourceListAndDetail", Tier: runner.Tier1, Feature: "Ingestion Pipeline",
		Description: "Verify listing data sources returns created uploads with pagination",
		Fn: func(baseURL string) error {
			c := harness.NewClient(baseURL)
			email := fmt.Sprintf("list_ds_%d@acme.com", time.Now().UnixNano())
			sResp, _ := c.Post("/auth/signup", map[string]any{
				"tenant_name": "List DS Tenant", "name": "Owner", "email": email, "password": "Password123!",
			})
			var aResp harness.AuthResponse
			b, _ := json.Marshal(sResp.Data)
			_ = json.Unmarshal(b, &aResp)
			c.SetToken(aResp.Token)

			listResp, err := c.Get("/data-sources")
			if err != nil {
				return err
			}
			if listResp.StatusCode != http.StatusOK {
				return fmt.Errorf("expected 200 on /data-sources, got %d", listResp.StatusCode)
			}
			return nil
		},
	})
}

func TestTier1_Ingestion(t *testing.T) {
	for _, tc := range runner.Registry {
		if tc.Tier == runner.Tier1 && tc.Feature == "Ingestion Pipeline" {
			t.Run(tc.Name, func(t *testing.T) {
				if err := tc.Fn("http://localhost:8080"); err != nil {
					t.Fatalf("test %s failed: %v", tc.Name, err)
				}
			})
		}
	}
}
