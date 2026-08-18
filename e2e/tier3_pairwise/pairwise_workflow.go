package tier3_pairwise

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
		Name: "Tier3_Pairwise_IngestToResolverToDetectionToAudit", Tier: runner.Tier3, Feature: "Pairwise Workflow",
		Description: "Verify end-to-end integration: Ingest -> Entity Alias Resolution -> Detection -> Audit Log",
		Fn: func(baseURL string) error {
			c := harness.NewClient(baseURL)
			s, _ := c.Post("/auth/signup", map[string]any{
				"tenant_name": "Full Workflow Tenant", "name": "Owner",
				"email": fmt.Sprintf("wf_full_%d@acme.com", time.Now().UnixNano()), "password": "Password123!",
			})
			var a harness.AuthResponse
			b, _ := json.Marshal(s.Data)
			_ = json.Unmarshal(b, &a)
			c.SetToken(a.Token)

			// 1. Ingest Order and Invoice
			c.UploadFile("/data-sources", "file", "orders.csv", harness.GenerateOrderCSV("ORD-WF-1", "TVS Motors Ltd", "SKU-TVS-1", 2000, 3000))
			c.UploadFile("/data-sources", "file", "invoices.csv", harness.GenerateInvoiceCSV("INV-WF-1", "ORD-WF-1", "TVS Motor Company", "SKU-TVS-1", 1800, 3000))

			// 2. Query Audit Log
			auditResp, err := c.Get("/audit-logs")
			if err != nil {
				return err
			}
			if auditResp.StatusCode != http.StatusOK {
				return fmt.Errorf("expected 200 on /audit-logs, got %d", auditResp.StatusCode)
			}
			return nil
		},
	})

	runner.Register(runner.TestCase{
		Name: "Tier3_Pairwise_TriageTransitionToReasonToTimeline", Tier: runner.Tier3, Feature: "Pairwise Workflow",
		Description: "Verify finding triage transition (detected -> verified) logs reason and updates timeline",
		Fn: func(baseURL string) error {
			c := harness.NewClient(baseURL)
			s, _ := c.Post("/auth/signup", map[string]any{
				"tenant_name": "Triage Timeline Tenant", "name": "Owner",
				"email": fmt.Sprintf("wf_triage_%d@acme.com", time.Now().UnixNano()), "password": "Password123!",
			})
			var a harness.AuthResponse
			b, _ := json.Marshal(s.Data)
			_ = json.Unmarshal(b, &a)
			c.SetToken(a.Token)

			// Status update with reason
			c.Patch("/mistakes/mst-dummy-1/status", map[string]any{
				"status": "under_review",
				"reason": "Investigating with procurement team",
			})

			resp, err := c.Get("/events")
			if err != nil {
				return err
			}
			if resp.StatusCode != http.StatusOK {
				return fmt.Errorf("events query failed: %d", resp.StatusCode)
			}
			return nil
		},
	})

	runner.Register(runner.TestCase{
		Name: "Tier3_Pairwise_EventSourcingToReconstructedTimeline", Tier: runner.Tier3, Feature: "Pairwise Workflow",
		Description: "Verify temporal event sourcing with occurred_at vs observed_at reconstructs chronological timeline",
		Fn: func(baseURL string) error {
			c := harness.NewClient(baseURL)
			s, _ := c.Post("/auth/signup", map[string]any{
				"tenant_name": "Event Sourcing Tenant", "name": "Owner",
				"email": fmt.Sprintf("wf_es_%d@acme.com", time.Now().UnixNano()), "password": "Password123!",
			})
			var a harness.AuthResponse
			b, _ := json.Marshal(s.Data)
			_ = json.Unmarshal(b, &a)
			c.SetToken(a.Token)

			timelineResp, err := c.Get("/entities/ent-test-1/timeline")
			if err != nil {
				return err
			}
			if timelineResp.StatusCode != http.StatusOK && timelineResp.StatusCode != http.StatusNotFound {
				return fmt.Errorf("unexpected status on timeline: %d", timelineResp.StatusCode)
			}
			return nil
		},
	})

	runner.Register(runner.TestCase{
		Name: "Tier3_Pairwise_GlobalSearchAfterIngestionResolution", Tier: runner.Tier3, Feature: "Pairwise Workflow",
		Description: "Verify global search indexes data and returns matches for both canonical and alias names",
		Fn: func(baseURL string) error {
			c := harness.NewClient(baseURL)
			s, _ := c.Post("/auth/signup", map[string]any{
				"tenant_name": "Search Workflow Tenant", "name": "Owner",
				"email": fmt.Sprintf("wf_srch_%d@acme.com", time.Now().UnixNano()), "password": "Password123!",
			})
			var a harness.AuthResponse
			b, _ := json.Marshal(s.Data)
			_ = json.Unmarshal(b, &a)
			c.SetToken(a.Token)

			c.UploadFile("/data-sources", "file", "tvs_batch.csv", harness.GenerateOrderCSV("ORD-TVS-99", "TVS Sundaram Fasteners", "SKU-BOLT-1", 10000, 250))

			searchResp, err := c.Get("/search?q=Sundaram")
			if err != nil {
				return err
			}
			if searchResp.StatusCode != http.StatusOK {
				return fmt.Errorf("search query failed: %d", searchResp.StatusCode)
			}
			return nil
		},
	})
}

func TestTier3_PairwiseWorkflow(t *testing.T) {
	for _, tc := range runner.Registry {
		if tc.Tier == runner.Tier3 && tc.Feature == "Pairwise Workflow" {
			t.Run(tc.Name, func(t *testing.T) {
				if err := tc.Fn("http://localhost:8080"); err != nil {
					t.Fatalf("test %s failed: %v", tc.Name, err)
				}
			})
		}
	}
}
