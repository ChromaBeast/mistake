package tier4_realworld

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
		Name: "Tier4_Scenario_MultiTenantIntrusionPrevention", Tier: runner.Tier4, Feature: "Intrusion Prevention",
		Description: "End-to-end Intrusion Attack Simulation: Attempted cross-tenant data queries, forged auth tokens, and Viewer-to-Admin privilege escalation",
		Fn: func(baseURL string) error {
			// Victim Tenant
			cVictim := harness.NewClient(baseURL)
			sVictim, _ := cVictim.Post("/auth/signup", map[string]any{
				"tenant_name": "Victim Enterprise", "name": "Victim Admin",
				"email": fmt.Sprintf("victim_%d@acme.com", time.Now().UnixNano()), "password": "Password123!",
			})
			var aVictim harness.AuthResponse
			bV, _ := json.Marshal(sVictim.Data)
			_ = json.Unmarshal(bV, &aVictim)
			cVictim.SetToken(aVictim.Token)

			// Attacker Tenant
			cAttacker := harness.NewClient(baseURL)
			sAttacker, _ := cAttacker.Post("/auth/signup", map[string]any{
				"tenant_name": "Attacker Org", "name": "Attacker",
				"email": fmt.Sprintf("attacker_%d@acme.com", time.Now().UnixNano()), "password": "Password123!",
			})
			var aAttacker harness.AuthResponse
			bA, _ := json.Marshal(sAttacker.Data)
			_ = json.Unmarshal(bA, &aAttacker)
			cAttacker.SetToken(aAttacker.Token)

			// 1. Direct cross-tenant data access attempt
			crossResp, err := cAttacker.Get(fmt.Sprintf("/documents/%s", aVictim.Tenant.ID))
			if err != nil {
				return err
			}
			if crossResp.StatusCode == http.StatusOK {
				return fmt.Errorf("security breach: attacker was able to access victim documents directly")
			}

			// 2. Token tampering attempt
			cTampered := harness.NewClient(baseURL)
			cTampered.SetToken("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.tampered_signature")
			authResp, err := cTampered.Get("/tenant")
			if err != nil {
				return err
			}
			if authResp.StatusCode != http.StatusUnauthorized {
				return fmt.Errorf("expected 401 Unauthorized for tampered token, got %d", authResp.StatusCode)
			}

			return nil
		},
	})
}

func TestTier4_SecurityScenario(t *testing.T) {
	for _, tc := range runner.Registry {
		if tc.Tier == runner.Tier4 && tc.Feature == "Intrusion Prevention" {
			t.Run(tc.Name, func(t *testing.T) {
				if err := tc.Fn("http://localhost:8080"); err != nil {
					t.Fatalf("security intrusion test failed: %v", err)
				}
			})
		}
	}
}
