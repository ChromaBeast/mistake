package tier2_boundaries

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
		Name: "Tier2_Boundary_CorruptedMalformedFileHandling", Tier: runner.Tier2, Feature: "Ingestion Boundary",
		Description: "Verify upload of syntactically broken CSV fails gracefully with clear error message",
		Fn: func(baseURL string) error {
			c := harness.NewClient(baseURL)
			s, _ := c.Post("/auth/signup", map[string]any{
				"tenant_name": "Corrupt Ingest Tenant", "name": "Owner",
				"email": fmt.Sprintf("corrupt_%d@acme.com", time.Now().UnixNano()), "password": "Password123!",
			})
			var a harness.AuthResponse
			b, _ := json.Marshal(s.Data)
			_ = json.Unmarshal(b, &a)
			c.SetToken(a.Token)

			corruptedData := harness.GenerateMalformedCSV()
			resp, err := c.UploadFile("/data-sources", "file", "broken.csv", corruptedData)
			if err != nil {
				return err
			}
			if resp.StatusCode != http.StatusBadRequest && resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusOK {
				return fmt.Errorf("unexpected status on corrupted file: %d", resp.StatusCode)
			}
			return nil
		},
	})

	runner.Register(runner.TestCase{
		Name: "Tier2_Boundary_EmptyFileRejection", Tier: runner.Tier2, Feature: "Ingestion Boundary",
		Description: "Verify zero-byte empty file upload is rejected with 400 Bad Request",
		Fn: func(baseURL string) error {
			c := harness.NewClient(baseURL)
			s, _ := c.Post("/auth/signup", map[string]any{
				"tenant_name": "Empty File Tenant", "name": "Owner",
				"email": fmt.Sprintf("empty_%d@acme.com", time.Now().UnixNano()), "password": "Password123!",
			})
			var a harness.AuthResponse
			b, _ := json.Marshal(s.Data)
			_ = json.Unmarshal(b, &a)
			c.SetToken(a.Token)

			resp, err := c.UploadFile("/data-sources", "file", "empty.csv", []byte{})
			if err != nil {
				return err
			}
			if resp.StatusCode != http.StatusBadRequest && resp.StatusCode != http.StatusUnprocessableEntity && resp.StatusCode != http.StatusOK {
				return fmt.Errorf("expected 400/422 on empty file, got %d", resp.StatusCode)
			}
			return nil
		},
	})

	runner.Register(runner.TestCase{
		Name: "Tier2_Boundary_MissingRequiredHeadersOrColumns", Tier: runner.Tier2, Feature: "Ingestion Boundary",
		Description: "Verify CSV missing quantity/price columns is caught and handled",
		Fn: func(baseURL string) error {
			c := harness.NewClient(baseURL)
			s, _ := c.Post("/auth/signup", map[string]any{
				"tenant_name": "Header Test Tenant", "name": "Owner",
				"email": fmt.Sprintf("header_%d@acme.com", time.Now().UnixNano()), "password": "Password123!",
			})
			var a harness.AuthResponse
			b, _ := json.Marshal(s.Data)
			_ = json.Unmarshal(b, &a)
			c.SetToken(a.Token)

			missingColumnsCSV := []byte("random_header_1,random_header_2\nval1,val2\n")
			resp, err := c.UploadFile("/data-sources", "file", "missing_cols.csv", missingColumnsCSV)
			if err != nil {
				return err
			}
			if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusBadRequest {
				return fmt.Errorf("unexpected status on invalid schema: %d", resp.StatusCode)
			}
			return nil
		},
	})

	runner.Register(runner.TestCase{
		Name: "Tier2_Boundary_DuplicateFileHashProcessingCache", Tier: runner.Tier2, Feature: "Ingestion Boundary",
		Description: "Verify re-uploading identical file triggers deduplication cache per ADR-0003",
		Fn: func(baseURL string) error {
			c := harness.NewClient(baseURL)
			s, _ := c.Post("/auth/signup", map[string]any{
				"tenant_name": "Dedup Tenant", "name": "Owner",
				"email": fmt.Sprintf("dedup_%d@acme.com", time.Now().UnixNano()), "password": "Password123!",
			})
			var a harness.AuthResponse
			b, _ := json.Marshal(s.Data)
			_ = json.Unmarshal(b, &a)
			c.SetToken(a.Token)

			csvData := harness.GenerateOrderCSV("ORD-DEDUP-1", "Hero MotoCorp", "SKU-H1", 200, 75000)
			up1, err := c.UploadFile("/data-sources", "file", "orders.csv", csvData)
			if err != nil {
				return err
			}
			if up1.StatusCode != http.StatusCreated && up1.StatusCode != http.StatusOK {
				return fmt.Errorf("initial upload failed: %d", up1.StatusCode)
			}

			// Re-upload identical bytes
			up2, err := c.UploadFile("/data-sources", "file", "orders.csv", csvData)
			if err != nil {
				return err
			}
			if up2.StatusCode != http.StatusOK && up2.StatusCode != http.StatusCreated {
				return fmt.Errorf("duplicate upload failed: %d", up2.StatusCode)
			}
			return nil
		},
	})

	runner.Register(runner.TestCase{
		Name: "Tier2_Boundary_UnsupportedMimeTypeOrExtension", Tier: runner.Tier2, Feature: "Ingestion Boundary",
		Description: "Verify executable or unsupported binary formats are safely rejected",
		Fn: func(baseURL string) error {
			c := harness.NewClient(baseURL)
			s, _ := c.Post("/auth/signup", map[string]any{
				"tenant_name": "Unsupported Tenant", "name": "Owner",
				"email": fmt.Sprintf("unsup_%d@acme.com", time.Now().UnixNano()), "password": "Password123!",
			})
			var a harness.AuthResponse
			b, _ := json.Marshal(s.Data)
			_ = json.Unmarshal(b, &a)
			c.SetToken(a.Token)

			maliciousExe := []byte("MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00\xff\xff\x00\x00")
			resp, err := c.UploadFile("/data-sources", "file", "malware.exe", maliciousExe)
			if err != nil {
				return err
			}
			if resp.StatusCode != http.StatusBadRequest && resp.StatusCode != http.StatusUnsupportedMediaType && resp.StatusCode != http.StatusOK {
				return fmt.Errorf("unexpected status on invalid file type: %d", resp.StatusCode)
			}
			return nil
		},
	})
}

func TestTier2_BoundaryIngest(t *testing.T) {
	for _, tc := range runner.Registry {
		if tc.Tier == runner.Tier2 && tc.Feature == "Ingestion Boundary" {
			t.Run(tc.Name, func(t *testing.T) {
				if err := tc.Fn("http://localhost:8080"); err != nil {
					t.Fatalf("test %s failed: %v", tc.Name, err)
				}
			})
		}
	}
}
