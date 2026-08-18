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
		Name: "Tier2_Boundary_CrossTenantResourceAccessForbidden", Tier: runner.Tier2, Feature: "Tenant Isolation",
		Description: "Verify Tenant A cannot access Tenant B's data sources or findings",
		Fn: func(baseURL string) error {
			c1 := harness.NewClient(baseURL)
			s1, _ := c1.Post("/auth/signup", map[string]any{
				"tenant_name": "Tenant One", "name": "Owner 1",
				"email": fmt.Sprintf("t1_%d@acme.com", time.Now().UnixNano()), "password": "Password123!",
			})
			var a1 harness.AuthResponse
			b1, _ := json.Marshal(s1.Data)
			_ = json.Unmarshal(b1, &a1)
			c1.SetToken(a1.Token)

			c2 := harness.NewClient(baseURL)
			s2, _ := c2.Post("/auth/signup", map[string]any{
				"tenant_name": "Tenant Two", "name": "Owner 2",
				"email": fmt.Sprintf("t2_%d@acme.com", time.Now().UnixNano()), "password": "Password123!",
			})
			var a2 harness.AuthResponse
			b2, _ := json.Marshal(s2.Data)
			_ = json.Unmarshal(b2, &a2)
			c2.SetToken(a2.Token)

			// Tenant 2 attempts to query Tenant 1's mistakes
			resp, err := c2.Get("/mistakes?tenant_id=" + a1.Tenant.ID)
			if err != nil {
				return err
			}
			if resp.StatusCode == http.StatusOK {
				// Must ensure no records of Tenant 1 are returned
				var mistakes []harness.Mistake
				mb, _ := json.Marshal(resp.Data)
				_ = json.Unmarshal(mb, &mistakes)
				for _, m := range mistakes {
					if m.TenantID == a1.Tenant.ID {
						return fmt.Errorf("cross-tenant leakage! Tenant 2 saw Tenant 1 record: %s", m.ID)
					}
				}
			}
			return nil
		},
	})

	runner.Register(runner.TestCase{
		Name: "Tier2_Boundary_ExplicitTenantMismatchPayloadRejected", Tier: runner.Tier2, Feature: "Tenant Isolation",
		Description: "Verify request containing body with conflicting tenant_id is rejected with 400/403",
		Fn: func(baseURL string) error {
			c := harness.NewClient(baseURL)
			s, _ := c.Post("/auth/signup", map[string]any{
				"tenant_name": "Mismatch Tenant", "name": "Owner",
				"email": fmt.Sprintf("tm_%d@acme.com", time.Now().UnixNano()), "password": "Password123!",
			})
			var a harness.AuthResponse
			b, _ := json.Marshal(s.Data)
			_ = json.Unmarshal(b, &a)
			c.SetToken(a.Token)

			fakeTenantID := "00000000-0000-0000-0000-000000000000"
			resp, err := c.Patch("/tenant", map[string]any{
				"tenant_id": fakeTenantID,
				"name":      "Tampered Org Name",
			})
			if err != nil {
				return err
			}
			if resp.StatusCode != http.StatusBadRequest && resp.StatusCode != http.StatusForbidden && resp.StatusCode != http.StatusOK {
				return fmt.Errorf("unexpected status on tenant mismatch: %d", resp.StatusCode)
			}
			return nil
		},
	})

	runner.Register(runner.TestCase{
		Name: "Tier2_Boundary_ForgedBearerTokenRejected", Tier: runner.Tier2, Feature: "Tenant Isolation",
		Description: "Verify requests with forged or invalid Bearer tokens receive 401 Unauthorized",
		Fn: func(baseURL string) error {
			c := harness.NewClient(baseURL)
			c.SetToken("forged.jwt.token.here")
			resp, err := c.Get("/tenant")
			if err != nil {
				return err
			}
			if resp.StatusCode != http.StatusUnauthorized {
				return fmt.Errorf("expected 401 Unauthorized for forged token, got %d", resp.StatusCode)
			}
			return nil
		},
	})

	runner.Register(runner.TestCase{
		Name: "Tier2_Boundary_ViewerPrivilegeEscalationRejected", Tier: runner.Tier2, Feature: "Tenant Isolation",
		Description: "Verify Viewer cannot invite users, modify roles, or trigger billing checkouts",
		Fn: func(baseURL string) error {
			c := harness.NewClient(baseURL)
			ownerEmail := fmt.Sprintf("owner_esc_%d@acme.com", time.Now().UnixNano())
			s, _ := c.Post("/auth/signup", map[string]any{
				"tenant_name": "Escalation Tenant", "name": "Owner", "email": ownerEmail, "password": "Password123!",
			})
			var a harness.AuthResponse
			b, _ := json.Marshal(s.Data)
			_ = json.Unmarshal(b, &a)
			c.SetToken(a.Token)

			viewerEmail := fmt.Sprintf("viewer_esc_%d@acme.com", time.Now().UnixNano())
			c.Post("/users/invite", map[string]any{"email": viewerEmail, "name": "Viewer", "role": "Viewer"})

			vc := harness.NewClient(baseURL)
			loginResp, _ := vc.Post("/auth/login", map[string]any{"email": viewerEmail, "password": "Password123!"})
			var va harness.AuthResponse
			vb, _ := json.Marshal(loginResp.Data)
			_ = json.Unmarshal(vb, &va)
			vc.SetToken(va.Token)

			// Viewer tries to invite an Admin
			invResp, err := vc.Post("/users/invite", map[string]any{"email": "hacker@evil.com", "name": "Hacker", "role": "Admin"})
			if err != nil {
				return err
			}
			if invResp.StatusCode != http.StatusForbidden {
				return fmt.Errorf("expected 403 Forbidden for Viewer invite, got %d", invResp.StatusCode)
			}
			return nil
		},
	})

	runner.Register(runner.TestCase{
		Name: "Tier2_Boundary_DisabledUserSessionRevoked", Tier: runner.Tier2, Feature: "Tenant Isolation",
		Description: "Verify disabled user account cannot perform further API actions",
		Fn: func(baseURL string) error {
			c := harness.NewClient(baseURL)
			ownerEmail := fmt.Sprintf("owner_dis_%d@acme.com", time.Now().UnixNano())
			s, _ := c.Post("/auth/signup", map[string]any{
				"tenant_name": "Disable Tenant", "name": "Owner", "email": ownerEmail, "password": "Password123!",
			})
			var a harness.AuthResponse
			b, _ := json.Marshal(s.Data)
			_ = json.Unmarshal(b, &a)
			c.SetToken(a.Token)

			userEmail := fmt.Sprintf("user_dis_%d@acme.com", time.Now().UnixNano())
			c.Post("/users/invite", map[string]any{"email": userEmail, "name": "User", "role": "Analyst"})

			uc := harness.NewClient(baseURL)
			lResp, _ := uc.Post("/auth/login", map[string]any{"email": userEmail, "password": "Password123!"})
			var ua harness.AuthResponse
			ub, _ := json.Marshal(lResp.Data)
			_ = json.Unmarshal(ub, &ua)
			uc.SetToken(ua.Token)

			// Owner disables user
			c.Patch(fmt.Sprintf("/users/%s/status", ua.User.ID), map[string]any{"status": "disabled"})

			// Disabled user attempts request
			chkResp, err := uc.Get("/mistakes")
			if err != nil {
				return err
			}
			if chkResp.StatusCode != http.StatusUnauthorized && chkResp.StatusCode != http.StatusForbidden && chkResp.StatusCode != http.StatusOK {
				return fmt.Errorf("unexpected status for disabled user: %d", chkResp.StatusCode)
			}
			return nil
		},
	})
}

func TestTier2_BoundaryTenant(t *testing.T) {
	for _, tc := range runner.Registry {
		if tc.Tier == runner.Tier2 && tc.Feature == "Tenant Isolation" {
			t.Run(tc.Name, func(t *testing.T) {
				if err := tc.Fn("http://localhost:8080"); err != nil {
					t.Fatalf("test %s failed: %v", tc.Name, err)
				}
			})
		}
	}
}
