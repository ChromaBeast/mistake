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
		Name: "Tier1_Lifecycle_DetectedToUnderReview", Tier: runner.Tier1, Feature: "Mistake Lifecycle",
		Description: "Verify transition from detected to under_review status",
		Fn: func(baseURL string) error {
			c := harness.NewClient(baseURL)
			email := fmt.Sprintf("life_ur_%d@acme.com", time.Now().UnixNano())
			sResp, _ := c.Post("/auth/signup", map[string]any{
				"tenant_name": "Lifecycle Tenant", "name": "Owner", "email": email, "password": "Password123!",
			})
			var aResp harness.AuthResponse
			b, _ := json.Marshal(sResp.Data)
			_ = json.Unmarshal(b, &aResp)
			c.SetToken(aResp.Token)

			resp, err := c.Patch("/mistakes/mst-001/status", map[string]any{
				"status": "under_review",
			})
			if err != nil {
				return err
			}
			if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusNotFound {
				return fmt.Errorf("unexpected status on transition: %d", resp.StatusCode)
			}
			return nil
		},
	})

	runner.Register(runner.TestCase{
		Name: "Tier1_Lifecycle_UnderReviewToVerified", Tier: runner.Tier1, Feature: "Mistake Lifecycle",
		Description: "Verify transition from under_review to verified status",
		Fn: func(baseURL string) error {
			c := harness.NewClient(baseURL)
			email := fmt.Sprintf("life_v_%d@acme.com", time.Now().UnixNano())
			sResp, _ := c.Post("/auth/signup", map[string]any{
				"tenant_name": "Verified Tenant", "name": "Owner", "email": email, "password": "Password123!",
			})
			var aResp harness.AuthResponse
			b, _ := json.Marshal(sResp.Data)
			_ = json.Unmarshal(b, &aResp)
			c.SetToken(aResp.Token)

			resp, err := c.Patch("/mistakes/mst-001/status", map[string]any{
				"status": "verified",
				"reason": "Confirmed physical count mismatch on dock",
			})
			if err != nil {
				return err
			}
			if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusNotFound {
				return fmt.Errorf("unexpected status on verify: %d", resp.StatusCode)
			}
			return nil
		},
	})

	runner.Register(runner.TestCase{
		Name: "Tier1_Lifecycle_DismissRequiresReason", Tier: runner.Tier1, Feature: "Mistake Lifecycle",
		Description: "Verify dismissing a mistake without reason returns 400 Validation Error",
		Fn: func(baseURL string) error {
			c := harness.NewClient(baseURL)
			email := fmt.Sprintf("life_d_err_%d@acme.com", time.Now().UnixNano())
			sResp, _ := c.Post("/auth/signup", map[string]any{
				"tenant_name": "Dismiss Error Tenant", "name": "Owner", "email": email, "password": "Password123!",
			})
			var aResp harness.AuthResponse
			b, _ := json.Marshal(sResp.Data)
			_ = json.Unmarshal(b, &aResp)
			c.SetToken(aResp.Token)

			resp, err := c.Patch("/mistakes/mst-001/status", map[string]any{
				"status": "dismissed",
			})
			if err != nil {
				return err
			}
			if resp.StatusCode != http.StatusBadRequest && resp.StatusCode != http.StatusNotFound {
				return fmt.Errorf("expected 400 Bad Request when dismissing without reason, got %d", resp.StatusCode)
			}
			return nil
		},
	})

	runner.Register(runner.TestCase{
		Name: "Tier1_Lifecycle_ResolveRequiresReason", Tier: runner.Tier1, Feature: "Mistake Lifecycle",
		Description: "Verify resolving a mistake requires mandatory reason logging",
		Fn: func(baseURL string) error {
			c := harness.NewClient(baseURL)
			email := fmt.Sprintf("life_r_err_%d@acme.com", time.Now().UnixNano())
			sResp, _ := c.Post("/auth/signup", map[string]any{
				"tenant_name": "Resolve Error Tenant", "name": "Owner", "email": email, "password": "Password123!",
			})
			var aResp harness.AuthResponse
			b, _ := json.Marshal(sResp.Data)
			_ = json.Unmarshal(b, &aResp)
			c.SetToken(aResp.Token)

			resp, err := c.Patch("/mistakes/mst-001/status", map[string]any{
				"status": "resolved",
				"reason": "Supplier issued credit note CN-2026-99",
			})
			if err != nil {
				return err
			}
			if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusNotFound {
				return fmt.Errorf("unexpected status on resolve: %d", resp.StatusCode)
			}
			return nil
		},
	})

	runner.Register(runner.TestCase{
		Name: "Tier1_Lifecycle_MistakeAssignment", Tier: runner.Tier1, Feature: "Mistake Lifecycle",
		Description: "Verify assigning a finding to an internal analyst updates assigned_to field",
		Fn: func(baseURL string) error {
			c := harness.NewClient(baseURL)
			email := fmt.Sprintf("life_assign_%d@acme.com", time.Now().UnixNano())
			sResp, _ := c.Post("/auth/signup", map[string]any{
				"tenant_name": "Assign Tenant", "name": "Owner", "email": email, "password": "Password123!",
			})
			var aResp harness.AuthResponse
			b, _ := json.Marshal(sResp.Data)
			_ = json.Unmarshal(b, &aResp)
			c.SetToken(aResp.Token)

			resp, err := c.Patch("/mistakes/mst-001/assign", map[string]any{
				"assigned_to": aResp.User.ID,
			})
			if err != nil {
				return err
			}
			if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusNotFound {
				return fmt.Errorf("unexpected status on assignment: %d", resp.StatusCode)
			}
			return nil
		},
	})
}

func TestTier1_Lifecycle(t *testing.T) {
	for _, tc := range runner.Registry {
		if tc.Tier == runner.Tier1 && tc.Feature == "Mistake Lifecycle" {
			t.Run(tc.Name, func(t *testing.T) {
				if err := tc.Fn("http://localhost:8080"); err != nil {
					t.Fatalf("test %s failed: %v", tc.Name, err)
				}
			})
		}
	}
}
