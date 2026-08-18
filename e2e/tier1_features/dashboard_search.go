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
		Name: "Tier1_Dashboard_ValueAtRiskAggregation", Tier: runner.Tier1, Feature: "Dashboard & Metrics",
		Description: "Verify dashboard summary endpoint calculates aggregate financial value at risk",
		Fn: func(baseURL string) error {
			c := harness.NewClient(baseURL)
			email := fmt.Sprintf("dash_var_%d@acme.com", time.Now().UnixNano())
			sResp, _ := c.Post("/auth/signup", map[string]any{
				"tenant_name": "Dashboard Tenant", "name": "Owner", "email": email, "password": "Password123!",
			})
			var aResp harness.AuthResponse
			b, _ := json.Marshal(sResp.Data)
			_ = json.Unmarshal(b, &aResp)
			c.SetToken(aResp.Token)

			resp, err := c.Get("/dashboard/summary")
			if err != nil {
				return err
			}
			if resp.StatusCode != http.StatusOK {
				return fmt.Errorf("expected 200 on /dashboard/summary, got %d", resp.StatusCode)
			}
			return nil
		},
	})

	runner.Register(runner.TestCase{
		Name: "Tier1_Dashboard_SeverityAndStatusBreakdown", Tier: runner.Tier1, Feature: "Dashboard & Metrics",
		Description: "Verify dashboard breakdown maps contains critical, high, medium counts",
		Fn: func(baseURL string) error {
			c := harness.NewClient(baseURL)
			email := fmt.Sprintf("dash_breakdown_%d@acme.com", time.Now().UnixNano())
			sResp, _ := c.Post("/auth/signup", map[string]any{
				"tenant_name": "Breakdown Tenant", "name": "Owner", "email": email, "password": "Password123!",
			})
			var aResp harness.AuthResponse
			b, _ := json.Marshal(sResp.Data)
			_ = json.Unmarshal(b, &aResp)
			c.SetToken(aResp.Token)

			resp, err := c.Get("/dashboard/summary")
			if err != nil {
				return err
			}
			if resp.StatusCode != http.StatusOK {
				return fmt.Errorf("expected 200, got %d", resp.StatusCode)
			}
			return nil
		},
	})

	runner.Register(runner.TestCase{
		Name: "Tier1_Dashboard_MonthlyTrendCalculation", Tier: runner.Tier1, Feature: "Dashboard & Metrics",
		Description: "Verify monthly trend history returns structured time-series data",
		Fn: func(baseURL string) error {
			c := harness.NewClient(baseURL)
			email := fmt.Sprintf("dash_trend_%d@acme.com", time.Now().UnixNano())
			sResp, _ := c.Post("/auth/signup", map[string]any{
				"tenant_name": "Trend Tenant", "name": "Owner", "email": email, "password": "Password123!",
			})
			var aResp harness.AuthResponse
			b, _ := json.Marshal(sResp.Data)
			_ = json.Unmarshal(b, &aResp)
			c.SetToken(aResp.Token)

			resp, err := c.Get("/dashboard/summary")
			if err != nil {
				return err
			}
			if resp.StatusCode != http.StatusOK {
				return fmt.Errorf("expected 200, got %d", resp.StatusCode)
			}
			return nil
		},
	})

	runner.Register(runner.TestCase{
		Name: "Tier1_Search_CrossEntityQuery", Tier: runner.Tier1, Feature: "Global Search",
		Description: "Verify search query executes across customers, suppliers, and orders",
		Fn: func(baseURL string) error {
			c := harness.NewClient(baseURL)
			email := fmt.Sprintf("search_cross_%d@acme.com", time.Now().UnixNano())
			sResp, _ := c.Post("/auth/signup", map[string]any{
				"tenant_name": "Search Tenant", "name": "Owner", "email": email, "password": "Password123!",
			})
			var aResp harness.AuthResponse
			b, _ := json.Marshal(sResp.Data)
			_ = json.Unmarshal(b, &aResp)
			c.SetToken(aResp.Token)

			resp, err := c.Get("/search?q=Bajaj")
			if err != nil {
				return err
			}
			if resp.StatusCode != http.StatusOK {
				return fmt.Errorf("expected 200 on /search, got %d", resp.StatusCode)
			}
			return nil
		},
	})

	runner.Register(runner.TestCase{
		Name: "Tier1_Search_FilterByType", Tier: runner.Tier1, Feature: "Global Search",
		Description: "Verify search results can be filtered specifically by entity or mistake type",
		Fn: func(baseURL string) error {
			c := harness.NewClient(baseURL)
			email := fmt.Sprintf("search_filter_%d@acme.com", time.Now().UnixNano())
			sResp, _ := c.Post("/auth/signup", map[string]any{
				"tenant_name": "Filter Search Tenant", "name": "Owner", "email": email, "password": "Password123!",
			})
			var aResp harness.AuthResponse
			b, _ := json.Marshal(sResp.Data)
			_ = json.Unmarshal(b, &aResp)
			c.SetToken(aResp.Token)

			resp, err := c.Get("/search?q=ORD-001&type=order")
			if err != nil {
				return err
			}
			if resp.StatusCode != http.StatusOK {
				return fmt.Errorf("expected 200 on /search with type filter, got %d", resp.StatusCode)
			}
			return nil
		},
	})
}

func TestTier1_DashboardAndSearch(t *testing.T) {
	for _, tc := range runner.Registry {
		if tc.Tier == runner.Tier1 && (tc.Feature == "Dashboard & Metrics" || tc.Feature == "Global Search") {
			t.Run(tc.Name, func(t *testing.T) {
				if err := tc.Fn("http://localhost:8080"); err != nil {
					t.Fatalf("test %s failed: %v", tc.Name, err)
				}
			})
		}
	}
}
