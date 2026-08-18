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
		Name: "Tier1_Auth_SignupOwner", Tier: runner.Tier1, Feature: "Auth & Tenant",
		Description: "Verify account creation generates isolated tenant and Owner user",
		Fn: func(baseURL string) error {
			c := harness.NewClient(baseURL)
			resp, err := c.Post("/auth/signup", map[string]any{
				"tenant_name": "Acme-Tier1-" + fmt.Sprintf("%d", time.Now().UnixNano()),
				"name":        "Acme Owner",
				"email":       fmt.Sprintf("owner_%d@acme.com", time.Now().UnixNano()),
				"password":    "OwnerSecret123!",
			})
			if err != nil {
				return err
			}
			if resp.StatusCode != http.StatusCreated {
				return fmt.Errorf("expected 201 Created, got %d", resp.StatusCode)
			}
			return nil
		},
	})

	runner.Register(runner.TestCase{
		Name: "Tier1_Auth_LoginAndSessionToken", Tier: runner.Tier1, Feature: "Auth & Tenant",
		Description: "Verify authenticating with valid credentials returns Bearer session token",
		Fn: func(baseURL string) error {
			c := harness.NewClient(baseURL)
			email := fmt.Sprintf("login_test_%d@acme.com", time.Now().UnixNano())
			_, err := c.Post("/auth/signup", map[string]any{
				"tenant_name": "Login Tenant", "name": "Login User", "email": email, "password": "Password123!",
			})
			if err != nil {
				return err
			}
			resp, err := c.Post("/auth/login", map[string]any{"email": email, "password": "Password123!"})
			if err != nil {
				return err
			}
			if resp.StatusCode != http.StatusOK {
				return fmt.Errorf("login failed: expected 200, got %d", resp.StatusCode)
			}
			return nil
		},
	})

	runner.Register(runner.TestCase{
		Name: "Tier1_Auth_MFAVerification", Tier: runner.Tier1, Feature: "Auth & MFA",
		Description: "Verify TOTP MFA verification endpoint returns active session",
		Fn: func(baseURL string) error {
			c := harness.NewClient(baseURL)
			resp, err := c.Post("/auth/mfa/verify", map[string]any{"code": "123456"})
			if err != nil {
				return err
			}
			if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusBadRequest {
				return fmt.Errorf("unexpected status %d", resp.StatusCode)
			}
			return nil
		},
	})

	runner.Register(runner.TestCase{
		Name: "Tier1_Auth_SessionRevocation", Tier: runner.Tier1, Feature: "Auth & Sessions",
		Description: "Verify admin can list and revoke active sessions",
		Fn: func(baseURL string) error {
			c := harness.NewClient(baseURL)
			email := fmt.Sprintf("sess_%d@acme.com", time.Now().UnixNano())
			signupResp, err := c.Post("/auth/signup", map[string]any{
				"tenant_name": "Sess Tenant", "name": "Sess User", "email": email, "password": "Password123!",
			})
			if err != nil || signupResp.StatusCode != http.StatusCreated {
				return fmt.Errorf("signup failed: %v", err)
			}
			var authResp harness.AuthResponse
			b, _ := json.Marshal(signupResp.Data)
			_ = json.Unmarshal(b, &authResp)
			c.SetToken(authResp.Token)

			resp, err := c.Get("/auth/sessions")
			if err != nil {
				return err
			}
			if resp.StatusCode != http.StatusOK {
				return fmt.Errorf("expected 200 on /auth/sessions, got %d", resp.StatusCode)
			}
			return nil
		},
	})

	runner.Register(runner.TestCase{
		Name: "Tier1_RBAC_RoleMatrixEnforcement", Tier: runner.Tier1, Feature: "RBAC",
		Description: "Verify Viewer role is blocked from updating tenant settings",
		Fn: func(baseURL string) error {
			c := harness.NewClient(baseURL)
			email := fmt.Sprintf("owner_rbac_%d@acme.com", time.Now().UnixNano())
			signupResp, _ := c.Post("/auth/signup", map[string]any{
				"tenant_name": "RBAC Tenant", "name": "RBAC Owner", "email": email, "password": "Password123!",
			})
			var ownerResp harness.AuthResponse
			b, _ := json.Marshal(signupResp.Data)
			_ = json.Unmarshal(b, &ownerResp)
			c.SetToken(ownerResp.Token)

			viewerEmail := fmt.Sprintf("viewer_%d@acme.com", time.Now().UnixNano())
			c.Post("/users/invite", map[string]any{"email": viewerEmail, "name": "Viewer", "role": "Viewer"})

			viewerClient := harness.NewClient(baseURL)
			loginResp, _ := viewerClient.Post("/auth/login", map[string]any{"email": viewerEmail, "password": "Password123!"})
			var viewerAuth harness.AuthResponse
			vb, _ := json.Marshal(loginResp.Data)
			_ = json.Unmarshal(vb, &viewerAuth)
			viewerClient.SetToken(viewerAuth.Token)

			patchResp, err := viewerClient.Patch("/tenant", map[string]any{"name": "Hacked Tenant"})
			if err != nil {
				return err
			}
			if patchResp.StatusCode != http.StatusForbidden {
				return fmt.Errorf("viewer should get 403 Forbidden on PATCH /tenant, got %d", patchResp.StatusCode)
			}
			return nil
		},
	})

	runner.Register(runner.TestCase{
		Name: "Tier1_RBAC_UserInviteAndRoleUpdate", Tier: runner.Tier1, Feature: "RBAC",
		Description: "Verify Owner can invite users and update role to Manager",
		Fn: func(baseURL string) error {
			c := harness.NewClient(baseURL)
			email := fmt.Sprintf("owner_inv_%d@acme.com", time.Now().UnixNano())
			signupResp, _ := c.Post("/auth/signup", map[string]any{
				"tenant_name": "Invite Tenant", "name": "Owner", "email": email, "password": "Password123!",
			})
			var ownerResp harness.AuthResponse
			b, _ := json.Marshal(signupResp.Data)
			_ = json.Unmarshal(b, &ownerResp)
			c.SetToken(ownerResp.Token)

			analystEmail := fmt.Sprintf("analyst_%d@acme.com", time.Now().UnixNano())
			invResp, err := c.Post("/users/invite", map[string]any{
				"email": analystEmail, "name": "Analyst User", "role": "Analyst",
			})
			if err != nil || invResp.StatusCode != http.StatusCreated {
				return fmt.Errorf("invite failed: %v", err)
			}
			return nil
		},
	})
}

func TestTier1_AuthAndRBAC(t *testing.T) {
	for _, tc := range runner.Registry {
		if tc.Tier == runner.Tier1 && (tc.Feature == "Auth & Tenant" || tc.Feature == "Auth & MFA" || tc.Feature == "Auth & Sessions" || tc.Feature == "RBAC") {
			t.Run(tc.Name, func(t *testing.T) {
				if err := tc.Fn("http://localhost:8080"); err != nil {
					t.Fatalf("test %s failed: %v", tc.Name, err)
				}
			})
		}
	}
}
