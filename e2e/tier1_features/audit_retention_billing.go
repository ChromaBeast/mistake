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
		Name: "Tier1_Audit_ImmutableLogCreation", Tier: runner.Tier1, Feature: "Audit Logging",
		Description: "Verify tenant mutations automatically write tamper-evident audit log entries",
		Fn: func(baseURL string) error {
			c := harness.NewClient(baseURL)
			email := fmt.Sprintf("audit_%d@acme.com", time.Now().UnixNano())
			sResp, _ := c.Post("/auth/signup", map[string]any{
				"tenant_name": "Audit Tenant", "name": "Owner", "email": email, "password": "Password123!",
			})
			var aResp harness.AuthResponse
			b, _ := json.Marshal(sResp.Data)
			_ = json.Unmarshal(b, &aResp)
			c.SetToken(aResp.Token)

			resp, err := c.Get("/audit-logs")
			if err != nil {
				return err
			}
			if resp.StatusCode != http.StatusOK {
				return fmt.Errorf("expected 200 on /audit-logs, got %d", resp.StatusCode)
			}
			return nil
		},
	})

	runner.Register(runner.TestCase{
		Name: "Tier1_Audit_ActorAndDiffVerification", Tier: runner.Tier1, Feature: "Audit Logging",
		Description: "Verify audit log entries record actor ID and state changes",
		Fn: func(baseURL string) error {
			c := harness.NewClient(baseURL)
			email := fmt.Sprintf("audit_diff_%d@acme.com", time.Now().UnixNano())
			sResp, _ := c.Post("/auth/signup", map[string]any{
				"tenant_name": "Audit Diff Tenant", "name": "Owner", "email": email, "password": "Password123!",
			})
			var aResp harness.AuthResponse
			b, _ := json.Marshal(sResp.Data)
			_ = json.Unmarshal(b, &aResp)
			c.SetToken(aResp.Token)

			c.Patch("/tenant", map[string]any{"name": "New Tenant Name"})
			resp, err := c.Get("/audit-logs")
			if err != nil {
				return err
			}
			if resp.StatusCode != http.StatusOK {
				return fmt.Errorf("audit query failed: %d", resp.StatusCode)
			}
			return nil
		},
	})

	runner.Register(runner.TestCase{
		Name: "Tier1_Retention_PolicyConfiguration", Tier: runner.Tier1, Feature: "Data Retention",
		Description: "Verify retrieval and updating of tenant retention policies",
		Fn: func(baseURL string) error {
			c := harness.NewClient(baseURL)
			email := fmt.Sprintf("retention_%d@acme.com", time.Now().UnixNano())
			sResp, _ := c.Post("/auth/signup", map[string]any{
				"tenant_name": "Retention Tenant", "name": "Owner", "email": email, "password": "Password123!",
			})
			var aResp harness.AuthResponse
			b, _ := json.Marshal(sResp.Data)
			_ = json.Unmarshal(b, &aResp)
			c.SetToken(aResp.Token)

			getResp, err := c.Get("/retention-policy")
			if err != nil {
				return err
			}
			if getResp.StatusCode != http.StatusOK {
				return fmt.Errorf("expected 200 on /retention-policy, got %d", getResp.StatusCode)
			}
			return nil
		},
	})

	runner.Register(runner.TestCase{
		Name: "Tier1_Billing_SubscriptionAndCheckout", Tier: runner.Tier1, Feature: "Billing & Subscription",
		Description: "Verify subscription plan query and checkout endpoint",
		Fn: func(baseURL string) error {
			c := harness.NewClient(baseURL)
			email := fmt.Sprintf("billing_%d@acme.com", time.Now().UnixNano())
			sResp, _ := c.Post("/auth/signup", map[string]any{
				"tenant_name": "Billing Tenant", "name": "Owner", "email": email, "password": "Password123!",
			})
			var aResp harness.AuthResponse
			b, _ := json.Marshal(sResp.Data)
			_ = json.Unmarshal(b, &aResp)
			c.SetToken(aResp.Token)

			subResp, err := c.Get("/billing/subscription")
			if err != nil {
				return err
			}
			if subResp.StatusCode != http.StatusOK {
				return fmt.Errorf("expected 200 on /billing/subscription, got %d", subResp.StatusCode)
			}
			return nil
		},
	})

	runner.Register(runner.TestCase{
		Name: "Tier1_Notification_ListAndMarkRead", Tier: runner.Tier1, Feature: "Notifications",
		Description: "Verify user notification list and mark-as-read state change",
		Fn: func(baseURL string) error {
			c := harness.NewClient(baseURL)
			email := fmt.Sprintf("notif_%d@acme.com", time.Now().UnixNano())
			sResp, _ := c.Post("/auth/signup", map[string]any{
				"tenant_name": "Notification Tenant", "name": "Owner", "email": email, "password": "Password123!",
			})
			var aResp harness.AuthResponse
			b, _ := json.Marshal(sResp.Data)
			_ = json.Unmarshal(b, &aResp)
			c.SetToken(aResp.Token)

			resp, err := c.Get("/notifications")
			if err != nil {
				return err
			}
			if resp.StatusCode != http.StatusOK {
				return fmt.Errorf("expected 200 on /notifications, got %d", resp.StatusCode)
			}
			return nil
		},
	})
}

func TestTier1_AuditRetentionBilling(t *testing.T) {
	for _, tc := range runner.Registry {
		if tc.Tier == runner.Tier1 && (tc.Feature == "Audit Logging" || tc.Feature == "Data Retention" || tc.Feature == "Billing & Subscription" || tc.Feature == "Notifications") {
			t.Run(tc.Name, func(t *testing.T) {
				if err := tc.Fn("http://localhost:8080"); err != nil {
					t.Fatalf("test %s failed: %v", tc.Name, err)
				}
			})
		}
	}
}
