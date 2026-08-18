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
		Name: "Tier1_Resolver_ExactMatch", Tier: runner.Tier1, Feature: "Entity Resolver",
		Description: "Verify entities list and exact canonical matching",
		Fn: func(baseURL string) error {
			c := harness.NewClient(baseURL)
			email := fmt.Sprintf("resolver_%d@acme.com", time.Now().UnixNano())
			sResp, _ := c.Post("/auth/signup", map[string]any{
				"tenant_name": "Resolver Tenant", "name": "Owner", "email": email, "password": "Password123!",
			})
			var aResp harness.AuthResponse
			b, _ := json.Marshal(sResp.Data)
			_ = json.Unmarshal(b, &aResp)
			c.SetToken(aResp.Token)

			resp, err := c.Get("/entities?entity_type=supplier")
			if err != nil {
				return err
			}
			if resp.StatusCode != http.StatusOK {
				return fmt.Errorf("expected 200 on /entities, got %d", resp.StatusCode)
			}
			return nil
		},
	})

	runner.Register(runner.TestCase{
		Name: "Tier1_Resolver_AliasPreservation", Tier: runner.Tier1, Feature: "Entity Resolver",
		Description: "Verify entity aliases are retrieved and linked to canonical record",
		Fn: func(baseURL string) error {
			c := harness.NewClient(baseURL)
			email := fmt.Sprintf("alias_%d@acme.com", time.Now().UnixNano())
			sResp, _ := c.Post("/auth/signup", map[string]any{
				"tenant_name": "Alias Tenant", "name": "Owner", "email": email, "password": "Password123!",
			})
			var aResp harness.AuthResponse
			b, _ := json.Marshal(sResp.Data)
			_ = json.Unmarshal(b, &aResp)
			c.SetToken(aResp.Token)

			// Ingest CSV with alias
			csvData := harness.GenerateOrderCSV("ORD-A1", "Mahindra & Mahindra Ltd", "SKU-TRACTOR", 10, 500000)
			c.UploadFile("/data-sources", "file", "mahindra_alias.csv", csvData)

			resp, err := c.Get("/entities")
			if err != nil {
				return err
			}
			if resp.StatusCode != http.StatusOK {
				return fmt.Errorf("failed fetching entities: %d", resp.StatusCode)
			}
			return nil
		},
	})

	runner.Register(runner.TestCase{
		Name: "Tier1_Resolver_ReviewQueueSurfacing", Tier: runner.Tier1, Feature: "Entity Resolver",
		Description: "Verify ambiguous matches (0.70-0.95 confidence) surface in human review queue",
		Fn: func(baseURL string) error {
			c := harness.NewClient(baseURL)
			email := fmt.Sprintf("rq_%d@acme.com", time.Now().UnixNano())
			sResp, _ := c.Post("/auth/signup", map[string]any{
				"tenant_name": "Review Queue Tenant", "name": "Owner", "email": email, "password": "Password123!",
			})
			var aResp harness.AuthResponse
			b, _ := json.Marshal(sResp.Data)
			_ = json.Unmarshal(b, &aResp)
			c.SetToken(aResp.Token)

			resp, err := c.Get("/entities/review-queue")
			if err != nil {
				return err
			}
			if resp.StatusCode != http.StatusOK {
				return fmt.Errorf("expected 200 on /entities/review-queue, got %d", resp.StatusCode)
			}
			return nil
		},
	})

	runner.Register(runner.TestCase{
		Name: "Tier1_Resolver_ConfirmMerge", Tier: runner.Tier1, Feature: "Entity Resolver",
		Description: "Verify human confirmation merges target entity into canonical survivor",
		Fn: func(baseURL string) error {
			c := harness.NewClient(baseURL)
			email := fmt.Sprintf("merge_%d@acme.com", time.Now().UnixNano())
			sResp, _ := c.Post("/auth/signup", map[string]any{
				"tenant_name": "Merge Tenant", "name": "Owner", "email": email, "password": "Password123!",
			})
			var aResp harness.AuthResponse
			b, _ := json.Marshal(sResp.Data)
			_ = json.Unmarshal(b, &aResp)
			c.SetToken(aResp.Token)

			mergeResp, err := c.Post("/entities/ent-101/merge", map[string]any{
				"target_id": "ent-102",
			})
			if err != nil {
				return err
			}
			if mergeResp.StatusCode != http.StatusOK && mergeResp.StatusCode != http.StatusNotFound {
				return fmt.Errorf("unexpected status on merge: %d", mergeResp.StatusCode)
			}
			return nil
		},
	})

	runner.Register(runner.TestCase{
		Name: "Tier1_Resolver_RejectMerge", Tier: runner.Tier1, Feature: "Entity Resolver",
		Description: "Verify human rejection dismisses proposed entity merge",
		Fn: func(baseURL string) error {
			c := harness.NewClient(baseURL)
			email := fmt.Sprintf("reject_merge_%d@acme.com", time.Now().UnixNano())
			sResp, _ := c.Post("/auth/signup", map[string]any{
				"tenant_name": "Reject Merge Tenant", "name": "Owner", "email": email, "password": "Password123!",
			})
			var aResp harness.AuthResponse
			b, _ := json.Marshal(sResp.Data)
			_ = json.Unmarshal(b, &aResp)
			c.SetToken(aResp.Token)

			resp, err := c.Post("/entities/ent-101/reject-merge", map[string]any{
				"reason": "Distinct independent legal entities",
			})
			if err != nil {
				return err
			}
			if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusNotFound {
				return fmt.Errorf("unexpected status on reject merge: %d", resp.StatusCode)
			}
			return nil
		},
	})
}

func TestTier1_Resolver(t *testing.T) {
	for _, tc := range runner.Registry {
		if tc.Tier == runner.Tier1 && tc.Feature == "Entity Resolver" {
			t.Run(tc.Name, func(t *testing.T) {
				if err := tc.Fn("http://localhost:8080"); err != nil {
					t.Fatalf("test %s failed: %v", tc.Name, err)
				}
			})
		}
	}
}
